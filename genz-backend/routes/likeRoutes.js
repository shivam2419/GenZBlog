import express from "express";
import Like from "../models/Like.js";
import { protect } from "../middleware/authMiddleware.js";
import Post from "../models/Post.js";
const router = express.Router();

// like a post
router.post("/:postId", protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if user already liked this post
    // If you want to prevent duplicate likes, you might need a likedBy array
    // For now, we'll just increment the like count

    // Increment like count
    const like = await Like.create({ post: req.params.postId, user: req.user });
    if(like) {
      post.likes += 1;
      await post.save();
    }

    res.json({
      message: "Post liked successfully",
      likes: post.likes,
    });
  } catch {
    res.status(400).json({ message: "Already liked or error" });
  }
});

// unlike a post
router.delete("/:postId", protect, async (req, res) => {
  await Like.findOneAndDelete({ post: req.params.postId, user: req.user });
  res.json({ message: "Unliked" });
});

export default router;
