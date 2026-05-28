 
import Navbar from "../components/Navbar";

function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <div className="flex flex-col items-center justify-center text-center h-[80vh] px-6">
        <h1 className="text-6xl font-bold leading-tight">
          Master Interviews with{" "}
          <span className="text-cyan-400">
            AI-Powered Practice
          </span>
        </h1>

        <p className="text-slate-400 text-xl mt-6 max-w-2xl">
          PrepWise AI helps students and developers prepare
          for technical interviews using intelligent mock
          interviews, AI feedback, and personalized learning.
        </p>

        <div className="flex gap-5 mt-10">
          <button className="bg-cyan-500 hover:bg-cyan-600 px-6 py-3 rounded-xl text-lg font-semibold transition">
            Start Practicing
          </button>

          <button className="border border-slate-700 hover:border-cyan-400 px-6 py-3 rounded-xl text-lg transition">
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;
 
