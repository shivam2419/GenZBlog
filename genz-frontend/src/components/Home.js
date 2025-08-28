import { useState, useEffect } from "react";
import axios from "axios";
import "../style/Home.css";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

export default function Home() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Add useNavigate hook

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        // Check if token exists before making the request
        if (!token) {
          setLoading(false);
          return;
        }

        const res = await axios.get("http://localhost:5000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(res.data);
      } catch (err) {
        console.error(err);
        // If there's an error (like token expired), remove token and set user to null
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem("token");
        // Only fetch posts if user is logged in and has a token
        if (!token) {
          setPosts([]);
          return;
        }

        const res = await axios.get("http://localhost:5000/api/posts", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Handle different response formats
        if (Array.isArray(res.data)) {
          setPosts(res.data);
        } else if (res.data && Array.isArray(res.data.posts)) {
          setPosts(res.data.posts);
        } else if (res.data && Array.isArray(res.data.data)) {
          setPosts(res.data.data);
        } else {
          console.error("Unexpected posts response format:", res.data);
          setPosts([]);
        }
      } catch (err) {
        console.error("Error fetching posts:", err);
        setPosts([]);
      }
    };

    if (user) {
      fetchPosts();
    }
  }, [user]);

  // Logout function
  const handleLogout = () => {
    // Remove token from localStorage
    localStorage.removeItem("token");
    // Clear user state
    setUser(null);
    // Clear posts
    setPosts([]);
    // Redirect to home or login page
    navigate("/");
    // Optional: Show logout success message
    alert("You have been logged out successfully!");
  };

  const handleLike = async (postId, e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    try {
      // Optimistic update
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId ? { ...post, likes: post.likes + 1 } : post
        )
      );

      // Make the API call
      const response = await API.post(`/like/${postId}`);
    } catch (err) {
      console.error("Like error:", err);

      // Revert on error
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? { ...post, likes: Math.max(0, post.likes - 1) }
            : post
        )
      );

      alert("Post already liked.");
    }
  };

  if (loading) {
    return (
      <div className="home-container">
        <div className="card">
          <h2>Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container">
      {/* Navigation Bar for logged-in users */}
      {user && (
        <div className="nav-bar">
          <Link to={"/dashboard"} className="dashboard-btn">
            Dashboard
          </Link>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      )}

      {!user ? (
        <div className="card">
          <h1>Welcome!</h1>
          <p>Please login or signup to upload images.</p>
          <div className="btn-group">
            <Link className="btn btn-blue" to={"/login"}>
              Login
            </Link>
            <Link className="btn btn-green" to={"/signup"}>
              Signup
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="posts-container">
            <h2>All Posts</h2>
            {!Array.isArray(posts) || posts.length === 0 ? (
              <p>No posts yet. Be the first to upload!</p>
            ) : (
              <div className="posts-grid">
                {posts.map((post) => (
                  <div key={post._id || post.id} className="post-card">
                    <Link to={`/post/${post._id}`}>
                      <img
                        src={`${post.image}`}
                        alt={post.title || "Post image"}
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/300x200?text=Image+Not+Found";
                        }}
                      />
                    </Link>
                    <div className="post-info">
                      <span className="home-action-btn">
                        <button
                          className="home-like-btn"
                          onClick={() => handleLike(post._id)}
                        >
                          🩷
                          <span className="home-like-count">{post.likes}</span>
                        </button>
                        <Link className="home-comment-btn" to={`/post/${post._id}`}>
                          💬
                          <span className="home-comment-count">
                            {post.comments}
                          </span>
                        </Link>
                      </span>
                      <h3>{post.title || "Untitled"}</h3>
                      <p>
                        By:{" "}
                        {post.author?.username ||
                          post.user?.username ||
                          "Unknown"}
                      </p>
                      <p>
                        {post.createdAt
                          ? new Date(post.createdAt).toLocaleDateString()
                          : "Unknown date"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
