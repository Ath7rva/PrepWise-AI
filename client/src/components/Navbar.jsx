 
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="flex items-center justify-between px-10 py-5 bg-slate-900 border-b border-slate-800">
      <h1 className="text-2xl font-bold text-cyan-400">
        PrepWise AI
      </h1>

      <div className="flex gap-6 text-white">
        <Link to="/">Home</Link>
        <Link to="/login">Login</Link>
        <Link to="/signup">Signup</Link>
      </div>
    </nav>
  );
}

export default Navbar;
 
