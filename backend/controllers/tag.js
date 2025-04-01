import Tag from './../models/Tag.js'
import Blog from './../models/Blog.js'
import mongoose from 'mongoose'

async function postTag(req, res) {
  try {
    const { name, blogs } = req.body;


    if (!name || !blogs) {
      return res.status(400).json({ error: "Missing required fields" });
    }


    const blog = await Blog.findOne({ _id: blogs });
    if (!blog) return res.status(404).json({ error: "Blog not found" });

    let tag = await Tag.findOne({ name });

    if (tag) {

      tag.count += 1;
      await tag.save();
    } else {
      // If the tag does not exist, create a new one
      tag = new Tag({ name, count: 1, blogs });
      await tag.save();
    }

    blog.tags = blog.tags || [];
    if (!blog.tags.includes(tag._id)) {
      blog.tags.push(tag._id);
      await blog.save();
    }

    // Send response with the updated/created tag
    res.json(tag);
  } catch (err) {

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

    res.json(tags);
  }
  catch (err) {
    res.status(500).json({ error: err });
    console.log(err);
  }
}

async function searchTags(req, res) {
  try {
    const { query } = req.query;
    if (!query || query.trim() === '') {
      return res.status(400).json({ error: "Search query is required" });
    }
    const searchPattern = new RegExp(query,"i");
    const tags = await Tag.find({
      $or: [
        { name: searchPattern }
      ]
    }).sort({ CreatedAt: -1 });

    if (!tags || tags.length === 0) {
      return res.status(404).json({ message: "No tags found matching your search" });
    }
    res.json(tags);
  } catch (error) {
    console.error("Error searching tags:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}


export { postTag, getTag, deleteTag, patchTag, removeTag, putTag, getPopularTags, searchTags };