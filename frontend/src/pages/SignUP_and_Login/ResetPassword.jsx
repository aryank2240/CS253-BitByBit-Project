import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { FaLock } from "react-icons/fa";
import "./SignUp.css"; // Reusing the existing CSS

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  useEffect(() => {
    // Get token from URL params or query string
    const queryParams = new URLSearchParams(location.search);
    const tokenFromQuery = queryParams.get("token");
    const tokenFromParams = params.token;
    
    if (tokenFromQuery) {
      setToken(tokenFromQuery);
    } else if (tokenFromParams) {
      setToken(tokenFromParams);
    }
  }, [location.search, params]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validate password
    if (!password || password.length < 6) {
      setError("Password should be at least 6 characters");
      setLoading(false);
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/reset-password",
        { token, password }
      );
      
      setSuccess(response.data.message || "Password has been reset successfully.");
      setTimeout(() => navigate("/login"), 3000); // Redirect after 3 seconds
    } catch (error) {
      console.error("Error:", error.response?.data?.message || error.message);
      setError(error.response?.data?.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-card">
      <h2>Reset Your Password</h2>
      <p>Please enter your new password below.</p>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="password">New Password</label>
          <div className="input-container">
            <FaLock className="icon" />
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <div className="input-container">
            <FaLock className="icon" />
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && <p style={{ color: "green" }}>{success}</p>}
        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? "Processing..." : "Reset Password"}
        </button>
      </form>
      <p>
        Remember your password? <a href="/login">Log in here</a>
      </p>
    </div>
  );
};

export default ResetPassword;
