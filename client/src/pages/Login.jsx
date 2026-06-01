import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaArrowRight, FaEnvelope, FaKey } from "react-icons/fa";
import AuthShowcase from "../components/AuthShowcase";
import { API_URL } from "../config/api";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const res = await axios.post(`${API_URL}/api/auth/login`, formData);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/dashboard");
    } catch (error) {
      setError(error.response?.data?.message || "Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShowcase
      title="Welcome back"
      subtitle="Enter your PrepWise AI workspace and continue building interview readiness with saved sessions, analytics, and coaching insights."
      footerText="New to PrepWise AI?"
      footerLinkText="Create an account"
      footerLinkTo="/signup"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Field
          icon={<FaEnvelope />}
          label="Email address"
          type="email"
          name="email"
          value={formData.email}
          placeholder="you@example.com"
          onChange={handleChange}
        />

        <Field
          icon={<FaKey />}
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          placeholder="Enter your password"
          onChange={handleChange}
        />

        {error && (
          <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 rounded-2xl bg-cyan-400 px-5 py-4 text-base font-black text-slate-950 shadow-lg shadow-cyan-500/25 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Signing in..." : "Enter Dashboard"}
          <FaArrowRight />
        </button>
      </form>
    </AuthShowcase>
  );
}

function Field({ icon, label, ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-300">{label}</span>
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 focus-within:border-cyan-300">
        <span className="text-cyan-300">{icon}</span>
        <input
          required
          className="w-full bg-transparent text-white outline-none placeholder:text-slate-600"
          {...props}
        />
      </div>
    </label>
  );
}

export default Login;
