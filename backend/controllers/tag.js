import Tag from './../models/Tag.js'
import Blog from './../models/Blog.js'
import mongoose from 'mongoose'

async function postTag(req, res) {
  try {
    const { name, count, blogs } = req.body; // Destructure correctly

    // Validate required fields
    if (!name || !count || !blogs) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if the blog exists
    const blog = await Blog.findOne({ _id: blogs }); 
    if (!blog) return res.status(404).json({ error: "Blog not found" });

    // Create new tag with all required fields
    const newTag = new Tag({ name, count, blogs });
    await newTag.save();

    // Add tag reference to blog
    blog.tags = blog.tags || []; // Ensure `tags` is an array
    blog.tags.push(newTag._id);
    await blog.save();

    // Send response with the newly created tag
    res.json(newTag);
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}


async function getTag(req, res) {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid tag ID" });
    }
    const tags = await Tag.findOne({ _id: id });
    if (!tags) return res.status(404).json({ error: "Tag not found" });
    res.json(tags);
  }
  catch (err) {
    res.status(500).json({ error: err });
    console.log(err);
  }
}

async function deleteTag(req, res) {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid tag ID" });
    }
    const tags = await Tag.findOneAndDelete({ _id: id });
    if (!tags) return res.status(404).json({ error: "Tag not found" });
    res.json(tags);
  }
  catch (err) {
    res.status(500).json({ error: err });
    console.log(err);
  }

}

async function patchTag(req, res) {

  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid tag ID" });
    }
    console.log(req.body);
    console.log(req.body.blogs)
    const tags = await Tag.findOneAndUpdate({ _id: id }, { $set: req.body }, { new: true, runValidators: true });
    if (!tags) return res.status(404).json({ error: "Tag not found" });
    res.json(tags);
  }
  catch (err) {
    res.status(500).json({ error: err });
    console.log(err);
  }

}

async function removeTag(req, res) {

  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid tag ID" });
    }
    const blog_id = req.body.blog_id;
    const tag = await Tag.findOne({ _id: id });
    if (!tag) return res.status(404).json({ error: "Tag not found" });
    const blog = await Blog
      .findOne({ _id: blog_id });
    if (!blog) { return res.status(404).json({ error: "Blog not found" }) }
    blog.tags.pull(tag._id);
    await blog.save();
    tag.blogs.pull(blog._id);
    tag.count = tag.count - 1
    await tag.save();
    const updatedTag = await Tag.findOne({ _id: id });
    return res.json(updatedTag);
  }
  catch (err) {
    res.status(500).json({ error: err });
    console.log(err);
  }
}


async function putTag(req, res) {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid tag ID" });
    }
    const blog_id = req.body.blog_id;
    const tag = await Tag.findOne({ _id: id });
    if (!tag) return res.status(404).json({ error: "Tag not found" });
    const blog = await Blog
      .findOne({ _id: blog_id });
    if (!blog) { return res.status(404).json({ error: "Blog not found" }) }
    blog.tags.push(tag._id);
    await blog.save();
    tag.blogs.push(blog._id);
    tag.count = tag.count + 1;
    await tag.save();
    const updatedTag = await Tag.findOne({ _id: id });
    return res.json(updatedTag);
  }
  catch (err) {
    res.status(500).json({ error: err });
    console.log(err);
  }
}


async function getPopularTags(req, res) {
  try {
    const tags = await Tag.find().sort({ count: -1 }).limit(3);
    if (!tags || tags.length === 0) return res.status(404).json({ error: "No tags found" });
    console.log(tags);
    res.json(tags);
  }
  catch (err) {
    res.status(500).json({ error: err });
    console.log(err);
  }
}


export { postTag, getTag, deleteTag, patchTag, removeTag, putTag, getPopularTags };