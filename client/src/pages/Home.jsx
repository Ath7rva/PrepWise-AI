import { Link } from "react-router-dom";
import { FaChartLine, FaFileAlt, FaMicrophoneAlt, FaShieldAlt } from "react-icons/fa";
import Navbar from "../components/Navbar";

const highlights = [
  {
    icon: <FaShieldAlt />,
    title: "Proctored practice",
    text: "Run realistic mock interviews with camera, mic, and focus checks.",
  },
  {
    icon: <FaChartLine />,
    title: "Progress analytics",
    text: "Track readiness, score trends, and skill-by-skill improvement.",
  },
  {
    icon: <FaFileAlt />,
    title: "Session reports",
    text: "Review feedback, stronger sample answers, and next practice steps.",
  },
];

function Home() {
  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-950">
      <Navbar />

      <main className="grid items-center gap-12 px-6 py-14 md:px-10 lg:grid-cols-[1fr_0.9fr] lg:px-16">
        <section>
          <p className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-cyan-700 shadow-sm">
            AI interview preparation for serious candidates
          </p>

          <h1 className="mt-7 max-w-4xl text-4xl font-black leading-tight md:text-6xl">
            Build interview confidence with professional AI practice.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            PrepWise AI helps candidates prepare with role-specific mock
            interviews, voice practice, resume-aware questions, detailed
            feedback, and progress analytics.
          </p>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <Link
              to="/signup"
              className="rounded-2xl bg-slate-950 px-7 py-4 text-center text-lg font-black text-white shadow-xl shadow-slate-200 transition hover:bg-slate-800"
            >
              Start Practicing
            </Link>

            <Link
              to="/login"
              className="rounded-2xl border border-slate-200 bg-white px-7 py-4 text-center text-lg font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Sign In
            </Link>
          </div>
        </section>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-200">
          <img
            src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80"
            alt="Professional interview preparation session"
            className="h-80 w-full object-cover"
          />
          <div className="grid gap-4 p-6 sm:grid-cols-3">
            {highlights.map((item) => (
              <div key={item.title}>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
                  {item.icon}
                </div>
                <h2 className="font-black">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 p-6">
            <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
              <FaMicrophoneAlt className="text-cyan-700" />
              Voice-enabled interviews with typed fallback.
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Home;
