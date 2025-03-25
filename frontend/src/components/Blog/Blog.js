import {React, useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBookmark } from 'react-icons/fi';
import axios from 'axios';
import './Blog.css';
import { jwtDecode } from 'jwt-decode';

const Blog = ({ blogId }) => {
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [user, setUser] = useState(null);

 
    useEffect(() => {
      console.log(blogId)
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
          setUser(decoded); // Ensure this contains the expected fields
        }
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem("jwtToken");
        navigate("/login");
      }
    }, [navigate]); 

    const Vote = async (blogId, choice) => {
      try {
        if (choice === "upvote") {
          await axios.put(`http://localhost:5000/api/blog/upvote/${blogId}`);
        } else {
          await axios.put(`http://localhost:5000/api/blog/downvote/${blogId}`);
        }
      } catch (error) {
        console.error("Error voting blog:", error);
      }
    };
    
    const SaveBlogs = async (blogId) => {
      try {
        await axios.put(`http://localhost:5000/api/user/${user._id}/saveBlogs`,
          { blogId },
          { headers: { "Content-Type": "application/json" } }
        );
      } catch (error) {
        console.error("Error saving blog:", error);
      }
    };
    

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/blog/${blogId}`,
          { headers: { "Content-Type": "application/json" } }
        );
        console.log(response.data);
        setBlog(response.data);
      } catch (error) {
        console.error("Error fetching blog:", error);
      }
    };
    fetchBlog();
  }, [blogId]);

  

  return (
    <div className="blog-post" onClick={() => navigate(`/blog/${blog?._id}`)}>
      <div className="author-info">
        {/* <img src={blog.authorImage || 'https://via.placeholder.com/40'} alt={blog.author} /> */}
        <div className="author-details">
          <h3 className="author-name">{blog?.author_name}</h3>
          <p className="author-role">{blog?.role}</p>
        </div>
        <div className="post-time">{blog?.CreatedAt}</div>
      </div>
      
      <h2 className="blog-title">{blog?.title}</h2>
      <p className="blog-content">{blog?.content}</p>
      
      <div className="blog-footer">
        <div className="vote-section">
          <button 
            className="vote-button"
            onClick={(e) => {
              Vote(blog?._id, "upvote");
              e.stopPropagation();
            }}
          >
            ↑
          </button>
          <span className="vote-count">
            {(blog?.Upvote || 0) - (blog?.DownVote || 0)}
          </span>
          <button 
            className="vote-button"
            onClick={(e) => {
              Vote(blog?._id, "downvote");
              e.stopPropagation();
            }}
          >
            ↓
          </button>
        </div>
        <span className="blog-stats">
          <span>💬</span>
          <span>{blog?.comments?.length || 0} Comments</span>
        </span>
        {/* <div className="blog-tags">
          {blog?.tags?.map((tag, index) => (
            <span key={index} className="tag">{tag}</span>
          ))}
        </div> */}
        <button 
          className={`save-button ${blog?.isSaved ? 'saved' : ''}`}
          onClick={(e) => {
            SaveBlogs(blog?._id);
            e.stopPropagation();
            
          }}
        >
          <FiBookmark />
        </button>
      </div>
    </div>
  );
};

export default Blog