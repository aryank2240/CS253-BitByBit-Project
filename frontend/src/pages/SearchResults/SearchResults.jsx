import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { FiSearch } from 'react-icons/fi';
import Blog from '../../components/Blog/Blog';
import Sidebar from '../../components/Sidebar/Sidebar';
import './SearchResults.css';
import { IoReturnDownBackOutline } from "react-icons/io5";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  // Get search query from URL
  const query = searchParams.get('query') || '';

  // Check authentication
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

  // Perform search when query changes
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setSearchTerm(query);
    
    const fetchResults = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/blog/search?query=${encodeURIComponent(query)}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
          }
        });
        setResults(response.data);
        setError('');
      } catch (error) {
        console.error('Error searching blogs:', error);
        if (error.response && error.response.status === 404) {
          // No results found is not an error
          setResults([]);
        } else {
          setError('An error occurred while searching. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  // Handle new search
  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <div className="search-results-container">
   
      <header className="search-results-header">
      
        <div className='search-results-header-left'>
        <IoReturnDownBackOutline  size={30} onClick={()=>{window.history.back()}} style={{cursor:'pointer',}}/>
        <div className="search-container">
          
          <input
            type="text"
            className="search-input"
            placeholder="Search for blogs..."
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
          <button className="add-blog-button" onClick={() => navigate('/write')}>
            Add New Blog +
          </button>
          <div className="profile-icon" onClick={() => navigate('/user-profile')}>
            <img
              src={`https://api.dicebear.com/8.x/identicon/svg?seed=${user?.name}`}
              alt="Profile"
              style={{ width: '100%', height: '100%', borderRadius: '50%' }}
            />
          </div>
        </div>
      </header>

      <div className="search-results-main">
        <div className="search-results-column">
          <div className="search-results-info">
            <h2>Search Results for "{query}"</h2>
            {!loading && results.length > 0 && (
              <p>{results.length} result{results.length !== 1 ? 's' : ''} found</p>
            )}
          </div>

          {loading ? (
            <div className="search-loading">
              <div className="loading-spinner"></div>
              <p>Searching...</p>
            </div>
          ) : error ? (
            <div className="search-error">{error}</div>
          ) : results.length === 0 ? (
            <div className="no-results">
              <h3>No blogs found matching "{query}"</h3>
              <p>Try different keywords or check your spelling.</p>
            </div>
          ) : (
            results.map(blog => (
              <div key={blog._id} className="blog-wrapper">
                <Blog blogId={blog._id} />
              </div>
            ))
          )}
        </div>

        <Sidebar />
      </div>
    </div>
  );
};

export default SearchResults;
