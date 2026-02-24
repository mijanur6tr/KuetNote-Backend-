import Post from '../models/Post.js';

const createPost = async (req, res) => {
  try {
    const { title, slug, content, featuredImage, status, category } = req.body;
    const userId = req.user._id;
    const userName = req.user.name;


    let postSlug = slug;
    if (!postSlug) {
      postSlug = title
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z\d\s]+/g, "-")
        .replace(/\s/g, "-")
        .slice(0, 36);
    }

    const post = new Post({
      title,
      slug: postSlug,
      content,
      featuredImage,
      status,
      userId,
      userName,
      category,
    });

    await post.save();
    res.status(201).json(post);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Slug already exists' });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

const updatePost = async (req, res) => {
  try {
    const { title, content, featuredImage, status, category } = req.body;
    const slug = req.params.slug;

    const post = await Post.findOne({ slug });
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    post.title = title || post.title;
    post.content = content || post.content;
    post.featuredImage = featuredImage || post.featuredImage;
    post.status = status || post.status;
    post.category = category || post.category;

    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deletePost = async (req, res) => {
  try {
    const slug = req.params.slug;

    const post = await Post.findOne({ slug });
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Post.findByIdAndDelete(post._id);
    res.json({ message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPost = async (req, res) => {
  try {
    const slug = req.params.slug;

    const posts = await Post.aggregate([
      { $match: { slug } },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'postId',
          as: 'comments'
        }
      },
      {
        $addFields: {
          commentCount: { $size: '$comments' }
        }
      },
      {
        $project: {
          'user.password': 0,
          'user._id': 0,
          comments: 0
        }
      }
    ]);

    if (posts.length === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(posts[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPosts = async (req, res) => {
  try {
    const posts = await Post.aggregate([
      { $match: { status: 'Public' } },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'postId',
          as: 'comments'
        }
      },
      {
        $addFields: {
          commentCount: { $size: '$comments' }
        }
      },
      {
        $project: {
          'user.password': 0,
          'user._id': 0,
          comments: 0
        }
      },
      { $sort: { createdAt: -1 } }
    ]);
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyPosts = async (req, res) => {
  try {
    const posts = await Post.aggregate([
      { $match: { userId: req.user._id } },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'postId',
          as: 'comments'
        }
      },
      {
        $addFields: {
          commentCount: { $size: '$comments' }
        }
      },
      {
        $project: {
          'user.password': 0,
          'user._id': 0,
          comments: 0
        }
      },
      { $sort: { createdAt: -1 } }
    ]);
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const upvotePost = async (req, res) => {
  try {
    const slug = req.params.slug;
    const userId = req.user._id;

    const post = await Post.findOne({ slug });
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const upvoteIndex = post.upvotes.indexOf(userId);
    const downvoteIndex = post.downvotes.indexOf(userId);

    if (upvoteIndex > -1) {
      // Already upvoted, remove upvote
      post.upvotes.splice(upvoteIndex, 1);
    } else {
      // Add upvote, remove downvote if exists
      post.upvotes.push(userId);
      if (downvoteIndex > -1) {
        post.downvotes.splice(downvoteIndex, 1);
      }
    }

    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const downvotePost = async (req, res) => {
  try {
    const slug = req.params.slug;
    const userId = req.user._id;

    const post = await Post.findOne({ slug });
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const upvoteIndex = post.upvotes.indexOf(userId);
    const downvoteIndex = post.downvotes.indexOf(userId);

    if (downvoteIndex > -1) {
      // Already downvoted, remove downvote
      post.downvotes.splice(downvoteIndex, 1);
    } else {
      // Add downvote, remove upvote if exists
      post.downvotes.push(userId);
      if (upvoteIndex > -1) {
        post.upvotes.splice(upvoteIndex, 1);
      }
    }

    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { createPost, updatePost, deletePost, getPost, getPosts, getMyPosts, upvotePost, downvotePost };