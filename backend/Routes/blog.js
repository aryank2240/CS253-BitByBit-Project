import express from 'express'
const router = express.Router({ mergeParams: true });
import { createBlog, getBlog, deleteBlog, updateBlog, addCommentOrTags,getTopBlogs } from '../controllers/blog.js';

router.post("/post", async (req, res) => {
  createBlog(req, res);
});

router.get("/home", async (req, res) => {
  getTopBlogs(req, res);
});
router.get("/:id", async (req, res) => {
  getBlog(req, res);
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