import { Link } from "react-router-dom";
import {
  FaBrain,
  FaChartLine,
  FaFileAlt,
  FaLock,
  FaMicrophoneAlt,
  FaPlayCircle,
  FaShieldAlt,
  FaUserGraduate,
} from "react-icons/fa";

const features = [
  {
    icon: <FaShieldAlt />,
    title: "Proctored mock interviews",
    text: "Camera, microphone, focus warnings, and structured interview flow.",
  },
  {
    icon: <FaBrain />,
    title: "Adaptive AI coaching",
    text: "Questions can target your role, resume, job description, and weak skills.",
  },
  {
    icon: <FaChartLine />,
    title: "Skill intelligence",
    text: "Track technical, communication, confidence, and problem-solving trends.",
  },
  {
    icon: <FaFileAlt />,
    title: "Session reports",
    text: "Review answers, feedback, better sample answers, and next practice plans.",
  },
];

const metrics = [
  ["5", "AI-generated questions per round"],
  ["4", "skill dimensions scored"],
  ["1", "complete report after every session"],
];

function AuthShowcase({
  title,
  subtitle,
  children,
  footerText,
  footerLinkText,
  footerLinkTo,
}) {
  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-950 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(120deg,#f8fafc_0%,#eef4f8_48%,#e7f3f0_100%)]" />

      <main className="relative z-10 grid min-h-screen lg:grid-cols-[1.12fr_0.88fr]">
        <section className="px-6 py-8 md:px-12 lg:px-16 flex flex-col justify-between gap-12">
          <nav className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-slate-950 text-cyan-300 flex items-center justify-center shadow-lg shadow-slate-200">
                <FaBrain />
              </div>
              <div>
                <p className="text-xl font-black tracking-wide">PrepWise AI</p>
                <p className="text-xs uppercase text-slate-500 tracking-[0.24em]">
                  Interview Intelligence
                </p>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
              <FaLock className="text-emerald-600" />
              Secure candidate workspace
            </div>
          </nav>

          <div className="grid items-center gap-9 xl:grid-cols-[0.9fr_1.1fr]">
            <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
              <FaUserGraduate className="text-cyan-700" />
              AI interview preparation built for serious candidates
            </div>

            <h1 className="mt-7 max-w-3xl text-4xl font-black leading-tight text-slate-950 md:text-6xl">
              Practice, measure, and improve before the real interview.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              PrepWise AI simulates professional interviews, evaluates your
              answers across key skills, and turns every session into a focused
              improvement plan. Use role-specific rounds, resume and job
              description context, voice practice, and analytics to prepare with
              intent.
            </p>

            <div className="mt-9 grid gap-4 sm:grid-cols-3">
              {metrics.map(([value, label]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <p className="text-4xl font-black text-cyan-700">{value}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{label}</p>
                </div>
              ))}
            </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-200">
              <img
                src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=80"
                alt="Professionals discussing interview preparation in a modern workspace"
                className="h-72 w-full object-cover"
              />
              <div className="grid gap-4 p-5 md:grid-cols-[1fr_0.9fr]">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">
                    Mock interview workflow
                  </p>
                  <h2 className="mt-2 text-2xl font-black text-slate-950">
                    Practice with context, not generic questions.
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    Add a role, resume highlights, or a job description when you
                    want a more tailored interview simulation.
                  </p>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950">
                  <iframe
                    title="Interview preparation video"
                    src="https://www.youtube.com/embed/BkL98JHAO_w"
                    className="aspect-video h-full min-h-40 w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
                  {feature.icon}
                </div>
                <h2 className="text-lg font-black text-slate-950">{feature.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {feature.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center bg-slate-950 px-6 pb-10 md:px-12 lg:px-16 lg:py-12">
          <div className="absolute inset-y-0 right-0 hidden w-[46%] bg-[linear-gradient(180deg,rgba(15,23,42,0.94),rgba(15,23,42,0.98)),url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=80')] bg-cover bg-center lg:block" />

          <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.08] p-7 shadow-2xl shadow-black/30 backdrop-blur-2xl md:p-8">
            <div className="mb-7">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-300 text-slate-950 shadow-lg shadow-cyan-500/20">
                <FaUserGraduate className="text-xl" />
              </div>
              <h2 className="text-3xl font-black text-white">{title}</h2>
              <p className="mt-3 leading-7 text-slate-400">{subtitle}</p>
            </div>

            {children}

            <p className="mt-7 text-center text-sm text-slate-400">
              {footerText}{" "}
              <Link
                to={footerLinkTo}
                className="font-bold text-cyan-300 hover:text-cyan-200"
              >
                {footerLinkText}
              </Link>
            </p>

            <div className="mt-7 rounded-2xl border border-white/10 bg-black/25 p-4">
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <FaMicrophoneAlt className="text-cyan-300" />
                Voice-enabled practice and typed fallback are included.
              </div>
              <div className="mt-3 flex items-center gap-3 text-sm text-slate-300">
                <FaPlayCircle className="text-cyan-300" />
                Watch interview-prep content before signing in.
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AuthShowcase;
