import Blog from './../models/Blog.js'
import User from './../models/User.js'
import Tag from './../models/Tag.js'
import Comment from './../models/Comment.js'
import mongoose from 'mongoose';
import { get } from 'http';

async function createBlog(req , res){
    try {
        const newBlog = req.body;
    
        const user = await User.findOne({ _id: newBlog.author });
        if (!user) return res.status(404).json({ error: "User not found" });
        console.log(user);
    
        const blog = new Blog(newBlog);
        await blog.save();
        user.Blogs.push(blog._id);
        await user.save();
        res.json(newBlog);
    
    
      }
      catch (err) {
    
        res.status(500).json({ error: err });
        // console.log(err); // Consider using a proper logging mechanism
    }
}


async function getTopBlogs(req , res){
    try {
        const blogs = await Blog.find().sort({Upvote: -1}).limit(8);
        if (blogs.length === 0) return res.status(404).json({ error: "No blogs found" });
        res.json(blogs); 
      }
      catch (err) {
        res.status(500).json({ error: err });
        console.log(err);
      }
}


async function getBlog(req , res){
     try {
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
          return res.status(400).json({ error: "Invalid blog ID" });
        }
        const blogs = await Blog.findOne({ _id: id });
        if (!blogs) return res.status(404).json({ error: "Blog not found" });
        return res.json(blogs);
      }
      catch (err) {
        res.status(500).json({ error: err });
        console.log(err);
      }
}

async function deleteBlog(req , res){
     try {
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
          return res.status(400).json({ error: "Invalid blog ID" });
        }
        await User.updateMany({ Blogs: { $in: [id] } }, { $pull: { Blogs: id } });
        await Tag.updateMany({ blogs: { $in: [id] } }, { $pull: { blogs: id } });
        await Comment.deleteMany({ ParentBlogId: id });
        const blogs = await Blog.findOneAndDelete({ _id: id });
        if (!blogs) return res.status(404).json({ error: "Blog not found" });
        res.json(blogs);
      }
      catch (err) {
        res.status(500).json({ error: err });
        console.log(err);
      }
}

async function updateBlog(req , res){
    try {
    
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
          return res.status(400).json({ error: "Invalid blog ID" });
        }
        const blogs = await Blog.findOneAndUpdate({ _id: id }, { $set: req.body }, { new: true, runValidators: true });
        if (!blogs) return res.status(404).json({ error: "Blog not found" });
        res.json(blogs);
      }
      catch (err) {
        res.status(500).json({ error: err });
        console.log(err);
      }
}


async function addCommentOrTags(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid blog ID" });
    }

    const blog = await Blog.findById(id);
    if (!blog) return res.status(404).json({ error: "Blog not found" });

    const { tag_name, comment_id } = req.body;

    if (!tag_name && !comment_id) {
      return res.status(400).json({ error: "Tag name or Comment ID is required" });
    }

    if (tag_name) {
      // Check if the tag already exists
      let tag = await Tag.findOne({ name: tag_name });

      // If the tag does not exist, create it
      if (!tag) {
        tag = new Tag({ name: tag_name, blogs: [blog._id] });
        await tag.save();
      } else {
        // If it exists, update its blogs array
        if (!tag.blogs.includes(blog._id)) {
          tag.blogs.push(blog._id);
          tag.count = tag.count + 1
          await tag.save();
        }
      }

      // Add the tag ID to the blog if it's not already there
      if (!blog.tags.includes(tag._id)) {
        blog.tags.push(tag._id);
        await blog.save();
      }
    }

    if (comment_id) {
      const comment = await Comment.findById(comment_id);
      if (!comment) return res.status(404).json({ error: "Comment not found" });

      // Add the comment to the blog
      if (!blog.comments.includes(comment._id)) {
        blog.comments.push(comment._id);
        await blog.save();
      }
    }

    res.json(blog);
  } catch (err) {
    console.error("Error in addCommentOrTags:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getReportedBlogs(req,res){
  try{
    const reportedBlogs = await Blog.find({ ReportCount: { $gt: 1 } });
    if(!reportedBlogs) res.status(404).json({error:"No Reported Blogs found"});
    res.json(reportedBlogs);
  }
  catch(err){
    console.error("Error in getReportedBlogs:", err);
    res.status(500).json({error:"Internal Server Error"});
  }
}

const getCommentsForBlog = async (req,res) => {
  try {
    const id=req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid blog ID" });
    }
    const comments = await Comment.find({ blog: id }); // Find all comments linked to blogId
    if(!comments) res.status(404).json({message:"No comments for this blog"})
    console.log(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
  }
};

const getTagForBlog = async (req,res) => {
  try {
    const { id } =req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid blog ID" });
    }
    const tags = await Tag.find({ blogs: id }); // Find all comments linked to blogId
    if (tags.length === 0) {
      return res.status(404).json({ message: "No tags for this blog" });
    }
    res.json(tags); // Send tags as response
  } catch (error) {
    console.error("Error fetching tags:", error);
    res.status(500).json({ message: "Internal server error",error });
  }
};


export {createBlog ,getTopBlogs, getBlog , deleteBlog , updateBlog , addCommentOrTags, getReportedBlogs, getCommentsForBlog, getTagForBlog}