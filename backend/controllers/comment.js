import Blog from './../models/Blog.js'
import Comment from './../models/Comment.js'
import mongoose from 'mongoose';
import User from './../models/User.js'

async function postComment(req, res) {
    try {
        const newComment = req.body;
        const blog = await Blog.findOne({
          _id: newComment.ParentBlogId
        })
    
        if (!blog) { return res.status(404).json({ error: "Blog not found" }) }
        const user = await User.findOne({
          _id:newComment.UserId
        })
        
        if (!user) { return res.status(404).json({ error: "User not found" }) }
        
        const comment = new Comment(newComment);
        await comment.save()
        user.comments.push(comment._id);
        await user.save();
        blog.comments.push(comment._id);
        await blog.save();
        res.json(newComment);
      }
      catch (err) {
        res.status(500).json({ error: err });
        console.log(err);
      }
}

async function getComment(req, res) {
     try {
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
          return res.status(400).json({ error: "Invalid blog ID" });
        }
        const comments = await Comment.findOne({ _id: id });
        if (!comments) return res.status(404).json({ error: "Comment not found" });
        res.json(comments);
      }
      catch (err) {
        res.status(500).json({ error: err });
        console.log(err);
      }
}

async function deleteComment(req, res) {
   try {
       const id = req.params.id;
       if (!mongoose.Types.ObjectId.isValid(id)) {
         return res.status(400).json({ error: "Invalid blog ID" });
       }
       const comments = await Comment.findOneAndDelete({ _id: id });
       if (!comments) return res.status(404).json({ error: "Comment not found" });
       res.json(comments);
     }
     catch (err) {
       res.status(500).json({ error: err });
       console.log(err);
     }
}

async function updateComment(req, res) {
     try {
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
          return res.status(400).json({ error: "Invalid blog ID" });
        }
        const comments = await Comment.findOneAndUpdate({ _id: id }, { $set: req.body }, { new: true, runValidators: true });
        if (!comments) return res.status(404).json({ error: "Comment not found" });
        res.json(comments);
      }
      catch (err) {
        res.status(500).json({ error: err });
        console.log(err);
      }
}

export { postComment, getComment, deleteComment, updateComment }