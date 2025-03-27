import express from 'express'
const router = express.Router({ mergeParams: true });
import { createUser, getUser, deleteUser, updateUser,loginUser, SaveBlogs, getBlogsbyFollowedUsers, getSavedBlogs, getBlogsbyUser,followUsers} from './../controllers/user.js';
import { get } from 'http';

router.get("/:id", async (req, res) => {
  getUser(req, res);
});

router.put("/:id/saveBlogs", async (req, res) => {
  SaveBlogs(req, res);
});

router.get("/:id/blogs", async (req, res) => {
  getBlogsbyUser(req, res);
});
router.delete("/:id", async (req, res) => {
  deleteUser(req, res);
});
router.get("/:id/followedBlogs", async (req, res) => {
  getBlogsbyFollowedUsers(req, res);
});

router.put("/:id/follow", async (req, res) => {
  followUsers(req,res);
});

router.patch("/:id", async (req, res) => {
  updateUser(req, res);
});

router.get("/:id/SavedBlogs", async (req, res) => {
  getSavedBlogs(req, res);
});

export default router;