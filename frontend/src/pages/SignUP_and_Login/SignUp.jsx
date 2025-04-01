import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./SignUp.css"

import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";
const SignUpCard = () => {
        const [error, setError] = useState("");
        const [success, setSuccess] = useState("");
        const[name,setName]=useState("");
        const [email,setEmail]=useState("");
        const[password,setPassword]=useState("");
        const[confirmPassword,setConfirmPassword]=useState("");
        const navigate = useNavigate();
    
        const handleSubmit = (e) => {
            e.preventDefault();
          handleSignUp();

        }

    const handleSignUp = async () => {

        try {
            if(password&&password.length<6){
              setError('Password should be more than or equal to 6 characters');
              return;
            }
            if (password===confirmPassword){
            const response = await axios.post(
                "http://localhost:5000/api/auth/register",
                { name, email, password,  role: "user"}, {
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
                  }
                }
            );

            setSuccess(response.data.message);
            setTimeout(() => navigate("/otp", {
              state: { userId:`${response.data.userId}` },
            }), 2000);
         }
         else{
            setError("Passwords don't match with each other.")
         } // Redirect after 2s
        } catch (error) {
            console.error("Signup Error:", error.response?.data || error.message);
            setError(error.response?.data?.message || "Something went wrong");
        }
    };

    return (
        <div className="signup-card">
        <h2>Sign Up Your Account</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <div className="input-container">
            <FaUser className="icon" />
            <input
              type="text"
              id="fullName"
              name="fullName"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            </div>
          </div>
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
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-container">
            <FaLock className="icon" />
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            </div>
          </div>
          {error && <p style={{ color: "red" }}>{error}</p>}
        {success && <p style={{ color: "green" }}>{success}</p>}
          <button type="submit" className="submit-button">
            Sign Up
          </button>
        </form>
        <p>
          Already have an account? <a href="/login">Sign In</a>
        </p>
      </div>
    );
};

export default SignUpCard;
