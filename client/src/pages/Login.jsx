  
import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        formData
      );

      localStorage.setItem("token", res.data.token);

      localStorage.setItem(
        "user",
        JSON.stringify(res.data.user)
      );

      alert("Login Successful!");

      navigate("/dashboard");
    } catch (error) {
      alert(error.response.data.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md bg-slate-900/70 backdrop-blur-lg border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <h1 className="text-4xl font-bold text-center text-cyan-400 mb-8">
          Welcome Back
        </h1>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5"
        >
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            onChange={handleChange}
            className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-400"
          />

          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            onChange={handleChange}
            className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-400"
          />

          <button
            type="submit"
            className="bg-cyan-500 hover:bg-cyan-600 transition rounded-xl py-3 text-lg font-semibold"
          >
            Login
          </button>
        </form>

        <p className="text-slate-400 text-center mt-6">
          Don’t have an account?{" "}
          <Link
            to="/signup"
            className="text-cyan-400 hover:underline"
          >
            Signup
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
 
