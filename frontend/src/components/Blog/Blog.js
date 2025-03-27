import {React, useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBookmark } from 'react-icons/fi';
import axios from 'axios';
import './Blog.css';
import { jwtDecode } from 'jwt-decode';
import DOMPurify from "dompurify";
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw'

import VoteComponent from '../Vote/Vote';

const Blog = ({ blogId }) => {
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [user, setUser] = useState(null);
  const[author,setAuthor]= useState(null);
  const [isSaved, setIsSaved] = useState(false);

  const extractFirstHtmlElement = (html = "") => (html.trim().match(/<(\w+)[^>]*>.*?<\/\1>/s) || [html])[0];
  const saveBlogToUser = async ( blogId) => {
    if(!user) return;
    if(!blogId) return;
    try {
        const response = await axios.put(`http://localhost:5000/api/user/${user?.id}/saveBlogs`, {
            blogId:blogId,
        });
        console.log("Blog saved to user successfully:", response.data);
        setIsSaved(true) ; // Return updated user data
    } catch (error) {
        console.error("Error saving blog to user:", error.response?.data?.message || error.message);
        throw error;
    }
};
  useEffect(() => {
    const fetchAuthor= async () => {
      if(!blog) return 
      try {
        const response = await axios.get(`http://localhost:5000/api/user/${blog?.author}`,
          { headers: { "Content-Type": "application/json" } }
        );
        console.log(response.data);
        setAuthor(response.data);
      } catch (error) {
        console.error("Error fetching blog:", error);
      }
    };
    fetchAuthor();
  }, [blog]);

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
    
    // const SaveBlogs = async (blogId) => {
    //   try {
    //     await axios.put(`http://localhost:5000/api/user/${user._id}/saveBlogs`,
    //       { blogId },
    //       { headers: { "Content-Type": "application/json" } }
    //     );
    //   } catch (error) {
    //     console.error("Error saving blog:", error);
    //   }
    // };
    

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
    <div className="blog-post" >
      <div className="author-info">
        <img src={`https://api.dicebear.com/8.x/identicon/svg?seed=${blog?.author_name}`} alt={blog?.author} style={{ width: '20px', height: '20px', borderRadius: '50%', border:'black' }} onClick={()=>{if(author._id===user.id){navigate(`/user-profile`)}
        else if(blog?.author_name!=='Anonymous') {navigate(`/account/${author?._id}`)}} }
        
        />
        <div className="author-details">
          <h3 className="author-name">{blog?.author_name}</h3>
          <p className="author-role">{blog?.role}</p>
          <div className="post-time">{blog?.CreatedAt}</div>
        </div>
        
      </div>
      
      <h2 className="blog-title">{blog?.title}</h2>
      <div  className="blog-content" onClick={() => navigate(`/blog/${blog?._id}`)}>
      <ReactMarkdown rehypePlugins={[rehypeRaw]}>{ extractFirstHtmlElement(blog?.content) }</ReactMarkdown>
      </div>
      
      <div className="blog-footer">
        <div className="vote-section">
          <VoteComponent blogId={blogId}/>
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
      </div>
    </div>
  );
};

export default Blog