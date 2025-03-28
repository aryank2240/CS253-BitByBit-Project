import express from 'express'
const router = express.Router({ mergeParams: true });
import { createBlog, getBlog, deleteBlog, updateBlog, addCommentOrTags, getTopBlogs, getReportedBlogs, 
  getCommentsForBlog, getTagForBlog, upvoteBlog, downvoteBlog, searchBlogs 
} from '../controllers/blog.js';

router.post("/post", async (req, res) => {
  createBlog(req, res);
});

router.get("/home", async (req, res) => {
  getTopBlogs(req, res);
});
router.get("/reported", async (req, res) => {
  getReportedBlogs(req, res);
});
router.get("/search", async (req, res) => {
  searchBlogs(req, res);
});
router.get("/comments/:id", async(req,res)=>{
  getCommentsForBlog(req,res);
});
router.get("/tag/:id", async(req,res)=>{
  getTagForBlog(req,res);
});
router.get("/:id", async (req, res) => {
  getBlog(req, res);
});

router.patch("/:id/upvote", async (req, res) => {
  upvoteBlog(req, res);
});
router.patch("/:id/downvote", async (req, res) => {
  downvoteBlog(req, res);
});
router.delete("/:id", async (req, res) => {
  deleteBlog(req, res);
}
);

router.patch("/:id", async (req, res) => {
  updateBlog(req, res);
});

router.put("/add/:id", async (req, res) => {
  addCommentOrTags(req, res);
});





export default router;
