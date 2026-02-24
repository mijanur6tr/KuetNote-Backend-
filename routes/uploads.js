import express from 'express';
import { uploadFile, deleteFile } from '../controllers/uploadController.js';
import { upload } from '../config/cloudinary.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

router.post('/', auth, upload.single('file'), uploadFile);
router.delete('/', auth, deleteFile);

export default router;