import mongoose from 'mongoose';

const linkSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    userEmail: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2048,
    },
    title: {
      type: String,
      default: '',
      trim: true,
      maxlength: 500,
    },
    faviconUrl: {
      type: String,
      default: '',
      trim: true,
      maxlength: 2048,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Database-level duplicate protection is essential because request-time checks race.
linkSchema.index({ userId: 1, url: 1 }, { unique: true, name: 'user_url_unique' });
linkSchema.index({ userId: 1, createdAt: -1 });

const Link = mongoose.model('Link', linkSchema);

export default Link;
