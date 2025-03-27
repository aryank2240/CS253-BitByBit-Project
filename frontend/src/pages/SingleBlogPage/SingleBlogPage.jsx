import { react, useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { jwtDecode } from 'jwt-decode'
import axios from 'axios'
import "./SingleBlogPage.css"
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw'
import { FiSearch, FiBell, FiBookmark, FiSettings } from 'react-icons/fi';
import { FaRegShareSquare,FaRegCommentDots  } from "react-icons/fa";
import VoteComponent from "../../components/Vote/Vote"
import { EmailShareButton, WhatsappShareButton, TwitterShareButton } from 'react-share'
import { LuSendHorizontal } from "react-icons/lu";

const SingleBlogPage = () => {
  const [comment, setComment] = useState("");
  const { id: blogId } = useParams();
  const [blog, setBlog] = useState(null);
  const [user, setUser] = useState(null);
  const [comments, setComments] = useState([]);
  const [tags, setTags] = useState([]);
  const navigate = useNavigate();
  const [author, setAuthor] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [authorName, setAuthorName] = useState('Anonymous');
  const [email, setEmail] = useState('Anonymous')
  const [blogCount, setBlogCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isSaved,setIsSaved]=useState(false);

  useEffect(() => {
    const fetchAuthor = async () => {
      if (!blog) return
      try {
        const response = await axios.get(`http://localhost:5000/api/user/${blog?.author}`,
          { headers: { "Content-Type": "application/json" } }
        );
        console.log(response.data);
        setAuthor(response.data);
        if (authorName !== 'Anonymous') {
          setEmail(response.data.email);
          setBlogCount(response.data.blogCount);
          setFollowersCount(response.data.followersCount);
          setFollowingCount(response.data.followingCount);
        }
      } catch (error) {
        console.error("Error fetching blog:", error);
      }
    };
    fetchAuthor();
  }, [blog]);
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/blog/comments/${blogId}`);
        setComments(response?.data);
      } catch (error) {
        if (error.response && error.response.status === 400) {
          navigate("/404");
        } else {
          console.error("Error fetching Comments:", error);
        }
      }
    };
    fetchComments();
  }, [blogId])

  useEffect(() => {

    const fetchTags = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/blog/tag/${blogId}`);
        setTags(response?.data);
      } catch (error) {
        if (error.response && error.response.status === 400) {
          navigate("/404");
        } else {
          console.error("Error fetching Tags:", error);
        }
      }
    };
    fetchTags();
  }, [blogId])

  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

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
        if (response.status === 400) {
          navigate("/404");
        }
        const blogData = response?.data;
        setBlog(blogData);
        setAuthorName(blogData?.author_name);
          if(user?.id){
            setIsSaved(blogData?.SavedBy?.includes(user?.id))
          }
         
        
      } catch (error) {
        if (error.response && error.response.status === 400) {
          navigate("/404");
        } else {
          console.error("Error fetching blog:", error);
        }
      }
    };
    fetchBlog();
  }, [blogId,user]);

  const addComments = async () => {
    if (!comment) return;
    if (!user) return;
    try {
        const content= comment;
        const ParentBlogId= blogId;
       const  UserId= user?.id;
      const res = await axios.post(`http://localhost:5000/api/comment/post`, {
        content,
        ParentBlogId,
        UserId
  }, {
      headers: { "Content-Type": "application/json" },
    });
    console.log(res.data);
    // Optionally, clear the comment input
    setComment("");
  } catch (err) {
    console.log(err);
  }
};

const SaveBlogs = async () => {
  if(isSaved){return;}
      try {
        await axios.put(`http://localhost:5000/api/user/${user.id}/saveBlogs`,
          { blogId },
          { headers: { "Content-Type": "application/json" } }
        );
        setIsSaved(true);
      } catch (error) {
        console.error("Error saving blog:", error);
      }
    };
    

return (
  <div className="single-blog-app">
    {/* Header/Navigation */}
    <header className="single-blog-header">
      <div className="search-add-container">
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search for blogs, friends"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button className="search-button" onClick={handleSearch}>
            <FiSearch className="search-icon" />
          </button>
        </div>
      </div>

      <div className="single-blog-header-right">
        <div className="single-blog-profile-icon small">
          <img src={`https://api.dicebear.com/8.x/identicon/svg?seed=${user?.name}`} alt={'user'} style={{ width: '33px', height: '33px', borderRadius: '50%', border: 'black', cursor: 'pointer' }} onClick={() => { navigate(`/user-profile`) }} />
        </div>
        <button className="single-blog-add-new-post" onClick={() => navigate('/write')}>
          Add New Blog +
        </button>
      </div>
    </header>

    <div className="single-blog-content-container">
      {/* Main Content Area */}
      <main className="single-blog-main-content">
        {/* Post */}
        <div className="single-blog-post">
          <div className="single-blog-post-header">
            <div className="single-blog-author">
              <div className="single-blog-profile-icon">
                <img src={`https://api.dicebear.com/8.x/identicon/svg?seed=${blog?.author_name}`} alt={'author'} style={{ width: '40px', height: '40px', borderRadius: '50%', border: 'black' }} />
              </div>
              <span className="single-blog-author-name">{blog?.author_name}</span>
            </div>
            <button className="single-blog-more-options">⋮</button>
          </div>

          <div className="single-blog-post-content">
            <h2 className="single-blog-post-title">{blog?.title}</h2>
            <p className="single-blog-post-text">
              <ReactMarkdown rehypePlugins={[rehypeRaw]}>{blog?.content}</ReactMarkdown>
            </p>

            <div className="single-blog-hashtags">
            </div>
          </div>

          <div className="single-blog-post-actions">
            <div className="single-blog-vote-section">
              <VoteComponent blogId={blogId} />
            </div>

            <div className="single-blog-comments-count">
              <span className="comment-icon"><FaRegCommentDots  size={20}/></span>
              <span>{blog?.comments?.length}</span>
            </div>

            <div className="single-blog-share-section">
              <button className="single-blog-share-button">
                <span className="share-icon">Share</span>
                <span><TwitterShareButton url={window.location.href} quote={`Check out this blog....`}><FaRegShareSquare /></TwitterShareButton></span>
              </button>
            </div>



            <div className="single-blog-bookmark-section">
              <button className={`icon-button ${isSaved ? "active": ""}`} onClick={()=>{SaveBlogs();}}>
                <FiBookmark size={20} />
              </button>
            </div>
          </div>

          <div className="single-blog-comment-input">
            <div className="single-blog-profile-icon small">
              <img src={`https://api.dicebear.com/8.x/identicon/svg?seed=${user?.name}`} alt={'user'} style={{ width: '33px', height: '33px', borderRadius: '50%', border: 'black' }} />
            </div>
            <input
              type="text"
              placeholder="Write your comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button
              className="single-blog-send-button"
              style={{ cursor: 'pointer' }}
              onClick={addComments}
            >
              <LuSendHorizontal  />
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <div className="single-blog-comments">
        </div>
      </main>

      {/* Profile Sidebar */}
      <aside className="single-blog-profile">
        <div className="single-blog-profile-card">
          <div className="single-blog-profile-picture">
            <img src={`https://api.dicebear.com/8.x/identicon/svg?seed=${blog?.author_name}`} alt={'user'} style={{ width: '100px', height: '100px', borderRadius: '50%', border: 'black' }} />
            <div className="single-blog-online-indicator"></div>
          </div>

          <h2 className="single-blog-profile-name">{blog?.author_name}</h2>
          <p className="single-blog-profile-handle">{email}</p>

          <div className="single-blog-stats">
            <div className="single-blog-stat">
              <p className="single-blog-stat-value">{blogCount}</p>
              <p className="single-blog-stat-label">Blogs</p>
            </div>

            <div className="single-blog-stat">
              <p className="single-blog-stat-value">{followersCount}</p>
              <p className="single-blog-stat-label">Followers</p>
            </div>

            <div className="single-blog-stat">
              <p className="single-blog-stat-value">{followingCount}</p>
              <p className="single-blog-stat-label">Following</p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>

)
}

export default SingleBlogPage;