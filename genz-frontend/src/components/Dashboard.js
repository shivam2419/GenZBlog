import { useEffect, useState } from "react";
import API from "../services/api";
import "../style/Dashboard.css"; // ⬅️ External CSS file

export default function Dashboard() {
  const [posts, setPosts] = useState([]);
  const [userId, setUserId] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem("token");

        const userRes = await API.get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserId(userRes.data._id);

        const res = await API.get("/posts", {
          headers: { Authorization: `Bearer ${token}` },
        });
        // only current user's posts
        const userPosts = res.data.posts.filter(
          (post) => post.user._id === userRes.data._id
        );
        setPosts(userPosts);
      } catch (err) {
        console.error(err);
      }
    };

    fetchPosts();
  }, []);

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await API.delete(`/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(posts.filter((post) => post._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete post");
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!title || !content) return alert("Please fill all fields!");

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    if (image) formData.append("image", image);

    try {
      const res = await API.post("/posts", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setPosts([res.data, ...posts]); // prepend new post
      setTitle("");
      setContent("");
      setImage(null);
    } catch (err) {
      console.error(err);
      alert("Failed to upload post");
    }
  };

  return (
    <div className="dashboard-container">
      <h2>My Posts</h2>

      <form className="upload-form" onSubmit={handleUpload}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <input
          type="file"
          onChange={(e) => setImage(e.target.files[0])}
        />
        <button type="submit">Upload Post</button>
      </form>

      <div className="posts-list">
        {posts.length === 0 ? (
          <p>No posts yet.</p>
        ) : (
          posts.map((post) => (
            <div key={post._id} className="post-card">
              <h3>{post.title}</h3>
              <p>{post.content}</p>
              {post.image && (
                <img src={post.image} alt="post" className="post-image" />
              )}
              <p className="post-date">
                {new Date(post.createdAt).toLocaleString()}
              </p>
              <button
                className="delete-btn"
                onClick={() => handleDelete(post._id)}
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
