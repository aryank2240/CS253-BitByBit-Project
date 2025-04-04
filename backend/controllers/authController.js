import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from  'jsonwebtoken'
import nodemailer from 'nodemailer'
import crypto from 'crypto'
import speakeasy from 'speakeasy'
import generateOTP from '../utils/otpUtils.js'

// Configure email transporter

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD, // Use the App Password here
  },
});
// Register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate email domain
    if (!email.endsWith('@iitk.ac.in')) {
      return res.status(400).json({ message: 'Only IITK email domains (@iitk.ac.in) are allowed' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate OTP for email verification
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user with unverified status
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      emailVerificationOTP: otp,
      emailVerificationOTPExpiry: otpExpiry,
      emailVerified: false,
    });

    // Send verification OTP to email
    await sendVerificationEmail(email, otp);

    res.status(201).json({ 
      message: 'Registration initiated. Please verify your email address with the OTP sent to your email.',
      userId: user._id 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Verify Email with OTP
const  verifyEmail = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if OTP is valid and not expired
    if (user.emailVerificationOTP !== otp || new Date() > user.emailVerificationOTPExpiry) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Mark email as verified
    user.emailVerified = true;
    user.emailVerificationOTP = undefined;
    user.emailVerificationOTPExpiry = undefined;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login
const  login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate email domain
    if (!email.endsWith('@iitk.ac.in')) {
      return res.status(400).json({ message: 'Only IITK email domains (@iitk.ac.in) are allowed' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      // Generate new OTP if needed
      const otp = generateOTP();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
      
      user.emailVerificationOTP = otp;
      user.emailVerificationOTPExpiry = otpExpiry;
      await user.save();
      
      // Send new verification OTP
      await sendVerificationEmail(email, otp);
      
      return res.status(401).json({ 
        message: 'Email not verified. A new verification OTP has been sent to your email.',
        userId: user._id 
      });
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      // Generate and send OTP for 2FA
      const twoFactorOTP = generateOTP();
      const twoFactorOTPExpiry = new Date(Date.now() + 10 * 60 * 1000);
      
      user.twoFactorOTP = twoFactorOTP;
      user.twoFactorOTPExpiry = twoFactorOTPExpiry;
      await user.save();
      
      
      // Send 2FA OTP to email
      await send2FAOTP(email, twoFactorOTP);
      
      return res.status(200).json({
        message: '2FA verification required',
        requires2FA: true,
        userId: user._id
      });
    }

    // Create and send token
    const token = jwt.sign({ id: user._id , name: user.name, email: user.email, role:user.role}, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Verify 2FA OTP
const verify2FA = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if OTP is valid and not expired
    if (user.twoFactorOTP !== otp || new Date() > user.twoFactorOTPExpiry) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Clear 2FA OTP
    user.twoFactorOTP = undefined;
    user.twoFactorOTPExpiry = undefined;
    await user.save();

    // Create and send token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('2FA verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Setup 2FA with authenticator app
const setup2FAAuthenticator = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a secret key for the authenticator app
    const secret = speakeasy.generateSecret({
      length: 20,
      name: `IITK_Blog:${user.email}`
    });
    
    user.twoFactorSecret = secret.base32;
    user.twoFactorEnabled = false; // Not enabled until verified
    await user.save();

    res.status(200).json({
      message: 'Authentication app setup initiated',
      secret: secret.base32,
      otpauth_url: secret.otpauth_url
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Verify and enable 2FA with authenticator app
const verify2FAAuthenticator = async (req, res) => {
  try {
    const userId = req.user.id;
    const { token } = req.body;

    const user = await User.findById(userId);
    if (!user || !user.twoFactorSecret) {
      return res.status(404).json({ message: 'User not found or 2FA not initialized' });
    }

    // Verify the token against the stored secret using speakeasy
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token,
      window: 1
    });

    if (!verified) {
      return res.status(400).json({ message: 'Invalid authentication code' });
    }

    // Enable 2FA
    user.twoFactorEnabled = true;
    await user.save();

    res.status(200).json({ message: '2FA enabled successfully' });
  } catch (error) {
    console.error('2FA verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper functions
async function sendVerificationEmail(email, otp) {
  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: email,
    subject: 'IITK Blog - Email Verification',
    html: `
      <h1>Email Verification</h1>
      <p>Your verification OTP is: <strong>${otp}</strong></p>
      <p>This OTP will expire in 10 minutes.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}

async function send2FAOTP(email, otp) {
  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: email,
    subject: 'IITK Blog - 2FA Verification',
    html: `
      <h1>Two-Factor Authentication</h1>
      <p>Your 2FA verification code is: <strong>${otp}</strong></p>
      <p>This code will expire in 10 minutes.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}

// Forgot Password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email domain
    if (!email.endsWith('@iitk.ac.in')) {
      return res.status(400).json({ message: 'Only IITK email domains (@iitk.ac.in) are allowed' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found with this email' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    // Store hashed token in database
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = resetTokenExpiry;
    await user.save();

    // Create reset URL
    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;
    // For local development
    const frontendResetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;

    // Send email with reset link
    await sendPasswordResetEmail(email, frontendResetUrl);

    res.status(200).json({ 
      message: 'Password reset instructions sent to your email',
      resetUrl: frontendResetUrl // Remove in final revision
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Error sending password reset email' });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    // Hash the token from the URL
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with this token and token not expired
    const user = await User.findOne({ 
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Token is invalid or has expired' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    
    // Clear reset token fields
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    
    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Error resetting password' });
  }
};

// Helper function to send password reset email
async function sendPasswordResetEmail(email, resetUrl) {
  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: email,
    subject: 'IITK Blog - Password Reset',
    html: `
      <h1>Reset Your Password</h1>
      <p>You requested a password reset. Please click the link below to reset your password:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #6c63ff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <p>This link will expire in 30 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}
export {register,login, verifyEmail, verify2FAAuthenticator, setup2FAAuthenticator,  forgotPassword, resetPassword }
