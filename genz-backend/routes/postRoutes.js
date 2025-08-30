import express from "express";
import Post from "../models/Post.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../multer.js"; // ⬅️ ye wala lena (Cloudinary storage wala)

const router = express.Router();

// Create a post
router.post("/", protect, upload.single("image"), async (req, res) => {
  try {
    const { title, content } = req.body;

    // Cloudinary se jo url aata hai wo `req.file.path` hota hai
    const image = req.file ? req.file.path : null;
    const likes = 0,
      comments = 0;
    const post = await Post.create({
      user: req.user.id,
      title,
      content,
      image,
      likes,
      comments,
    });

    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Get all posts
// Get all posts with pagination
router.get("/", async (req, res) => {
  try {
    let { page = 1, limit = 5 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user");

    const total = await Post.countDocuments();

    res.json({
      posts,
      hasMore: skip + posts.length < total,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/user/:userId", async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.userId }) // filter by user ID
      .populate("user");

    if (!posts || posts.length === 0) {
      return res.status(404).json({ message: "No posts found for this user" });
    }

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/post/:postId", async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId).populate("user");
    if (!post) return res.status(404).json({ message: "Post not found" });

    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// postRoutes.js
router.delete("/:id", protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // ✅ sirf owner delete kar sakta hai
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await post.deleteOne();
    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
