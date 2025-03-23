import React from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BlogEditor from "./pages/BlogEditor"; // Import the Blog Edit page
import HomePage from "./pages/Home";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/edit/:id" element={<BlogEditor />} />
        <Route path="/blog-edit" element={<BlogEditor />} /> {/* New Route */}
        <Route path="/blog/edit/:id" element={<BlogEditor />} />
      </Routes>
    </Router>
  );
}

export default App;
