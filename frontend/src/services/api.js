import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Blog APIs
export const getBlogs = () => api.get('/blog/home');
export const createBlog = (data) => api.post('/blog/post', data);
export const deleteBlog = (id) => api.delete(`/blog/${id}`);
export const isBlogSaved = (id) => {
  api.get(`/blog/${id}`).then((res) => {
    const blog=res.data;
    if(!blog){
      return false;
    }
    return true;
  })
  .catch((err) => {
    console.error(err);
  });

};
export const setBlog = (data) => api.post('/blog/home', data);

// // Local storage helpers for features not supported by backend
// export const getLocalStorageData = (key) => {
//   const data = localStorage.getItem(key);
//   return data ? JSON.parse(data) : null;
// };

// export const setLocalStorageData = (key, data) => {
//   localStorage.setItem(key, JSON.stringify(data));
// };

// // Save functionality
// export const saveBlog = (blogId) => {
//   const savedBlogs = getLocalStorageData('savedBlogs') || [];
//   if (!savedBlogs.includes(blogId)) {
//     savedBlogs.push(blogId);
//     setLocalStorageData('savedBlogs', savedBlogs);
//     return true;
//   }
//   return false;
// };

// export const unsaveBlog = (blogId) => {
//   const savedBlogs = getLocalStorageData('savedBlogs') || [];
//   const index = savedBlogs.indexOf(blogId);
//   if (index > -1) {
//     savedBlogs.splice(index, 1);
//     setLocalStorageData('savedBlogs', savedBlogs);
//     return true;
//   }
//   return false;
// };

// export const isBlogSaved = (blogId) => {
//   const savedBlogs = getLocalStorageData('savedBlogs') || [];
//   return savedBlogs.includes(blogId);
// };

// // Temporary features using localStorage
// export const addComment = (blogId, comment) => {
//   const comments = getLocalStorageData('comments') || {};
//   if (!comments[blogId]) comments[blogId] = [];
//   comments[blogId].push({
//     id: Date.now(),
//     content: comment,
//     author: getLocalStorageData('currentUser')?.name || 'Anonymous',
//     timestamp: new Date().toISOString()
//   });
//   setLocalStorageData('comments', comments);
// };

// export const getComments = (blogId) => {
//   const comments = getLocalStorageData('comments') || {};
//   return comments[blogId] || [];
// };

// export const toggleVote = (blogId, type) => {
//   const votes = getLocalStorageData('votes') || {};
//   if (!votes[blogId]) votes[blogId] = { upvotes: 0, downvotes: 0 };
  
//   if (type === 'upvote') {
//     votes[blogId].upvotes += 1;
//   } else if (type === 'downvote') {
//     votes[blogId].downvotes += 1;
//   }
  
//   setLocalStorageData('votes', votes);
// };

// export const getVotes = (blogId) => {
//   const votes = getLocalStorageData('votes') || {};
//   return votes[blogId] || { upvotes: 0, downvotes: 0 };
// };

// export const reportBlog = (blogId, reason) => {
//   const reports = getLocalStorageData('reports') || {};
//   if (!reports[blogId]) reports[blogId] = [];
//   reports[blogId].push({
//     id: Date.now(),
//     reason,
//     reporter: getLocalStorageData('currentUser')?.name || 'Anonymous',
//     timestamp: new Date().toISOString()
//   });
//   setLocalStorageData('reports', reports);
// };

// export const getReports = (blogId) => {
//   const reports = getLocalStorageData('reports') || {};
//   return reports[blogId] || [];
// };

export default api;
