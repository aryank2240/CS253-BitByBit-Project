import Blog from './../models/Blog.js'

import User from './../models/User.js'
import Tag from './../models/Tag.js'
import Comment from './../models/Comment.js'
import mongoose from 'mongoose';


async function createBlog(req, res) {
  try {
    const newBlog = req.body;
    const user = await User.findOne({ _id: newBlog.author });
    if (!user) return res.status(404).json({ error: "User not found" });
    console.log(user);
    user.blogCount = user.blogCount + 1;
    const blog = new Blog(newBlog);
    await blog.save();
    user.Blogs.push(blog._id);
    await user.save();

    res.json(blog);

  }
  catch (err) {

    res.status(500).json({ error: err });
    // console.log(err); // Consider using a proper logging mechanism
  }
}


async function getTopBlogs(req, res) {
  try {
    const blogs = await Blog.find().sort({ Upvote: -1 }).limit(8);
    if (blogs.length === 0) return res.status(404).json({ error: "No blogs found" });
    res.json(blogs);
  }
  catch (err) {
    res.status(500).json({ error: err });
    console.log(err);
  }
}


async function getBlog(req, res) {
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

async function deleteBlog(req, res) {
  try {
    const id = req.params.id;
    const reqSender=req.user;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid blog ID" });
    }
    
    const blogToDelete = await Blog.findById(id);
    if (!blogToDelete) {
      return res.status(404).json({ error: "Blog not found" });
    }
    
    const authorId = blogToDelete.author;
    const authorUser = await User.findById(authorId);
    if (!authorUser) {
      return res.status(404).json({ error: "User not found" });
    }
    if(reqSender?._id!==authorUser?._id){
      return res.status(401).json({ error: "You are not authorised to delete this blog" });
    }
    if (authorUser) {
      authorUser.blogCount = Math.max(0, authorUser.blogCount - 1);
      await authorUser.save();
    }
    
    
    await User.updateMany(
      { Blogs: { $in: [id] } },
      { $pull: { Blogs: id } },
      { new: true }
    );
    
    await User.updateMany(
      { SavedBlogs: { $in: [id] } },
      { $pull: { SavedBlogs: id } },
      { new: true }
    );
    

    await User.updateMany(
      { likedBlogs: { $in: [id] } },
      { $pull: { likedBlogs: id } }, 
      { new: true }
    );
    
    await Tag.updateMany(
      { blogs: { $in: [id] } },
      { $pull: { blogs: id }, $inc: { count: -1 } }
    );
    
    await Comment.deleteMany({ ParentBlogId: id });
    
  
    const deletedBlog = await Blog.findOneAndDelete({ _id: id });
    if (!deletedBlog) {
      return res.status(404).json({ error: "Blog not found" });
    }
    
    res.json(deletedBlog);
  }
  catch (err) {
    res.status(500).json({ error: err });
    console.log(err);
  }
}

async function updateBlog(req, res) {
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

async function searchBlogs(req, res) {
  try {
    const { query } = req.query;

    if (!query || query.trim() === '') {
      return res.status(400).json({ error: "Search query is required" });
    }

    // Create a regex search pattern that is case insensitive
    const searchPattern = new RegExp(query, 'i');

    // Search in title, content, and author_name
    const blogs = await Blog.find({
      $or: [
        { title: searchPattern },
        { content: searchPattern },
        { author_name: searchPattern }
      ]
    }).sort({ CreatedAt: -1 }); // Sort by newest first

    if (!blogs || blogs.length === 0) {
      return res.status(404).json({ message: "No blogs found matching your search" });
    }

    res.json(blogs);
  } catch (error) {
    console.error("Error searching blogs:", error);
    res.status(500).json({ error: "Internal server error" });
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

async function getReportedBlogs(req, res) {
  try {
    const reportedBlogs = await Blog.find({ ReportCount: { $gt: 0 } });
    if (!reportedBlogs) res.status(404).json({ error: "No Reported Blogs found" });
    res.json(reportedBlogs);
  }
  catch (err) {
    console.error("Error in getReportedBlogs:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getCommentsForBlog(req, res) {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid blog ID" });
    }

    // Fix: Use ParentBlogId instead of blog, and populate the UserId to get user details
    const comments = await Comment.find({ ParentBlogId: id }).populate('UserId', 'name');

    if (!comments || comments.length === 0) {
      return res.status(404).json({ message: "No comments for this blog" });
    }

    // Return the comments as JSON response
    res.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    // Add proper error response
    res.status(500).json({ error: "Internal server error" });
  }
}

const getTagForBlog = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid blog ID" });
    }
    const tags = await Tag.find({ blogs: id }); // Find all comments linked to blogId
    if (tags.length === 0) {


    }
    res.json(tags); // Send tags as response
  } catch (error) {
    console.error("Error fetching tags:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};


// Upvote controller function
const upvoteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const blogId = id;
    const userId = req.body.userId;

    // Find the blog document with the given blogId
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // Check if the user already upvoted or downvoted
    const alreadyUpvoted = blog.upvoters.includes(userId);
    const alreadyDownvoted = blog.downvoters.includes(userId);

    if (alreadyUpvoted) {
      // If user has already upvoted, remove the upvote
      blog.upvoters.pull(userId);
    } else {
      // Otherwise, add the upvote
      blog.upvoters.push(userId);
      // If the user had downvoted previously, remove that vote
      if (alreadyDownvoted) {
        blog.downvoters.pull(userId);
      }
    }

    // Update count fields based on the lengths of the arrays
    blog.Upvote = blog.upvoters.length;
    blog.Downvote = blog.downvoters.length;
    blog.UpdatedAt = new Date();

    await blog.save();

    // Optionally update user's likedBlogs if you want to track blogs the user liked
    const user = await User.findById(userId);
    if (user) {
      if (!alreadyUpvoted) {
        // Avoid duplicating blog id in likedBlogs
        if (!user.likedBlogs.includes(blogId)) {
          user.likedBlogs.push(blogId);
        }
      } else {
        user.likedBlogs.pull(blogId);
      }
      await user.save();
    }

    res.json({ message: "Upvote updated successfully", blog });
  } catch (error) {
    res.status(500).json({ message: "Error updating upvote", error: error.message });
  }
};

// Downvote controller function
const downvoteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const blogId = id;
    const userId = req.body.userId;

    // Find the blog document
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // Check if the user has already voted
    const alreadyDownvoted = blog.downvoters.includes(userId);
    const alreadyUpvoted = blog.upvoters.includes(userId);

    if (alreadyDownvoted) {
      // If user has already downvoted, remove the downvote
      blog.downvoters.pull(userId);
    } else {
      // Otherwise, add the downvote
      blog.downvoters.push(userId);
      // Remove an upvote if the user had upvoted before
      if (alreadyUpvoted) {
        blog.upvoters.pull(userId);
      }
    }

    // Update count fields accordingly
    blog.Upvote = blog.upvoters.length;
    blog.Downvote = blog.downvoters.length;
    blog.UpdatedAt = new Date();

    await blog.save();

    // If user had previously liked this blog, remove it from likedBlogs
    const user = await User.findById(userId);
    if (user && alreadyUpvoted) {
      user.likedBlogs.pull(blogId);
      await user.save();
    }

    res.json({ message: "Downvote updated successfully", blog });
  } catch (error) {
    res.status(500).json({ message: "Error updating downvote", error: error.message });
  }
};


export {
  createBlog, getTopBlogs, getBlog, deleteBlog, updateBlog, addCommentOrTags,
  getReportedBlogs, getCommentsForBlog, getTagForBlog, upvoteBlog, downvoteBlog, searchBlogs
}
