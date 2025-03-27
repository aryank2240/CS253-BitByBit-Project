/**
 * Generates a random OTP of specified length (default 6 digits)
 */
const generateOTP = (length = 6) => {
    const digits = '0123456789';
    let OTP = '';
    
    for (let i = 0; i < length; i++) {
      OTP += digits[Math.floor(Math.random() * 10)];
    }
    
    return OTP;
  };
  

  export default generateOTP;