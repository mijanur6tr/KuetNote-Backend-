import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  content: {
    type: String,
    required: true,
  },
  featuredImage: {
    type: String, // Cloudinary URL
  },
  status: {
    type: String,
    enum: ['Public', 'Private'],
    default: 'Public',
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
  category: {
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

// Ensure no user in both upvotes and downvotes
postSchema.pre('save', function(next) {
  const upvotedUsers = new Set(this.upvotes.map(id => id.toString()));
  this.downvotes = this.downvotes.filter(id => !upvotedUsers.has(id.toString()));
  next();
});

export default mongoose.model('Post', postSchema);