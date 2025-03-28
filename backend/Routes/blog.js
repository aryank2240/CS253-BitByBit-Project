import express from 'express'
const router = express.Router({ mergeParams: true });
import { createBlog, getBlog, deleteBlog, updateBlog, addCommentOrTags, getTopBlogs, getReportedBlogs, 
  getCommentsForBlog, getTagForBlog, upvoteBlog, downvoteBlog, searchBlogs 
} from '../controllers/blog.js';
import { protect , admin } from '../middleware/authMiddleware.js'
router.post("/post", protect, async (req, res) => {
  createBlog(req, res);
});

router.get("/home", protect, async (req, res) => {
  getTopBlogs(req, res);
});
router.get("/reported", protect, admin, async (req, res) => {
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
router.get("/:id", protect, async (req, res) => {
  getBlog(req, res);
});

router.patch("/:id/upvote", protect, async (req, res) => {
  upvoteBlog(req, res);
});
router.patch("/:id/downvote", protect, async (req, res) => {
  downvoteBlog(req, res);
});
router.delete("/:id", protect , async (req, res) => {
  deleteBlog(req, res);
}
);

router.patch("/:id", protect, async (req, res) => {
  updateBlog(req, res);
});

router.put("/add/:id", protect, async (req, res) => {
  addCommentOrTags(req, res);
});





export default router;
