import express from 'express';
import {
  createComment,
  getComments,
  updateComment,
  deleteComment,
  upvoteComment,
  downvoteComment,
} from '../controllers/commentController.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

router.post('/', auth, createComment);
router.get('/:postId', getComments);
router.put('/:commentId', auth, updateComment);
router.delete('/:commentId', auth, deleteComment);
router.post('/:commentId/upvote', auth, upvoteComment);
router.post('/:commentId/downvote', auth, downvoteComment);

export default router;