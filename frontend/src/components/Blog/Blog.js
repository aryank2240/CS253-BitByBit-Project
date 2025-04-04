import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBookmark, FiMoreHorizontal } from 'react-icons/fi'; // Three-dot icon
import axios from 'axios';
import './Blog.css';
import {jwtDecode} from 'jwt-decode';
import DOMPurify from 'dompurify';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import VoteComponent from '../Vote/Vote';

const Blog = ({ blogId }) => {
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [user, setUser] = useState(null);
  const [author, setAuthor] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [tags, setTags] = useState([]);
  const [showOptions, setShowOptions] = useState(false);
  const [isReported, setIsReported] = useState(false);
  // Utility: Extract first HTML element from content
  const extractFirstHtmlElement = (html = "") =>
    (html.trim().match(/<(\w+)[^>]*>.*?<\/\1>/s) || [html])[0];

  // Function: Save blog to user's saved blogs
  const saveBlogToUser = async (blogId) => {
    if (!user || !blogId) return;
    try {
      await axios.put(
        `http://localhost:5000/api/user/${user?.id}/saveBlogs`,
        { blogId },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
          },
        }
      );
      setIsSaved(true);
    } catch (error) {
      console.error(
        "Error saving blog to user:",
        error.response?.data?.message || error.message
      );
      throw error;
    }
  };

  // Toggle dropdown options
  const handleOptionsToggle = () => {
    setShowOptions((prev) => !prev);
  };

  // Navigate to edit page (with blogId passed in state)
  const handleEdit = () => {
    navigate(`/edit-blog`, { state: { blogId: blogId } });
  };

  // Delete blog and refresh the page afterward
  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/blog/${blogId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
        },
      });
      window.location.reload();
    } catch (error) {
      console.error('Error deleting blog:', error);
    }
  };


  
  const handleReport = async () => {
    if (isReported) {
      alert("This blog has already been reported.");
      return;
    }
  
    try {
      if (!blog || !blogId) return;
      
      const updatedReportCount = (blog?.ReportCount || 0) + 1;
  
      await axios.patch(
        `http://localhost:5000/api/blog/${blogId}`,
        { ReportCount: updatedReportCount },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          },
        }
      );
  
      alert("Thank you for reporting this blog. Our team will review it soon.");
      setIsReported(true);
     
    } catch (error) {
      console.error("Error reporting blog:", error);
    }
  };
  

  // Fetch blog author data once blog is set
  useEffect(() => {
    const fetchAuthor = async () => {
      if (!blog) return;
      try {
        const response = await axios.get(
          `http://localhost:5000/api/user/${blog?.author}`,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
            },
          }
        );
        setAuthor(response.data);
      } catch (error) {
        console.error("Error fetching blog:", error);
      }
    };
    fetchAuthor();
  }, [blog]);

  // Verify token, decode it, and set user data
  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      if (decoded.exp < currentTime) {
        localStorage.removeItem("jwtToken");
        navigate("/login");
      } else {
        setUser(decoded);
      }
    } catch (error) {
      console.error("Invalid token:", error);
      localStorage.removeItem("jwtToken");
      navigate("/login");
    }
  }, [navigate]);

  // Fetch blog data
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/blog/${blogId}`,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
            },
          }
        );
        setBlog(response.data);
        if (response?.data.ReportCount > 0) {
          setIsReported(true);
        }
      } catch (error) {
        console.error("Error fetching blog:", error);
      }
    };
    fetchBlog();
  }, [blogId]);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/blog/tag/${blogId}`,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
            },
          }
        );
        setTags(response.data);
      } catch (error) {
        if (error.response && error.response.status === 400) {
          // Optional: handle error 400 if necessary
        } else {
          console.error("Error fetching Tags:", error);
        }
      }
    };
    fetchTags();
  }, [blogId, navigate]);

 
  return (
    <div className="blog-post" style={{ position: 'relative' }}>
      {/* Three-dot options button in the top-right corner */}
      <div className="options-container" style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 2 }}>
        <button
          onClick={handleOptionsToggle}
          className="options-button"
          style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
        >
          <FiMoreHorizontal size={20} />
        </button>

        {showOptions && (
          <div
            className="options-dropdown"
            style={{
              position: "absolute",
              top: "30px",
              right: 0,
              background: "#fff",
              border: "1px solid #ccc",
              borderRadius: "4px",
              boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
            }}
          >
            {user?.id === author?._id ? (
              <>
                {/* "Edit" button for authors */}
                <button
                  onClick={handleEdit}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "8px",
                    border: "none",
                    background: "none",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  Edit
                </button>
                {/* "Delete" button for authors */}
                <button
                  onClick={handleDelete}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "8px",
                    border: "none",
                    background: "none",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </>
            ) : (
              // "Report" button for non‑authors
              <button
                onClick={handleReport}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "8px",
                  border: "none",
                  background: "none",
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                Report
              </button>
            )}
          </div>
        )}
      </div>

      <div className="author-info">
        <img
          src={`https://api.dicebear.com/8.x/identicon/svg?seed=${blog?.author_name}`}
          alt={blog?.author}
          style={{
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            border: "#6c63ff 1px solid",
          }}
          onClick={() => {
            if (author?._id === user.id) navigate(`/user-profile`);
            else if (blog?.author_name !== "Anonymous") navigate(`/account/${author?._id}`);
          }}
        />
        <div className="author-details">
          <h3 className="author-name">{blog?.author_name}</h3>
          <p className="author-role">{blog?.role}</p>
          <div className="post-time">{blog?.CreatedAt}</div>
        </div>
      </div>

      <h2 className="blog-title">{blog?.title}</h2>

      <div className="blog-content" onClick={() => navigate(`/blog/${blog?._id}`)}>
        <ReactMarkdown rehypePlugins={[rehypeRaw]}>
          {extractFirstHtmlElement(blog?.content)}
        </ReactMarkdown>
      </div>

      <div className="blog-footer">
        <div className="vote-section">
          <VoteComponent blogId={blogId} userId={user?.id} />
        </div>
        <span className="blog-stats">
          <span>💬</span>
          <span>{blog?.comments?.length || 0} Comments</span>
        </span>
        <div className="blog-tags">
          {tags?.map((tag, index) => (
            <span
              key={index}
              className="tag"
              style={{ color: "#6c63ff" }}
              onClick={() => navigate(`/search?query=${encodeURIComponent(tag?.name?.trim())}`)}
            >
              #{tag?.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Blog;
