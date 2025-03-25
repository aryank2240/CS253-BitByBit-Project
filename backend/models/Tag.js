import mongoose from 'mongoose';
import Blog from './Blog.js';
const tagSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    count:{
        type:Number,
        default:0   
    },
    blogs:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Blog'
    }]
});

export default mongoose.model('Tag',tagSchema);