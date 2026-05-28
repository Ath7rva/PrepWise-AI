 
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-10 py-5 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-cyan-400">
          PrepWise AI
        </h1>

        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 px-5 py-2 rounded-xl transition"
        >
          Logout
        </button>
      </nav>

      {/* Main Content */}
      <div className="p-10">
        {/* Welcome Section */}
        <div className="mb-10">
          <h1 className="text-5xl font-bold">
            Welcome,{" "}
            <span className="text-cyan-400">
              {user?.name}
            </span>
          </h1>

          <p className="text-slate-400 mt-3 text-lg">
            Ready to master your interviews today?
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-slate-400 text-lg">
              Interviews Completed
            </h2>

            <p className="text-4xl font-bold text-cyan-400 mt-4">
              12
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-slate-400 text-lg">
              Average Score
            </h2>

            <p className="text-4xl font-bold text-green-400 mt-4">
              84%
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-slate-400 text-lg">
              AI Feedback Reports
            </h2>

            <p className="text-4xl font-bold text-purple-400 mt-4">
              18
            </p>
          </div>
        </div>

        {/* Start Interview Section */}
        <div className="mt-12 bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <h2 className="text-3xl font-bold mb-4">
            Start New Interview
          </h2>

          <p className="text-slate-400 mb-6">
            Practice with AI-generated interview questions
            tailored to your target role.
          </p>
<button
  onClick={() => navigate("/interview")}
  className="bg-cyan-500 hover:bg-cyan-600 px-6 py-3 rounded-xl text-lg font-semibold transition"
>
  Start Interview
</button>


        </div>
      </div>
    </div>
  );
}

export default Dashboard;
 
