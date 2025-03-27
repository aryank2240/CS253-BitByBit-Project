import express from 'express'
const router = express.Router({ mergeParams: true });
import { register, login, verifyEmail, verify2FAAuthenticator, setup2FAAuthenticator} from '../controllers/authController.js';
import { protect , admin } from '../middleware/authMiddleware.js'

// Public routes
router.post('/register',async (req , res) =>{
   register(req,res);
});
router.post('/login',async (req , res) =>{
login(req,res);
});
router.post('/verify-email', async (req , res) =>{
    verifyEmail(req,res);
});
router.post('/verify-2fa', async (req , res) =>{
  verify2FAAuthenticator(req,res);
});

// Protected routes (require authentication)
router.post('/setup-2fa-authenticator', protect,setup2FAAuthenticator);
router.post('/verify-2fa-authenticator', protect, verify2FAAuthenticator);

export default router;
