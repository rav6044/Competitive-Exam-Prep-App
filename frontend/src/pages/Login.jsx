import { useState } from "react";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import api from "../utils/axios";

// Validation helper
const validateEmail = (email) =>
  /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // -------------------------------
  // 👤 STATE
  // -------------------------------
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // -------------------------------
  // 🔐 HANDLE LOGIN
  // -------------------------------
  const handleLogin = async () => {
    setError("");
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }
    if (!validateEmail(email)) {
      setError("Invalid email format");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/auth/login", { email, password });
      dispatch(
        loginSuccess({
          user: res.data.user,
          token: res.data.token,
        })
      );
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------
  // 🔑 HANDLE SIGNUP
  // -------------------------------
  const handleSignup = async () => {
    setError("");
    if (!name || !email || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }
    if (!validateEmail(email)) {
      setError("Invalid email format");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/auth/register", { name, email, password });
      alert("Registration successful! You can now login.");
      setIsSignup(false);
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------
  // 🔄 TOGGLE LOGIN / SIGNUP
  // -------------------------------
  const toggleMode = () => {
    setError("");
    setIsSignup(!isSignup);
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="p-8 bg-white shadow-2xl rounded-3xl w-[400px]">
        <h2 className="text-3xl font-bold text-center mb-6 text-blue-600">
          {isSignup ? "Sign Up" : "Login"}
        </h2>

        {error && (
          <div className="bg-red-100 text-red-700 px-3 py-2 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {isSignup && (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          {isSignup && (
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          )}
        </div>

        <button
          onClick={isSignup ? handleSignup : handleLogin}
          disabled={loading}
          className="w-full mt-6 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-2xl font-semibold transition duration-300"
        >
          {loading ? "Please wait..." : isSignup ? "Sign Up" : "Login"}
        </button>

        <p className="text-center mt-4 text-gray-500">
          {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
          <span
            onClick={toggleMode}
            className="text-blue-500 font-semibold cursor-pointer hover:underline"
          >
            {isSignup ? "Login" : "Sign Up"}
          </span>
        </p>
      </div>
    </div>
  );
}