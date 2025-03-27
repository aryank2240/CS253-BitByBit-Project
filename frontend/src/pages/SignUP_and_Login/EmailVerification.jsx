import React, { useState } from 'react';
import axios from 'axios';
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
const EmailVerification = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate= useNavigate();
  const location = useLocation();
  const { userId } = location.state || {}; // Avoids errors if state is undefined

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if(!userId) return
    try {
      const response = await axios.post('/api/auth/verify-email', { userId, otp });
      
      if (response.status === 200) {
        // Redirect to login page after successful verification
       navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while verifying email');
    } finally {
      setLoading(false);
    }
  };



  return (
    // <div className="email-verification-container">
    //   <h2>Verify Your Email</h2>
    //   <p>Please enter the verification code sent to your email address.</p>
      
    //   {error && <div className="alert alert-danger">{error}</div>}
      
    //   <form onSubmit={handleSubmit}>
    //     <div className="form-group">
    //       <label htmlFor="otp">Verification Code</label>
    //       <input
    //         type="text"
    //         id="otp"
    //         value={otp}
    //         onChange={(e) => setOtp(e.target.value)}
    //         className="form-control"
    //         placeholder="Enter 6-digit code"
    //         required
    //       />
    //     </div>
        
    //     <button 
    //       type="submit" 
    //       className="btn btn-primary"
    //       disabled={loading}
    //     >
    //       {loading ? 'Verifying...' : 'Verify Email'}
    //     </button>
    //   </form>
    // </div>
     <div className="signup-card">
                    <h2>Verify Your Email</h2>
                    <p>Please enter the verification code sent to your email address.</p>
                    <form onSubmit={handleSubmit}>
                      <div className="form-group">
                        <label htmlFor="otp">Verification Code</label>
                        <div className="input-container">
            <FaLock className="icon" />
                        <input
                          type="text"
                          id="otp"
                          name="otp"
                          placeholder="Enter your otp"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                        />
                        </div>
                      </div>
                      <button type="submit" className="submit-button">
                      {loading ? 'Verifying...' : 'Verify Email'}
                      </button>
                    </form>
                    <p>
                      Don't have an account? <a href="/signup">Sign Up</a>
                    </p>
                  </div>
  );
};

export default EmailVerification;