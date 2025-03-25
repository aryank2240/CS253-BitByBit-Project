import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./MyBlog.css";
import { useNavigate } from "react-router-dom";
import {jwtDecode} from "jwt-decode";

const MyBlog = () => {
  const [blogs, setBlogs] = useState([]);
   const [user, setUser] = useState(null);
    const navigate = useNavigate();
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
          setUser(decoded); // Ensure this contains the expected fields
        }
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem("jwtToken");
        navigate("/login");
      }
    }, [navigate]); // Ensure `navigate` is included in dependencies
  
  useEffect(() => {
    
    const fetchBlogs = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/blog/home");
        setBlogs(response.data);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      }
    };

    fetchBlogs();
  }, []);

  return (
    <div className="home-container">
      <h1>📝 My Blog</h1>
      <Link to="/blog-create">
        <button className="new-blog-btn">➕ Create New Blog</button>
      </Link>

      <div className="blog-list">
        {blogs.length > 0 ? (
          blogs.map((blog) => (
            <div key={blog._id} className="blog-card">
              <h3>{blog.title}</h3>
              <p>{blog.content.substring(0, 100)}...</p>
              <Link to={`/blog-create/${blog._id}`}>
                <button className="edit-btn">✏️ Edit</button>
              </Link>
            </div>
          ))
        ) : (
          <p>No blogs available. Start writing!</p>
        )}
      </div>
    </div>
  );
};

export default MyBlog;
