import express from 'express'
const router = express.Router({ mergeParams: true });
import { postComment, getComment, deleteComment, updateComment } from '../controllers/comment.js';
import { protect , admin } from '../middleware/authMiddleware.js'
router.post("/post", protect, async (req, res) => {
  postComment(req, res);
});

router.get("/:id", protect, async (req, res) => {
  getComment(req, res);
});

router.delete("/:id", protect, async (req, res) => {
  deleteComment(req, res);
});

router.patch("/:id", protect, async (req, res) => {
  updateComment(req, res);
}
);

export default router;