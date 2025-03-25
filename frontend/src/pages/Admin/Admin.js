import React, { useState, useEffect } from 'react';
import { FiSearch, FiBell, FiBookmark, FiSettings, FiAlertCircle, FiTrash2 } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import Blog from '../../components/Blog/Blog';
import Sidebar from '../../components/Sidebar/Sidebar';
import './Admin.css';

const Admin = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('forYou');
  const [viewMode, setViewMode] = useState('default');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [selectedBlogId, setSelectedBlogId] = useState(null);
  const [warningMessage, setWarningMessage] = useState('');

  // Check if user is admin
  useEffect(() => {
    // This should be replaced with your actual admin authentication logic
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    if (!isAdmin) {
      navigate('/');
    }
  }, [navigate]);

  // Mock data for blogs
  const [blogs] = useState([
    {
      id: 1,
      author: "X_AE_A-13",
      role: "Product Designer, slothUI",
      title: "UI Design Trends for 2025",
      content: "As we look ahead to 2025, several exciting trends are shaping the future of UI design.",
      tags: ["#amazing", "#uiux"],
      upvotes: 15,
      downvotes: 3,
      comments: 25,
      time: "2 hours ago",
      reportCount: 3,
      reports: [
        { reason: "Inappropriate content", reportedBy: "user1" },
        { reason: "Spam", reportedBy: "user2" },
        { reason: "Misleading", reportedBy: "user3" }
      ]
    },
    // ... other blog posts
  ]);

  const popularTags = [
    { name: "Campus", count: "112 blogs" },
    { name: "Events", count: "109 blogs" },
    { name: "Sports", count: "87 blogs" },
    { name: "Lost&Found", count: "84 blogs" },
    { name: "Buy&Sell", count: "78 blogs" }
  ];

  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/admin/search?query=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleAction = (blogId, type) => {
    setSelectedBlogId(blogId);
    setActionType(type);
    setShowConfirmDialog(true);
  };

  const handleConfirmAction = () => {
    if (actionType === 'warning') {
      // Send warning to user
      console.log(`Warning sent for blog ${selectedBlogId}: ${warningMessage}`);
    } else if (actionType === 'remove') {
      // Remove the blog
      console.log(`Removing blog ${selectedBlogId}`);
    }
    setShowConfirmDialog(false);
    setWarningMessage('');
    setSelectedBlogId(null);
    setActionType(null);
  };

  const getPageTitle = () => {
    switch (viewMode) {
      case 'saved':
        return 'Saved Blogs';
      case 'reported':
        return 'Reported Posts';
      default:
        return activeTab === 'forYou' ? 'For You' : 'Following';
    }
  };

  return (
    <div className="admin-container">
      {/* Admin Badge */}
      <div className="admin-badge">
        Admin Dashboard
      </div>

      {/* Header Section */}
      <header className="header-content">
        <div className="header-main-row">
          <div className="search-add-container">
            <div className="search-container">
              <input
                type="text"
                className="search-input"
                placeholder="Search for blogs, users, tags"
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
                {viewMode !== 'reported' && <span className="report-badge">3</span>}
              </button>
              <button className="icon-button" onClick={() => navigate('/admin/settings')}>
                <FiSettings />
              </button>
              <button className="icon-button admin-profile">
                <img 
                  src="https://via.placeholder.com/40" 
                  alt="Admin Profile" 
                  style={{ width: '100%', height: '100%', borderRadius: '50%' }}
                />
                <span className="admin-indicator"></span>
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
          {blogs.map(blog => (
            <div key={blog.id} className="blog-wrapper">
              <Blog blog={blog} />
              {viewMode === 'reported' && (
                <div className="blog-actions">
                  <div className="report-info">
                    <span className="report-count">Reported {blog.reportCount} Times</span>
                    <button className="view-reports-btn" onClick={() => console.log('View reports')}>
                      View Reports
                    </button>
                  </div>
                  <div className="action-buttons">
                    <button 
                      className="action-button warning"
                      onClick={() => handleAction(blog.id, 'warning')}
                    >
                      <FiAlertCircle /> Give Warning
                    </button>
                    <button 
                      className="action-button remove"
                      onClick={() => handleAction(blog.id, 'remove')}
                    >
                      <FiTrash2 /> Remove Post
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <Sidebar popularTags={popularTags} />
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
                onClick={handleConfirmAction}
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