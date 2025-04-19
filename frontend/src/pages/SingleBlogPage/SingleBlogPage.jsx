import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { jwtDecode } from 'jwt-decode'
import axios from 'axios'
import "./SingleBlogPage.css"
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw'
import { FiSearch, FiBookmark } from 'react-icons/fi';
import { FaRegShareSquare, FaRegCommentDots } from "react-icons/fa";
import VoteComponent from "../../components/Vote/Vote"
import { TwitterShareButton } from 'react-share'
import { LuSendHorizontal } from "react-icons/lu";
// Import the new CommentList component
import CommentList from "../../components/Comment/CommentList";
import { IoReturnDownBackOutline } from "react-icons/io5";

const SingleBlogPage = () => {
  const [comment, setComment] = useState("");
  const { id: blogId } = useParams();
  const [blog, setBlog] = useState(null);
  const [user, setUser] = useState(null);
  const [tags, setTags] = useState([]);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [author, setAuthor] = useState(null)
  const [newCommentAdded, setNewCommentAdded] = useState(false);

  useEffect(() => {
    const fetchAuthor = async () => {
      if (!blog) return
      try {
        const response = await axios.get(`http://localhost:5000/api/user/${blog?.author}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
          }
        }
        );
        setAuthor(response?.data);
      } catch (error) {
        console.error("Error fetching blog:", error);
      }
    };
    fetchAuthor();
  }, [blog]);


  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/blog/tag/${blogId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
          }
        });
        setTags(response?.data);
      } catch (error) {
        if (error.response && error.response.status === 400) {
          // navigate("/404");
        } else {
          console.error("Error fetching Tags:", error);
        }
      }
    };
    fetchTags();
  }, [blogId, navigate])

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
        const response = await axios.get(`http://localhost:5000/api/blog/${blogId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
          }
        });
        if (response.status === 400) {
          // navigate("/404");
        }
        const blogData = response?.data;
        setBlog(blogData);

        if (user?.id) {
          setIsSaved(blogData?.SavedBy?.includes(user?.id))
        }
      } catch (error) {
        if (error.response && error.response.status === 400) {
          //navigate("/404");
        } else {
          console.error("Error fetching blog:", error);
        }
      }
    };
    fetchBlog();
  }, [blogId, user, navigate]);

  const addComments = async () => {
    if (!comment) return;
    if (!user) return;
    try {
      const content = comment;
      const ParentBlogId = blogId;
      const UserId = user?.id;
      const res = await axios.post(`http://localhost:5000/api/comment/post`, {
        content,
        ParentBlogId,
        UserId

      }, {
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`

        },

      });

      setComment("");
      // Toggle newCommentAdded to trigger a refresh in CommentList
      setNewCommentAdded(prev => !prev);
      window.location.reload();
    } catch (err) {
      console.log(err);
    }
  };

  const SaveBlogs = async () => {
    if (isSaved) { return; }
    try {
      await axios.put(`http://localhost:5000/api/user/${user.id}/saveBlogs`,
        { blogId }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
        }
      }
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
          <IoReturnDownBackOutline size={30} onClick={() => { window.history.back() }} style={{ cursor: 'pointer', }} />

          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Search for blogs, tags"
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
            <img src={`https://api.dicebear.com/8.x/identicon/svg?seed=${user?.id}`} alt={'user'} style={{ width: '33px', height: '33px', borderRadius: '100%',cursor:'pointer' }} onClick={() => { navigate(`/user-profile`) }} className="profile-image" />
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
                  <img onClick={() => {
                    if (author?._id === user.id) navigate(`/user-profile`);
                    else if (blog?.author_name !== "Anonymous") navigate(`/account/${author?._id}`);
                  }} src={`https://api.dicebear.com/8.x/identicon/svg?seed=${blog?.author_name == "Anonymous" ? blog?.author_name : author?._id}`} alt={'author'} style={{ width: '40px', height: '40px', borderRadius: '50%',  cursor:'pointer'}} className="profile-image"/>
                </div>
                <span className="single-blog-author-name">{blog?.author_name == "Anonymous" ? blog?.author_name : author?.name}</span>
              </div>
              <button className="single-blog-more-options">⋮</button>
            </div>

            <div className="single-blog-post-content">
              <h2 className="single-blog-post-title">{blog?.title}</h2>
              {tags.map(tag => (
                <p style={{ color: "purple" }}>{`#${tag?.name}`}</p>
              ))}
              <span className="single-blog-post-text">
                <ReactMarkdown rehypePlugins={[rehypeRaw]}>{blog?.content}</ReactMarkdown>
              </span>

              <div className="single-blog-hashtags">
              </div>
            </div>

            <div className="single-blog-post-actions">
              <div className="single-blog-vote-section">
                <VoteComponent blogId={blogId} userId={user?.id} />
              </div>

              <div className="single-blog-comments-count">
                <span className="comment-icon"><FaRegCommentDots size={20} /></span>
                <span>{blog?.comments?.length}</span>
              </div>

              <div className="single-blog-share-section">
                <div className="single-blog-share-button">
                  <span className="share-icon">Share</span>
                  <span><TwitterShareButton url={window.location.href} quote={`Check out this blog....`}><FaRegShareSquare /></TwitterShareButton></span>
                </div>
              </div>

              <div className="single-blog-bookmark-section">
                <button className={`icon-button ${isSaved ? "active" : ""}`} onClick={() => { SaveBlogs(); }}>
                  <FiBookmark size={20} />
                </button>
              </div>
            </div>

            <div className="single-blog-comment-input">
              <div className="single-blog-profile-icon small">
                <img onClick={() => {
                    if (author?._id === user?.id) navigate(`/user-profile`);
                    else if (blog?.author_name !== "Anonymous") navigate(`/account/${author?._id}`);
                  }} src={`https://api.dicebear.com/8.x/identicon/svg?seed=${user?.id}`} alt={'user'} style={{ width: '33px', height: '33px', cursor:'pointer'}}  className="profile-image"/>
              </div>
              <input
                type="text"
                placeholder="Write your comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addComments()}
              />
              <button
                className="single-blog-send-button"
                style={{ cursor: 'pointer' }}
                onClick={addComments}
              >
                <LuSendHorizontal />
              </button>
            </div>
          </div>

          {/* Comments Section - Use our new CommentList component */}
          <div className="single-blog-comments">
            <CommentList blogId={blogId} newComment={newCommentAdded} />
          </div>
        </main>

        {/* Profile Sidebar */}
        <aside className="single-blog-profile">
          <div className="single-blog-profile-card">
            <div className="single-blog-profile-picture">
              <img onClick={() => {
                    if (author?._id === user.id) navigate(`/user-profile`);
                    else if (blog?.author_name !== "Anonymous") navigate(`/account/${author?._id}`);
                  }} src={`https://api.dicebear.com/8.x/identicon/svg?seed=${blog?.author_name == "Anonymous" ? blog?.author_name : author?._id}`} alt={'user'} style={{ width: '100px', height: '100px', borderRadius: '50%', cursor:'pointer' }} className="profile-image" />
              <div className="single-blog-online-indicator"></div>
            </div>

            <h2 className="single-blog-profile-name">{blog?.author_name == "Anonymous" ? blog?.author_name : author?.name}</h2>
            <p className="single-blog-profile-handle">{blog?.author_name == "Anonymous" ? "anonymous@iitk.ac.in" : author?.email}</p>

            <div className="single-blog-stats">
              <div className="single-blog-stat">
                <p className="single-blog-stat-value">{blog?.author_name == "Anonymous" ? "" : author?.blogs?.length}</p>
                <p className="single-blog-stat-label">Blogs</p>
              </div>

              <div className="single-blog-stat">
                <p className="single-blog-stat-value">{blog?.author_name == "Anonymous" ? "" : author?.followersCount}</p>
                <p className="single-blog-stat-label">Followers</p>
              </div>

              <div className="single-blog-stat">
                <p className="single-blog-stat-value">{blog?.author_name == "Anonymous" ? "" : author?.followingCount}</p>
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
