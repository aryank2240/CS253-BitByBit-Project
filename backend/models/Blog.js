import mongoose from 'mongoose';
import User from './User.js';
import Comment from './Comment.js';
import Tag from './Tag.js';

const blogSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    content:{
        type:String,
        required:true
    }, 
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    tags:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Tag'
    }],
    Upvote:{
        type:Number,
        default:0
    },
    Downvote:{
        type:Number,
        default:0
    },
    comments:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Comment'
    }],
    CreatedAt:{
        type:Date,
        default:Date.now
    },
    UpdatedAt:{
        type:Date,
        default:Date.now
    },
    ReportCount:{
        type:Number,
        default:0
    },
    ReportType:{
        type:String,
        default:""
    },
});

export default mongoose.model('Blog',blogSchema);