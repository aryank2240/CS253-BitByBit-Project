import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEnvelope } from "react-icons/fa";
import "./SignUp.css"; // Reusing the existing CSS

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validate email domain (IITK only)
    if (!email.endsWith('@iitk.ac.in')) {
      setError("Only IITK email domains (@iitk.ac.in) are allowed");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "api/auth/forgot-password",
        { email }
      );
      
      setSuccess(response.data.message || "Password reset instructions sent to your email.");
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
      <h2>Forgot Password</h2>
      <p>Enter your IITK email address to receive password reset instructions.</p>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <div className="input-container">
            <FaEnvelope className="icon" />
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your IITK email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && <p style={{ color: "green" }}>{success}</p>}
        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? "Processing..." : "Send Reset Instructions"}
        </button>
      </form>
      <p>
        Remember your password? <a href="/login">Log in here</a>
      </p>
      <p>
        Don't have an account? <a href="/signup">Sign up here</a>
      </p>
    </div>
  );
};

export default ForgotPassword;
