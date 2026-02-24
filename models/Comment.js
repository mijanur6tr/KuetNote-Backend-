import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  downvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
}, {
  timestamps: true,
});

// Ensure no user in both
commentSchema.pre('save', function(next) {
  const upvotedUsers = new Set(this.upvotes.map(id => id.toString()));
  this.downvotes = this.downvotes.filter(id => !upvotedUsers.has(id.toString()));
  next();
});

export default mongoose.model('Comment', commentSchema);