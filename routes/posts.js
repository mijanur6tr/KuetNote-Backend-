import express from 'express';
import {
  createPost,
  updatePost,
  deletePost,
  getPost,
  getPosts,
  getMyPosts,
  upvotePost,
  downvotePost,
} from '../controllers/postController.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

router.post('/', auth, createPost);
router.put('/:slug', auth, updatePost);
router.delete('/:slug', auth, deletePost);
router.get('/:slug', getPost);
router.get('/', getPosts);
router.get('/user/my-posts', auth, getMyPosts);
router.post('/:slug/upvote', auth, upvotePost);
router.post('/:slug/downvote', auth, downvotePost);

export default router;