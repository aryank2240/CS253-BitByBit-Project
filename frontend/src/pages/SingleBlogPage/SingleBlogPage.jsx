import { react, useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { jwtDecode } from 'jwt-decode'
import axios from 'axios'
const SingleBlogPage = () => {
    const { id: blogId } = useParams();
    const [blog, setBlog] = useState(null);
    const [user, setUser] = useState(null);
    const [comments, setComments] = useState([]);
    const [tags,setTags]= useState([]);
    const navigate = useNavigate();

    useEffect(()=>{
        const fetchComments = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/blog/comments/${blogId}`);
                setComments(response.data);
            } catch (error) {
                if (error.response && error.response.status === 400) {
                    navigate("/404");
                } else {
                    console.error("Error fetching Comments:", error);
                }
            }
        };
        fetchComments();
    },[blogId])

    useEffect(()=>{
        const fetchTags = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/blog/tag/${blogId}`);
                setTags(response.data);
            } catch (error) {
                if (error.response && error.response.status === 400) {
                    navigate("/404");
                } else {
                    console.error("Error fetching Tags:", error);
                }
            }
        };
        fetchTags();
    },[blogId])
    
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
                setUser(decoded); // Ensure this contains the expected fields
            }
        } catch (error) {
            console.error("Invalid token:", error);
            localStorage.removeItem("jwtToken");
            navigate("/login");
        }
    }, [navigate]); // Ensure `navigate` is included in dependencies

    // Fetch blog details
    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/blog/${blogId}`);
                if (response.status === 400) {
                    navigate("/404");
                }
                const blogData = response.data;
                setBlog(blogData);
            } catch (error) {
                if (error.response && error.response.status === 400) {
                    navigate("/404");
                } else {
                    console.error("Error fetching blog:", error);
                }
            }
        };
        fetchBlog();
    }, [blogId]);

    return (
        <div>Blog is here {blog?.content}</div>
    )
}

export default SingleBlogPage;