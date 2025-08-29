import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "../style/Home.css";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import InfiniteScroll from "react-infinite-scroll-component";
import Spinner from "./Spinner.js";
export default function Home() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(1); // ✅ use ref for page
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }
        const res = await axios.get("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        console.error(err);
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await axios.get(
        `http://localhost:5000/api/posts?page=${pageRef.current}&limit=4`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newPosts = res.data.posts.filter(
        (p) => !posts.some((existing) => existing._id === p._id)
      );

      // check if newPosts are empty
      if (!newPosts || newPosts.length === 0) {
        setHasMore(false);
        return;
      }

      setPosts((prev) => [...prev, ...newPosts]);

      // increment page only if new posts received
      pageRef.current += 1;

      // update hasMore based on total posts count
      if (res.data.totalPosts) {
        setHasMore(posts.length + newPosts.length < res.data.totalPosts);
      }
    } catch (err) {
      console.error("Error fetching posts:", err);
    }
  };

  useEffect(() => {
    if (user) {
      pageRef.current = 1; // reset page
      setPosts([]);
      setHasMore(true);
      fetchPosts();
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setPosts([]);
    navigate("/");
    alert("You have been logged out successfully!");
  };

  const handleLike = async (postId, e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    try {
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? { ...p, likes: p.likes + 1 } : p))
      );
      await API.post(`/like/${postId}`);
    } catch (err) {
      console.error("Like error:", err);
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId ? { ...p, likes: Math.max(0, p.likes - 1) } : p
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
        <div className="posts-container">
          <h2>All Posts</h2>
          <InfiniteScroll
            dataLength={posts.length}
            next={fetchPosts} // always uses pageRef
            hasMore={hasMore}
            loader={<Spinner />}
            endMessage={<center>No more posts to show</center>}
          >
            <div className="posts-grid">
              {posts.map((post) => (
                <div key={post._id} className="post-card">
                  <Link to={`/post/${post._id}`}>
                    <img
                      src={post.image}
                      alt={post.title || "Post image"}
                      onError={(e) =>
                        (e.target.src =
                          "https://via.placeholder.com/300x200?text=Image+Not+Found")
                      }
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
                      <Link
                        className="home-comment-btn"
                        to={`/post/${post._id}`}
                      >
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
          </InfiniteScroll>
        </div>
      )}
    </div>
  );
}
