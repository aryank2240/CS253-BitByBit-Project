import {React, useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import './Blog.css';
import { jwtDecode } from 'jwt-decode';

import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw'
import { fetchAuthor, fetchBlog, fetchUser } from '../../services/api';
import VoteComponent from '../Vote/Vote';

const Blog = ({ blogId }) => {
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [user, setUser] = useState(null);
  const[author,setAuthor]= useState(null);
  const extractFirstHtmlElement = (html = "") => (html.trim().match(/<(\w+)[^>]*>.*?<\/\1>/s) || [html])[0];

 useEffect(() => {
  const fetchData = async () => {
    const userData =await fetchUser(navigate);
    setUser(userData);

    const blogData = await fetchBlog(blogId);
    setBlog(blogData);

    const authorData = await fetchAuthor(blogData?.author);
    setAuthor(authorData);

  };

  fetchData();
}, [blogId, navigate]);

  
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
          <VoteComponent blogId={blogId} userId={user?.id}/>
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