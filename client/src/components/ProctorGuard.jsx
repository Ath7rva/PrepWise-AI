import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

const PHOTO_LIMIT = 10;
const VIDEO_DURATION_MS = 30000;
const PHOTO_INTERVAL_MS = 3000;
const PHOTO_WIDTH = 360;
const PHOTO_QUALITY = 0.55;

const getSupportedMimeType = () => {
  if (!("MediaRecorder" in window)) return "";

  const options = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
  ];

  return options.find((type) => MediaRecorder.isTypeSupported(type)) || "";
};

const blobToDataUrl = (blob) =>
  new Promise((resolve) => {
    const reader = new FileReader();

    reader.onloadend = () => resolve(reader.result || "");
    reader.onerror = () => resolve("");
    reader.readAsDataURL(blob);
  });

const ProctorGuard = forwardRef(function ProctorGuard(
  { active, onReady, onTerminate },
  ref
) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const warningLockRef = useRef(false);
  const readyCalledRef = useRef(false);
  const photoIntervalRef = useRef(null);
  const recordingTimeoutRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const videoChunksRef = useRef([]);
  const snapshotsRef = useRef([]);
  const recordingDataUrlRef = useRef("");
  const recordingMimeTypeRef = useRef("");
  const recordingPromiseRef = useRef(Promise.resolve(""));
  const resolveRecordingRef = useRef(null);

  const [warnings, setWarnings] = useState(0);
  const [warningMessage, setWarningMessage] = useState("");
  const [cameraError, setCameraError] = useState("");
  const [permissionStatus, setPermissionStatus] = useState("Waiting for permissions...");

  const MAX_WARNINGS = 10;

  const addWarning = (message) => {
    if (!active || warningLockRef.current) return;

    warningLockRef.current = true;

    setWarnings((prev) => {
      const newCount = prev + 1;
      setWarningMessage(`${message} Warning ${newCount}/${MAX_WARNINGS}`);

      if (newCount >= MAX_WARNINGS) {
        setTimeout(() => {
          onTerminate?.();
        }, 1000);
      }

      return newCount;
    });

    setTimeout(() => {
      setWarningMessage("");
      warningLockRef.current = false;
    }, 2500);
  };

  const captureSnapshot = () => {
    const video = videoRef.current;

    if (
      !video ||
      video.readyState < 2 ||
      snapshotsRef.current.length >= PHOTO_LIMIT
    ) {
      return;
    }

    const sourceWidth = video.videoWidth || PHOTO_WIDTH;
    const sourceHeight = video.videoHeight || Math.round((PHOTO_WIDTH * 3) / 4);
    const width = PHOTO_WIDTH;
    const height = Math.round((sourceHeight / sourceWidth) * width);
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) return;

    canvas.width = width;
    canvas.height = height;
    context.drawImage(video, 0, 0, width, height);

    snapshotsRef.current = [
      ...snapshotsRef.current,
      {
        capturedAt: new Date().toISOString(),
        dataUrl: canvas.toDataURL("image/jpeg", PHOTO_QUALITY),
      },
    ];

    if (snapshotsRef.current.length >= PHOTO_LIMIT && photoIntervalRef.current) {
      clearInterval(photoIntervalRef.current);
      photoIntervalRef.current = null;
    }
  };

  const stopRecording = () => {
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
    }

    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  const startMediaCapture = (stream) => {
    snapshotsRef.current = [];
    videoChunksRef.current = [];
    recordingDataUrlRef.current = "";
    recordingMimeTypeRef.current = "";

    if (photoIntervalRef.current) {
      clearInterval(photoIntervalRef.current);
    }

    setTimeout(captureSnapshot, 1000);
    photoIntervalRef.current = setInterval(captureSnapshot, PHOTO_INTERVAL_MS);

    if (!("MediaRecorder" in window)) {
      recordingPromiseRef.current = Promise.resolve("");
      return;
    }

    const mimeType = getSupportedMimeType();
    recordingMimeTypeRef.current = mimeType || "video/webm";

    recordingPromiseRef.current = new Promise((resolve) => {
      resolveRecordingRef.current = resolve;
    });

    try {
      const recorder = new MediaRecorder(stream, {
        ...(mimeType ? { mimeType } : {}),
        videoBitsPerSecond: 250000,
        audioBitsPerSecond: 32000,
      });

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data?.size) {
          videoChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const blob = new Blob(videoChunksRef.current, {
          type: recordingMimeTypeRef.current,
        });

        recordingDataUrlRef.current = blob.size ? await blobToDataUrl(blob) : "";
        resolveRecordingRef.current?.(recordingDataUrlRef.current);
        resolveRecordingRef.current = null;
      };

      recorder.start(1000);
      recordingTimeoutRef.current = setTimeout(stopRecording, VIDEO_DURATION_MS);
    } catch (error) {
      console.log("Proctor recording unavailable:", error);
      recordingPromiseRef.current = Promise.resolve("");
      resolveRecordingRef.current?.("");
      resolveRecordingRef.current = null;
    }
  };

  const getCapturedMedia = async () => {
    while (snapshotsRef.current.length < PHOTO_LIMIT && videoRef.current) {
      const beforeCount = snapshotsRef.current.length;
      captureSnapshot();

      if (snapshotsRef.current.length === beforeCount) break;
    }

    stopRecording();
    const videoDataUrl = await recordingPromiseRef.current;

    return {
      capturedAt: new Date().toISOString(),
      photoCount: snapshotsRef.current.length,
      photos: snapshotsRef.current,
      video: videoDataUrl
        ? {
            capturedAt: new Date().toISOString(),
            durationSeconds: 30,
            mimeType: recordingMimeTypeRef.current || "video/webm",
            dataUrl: videoDataUrl,
          }
        : null,
    };
  };

  useImperativeHandle(ref, () => ({
    getCapturedMedia,
  }));

  useEffect(() => {
    if (!active) return;

    const startPermissions = async () => {
      try {
        setPermissionStatus("Requesting camera and microphone access...");

        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        startMediaCapture(stream);

        setPermissionStatus("Permissions granted. Proctoring active.");

        if (!readyCalledRef.current) {
          readyCalledRef.current = true;
          onReady?.();
        }
      } catch (error) {
        console.log(error);
        setCameraError("Camera and microphone permissions are required.");
        addWarning("Camera or microphone permission denied.");
      }
    };

    startPermissions();

    return () => {
      if (photoIntervalRef.current) {
        clearInterval(photoIntervalRef.current);
        photoIntervalRef.current = null;
      }

      stopRecording();

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [active]);

  useEffect(() => {
    if (!active) return;

    const disableRightClick = (e) => {
      e.preventDefault();
      addWarning("Right click is not allowed.");
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        addWarning("Tab switching is not allowed.");
      }
    };

    const handleBlur = () => {
      addWarning("Do not click outside the interview window.");
    };

    const handleCopy = (e) => {
      e.preventDefault();
      addWarning("Copying is not allowed.");
    };

    const handlePaste = (e) => {
      e.preventDefault();
      addWarning("Pasting is not allowed.");
    };

    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();

      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && ["i", "j", "c"].includes(key)) ||
        (e.ctrlKey && key === "u")
      ) {
        e.preventDefault();
        addWarning("Developer tools shortcut is not allowed.");
      }
    };

    document.addEventListener("contextmenu", disableRightClick);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("contextmenu", disableRightClick);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [active]);

  useEffect(() => {
    if (!active) return;

    let interval;

    const checkFace = async () => {
      if (!videoRef.current) return;

      if (!("FaceDetector" in window)) {
        console.log("FaceDetector is not supported in this browser.");
        return;
      }

      try {
        const detector = new window.FaceDetector({
          fastMode: true,
          maxDetectedFaces: 1,
        });

        interval = setInterval(async () => {
          if (!videoRef.current || videoRef.current.readyState < 2) return;

          const faces = await detector.detect(videoRef.current);

          if (!faces || faces.length === 0) {
            addWarning("Face not visible in camera.");
          }
        }, 5000);
      } catch (error) {
        console.log("Face detection unavailable:", error);
      }
    };

    checkFace();

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [active]);

  if (!active) return null;

  return (
    <>
      <div className="fixed top-5 right-5 z-[9999]">
        <div className="bg-red-500/20 border border-red-500/40 text-red-300 px-5 py-3 rounded-2xl font-bold shadow-xl backdrop-blur-xl">
          Warnings: {warnings}/{MAX_WARNINGS}
        </div>
      </div>

      <div className="fixed bottom-5 right-5 z-[9999] w-64 bg-black border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-40 object-cover"
        />

        <div className="p-3">
          <p className="text-white text-sm font-bold">Proctor Camera</p>
          <p className="text-slate-400 text-xs">{permissionStatus}</p>

          {cameraError && (
            <p className="text-red-400 text-xs mt-2">{cameraError}</p>
          )}
        </div>
      </div>

      {warningMessage && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-red-500/20 border border-red-500/50 text-white rounded-3xl p-8 max-w-md text-center shadow-2xl">
            <h2 className="text-3xl font-black text-red-400 mb-4">Warning</h2>
            <p className="text-lg">{warningMessage}</p>
            <p className="text-slate-300 text-sm mt-4">
              10 warnings will automatically terminate the interview.
            </p>
          </div>
        </div>
      )}
    </>
  );
});

export default ProctorGuard;
