import {React, useEffect, useState}from 'react';
import '../Sidebar/Sidebar.css';
import {useNavigate} from 'react-router-dom'
import axios from 'axios';




const WritersSuggestion = () => {
  const [popularUsers, setPopularUsers] = useState([]);
    const navigate= useNavigate();
   useEffect(() => {
     const getPopularUsers = async () => {
       try {
         const response = await axios.get('http://localhost:5000/api/user/topUsers', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
          }
        }
         );
         console.log(response?.data);
         setPopularUsers(response?.data);
       } catch (error) {
         console.error("Error fetching popular Users:", error);
       }
     };
     getPopularUsers();
   }, []);
 
  return (
    <div className="sidebar">
      <div className="sidebar-section">
        <div className="sidebar-header">
          <h3>Writer Suggestions</h3>
        </div>
        
        <div className="tags-container" >
          {popularUsers?.map((tag, index) => (
            <div 
              key={index} 
              className="tag-item-sidebar"

            >
              <span className="tag-name"onClick={()=>{navigate(`/account/${tag?._id}`)}}>{tag?.name}</span>
              <span className="tag-count">{tag?.blogCount}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="sidebar-section">
        </div>
    </div>
  );
};


export default WritersSuggestion;