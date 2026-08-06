import { Link } from "react-router-dom";

export default function Login() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-8">

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-cyan-400">
            HireMind AI
          </h1>

          <p className="text-slate-400 mt-2">
            AI-Powered Interview & Hiring Platform
          </p>
        </div>

        <form className="space-y-5">

          <div>
            <label className="text-sm text-slate-300">
              Email
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              className="mt-2 w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-3 text-white outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-sm text-slate-300">
              Password
            </label>

            <input
              type="password"
              placeholder="Enter your password"
              className="mt-2 w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-3 text-white outline-none focus:border-cyan-500"
            />
          </div>

          <button
            className="w-full rounded-lg bg-cyan-500 py-3 font-semibold text-black hover:bg-cyan-400 transition"
          >
            Login
          </button>

        </form>

        <p className="text-center text-slate-400 mt-6">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-cyan-400 hover:underline"
          >
            Register
          </Link>
        </p>

      </div>
    </div>
  );
}