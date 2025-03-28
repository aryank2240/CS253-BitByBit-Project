import {React, useState, useEffect }from 'react';
import './BlogWriting.css';
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

import {jwtDecode} from "jwt-decode";
const BlogWritingPage = () => {

    const [tags, setTags] = useState([]);
    const [formData, setFormData] = useState({
      title: '',
      visibility: '',
    });
    const[content, setContent]= useState("");
    const [errors, setErrors] = useState({});
    const navigate= useNavigate();
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

    
      const handleAddTagBackend = async (blogID) => {
        try {
            const blogs=blogID;
            const count =1;
            if (!Array.isArray(tags) || tags.length === 0) return;
    
            const promises = tags.map((name) =>
                axios.post(`http://localhost:5000/api/tag/post`, { name , count, blogs }, {
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
                  }
                })
            );
    
            await Promise.all(promises);
            console.log("All tags created successfully");
        } catch (err) {
            console.error(err.response?.data?.message || err.message || "Something went wrong");
        }
    };
    
      const modules = {
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['link',  'code-block'],
          ['clean'], // Clear formatting
        ],
      };
      
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });
  
      // Real-time validation
      if (!value.trim()) {
        setErrors({ ...errors, [name]: `${name} is required` });
      } else {
        const updatedErrors = { ...errors };
        delete updatedErrors[name];
        setErrors(updatedErrors);
      }
    };
  
    const handleAddTag = (e) => {
      if (e.key === 'Enter' && e.target.value.trim()) {
        const newTag = e.target.value.trim();
        if (!tags.includes(newTag)) {
          setTags([...tags, newTag]);
          e.target.value = ''; // Clear input
        }
      }
    };
  
    const handleRemoveTag = (tagToRemove) => {
      setTags(tags.filter((tag) => tag !== tagToRemove));
    };
  
    // Publish Blog
    const handlePublish = async () => {
        try {
            if (!user) return;
    
            let author_name = user?.name;
            if (formData.visibility === 'Anonymous') {
                author_name = 'Anonymous';
            }
    
            const title = formData?.title;
            if (!title) {
                setErrors((prev) => ({ ...prev, title: 'Please give a title' }));
                return;
            }
    
            if (!content) {
                setErrors((prev) => ({ ...prev, content: 'Please write something before publishing' }));
                return;
            }
    
            const author = user?.id;
            if (!author) {
                setErrors((prev) => ({ ...prev, user: "User authentication failed" }));
                return;
            }
    
            const res = await axios.post(`http://localhost:5000/api/blog/post`, {
                author,
                author_name,
                content,
                title,
            },  {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
              }
            });
    
            if (res?.data?._id) {
                await handleAddTagBackend(res.data._id);
            } else {
                console.error("Blog ID is missing from API response");
            }
    
            navigate('/');
        } catch (err) {
            setErrors((prev) => ({ ...prev, general: err.response?.data?.message || 'Something went wrong' }));
            console.log(err);
        }
    };
    






  return (
    <div className="blog-writer-container">
      <header className="blog-writer-header">
        <div className="blog-writer-title">Build Your Blog✏️</div>
        <div className="blog-writer-header-controls">
          <button className="blog-writer-publish-btn" onClick={handlePublish} style={{cursor:'pointer'}}>Publish</button>
          <div className="blog-writer-avatar" onClick={() => navigate('/user-profile')}> <img src={`https://api.dicebear.com/8.x/identicon/svg?seed=${user?.name}`} alt="Profile" className="profile-image" style={{height:'40px',width:'40px',cursor:'pointer'}}/></div>
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
          {/* Real-time form validation section */}
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
              className={errors?.title ? 'error-input' : ''}
            />
            {errors?.title && <span className="error-message">{errors?.title}</span>}

            <label htmlFor="visibility">Visibility:</label>
            <select
              name="visibility"
              id="visibility"
              value={formData?.visibility}
              onChange={handleInputChange}
              className={errors?.visibility ? 'error-input' : ''}
            >
              <option value="">Select visibility</option>
              <option value="Public">Public</option>
              <option value="Anonymous">Anonymous</option>
            </select>
            {errors?.visibility && <span className="error-message">{errors?.visibility}</span>}

          </form>

          {/* Tags input section */}
          <div className="blog-writer-tags-section">
            <h3>Add Tags</h3>
            <input
              type="text"
              placeholder={`Press Enter to add a tag`}
              onKeyDown={handleAddTag}
            />
            <ul className="tags-list">
              {tags?.map((tag, index) => (
                <li key={index} className="tag-item">
                  {tag}
                  <button onClick={() => handleRemoveTag(tag)}>&times;</button>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default BlogWritingPage;
