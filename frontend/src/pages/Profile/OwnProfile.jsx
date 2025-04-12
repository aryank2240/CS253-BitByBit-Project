import React, { useState, useEffect } from "react";
import "./OwnProfile.css";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from 'axios';
import Blog from "../../components/Blog/Blog.js";
import { FiSearch, } from 'react-icons/fi';
import { IoReturnDownBackOutline } from "react-icons/io5";
import WritersSuggestion from "../../components/WritersSuggestion/WritersSuggestion.jsx";

const OwnProfilePage = () => {
  
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userBlogs, setUserBlogs] = useState([]);
  const [name, setName] = useState("");
  const [searchTerm, setSearchTerm] = useState('');
  const [account, setAccount]=useState(null);

    useEffect(() => {
      if(!user) return
      const getAccount= async ()=>{
          try{
              const res = await axios.get(`http://localhost:5000/api/user/${user?.id}`, {
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
                }
              });
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
  
    }, [user]);
  
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


  const editUser = async () => {
    try {
      if (!user) return;
  
      const res = await axios.patch(
        `http://localhost:5000/api/user/${user?.id}`,
        { name },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
          }
        }
      );
      
      setAccount(res?.data);
      setName(res?.data?.name);
      window.location.reload();
    } catch (error) {
      console.error("Failed to update user:", error);
    }
  };
  


  useEffect(() => {
    const getBlogsbyUser = async () => {
      if (!user) return; // Ensure user exists before making the API call

      try {
        const res = await axios.get(
          `http://localhost:5000/api/user/${user?.id}/blogs`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
            }
          });
        setUserBlogs(res.data);
      } catch (error) {
        console.error(error);
      }
    };

    getBlogsbyUser();
  }, [user]);

  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchTerm.trim())}`);
    }
  };




  const [isEditing, setIsEditing] = useState(false);

  const handleEditClick = () => {
    setIsEditing(true);
  };


  const handleSave = () => {
    editUser();
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
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
            <img src={`https://api.dicebear.com/8.x/identicon/svg?seed=${account?._id}`} alt="Profile" className="profile-image" />


            {isEditing ? (
              <>
                <input
                  type="text"
                  name="name"
                  value={name}
                  onChange={(e) => {setName(e.target.value)}}
                  className="edit-input"
                />

              </>
            ) : (
              <>
                <h2>{name}</h2>
                <p>{user?.email}</p>
              </>
            )}

            <p>{account?.blogCount} Blogs</p>
            <div className="follow-info">
              <span>{account?.followingCount} Following</span> | <span>{account?.followersCount} Followers</span>
            </div>


            {isEditing ? (
              <>
                <button className="save-btn" onClick={handleSave} >Save</button>
                <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
              </>
            ) : (
              <>
                <button className="edit-btn" onClick={handleEditClick}>Edit</button>


              </>
            )}
          </div>


          <div className="blogs-section">
            <h3>My Blogs</h3>
            {userBlogs.map(blog => (
              <div key={blog?._id} className="blog-wrapper">
                <Blog blogId={blog?._id} />
              </div>

            ))}
          </div>
        </div>


        <div className="right-section">
          <div className="writer-suggestions">
            <WritersSuggestion />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnProfilePage;