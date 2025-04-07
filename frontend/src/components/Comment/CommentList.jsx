import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Comment from './Comment';
import './CommentList.css';

const CommentList = ({ blogId, newComment }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`api/blog/comments/${blogId}`
        , {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
          }
        }
      );
      
      // Sort comments by creation date (newest first)
      const sortedComments = response.data.sort((a, b) => 
        new Date(b.CreatedAt) - new Date(a.CreatedAt)
      );
      
      setComments(sortedComments);
      setError('');
    } catch (err) {
      console.error('Error fetching comments:', err);
      if (err.response && err.response.status === 404) {
        // No comments is not an error condition
        setComments([]);
      } else {
        setError('Failed to load comments');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [blogId]);

  // Refetch comments when a new comment is added
  useEffect(() => {
    if (newComment !== undefined) {
      fetchComments();
    }
  }, [newComment]);

  if (loading) {
    return <div className="comments-loading">Loading comments...</div>;
  }

  if (error) {
    return <div className="comments-error">{error}</div>;
  }

  return (
    <div className="comments-list">
      <h3 className="comments-title">Comments ({comments.length})</h3>
      {comments.length === 0 ? (
        <div className="comments-empty">No comments yet. Be the first to comment!</div>
      ) : (
        comments.map(comment => (
          <Comment 
            key={comment._id} 
            comment={comment} 
            updateComments={fetchComments} 
          />
        ))
      )}
    </div>
  );
};

export default CommentList;
