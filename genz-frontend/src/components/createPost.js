import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../style/CreatePost.css";
export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    if (image) {
      formData.append("image", image); // 👈 multer will catch this
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/posts",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            // "Content-Type": "multipart/form-data", // axios khud set karega
          },
        }
      );
      navigate("/"); // success ke baad redirect karna ho to
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error creating post");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="create-post-form">
      <h2>Create a Post</h2>
      <input
        type="text"
        placeholder="Title"
        value={title}
        name="title"
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <textarea
        placeholder="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
      ></textarea>
      <input
        type="file"
        onChange={(e) => setImage(e.target.files[0])}
        name="image"
      />
      <button type="submit">Create Post</button>
    </form>
  );
}
