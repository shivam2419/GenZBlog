import { useEffect, useState } from "react";
import API from "../services/api";
import { useParams } from "react-router-dom";
import "../style/Post.css";
export default function Post() {
  const { postId } = useParams();
  const [post, setPost] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await API.get(`posts/post/${postId}`);
        // Handle different response formats
        setPost(res.data);
      } catch (err) {
        console.error("Error fetching posts:", err);
        setPost([]);
      }
    };
    fetchPost();
  }, []);
  const handleLike = async () => {
    try {
      await API.post(`/like/${postId}`);
      setPost({
        ...post,
        likes: post.likes + 1,
      });
    } catch (err) {
      alert("Post already liked.");
    }
  };

  // fetch comments on mount
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await API.get(`/comments/${postId}`);
        setComments(res.data || []);
      } catch (err) {
        console.error("Error fetching comments:", err);
      }
    };
    fetchComments();
  }, [postId]);

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const token = localStorage.getItem("token"); // assuming you store token in localStorage

      const res = await API.post(
        `/comments/${postId}`,
        { content: newComment }, // API expects description/content
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Update UI with new comment
      setComments((prevComments) => [
        ...prevComments,
        {
          post: postId,
          author:
            prevComments.length > 0
              ? prevComments[0].author.username
              : { username: "You" }, // reuse first comment's author
          content: newComment,
          _id: res.data._id, // temporary ID until backend returns actual one
          createdAt: res.data.createdAt,
          updatedAt: res.data.updatedAt,
          __v: 0,
        },
      ]);
      setPost({
        ...post,
        comments: post.comments + 1,
      });
      setNewComment("");
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  return (
    <div className="post-container">
      <span className="post-container-profile-header">
        <img
          src="https://media.istockphoto.com/id/1495088043/vector/user-profile-icon-avatar-or-person-icon-profile-picture-portrait-symbol-default-portrait.jpg?s=612x612&w=0&k=20&c=dhV2p1JwmloBTOaGAtaA3AW1KSnjsdMt7-U_3EZElZ0="
          alt=""
          height={40}
        />
        <h3>{post.user ? post.user.username : "Anonymous"}</h3>
      </span>
      <img src={post.image} alt="post" className="post-image" />

      <h2 className="post-title">{post.title}</h2>
      <p className="post-content">{post.content}</p>

      <div className="post-actions">
      <button className="action-btn" onClick={() => {
            handleLike(post._id);
          }}>
        ❤️ <span>{post.likes}</span>
      </button>
      <button className="action-btn">
        💬 <span>{post.comments}</span>
      </button>
    </div>

      <div className="post-comments">
        <h4>Comments</h4>
        {comments.length > 0 ? (
          comments.map((c, i) => (
            <div key={i} className="comment">
              <div className="comment-header">
                <strong>
                  {c.author.username.charAt(0).toUpperCase() +
                    c.author.username.slice(1) || "Anonymous"}
                </strong>
                <span className="comment-date">
                  {new Date(c.createdAt).toLocaleDateString()}{" "}
                  {/* format date */}
                </span>
              </div>
              <p>{c.content}</p>
            </div>
          ))
        ) : (
          <p>No comments yet. Be the first to comment</p>
        )}

        {/* Add new comment */}
        <form className="add-comment" onSubmit={handleComment}>
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
          />
          <button type="submit">Post</button>
        </form>
      </div>
    </div>
  );
}
