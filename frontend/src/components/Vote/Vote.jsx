import React, { useState, useEffect } from "react";
import "./Vote.css";
import axios from "axios";
import { BiUpvote, BiDownvote } from "react-icons/bi";

function VoteComponent({ blogId, userId }) {
    const [voteStatus, setVoteStatus] = useState(null); // null, "upvoted", or "downvoted"
    const [upvotes, setUpvotes] = useState(0);
    const [downvotes, setDownvotes] = useState(0);
 

    // Fetch initial vote status and counts
    useEffect(() => {
        const fetchVoteData = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/blog/${blogId}`);
                const blog = response?.data;
                
                setUpvotes(blog?.Upvote);
                setDownvotes(blog?.Downvote);
                
                if (userId) {
                    const isUpvoted = blog.upvoters?.includes(userId);
                    const isDownvoted = blog.downvoters?.includes(userId);
                    setVoteStatus(isUpvoted ? "upvoted" : isDownvoted ? "downvoted" : null);
                }
            } catch (error) {
                console.error("Error fetching vote data:", error);
            }
        };
        fetchVoteData();
    }, [blogId, userId]);

    const handleVote = async (voteType) => {
        if (!userId) {
            return;
        }

        try {
            const endpoint = `http://localhost:5000/api/blog/${blogId}/${voteType}`;
            const response = await axios.patch(endpoint, {userId}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            const updatedBlog = response?.data?.blog;
            setUpvotes(updatedBlog?.Upvote);
            setDownvotes(updatedBlog?.Downvote);

            // Update vote status
            const isUpvoted = updatedBlog?.upvoters?.includes(userId);
            const isDownvoted = updatedBlog?.downvoters?.includes(userId);
            if(isUpvoted){
                setVoteStatus("upvoted")
            }
            else{
                setVoteStatus("downvoted")
            }

        } catch (error) {
            console.error("Error updating vote:", error.response?.data?.message || error?.message);
        }
    };

    return (
        <div className="vote-container">
            <button
                className={`vote-button upvote-button ${voteStatus === "upvoted" ? "active" : ""}`}
                onClick={() => handleVote("upvote")}
            >
                <BiUpvote />
                <span className="count">{upvotes}</span>
            </button>
            
            <button
                className={`vote-button downvote-button ${voteStatus === "downvoted" ? "active" : ""}`}
                onClick={() => handleVote("downvote")}
            >
                <BiDownvote />
                <span className="count">{downvotes}</span>
            </button>
        </div>
    );
}

export default VoteComponent;
