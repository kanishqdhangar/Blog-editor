const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');

// Save or update a draft
router.post('/save-draft', async (req, res) => {
  try {
    const { id, title, content } = req.body;
    const allowedStatuses = ['draft', 'published'];
    const status = allowedStatuses.includes(req.body.status) ? req.body.status : 'draft';
    const tags = Array.isArray(req.body.tags) ? req.body.tags : [];

    let blog;
    if (id) {
      blog = await Blog.findByIdAndUpdate(
        id,
        { title, content, tags, status },
        { new: true }
      );
    } else {
      blog = new Blog({ title, content, tags, status });
      await blog.save();
    }

    res.status(200).json(blog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// Publish blog
router.post('/publish', async (req, res) => {
  try {
    const { id, title, content, tags } = req.body;

    let blog;
    if (id) {
      blog = await Blog.findByIdAndUpdate(
        id,
        { title, content, tags, status: 'published' },
        { new: true }
      );
    } else {
      blog = new Blog({ title, content, tags, status: 'published' });
      await blog.save();
    }

    res.status(200).json(blog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all blogs
router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ updated_at: -1 });
    res.status(200).json(blogs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get blog by ID
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    res.status(200).json(blog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
