import React, { useState, useEffect } from 'react';
import { FiSearch, FiBell, FiBookmark, FiSettings } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import Blog from '../../components/Blog/Blog';
import Sidebar from '../../components/Sidebar/Sidebar';

import './Home.css';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { FaUniregistry } from 'react-icons/fa';
import { act } from 'react';

const Home = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('forYou');
  const [viewMode, setViewMode] = useState('default');
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [followedBlogs, setFollowedBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [savedBlogs, setSavedBlogs] = useState([]);


  // const betterDate = (date) => {
  //   const newDate = new Date(date).toLocaleDateString('en-US', 
  
  
  // Example Usage
 
  
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
  }, [navigate]);




  const Vote = ({ blogId, choice }) => {
    try {
      if (choice == "upvote") {
        const upvote = async () => {
          try {
            const response = await axios.put(`http://localhost:5000/api/blog/upvote/${blogId}`);
          } catch (error) {
            console.error("Error upvoting blog:", error);
          }
        }
      }
      else {
        const downvote = async () => {
          try {
            const response = await axios.put(`http://localhost:5000/api/blog/downvote/${blogId}`);
          } catch (error) {
            console.error("Error downvoting blog:", error);
          }
        }
      }
    }
    catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    const fetchSavedBlog = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/user/${user._id}/SavedBlogs`);
        setSavedBlogs(response.data);
      } catch (error) {
        console.error("Error fetching saved blogs:", error);
      }
    };
  }, [user]);

  

  const SaveBlogs = ({ blogId }) => {
    try {
      const save = async () => {
        try {
          const response = await axios.put(`http://localhost:5000/api/user/${user._id}/saveBlogs`,
            { blogId }
            , { headers: { "Content-Type": "application/json" } }
          );
        } catch (error) {
          console.error("Error saving blog:", error);
        }
      }
    }
    catch (err) {
      console.error(err);
    }
  }



  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/blog/home', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
          }
        }).then((res) => {
          setBlogs(res.data);
          console.log(res.data);
        });
      } catch (error) {
        console.error('Error fetching blogs:', error);
        setError('Error fetching blogs');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchTerm.trim())}`);
    }
  };


  useEffect(() => {
    const fetchFollowedBlogs = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/user/${user._id}/followedBlogs`);
        setFollowedBlogs(response.data);
      } catch (error) {
        console.error("Error fetching followed blogs:", error);
      }
    };
  }, [user]);



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

  useEffect(() => {
    if(viewMode === 'saved') {
      setFilteredBlogs(savedBlogs);
    }
    else{
      if (activeTab === 'forYou') {
        setFilteredBlogs(blogs);
      } else if (activeTab === 'following') {
        setFilteredBlogs(followedBlogs);
    }
  }
    
  }, [activeTab, blogs, followedBlogs,savedBlogs, viewMode]);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    // <div className='wrap'>
    <div className="home-container">
      {/* Header Section */}
      <header className="header-content">
        <div className="header-main-row">
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

          <div className="header-right">
            <button className="add-blog-button" onClick={() => navigate('/write')}>
              Add New Blog +
            </button>

            <div className="header-icons">
              <button
                className={`icon-button ${viewMode === 'saved' ? 'active' : ''}`}
                onClick={() => setViewMode(prev => prev === 'saved' ? 'default' : 'saved')}
              >
                <FiBookmark />
              </button>
              <button className="icon-button" onClick={() => navigate('/user-profile')}>
                <img
                  src={`https://api.dicebear.com/8.x/identicon/svg?seed=${user?.name}`}
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

        {/* Single Tab for Saved/Reported Views */}
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
          {filteredBlogs.map(blog => (
            <div key={blog?._id} className="blog-wrapper">
              <Blog blogId={blog?._id} />
              {viewMode === 'reported' && blog.ReportCount > 0 && (
                <div className="blog-actions">
                  <span className="report-count">Reported {blog.ReportCount} Times</span>
                </div>
              )}
            </div>

          ))}

        </div>
        <Sidebar  />
      </div>
    </div>
    // </div>
  );
};

export default Home;