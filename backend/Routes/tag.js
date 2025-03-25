import express from 'express'
const router = express.Router({ mergeParams: true });
import { postTag,getTag,deleteTag,patchTag,removeTag,putTag,getPopularTags} from '../controllers/tag.js';

router.post("/post", async (req, res) => {
  postTag(req, res);
});
router.get("/popular", async (req, res) => {
  getPopularTags(req, res);
});
router.get("/:id", async (req, res) => {
  getTag(req, res);
});



router.delete("/:id", async (req, res) => {
  deleteTag(req, res);
});

router.patch("/:id", async (req, res) => {
  patchTag(req, res);
});

router.put("/remove/:id", async (req, res) => {
  removeTag(req, res);
});

router.put("/add/:id", async (req, res) => {
  putTag(req, res);
});

export default router;