import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {  FaEnvelope, FaLock } from "react-icons/fa";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
        const response = await axios.post(
            "http://localhost:5000/api/auth/login",
            { email, password }, {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
              }
            }
        );
        
        const { token, user } = response.data;
        localStorage.setItem("jwtToken", token);
        setSuccess("Login successful! Redirecting...");
        if(user?.role==='admin'){
          setTimeout(() => navigate("/admin"), 2000);
        }
        else{
          setTimeout(() => navigate("/"), 2000); // Redirect after 2s
        }
        
    } catch (error) {
        console.error("Login Error:", error.response?.data || error.message);
        
        // Check if the error is due to email not being verified
        if (error.response?.data?.userId && error.response?.status === 401) {
            // Redirect to OTP verification page with userId
            navigate("/otp", {
                state: { userId: error.response.data.userId }
            });
        } else {
            setError(error.response?.data?.message || "Invalid email or password");
        }
    }
    };

    
    return (
         <div className="signup-card">
                <h2>Log In Your Account</h2>
                <form onSubmit={handleLogin}>
                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <div className="input-container">
        <FaEnvelope className="icon" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <div className="input-container">
                    <FaLock className="icon" />
                    <input
                      type="password"
                      id="password"
                      name="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    </div>
                    <p className="forgot-password" style={{ textAlign: "right", margin: "5px 0" }}>
                      <a href="/forgot-password" style={{ color: "#6c63ff" }}>Forgot password?</a>
                    </p>
                  </div>
                  {error && <p style={{ color: "red" }}>{error}</p>}
                {success && <p style={{ color: "green" }}>{success}</p>}
                  <button type="submit" className="submit-button">
                    Sign In
                  </button>
                </form>
                <p>
                  Don't have an account? <a href="/signup">Sign Up</a>
                </p>
              </div>
    )
};

export default Login;
