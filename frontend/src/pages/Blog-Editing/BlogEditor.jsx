import React, { useState, useEffect } from "react";
import "./BlogEditor.css";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const BlogEditor = () => {
  const location = useLocation();
  const { blogId } = location?.state || {};
  const [formData, setFormData] = useState({
    title: "",
    visibility: "",
  });
  const [content, setContent] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [blog, setBlog] = useState(null);

  // Check authentication and set user
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

  // Fetch blog details once user is set
  useEffect(() => {
    if (!user || !blogId) return;

    const fetchBlog = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/blog/${blogId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
          }
        });

        setBlog(response.data);
      } catch (error) {
        console.error("Error fetching blog:", error);
      }
    };

    fetchBlog();
  }, [user, blogId]);

  // Update content and title when blog is set
  useEffect(() => {
    if (blog) {
      setContent(blog.content || "");
      setFormData((prev) => ({ ...prev, title: blog.title || "" }));
    }
  }, [blog]);

  // Redirect if user is not the author
  useEffect(() => {
    if (blog && user && blog.author !== user?.id) {
      navigate("/");
    }
  }, [blog, user, navigate]);

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "code-block"],
      ["clean"],
    ],
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Real-time validation
    if (!value.trim()) {
      setErrors((prev) => ({ ...prev, [name]: `${name} is required` }));
    } else {
      setErrors((prev) => {
        const updatedErrors = { ...prev };
        delete updatedErrors[name];
        return updatedErrors;
      });
    }
  };

  const handlePublish = async () => {
    try {
      if (!user) return;

      let author_name = user?.name;
      if (formData.visibility === "Anonymous") {
        author_name = "Anonymous";
      }

      const title = formData?.title;
      if (!title) {
        setErrors((prev) => ({ ...prev, title: "Please give a title" }));
        return;
      }

      if (!content) {
        setErrors((prev) => ({ ...prev, content: "Please write something before publishing" }));
        return;
      }

      const author = user?.id;
      if (!author) {
        setErrors((prev) => ({ ...prev, user: "User authentication failed" }));
        return;
      }

      await axios.patch(
        `http://localhost:5000/api/blog/${blogId}`,
        {
          author,
          author_name,
          content,
          title,
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
          }
        }
      );

      navigate("/");
    } catch (err) {
      setErrors((prev) => ({ ...prev, general: err.response?.data?.message || "Something went wrong" }));
      console.error(err);
    }
  };

  return (
    <div className="blog-writer-container">
      <header className="blog-writer-header">
        <div className="blog-writer-title">Edit Your Blog ✏️</div>
        <div className="blog-writer-header-controls">
          <button className="blog-writer-publish-btn" onClick={handlePublish} style={{ cursor: "pointer" }}>
            Update
          </button>
          <div className="blog-writer-avatar" onClick={() => navigate("/user-profile")}>
            <img
              src={`https://api.dicebear.com/8.x/identicon/svg?seed=${user?.name}`}
              alt="Profile"
              className="profile-image"
              style={{ height: "40px", width: "40px", cursor: "pointer" }}
            />
          </div>
        </div>
      </header>

      <div className="blog-writer-main">
        <div className="blog-writer-editor-panel">
          <div className="blog-writer-page-title">{formData?.title}</div>

          <ReactQuill
            value={content}
            onChange={setContent}
            modules={modules}
            preserveWhitespace={true}
            theme="snow"
            placeholder="Start writing your blog here..."
            className="blog-quill-editor"
          />
        </div>

        <aside className="blog-writer-sidebar">
          <form className="blog-writer-form-section">
            <h3>Form Validation</h3>
            <label htmlFor="title">Title:</label>
            <input
              type="text"
              name="title"
              id="title"
              placeholder="Enter blog title"
              value={formData?.title}
              onChange={handleInputChange}
              className={errors?.title ? "error-input" : ""}
            />
            {errors?.title && <span className="error-message">{errors?.title}</span>}

            <label htmlFor="visibility">Visibility:</label>
            <select
              name="visibility"
              id="visibility"
              value={formData?.visibility}
              onChange={handleInputChange}
              className={errors?.visibility ? "error-input" : ""}
            >
              <option value="">Select visibility</option>
              <option value="Public">Public</option>
              <option value="Anonymous">Anonymous</option>
            </select>
            {errors?.visibility && <span className="error-message">{errors?.visibility}</span>}
          </form>
        </aside>
      </div>
    </div>
  );
};

export default BlogEditor;
