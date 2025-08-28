import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    image: { type: String }, // URL or path to uploaded image
    likes: { type: Number, default: 0 }, // Count of likes
    comments: { type: Number, default: 0 } // Count of comments
  },
  { timestamps: true }
);

export default mongoose.model("Post", postSchema);