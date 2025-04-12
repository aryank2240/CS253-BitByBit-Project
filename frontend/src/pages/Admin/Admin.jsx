import React, { useState, useEffect } from 'react';
import { FiSearch, FiBell, FiBookmark, FiSettings, FiAlertCircle, FiTrash2 } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import Blog from '../../components/Blog/Blog';
import Sidebar from '../../components/Sidebar/Sidebar';
import './Admin.css';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { IoReturnDownBackOutline } from "react-icons/io5";

const Admin = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('forYou');
  const [viewMode, setViewMode] = useState('default');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [warningMessage, setWarningMessage] = useState('');
  const [user,setUser]= useState('');
  const [blog, setBlog]= useState([]);
  const [followedBlogs, setFollowedBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [savedBlogs, setSavedBlogs] = useState([]);
  const [reportedBlogs, setReportedBlogs] = useState([]);
  const [err, setError]= useState("");

  // Check if user is admin



  useEffect(() => {
      const token = localStorage.getItem("jwtToken");
  
      if (!token) {
        navigate("/login");
        return;
      }
  
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
  
        if (decoded.exp < currentTime || decoded.role==='user') {
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


  
    useEffect(() => {
      if(!user){return;}
      const fetchSavedBlog = async () => {
        try {
          const response = await axios.get(`http://localhost:5000/api/user/${user?.id}/SavedBlogs`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
            }
          }).then((res) => {
            setSavedBlogs(res?.data);
          });
        } catch (error) {
          console.error("Error fetching saved blogs:", error);
        }
      };
      fetchSavedBlog();
    }, [user]);
    

    useEffect(() => {
      const fetchBlogs = async () => {
        try {
          const response = await axios.get('http://localhost:5000/api/blog/home', {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
            }
          }).then((res) => {
            setBlog(res?.data);

          });
        } catch (error) {
          console.error('Error fetching blogs:', error);
          setError('Error fetching blogs');
        } 
      };
  
      fetchBlogs();
    }, []);

    async function removeBlog(blogId){
      try{
        const response = await axios.delete(`http://localhost:5000/api/blog/${blogId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
          }
        }).then((res) => {
          window.location.reload();
        });
      } catch (error) {
        console.error('Error fetching blogs:', error);
      } 
    }

    useEffect(() => {
      const fetchReportedBlogs = async () => {
        try {
           await axios.get('api/blog/reported', {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
            }
          }).then((res) => {
            setReportedBlogs(res?.data);
          });
        } catch (error) {
          console.error('Error fetching Reported blogs:', error);
          setError('Error fetching reported blogs');
        } 
      };
  
      fetchReportedBlogs();
    }, []);
    
    useEffect(() => {
      if(!user){return;}
        const fetchFollowedBlogs = async () => {
          try {
            const response = await axios.get(`http://localhost:5000/api/user/${user?.id}/followedBlogs`, {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
              }
            });
            setFollowedBlogs(response?.data);
          } catch (error) {
            console.error("Error fetching followed blogs:", error);
          }
        };
        fetchFollowedBlogs();
      }, [user]);
    

        useEffect(() => {
          if(viewMode === 'saved') {
            setFilteredBlogs(savedBlogs);
          }
          else if(viewMode === 'reported'){
            setFilteredBlogs(reportedBlogs);
          }
          else{
            if (activeTab === 'forYou') {
              setFilteredBlogs(blog);
            } else if (activeTab === 'following') {
              setFilteredBlogs(followedBlogs);
          }
        }
          
        }, [activeTab, blog, followedBlogs,savedBlogs, viewMode]);
  
        const getPageTitle = () => {
          switch (viewMode) {
            case 'saved':
              return 'Saved Blogs';
            case 'reported':
              return 'Reported';
            default:
              return activeTab === 'forYou' ? 'For You' : 'Following';
          }
        };


  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/admin/search?query=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <div className="admin-container">
      {/* Admin Badge */}
     

      {/* Header Section */}
      <header className="header-content">
        <div className="header-main-row">
          <div className="search-add-container">
            <div id="back-admin">
            <IoReturnDownBackOutline  size={30} onClick={()=>{navigate('/')}} style={{cursor:'pointer',}}/>
            Go to home
            </div>
                             
           
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
          <div className="admin-badge">
        Admin Dashboard
      </div>
          <div className="header-right">
            <div className="header-icons">
              <button 
                className={`icon-button ${viewMode === 'saved' ? 'active' : ''}`}
                onClick={() => setViewMode(prev => prev === 'saved' ? 'default' : 'saved')}
              >
                <FiBookmark />
              </button>
              <button 
                className={`icon-button ${viewMode === 'reported' ? 'active' : ''}`}
                onClick={() => setViewMode(prev => prev === 'reported' ? 'default' : 'reported')}
              >
                <FiBell />
                
              </button>
              <button className="icon-button" onClick={() => navigate('/user-profile')}>
                <img
                  src={`https://api.dicebear.com/8.x/identicon/svg?seed=${user?.id}`}
                  alt="Anonymous User"
                  className="user-icon"
                  style={{ width: '100%', height: '100%', borderRadius: '50%' }}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        {viewMode === 'default' && (
          <div className="navigation-tabs">
            <button
              className={`tab-button ${activeTab === 'forYou' ? 'active' : ''}`}
              onClick={() => setActiveTab('forYou')}
            >
              For You
            </button>
            <button
              className={`tab-button ${activeTab === 'following' ? 'active' : ''}`}
              onClick={() => setActiveTab('following')}
            >
              Following
            </button>
          </div>
        )}

        {viewMode !== 'default' && (
          <div className="navigation-tabs">
            <div className="tab-button active">
              {getPageTitle()}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <div className="main-content-container">
        <div className="feed-column">
        {filteredBlogs.map((blog) => {
          const shouldRenderBlog =
          activeTab !== 'following' || blog?.author_name !== 'Anonymous';
          if (!shouldRenderBlog) return null;
          return(
            <div key={blog?._id} className="blog-wrapper">
              <Blog blogId={blog?._id} />
              {viewMode === 'reported' && (
                <div className="blog-actions">
                  <div className="report-info">
                    <span className="report-count">Reported {blog?.ReportCount} Times</span>
                  </div>
                  <div className="action-buttons">
                    <button 
                      className="action-button remove"
                      onClick={()=>{removeBlog(blog?._id)}}
                    >
                      <FiTrash2 /> Remove Post
                      
                    </button>
                  </div>
                </div>
              )}
            </div>);})}
        </div>

        <Sidebar  />
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="dialog-overlay">
          <div className="dialog-content">
            <h3>{actionType === 'warning' ? 'Send Warning' : 'Remove Post'}</h3>
            {actionType === 'warning' && (
              <textarea
                value={warningMessage}
                onChange={(e) => setWarningMessage(e.target.value)}
                placeholder="Enter warning message..."
                className="warning-message"
              />
            )}
            <p>Are you sure you want to {actionType === 'warning' ? 'send this warning?' : 'remove this post?'}</p>
            <div className="dialog-buttons">
              <button className="cancel-btn" onClick={() => setShowConfirmDialog(false)}>
                Cancel
              </button>
              <button 
                className={`confirm-btn ${actionType === 'warning' ? 'warning' : 'remove'}`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin; 