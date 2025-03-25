import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "./BlogEditor.css";
import { FaCheckCircle } from "react-icons/fa";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

import {jwtDecode} from "jwt-decode";



const BlogEditor = () => {
  
  const { id: blogId } = useParams(); // Extract blogId from URL
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  
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

  // Fetch blog details
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/blog/${blogId}`);
        const blogData = response.data;
        setTitle(blogData.title);
        setContent(blogData.content);
        setTags(blogData.tags || []);
        setIsPublished(blogData.isPublished);
        setIsPublic(blogData.isPublic);
      } catch (error) {
        console.error("Error fetching blog:", error);
      }
    };

    if (blogId) fetchBlog();
  }, [blogId]);

  // Handle new tag input
  const handleAddTag = async (e) => {
    if (e.key === "Enter" && newTag.trim() !== "") {
      try {
        setLoading(true);
        const response = await axios.put(`http://localhost:5000/api/blog/add/${blogId}`, {
          tag_name: newTag.trim(),
        });

        if (response.status === 200) {
          setTags([...tags, newTag.trim()]); // Update frontend state
          setNewTag("");
        }
      } catch (error) {
        console.error("Error adding tag:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle tag removal
  const handleRemoveTag = async (tagToRemove) => {
    try {
      await axios.put(`http://localhost:5000/api/blog/remove/${blogId}`, {
        tag_name: tagToRemove,
      });
  
      setTags(tags.filter((tag) => tag !== tagToRemove)); // Update frontend state
    } catch (error) {
      console.error("Error removing tag:", error);
    }
  };
  

  // Save Draft
  const handleSaveDraft = async () => {
    try {
      await axios.patch(`http://localhost:5000/api/blog/${blogId}`, {
        title,
        content,
        isPublished: false,
      });
      alert("Draft Saved!");
    } catch (error) {
      console.error("Error saving draft:", error);
    }
  };

  // Publish Blog
  const handlePublish = async () => {
    if (!title.trim() || !content.trim()) {
      alert("Title and content cannot be empty!");
      return;
    }
  
    try {
      await axios.patch(`http://localhost:5000/api/blog/${blogId}`, {
        title,
        content,
        isPublished: true,
      });
  
      alert("Blog Published!");
      navigate("/");
    } catch (error) {
      console.error("Error publishing blog:", error);
    }
  };
  

  // Delete Blog
  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this blog?")) {
      try {
        await axios.delete(`http://localhost:5000/api/blog/${blogId}`);
        alert("Blog Deleted!");
        navigate("/"); // Redirect after deletion
      } catch (error) {
        console.error("Error deleting blog:", error);
      }
    }
  };

  return (
    <div className="blog-editor">
      <div className="editor-header">
        <h2>Edit Your Blog ✏️</h2>
        <p>Published 2 days ago •{user ? user.id : "Loading..."} </p>
        <div className="status">
          <FaCheckCircle className="icon" /> Saved
        </div>
      </div>
      <input type="text" className="blog-title" value={title} onChange={(e) => setTitle(e.target.value)} />

      {/* Rich Text Editor */}
      <ReactQuill theme="snow" value={content} onChange={setContent} className="blog-content" />

      <div className="edit-section">
        <div>
          <strong>Status:</strong> {isPublished ? "Published" : "Draft"} <button onClick={() => setIsPublished(!isPublished)}>Edit</button>
        </div>
        <div>
          <strong>Visibility:</strong> {isPublic ? "Public" : "Private"} <button onClick={() => setIsPublic(!isPublic)}>Edit</button>
        </div>
      </div>

      <div className="tags-section">
        <strong>Tags</strong>
        <div className="tags">
          {tags.map((tag) => (
            <span key={tag} className="tag">
              {tag} <button onClick={() => handleRemoveTag(tag)}>x</button>
            </span>
          ))}
        </div>
        <input type="text" placeholder="Add Tags" value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyDown={handleAddTag} disabled={loading} />
      </div>

      <div className="buttons">
        <button className="save-draft" onClick={handleSaveDraft}>Save Draft</button>
        <button className="edit">Edit</button>
        <button className="publish" onClick={handlePublish}>Publish</button>
        <button className="delete" onClick={handleDelete}>Delete</button>
      </div>
    </div>
  );
};

export default BlogEditor;
