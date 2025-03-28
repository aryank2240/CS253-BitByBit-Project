import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Comment.css';
import { jwtDecode } from 'jwt-decode';

const Comment = ({ comment, updateComments }) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  
  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setCurrentUser(decoded);
      } catch (error) {
        console.error("Failed to decode token:", error);
      }
    }
  }, []);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(comment.content);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError('');
  };

  const handleSave = async () => {
    try {
      if (!editContent.trim()) {
        setError('Comment cannot be empty');
        return;
      }
      
      await axios.patch(`http://localhost:5000/api/comment/${comment._id}`, {
        content: editContent
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
        }
      });
      
      setIsEditing(false);
      setError('');
      
      // Refresh comments after update
      if (updateComments) {
        updateComments();
      }
    } catch (err) {
      setError('Failed to update comment');
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await axios.delete(`http://localhost:5000/api/comment/${comment._id}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
          }
        });
        
        // Refresh comments after deletion
        if (updateComments) {
          updateComments();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const navigateToUserProfile = () => {
    // Check if it's the current user
    if (currentUser && currentUser.id === comment.UserId._id) {
      navigate('/user-profile');
    } else if (comment.UserId && comment.UserId._id) {
      navigate(`/account/${comment.UserId._id}`);
    }
  };

  // Determine if the current user can edit this comment
  const canEditComment = currentUser && (
    currentUser.id === comment.UserId._id || 
    currentUser.role === 'admin'
  );

  return (
    <div className="comment-container">
      <div className="comment-header">
        <div className="comment-user" onClick={navigateToUserProfile}>
          <img 
            src={`https://api.dicebear.com/8.x/identicon/svg?seed=${comment.UserId?.name || 'Anonymous'}`} 
            alt="User Avatar" 
            className="comment-avatar" 
          />
          <span className="comment-username">{comment.UserId?.name || 'Anonymous'}</span>
        </div>
        <span className="comment-time">{formatDate(comment.CreatedAt)}</span>
      </div>
      
      {isEditing ? (
        <div className="comment-edit-form">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="comment-edit-textarea"
          />
          {error && <div className="comment-error">{error}</div>}
          <div className="comment-edit-actions">
            <button onClick={handleSave} className="comment-save-btn">Save</button>
            <button onClick={handleCancel} className="comment-cancel-btn">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="comment-content">
          <p>{comment.content}</p>
        </div>
      )}
      
      {canEditComment && (
        <div className="comment-actions">
          <button onClick={handleEdit} className="comment-action-btn">Edit</button>
          <button onClick={handleDelete} className="comment-action-btn">Delete</button>
        </div>
      )}
    </div>
  );
};

export default Comment;
