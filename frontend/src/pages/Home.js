import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./HomePage.css";

const HomePage = () => {
  const [blogs, setBlogs] = useState([]);

  // Fetch all blogs from the backend
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await axios.get("http://localhost:5000/blogs");
        setBlogs(response.data); // Assuming response contains an array of blogs
      } catch (error) {
        console.error("Error fetching blogs:", error);
      }
    };

    fetchBlogs();
  }, []);

  return (
    <div className="home-container">
      <h1>📝 My Blog</h1>
      <Link to="/edit/new">
        <button className="new-blog-btn">➕ Create New Blog</button>
      </Link>

      <div className="blog-list">
        {blogs.length > 0 ? (
          blogs.map((blog) => (
            <div key={blog._id} className="blog-card">
              <h3>{blog.title}</h3>
              <p>{blog.content.substring(0, 100)}...</p>
              <Link to={`/edit/${blog._id}`}>
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

export default HomePage;
