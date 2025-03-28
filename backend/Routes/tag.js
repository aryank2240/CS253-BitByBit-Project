import express from 'express'
const router = express.Router({ mergeParams: true });
import { postTag,getTag,deleteTag,patchTag,removeTag,putTag,getPopularTags} from '../controllers/tag.js';
import { protect , admin } from '../middleware/authMiddleware.js'
router.post("/post", protect, async (req, res) => {
  postTag(req, res);
});
router.get("/popular", protect, async (req, res) => {
  getPopularTags(req, res);
});
router.get("/:id", protect, async (req, res) => {
  getTag(req, res);
});



router.delete("/:id", protect, async (req, res) => {
  deleteTag(req, res);
});

router.patch("/:id",  protect,async (req, res) => {
  patchTag(req, res);
});

router.put("/remove/:id", protect, async (req, res) => {
  removeTag(req, res);
});

router.put("/add/:id",  protect,async (req, res) => {
  putTag(req, res);
});

export default router;