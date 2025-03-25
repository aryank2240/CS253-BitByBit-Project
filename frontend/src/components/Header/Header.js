import React from 'react';
import { FiSearch } from 'react-icons/fi';
import './Header.css';

const Header = ({ searchTerm, setSearchTerm, onSearch }) => {
  return (
    <header className="header">
      <div className="search-container">
        <FiSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search blogs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && onSearch()}
        />
      </div>
      <div className="header-controls">
        <button className="header-button">+ New Post</button>
      </div>
    </header>
  );
};

export default Header;