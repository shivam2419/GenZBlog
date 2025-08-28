import express from "express";
import Comment from "../models/Comment.js";
import { protect } from "../middleware/authMiddleware.js";
import Post from "../models/Post.js";
const router = express.Router();

// add comment
router.post("/:postId", protect, async (req, res) => {
  const { content } = req.body;
  const { postId } = req.params;

  const post = await Post.findById(req.params.postId);
  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  const comment = new Comment({
    content,
    author: req.user.id, // authMiddleware se user set hota hai
    post: postId,
  });
  await comment.save();
  post.comments += 1;
  await post.save();
  
  res.status(201).json(comment);
});

// get comments for post
router.get("/:postId", async (req, res) => {
  const comments = await Comment.find({ post: req.params.postId }).populate(
    "author"
  );
  res.json(comments);
});

export default router;
