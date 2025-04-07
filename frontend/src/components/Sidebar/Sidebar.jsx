import {React, useEffect, useState}from 'react';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';

import axios from 'axios';



const Sidebar = () => {
  const navigate = useNavigate();
  const [popularTags, setPopularTags] = useState([]);

   useEffect(() => {
     const getPopularTag = async () => {
       try {
         const response = await axios.get('api/tag/popular', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
          }
        }
         );
         setPopularTags(response.data);
       } catch (error) {
         console.error("Error fetching popular tags:", error);
       }
     };
     getPopularTag();
   }, []);
 
  return (
    <div className="sidebar">
      <div className="sidebar-section">
        <div className="sidebar-header">
          <h3>Popular Tags</h3>
        </div>
        
        <div className="tags-container">
          {popularTags.map((tag, index) => (
            <div 
              key={index} 
              className="tag-item-sidebar"

            >
              <span className="tag-name" style={{color:'#6c63ff'}} onClick={()=>{navigate(`/search?query=${encodeURIComponent(tag?.name?.trim())}`);}}>#{tag?.name}</span>
              <span className="tag-count">{tag?.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="sidebar-section">
        </div>
    </div>
  );
};


export default Sidebar;