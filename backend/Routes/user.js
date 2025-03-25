import express from 'express'
const router = express.Router({ mergeParams: true });
import { createUser, getUser, deleteUser, updateUser,loginUser, SaveBlogs, getBlogsbyFollowedUsers, getSavedBlogs} from './../controllers/user.js';
import { get } from 'http';

router.post("/post", async (req, res) => {
  createUser(req, res);
});

router.get("/:id", async (req, res) => {
  getUser(req, res);
});

router.get("/:id/saveBlogs", async (req, res) => {
  SaveBlogs(req, res);
});

router.delete("/:id", async (req, res) => {
  deleteUser(req, res);
});
router.get("/:id/followedBlogs", async (req, res) => {
  getBlogsbyFollowedUsers(req, res);
});
router.post("/login", async (req, res) => {
 loginUser(req, res);
});
router.patch("/:id", async (req, res) => {
  updateUser(req, res);
});

router.get("/:id/SavedBlogs", async (req, res) => {
  getSavedBlogs(req, res);
});

export default router;