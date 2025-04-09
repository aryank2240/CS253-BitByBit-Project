import React, { useState, useEffect } from "react";
import "./OwnProfile.css";
import { useNavigate, useParams } from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import axios from "axios";
import Sidebar from "../../components/Sidebar/Sidebar.jsx";
import Blog from "../../components/Blog/Blog.js";
import { FiSearch } from "react-icons/fi";
import { IoReturnDownBackOutline } from "react-icons/io5";

const AccountProfilePage = () => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { id: accountId } = useParams();
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [userBlogs, setUserBlogs] = useState([]);
  const [name, setName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState(null);

  // Updated handleFollowClick function using template literals
  const handleFollowClick = async () => {
    if (!user) {
      console.log("User not found");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.put(
        `http://localhost:5000/api/user/${user?.id}/follow`,
        { accountId }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
          }
        }
      );
      if (res.status === 200) {
        // Update isFollowing using the backend response
        setIsFollowing(res.data.following);
        // Update the account's followersCount using the backend data
        setAccount((prev) => ({
          ...prev,
          followersCount: res.data.followersCount,
        }));
      } else {
        console.error("Unexpected response:", res);
      }
    } catch (err) {
      console.error("Error during follow/unfollow:", err);
    } finally {
      setLoading(false);
    }
  };

  // Check for authentication and decode token to set user state
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
        setUser(decoded);
      }
    } catch (error) {
      console.error("Invalid token:", error);
      localStorage.removeItem("jwtToken");
      navigate("/login");
    }
  }, [navigate]);

  // Fetch account details for display
  useEffect(() => {
    const getAccount = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/user/${accountId}`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
            }
          }
        );
        setAccount(res?.data);
        if (!name) {
          setName(res?.data?.name);
        }
        if (user && res?.data?._id) {
          setIsFollowing( res?.data?.followers.includes(user?.id));
        }
      } catch (e) {
        console.error("Error fetching the account's data:", e);
      }
    };
    getAccount();
  }, [accountId, user, name]);

  // Fetch blogs posted by the account user
  useEffect(() => {
    const getBlogsbyUser = async () => {
      if (!account) return;
      try {
        const res = await axios.get(
          `http://localhost:5000/api/user/${accountId}/blogs`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
            }
          }
        );
        setUserBlogs(res.data);
      } catch (error) {
        console.error("Error fetching user blogs:", error);
      }
    };
    getBlogsbyUser();
  }, [account, accountId]);

  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <div className="profile-container">
      <div className="search-add-container">
                          <IoReturnDownBackOutline  size={30} onClick={()=>{window.history.back()}} style={{cursor:'pointer',}}/>
        
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search for blogs, tags"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
          <button className="search-button" onClick={handleSearch}>
            <FiSearch className="search-icon" />
          </button>
        </div>
      </div>

      <div className="main-content">
        <div className="left-section">
          <div className="profile-section">
            <img
              src={`https://api.dicebear.com/8.x/identicon/svg?seed=${account?.name}`}
              alt="Profile"
              className="profile-image"
            />
            <div>
              <h2>{account?.name}</h2>
              <p>{account?.email}</p>
            </div>
            <p>{account?.blogCount} Blogs</p>
            <div className="follow-info">
              <span>{account?.followingCount} Following</span> |{" "}
              <span>{account?.followersCount} Followers</span>
            </div>
            <button
              className={`follow-btn ${isFollowing ? "following" : ""}`}
              onClick={handleFollowClick}
              disabled={loading}
            >
              {loading
                ? "Processing..."
                : isFollowing
                ? "Following"
                : "Follow"}
            </button>
          </div>

          <div className="blogs-section">
            <h3 style={{ marginLeft: "15px" }}>My Blogs</h3>
            {userBlogs
              .filter((blog) => blog?.author_name !== "Anonymous")
              .map((blog) => (
                <div key={blog?._id} className="blog-wrapper">
                  <Blog blogId={blog?._id} />
                </div>
              ))}
          </div>
        </div>

        <div className="right-section">
          <div className="writer-suggestions">
            <Sidebar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountProfilePage;
