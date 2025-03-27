import React, { useState, useEffect } from "react";
import "./Vote.css";
import axios from "axios";
import { BiUpvote , BiDownvote } from "react-icons/bi";
function VoteComponent({ blogId }) {
    const [voteStatus, setVoteStatus] = useState(null); // "upvoted", "downvoted", or null
    const [voteCount, setVoteCount] = useState(0);

    // Fetch initial vote count
    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/blog/${blogId}`);
                setVoteCount(response?.data?.Upvote || 0);
            } catch (error) {
                console.error("Error fetching blog:", error);
            }
        };
        fetchBlog();
    }, [blogId]);

    // Function to update vote count in backend
    const updateVote = async (newVoteCount) => {
        try {
            await axios.patch(`http://localhost:5000/api/blog/${blogId}`, {
                Upvote: newVoteCount,
            });
        } catch (error) {
            console.error("Error updating vote:", error);
        }
    };

    const handleUpvote = () => {
        let newVoteCount;
        if (voteStatus === "upvoted") {
            setVoteStatus(null);
            newVoteCount = voteCount - 1;
        } else {
            newVoteCount = voteStatus === "downvoted" ? voteCount + 2 : voteCount + 1;
            setVoteStatus("upvoted");
        }
        setVoteCount(newVoteCount);
        updateVote(newVoteCount); // Send update to backend
    };

    const handleDownvote = () => {
        let newVoteCount;
        if (voteStatus === "downvoted") {
            setVoteStatus(null);
            newVoteCount = voteCount + 1;
        } else {
            newVoteCount = voteStatus === "upvoted" ? voteCount - 2 : voteCount - 1;
            setVoteStatus("downvoted");
        }
        setVoteCount(newVoteCount);
        updateVote(newVoteCount); // Send update to backend
    };

    return (
        <div className="vote-container">
            <button
                className={`vote-button upvote-button ${voteStatus === "upvoted" ? "upvoted" : ""}`}
                onClick={handleUpvote}
            >
                <span className="arrow-up"><BiUpvote /></span>
            </button>
            <span className="vote-count">{voteCount}</span>
            <button
                className={`vote-button downvote-button ${voteStatus === "downvoted" ? "downvoted" : ""}`}
                onClick={handleDownvote}
            >
                <span className="arrow-down"><BiDownvote /></span>
            </button>
        </div>
    );
}

export default VoteComponent;
