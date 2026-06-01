 
import { Link } from "react-router-dom";
import { FaBrain } from "react-icons/fa";

function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-5 md:px-10 bg-white border-b border-slate-200">
      <Link to="/" className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-cyan-300">
          <FaBrain />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-950">PrepWise AI</h1>
          <p className="text-xs text-slate-500">Interview Intelligence</p>
        </div>
      </Link>

      <div className="flex items-center gap-4 text-sm font-bold text-slate-600">
        <Link className="hover:text-slate-950" to="/">Home</Link>
        <Link className="hover:text-slate-950" to="/login">Login</Link>
        <Link className="rounded-xl bg-slate-950 px-4 py-2 text-white hover:bg-slate-800" to="/signup">
          Signup
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
 
