import express from 'express';
import { signUp, logIn, getCurrentUser, logOut } from '../controllers/authController.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

router.post('/signup', signUp);
router.post('/login', logIn);
router.get('/current-user', auth, getCurrentUser);
router.post('/logout', auth, logOut);

export default router;