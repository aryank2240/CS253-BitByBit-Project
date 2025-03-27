import React, { useState, useEffect } from "react";
import "./OwnProfile.css";
import BlogCard from "../../components/Blog/Blog.js";
import { useNavigate, useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from 'axios';
import Sidebar from "../../components/Sidebar/Sidebar.js";
import Blog from "../../components/Blog/Blog.js";
import { FiSearch, FiBell, FiBookmark, FiSettings } from 'react-icons/fi';

const AccountProfilePage = () => {

   const { id: accountId } = useParams();
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [userBlogs, setUserBlogs] = useState([]);
  const [name, setName] = useState("");
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser]= useState(null);

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
    
  useEffect(() => {
    const getAccount= async ()=>{
        try{
            const res = await axios.get(`http://localhost:5000/api/user/${accountId}`);
            setAccount(res.data);
            if (name == '') {
                setName(res.data?.name);// Ensure this contains the expected fields
            }
        }
        catch(e){
            console.log("Error fetching the account's data");
        }

    };
    getAccount();

  }, [accountId]);



  const editUser = async (e) => {
    try {
      if (!user) return;
      const res = axios.patch(`http://localhost:5000/api/user/${account._id}`,
        {
          name
        },
        {
          headers: { "Content-Type": "application/json" }
        })
    }
    catch (e) {
      console.error(e);
    }
  }



  useEffect(() => {
    const getBlogsbyUser = async () => {
      if (!account) return; // Ensure account exists before making the API call

      try {
        const res = await axios.get(
          `http://localhost:5000/api/user/${account._id}/blogs`);
        console.log(account?.followersCount);
        setUserBlogs(res.data);
      } catch (error) {
        console.error(error);
      }
    };

    getBlogsbyUser();
  }, [account]);

  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchTerm.trim())}`);
    }
  };




 



  return (
    <div className="profile-container">


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


      <div className="main-content">

        <div className="left-section">

          <div className="profile-section">
            <img src={`https://api.dicebear.com/8.x/identicon/svg?seed=${account?.name}`} alt="Profile" className="profile-image" />

            <p>{account?.blogCount} Blogs</p>
            <div className="follow-info">
              <span>{account?.followingCount} Following</span> | <span>{account?.followersCount} Followers</span>
            </div>
          </div>


          <div className="blogs-section">
            <h3 style={{marginLeft:'15px'}}>My Blogs</h3>
            {userBlogs.map(blog => (
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