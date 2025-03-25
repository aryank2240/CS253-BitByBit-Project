import mongoose from 'mongoose';
import User from './User.js';
import Comment from './Comment.js';
import Blog from './Blog.js';
const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:['user','admin'],  
        required:true
    },
    profilePic:{
        type:String
    },
    followers:[{type:mongoose.Schema.Types.ObjectId,ref:'User'}],
    following:[{type:mongoose.Schema.Types.ObjectId,ref:'User'}],
    JoinDate:{
        type:Date,
        default:Date.now,
    },
    IsBlocked:{
        type:Boolean,
        default:false
    },
    Bio:{
        type:String,
        default:""
    },
    Blogs:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Blog'
    }],
    SavedBlogs:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Blog'
    }],
});

export default mongoose.model('User',userSchema);