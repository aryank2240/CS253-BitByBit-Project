import express from 'express'
const router = express.Router({ mergeParams: true });
import {  createUser,getUser, deleteUser, updateUser,loginUser,SaveBlogs, getBlogsbyFollowedUsers, getSavedBlogs, getBlogsbyUser,followUsers,getTopBloggers} from './../controllers/user.js';
import { protect , admin } from '../middleware/authMiddleware.js'

router.get("/topUsers",  async (req, res) => {
  getTopBloggers(req, res);
});
router.get("/:id", protect, async (req, res) => {
  getUser(req, res);
});

router.put("/:id/saveBlogs", protect, async (req, res) => {
  SaveBlogs(req, res);
});



router.get("/:id/blogs", protect, async (req, res) => {
  getBlogsbyUser(req, res);
});
router.delete("/:id", protect,admin, async (req, res) => {
  deleteUser(req, res);
});
router.get("/:id/followedBlogs", protect, async (req, res) => {
  getBlogsbyFollowedUsers(req, res);
});

router.put("/:id/follow",  protect,async (req, res) => {
  followUsers(req,res);
});

router.patch("/:id",  protect,async (req, res) => {
  updateUser(req, res);
});

router.get("/:id/SavedBlogs", protect, async (req, res) => {
  getSavedBlogs(req, res);
});



export default router;