import User from './../models/User.js'
import mongoose from 'mongoose'
import Blog from './../models/Blog.js'
import Tag from './../models/Tag.js'
import Comment from './../models/Comment.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';

const iitkEmailRegex = /^[a-zA-Z0-9._%+-]+@iitk\.ac\.in$/;
 


async function createUser(req, res) {
  try {
    const { name, email, password, role} = req.body;

    if (!iitkEmailRegex.test(email)) {
      return res.status(400).json({ message: "Only for IITK junta" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);


    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role
    });

    if(!name || !email || !password){
      return res.status(404).json({message:"You are missing one of the fields"});
    }
    await newUser.save();

    res.status(201).json({ message: "User created successfully", user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}


async function getBlogsbyUser(req,res){
  try{
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    const blogs = await Blog.find({ author: id });
    res.json(blogs);
  }
  catch (err) {
    res.status(500).json({ error: err });
    console.log(err);
  }
}


async function getUser(req, res) {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    const user = await User.findOne({ _id: id });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  }
  catch (err) {
    res.status(500).json({ error: err });
    console.log(err);
  }
}

async function deleteUser(req, res) {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    const blogs = await Blog.find({ user: id });

    if (!blogs.length) { console.log("No blogs found") }

    else {
      const blogIds = blogs.map((blog) => blog._id);
      await Tag.updateMany({ blogs: { $in: blogIds } }, { $pull: { blog: { $in: blogIds } } });
      await Comment.deleteMany({ ParentBlogId: { $in: blogIds } });
      await Blog.deleteMany({ user: id });
    }


    const user = await User.findOneAndDelete({ _id: id });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  }
  catch (err) {
    res.status(500).json({ error: err });
    console.log(err);
  }
}

async function updateUser(req, res) {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
   
    const user = await User.findOneAndUpdate({ _id: id }, { $set: req.body }, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  }
  catch (err) {
    res.status(500).json({ error: err });
    console.log(err);
  }
}

async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    console.log(user);
  if(!password){ return res.status(404).json({message: "Password missing."})}
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, name: user.name, email: user.email, role:user.role  }, SECRET_KEY, { expiresIn: "1h" });

    res.json({ message: "Login successful", token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}

async function SaveBlogs(req, res) {

  try{
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const user = await User.findOne({ _id: id });
    if (!user) return res.status(404).json({ error: "User not found" });
    const blog_id = req.body.blogId;
    const blog = await Blog.findOne({_id:blog_id})
    if(!blog) return res.status(404).json({ error: "Blog not found" });
    blog.SavedBy.push(user._id)
    await blog.save();
    user.SavedBlogs.push(blog_id);
    await user.save();
    res.json(user);
  }
  catch(err){
    res.status(500).json({ error: err });
    console.log(err);
  }
}

async function getBlogsbyFollowedUsers(req, res) {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    const user = await User.findOne({ _id: id });
    if (!user) return res.status(404).json({ error: "User not found" });
    const blogs = await Blog.find({ author: { $in: user.following } })
                            .sort({ upvotes: -1 })
                            .limit(5);
    res.json(blogs);
  }
  catch (err) {
    res.status(500).json({ error: err });
    console.log(err);
  }
}


async function getSavedBlogs(req , res){
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const blogs = await Blog.find({ _id: { $in: user.SavedBlogs } });
    res.json(blogs);
  } catch (err) {
    console.error("Error in getSavedBlogs:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function followUsers(req, res) {
  try {
    const { id } = req.params; // ID of the current user
    const { accountId } = req.body; // ID of the account to follow/unfollow

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(accountId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    // Find both users
    const [currentUser, targetUser] = await Promise.all([
      User.findById(id),
      User.findById(accountId)
    ]);

    if (!currentUser || !targetUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if already following
    const isFollowing = currentUser.following.includes(accountId);
    
    if (isFollowing) {
      // Unfollow logic
      currentUser.following.pull(accountId);
      targetUser.followers.pull(id);
      currentUser.followingCount = Math.max(0, currentUser.followingCount - 1);
      targetUser.followersCount = Math.max(0, targetUser.followersCount - 1);
    } else {
      // Follow logic
      currentUser.following.addToSet(accountId); // Prevent duplicates
      targetUser.followers.addToSet(id);
      currentUser.followingCount += 1;
      targetUser.followersCount += 1;
    }

    // Save both users
    const [updatedCurrentUser, updatedTargetUser] = await Promise.all([
      currentUser.save(),
      targetUser.save()
    ]);

    res.status(200).json({
      message: isFollowing ? "Unfollowed successfully" : "Followed successfully",
      following: !isFollowing,
      followingCount: updatedCurrentUser.followingCount,
      followersCount: updatedTargetUser.followersCount
    });

  } catch (err) {
    console.error("Error in followUsers:", err);
    res.status(500).json({ 
      error: "Internal Server Error",
      message: err.message 
    });
  }
}


async function getTopBloggers(req,res){
try{
          const topBloggers = await User.find().sort({blogCount: -1}).limit(5);
          if(topBloggers.length===0){return res.status(404).json({err:"No users found"})}
          res.json(topBloggers);
  
}
catch(err){
  console.error("Error in getTopBloggers:", err);
  res.status(500).json({ 
    error: "Internal Server Error",
    message: err.message 
  });
}
}

export { createUser, getBlogsbyUser, getUser, deleteUser, updateUser, loginUser, SaveBlogs, getBlogsbyFollowedUsers , getSavedBlogs, followUsers, getTopBloggers}