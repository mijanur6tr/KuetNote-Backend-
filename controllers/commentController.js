import Comment from '../models/Comment.js';
import Post from '../models/Post.js';

const createComment = async (req, res) => {
  try {
    const { content, postId } = req.body;
    const userId = req.user._id;
    const userName = req.user.name;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = new Comment({
      content,
      postId,
      userId,
      userName,
    });

    await comment.save();
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getComments = async (req, res) => {
  try {
    const postId = req.params.postId;

    const comments = await Comment.find({ postId }).populate('userId', 'name email').sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateComment = async (req, res) => {
  try {
    const { content } = req.body;
    const commentId = req.params.commentId;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    comment.content = content;
    await comment.save();
    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const commentId = req.params.commentId;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Comment.findByIdAndDelete(commentId);
    res.json({ message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const upvoteComment = async (req, res) => {
  try {
    const commentId = req.params.commentId;
    const userId = req.user._id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const upvoteIndex = comment.upvotes.indexOf(userId);
    const downvoteIndex = comment.downvotes.indexOf(userId);

    if (upvoteIndex > -1) {
      comment.upvotes.splice(upvoteIndex, 1);
    } else {
      comment.upvotes.push(userId);
      if (downvoteIndex > -1) {
        comment.downvotes.splice(downvoteIndex, 1);
      }
    }

    await comment.save();
    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const downvoteComment = async (req, res) => {
  try {
    const commentId = req.params.commentId;
    const userId = req.user._id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const upvoteIndex = comment.upvotes.indexOf(userId);
    const downvoteIndex = comment.downvotes.indexOf(userId);

    if (downvoteIndex > -1) {
      comment.downvotes.splice(downvoteIndex, 1);
    } else {
      comment.downvotes.push(userId);
      if (upvoteIndex > -1) {
        comment.upvotes.splice(upvoteIndex, 1);
      }
    }

    await comment.save();
    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { createComment, getComments, updateComment, deleteComment, upvoteComment, downvoteComment };