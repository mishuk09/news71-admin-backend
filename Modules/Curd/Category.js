const express = require('express');
const app = express.Router();
const CateScheema = require('../../Schema/CateScheema');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Fuse = require("fuse.js");



// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
    secure: true,
});

// Cloudinary storage setup
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'CateScheema',
        format: async (req, file) => 'png',
        public_id: (req, file) => `${file.originalname}-${Date.now()}`,
    },
});

const parser = multer({ storage: storage });

// Add a new post (with multiple images)
app.post('/add', parser.array('images', 10), async (req, res) => {
    const { category, title, newPrice, oldPrice, stock, color, size, description } = req.body;

    // Collect all uploaded image paths
    const img = req.files.map(file => file.path);

    const newPost = new CateScheema({
        img,
        category,
        title,
        newPrice,
        oldPrice,
        stock,
        color: color ? color.split(',') : [],
        size: size ? size.split(',') : [],
        description
    });

    try {
        await newPost.save();
        res.json('Post added!');
    } catch (err) {
        console.error('Error:', err);
        res.status(400).json('Error: ' + err);
    }
});




app.get("/search", async (req, res) => {
    try {
        let query = req.query.q?.trim();
        if (!query) return res.status(400).json({ message: "Search query is required" });

        const allItems = await CateScheema.find({});
        const fuse = new Fuse(allItems, { keys: ["title"], threshold: 0.3 });

        const results = fuse.search(query).map(result => result.item);
        res.json({ items: results });

    } catch (error) {
        console.error("Search error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Read all posts
app.get('/', (req, res) => {
    CateScheema.find()
        .then(posts => res.json(posts))
        .catch(err => res.status(400).json('Error: ' + err));
});

// Read a single post
app.get('/:id', (req, res) => {
    CateScheema.findById(req.params.id)
        .then(post => res.json(post))
        .catch(err => res.status(400).json('Error: ' + err));
});

// Update a post
app.post('/cateupdate/:id', parser.array('images', 10), async (req, res) => {
    try {
        const post = await CateScheema.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        // Add new images to the existing array if uploaded
        // if (req.files.length > 0) {
        //     post.img = post.img.concat(req.files.map(file => file.path));
        // }

        // Replace old images with new ones
        if (req.files.length > 0 || req.body.existingImages) {
            post.img = req.body.existingImages || [];
            post.img = post.img.concat(req.files.map(file => file.path));
        }

        // Update other fields
        post.category = req.body.category;
        post.title = req.body.title;
        post.newPrice = req.body.newPrice;
        post.oldPrice = req.body.oldPrice;
        post.stock = req.body.stock;
        post.color = req.body.color;
        post.size = req.body.size;
        post.description = req.body.description;

        await post.save();
        res.json('Post updated!');
    } catch (err) {
        console.error('Error:', err);
        res.status(400).json('Error: ' + err);
    }
});


// Delete a post
app.delete('/catedelete/:id', (req, res) => {
    CateScheema.findByIdAndDelete(req.params.id)
        .then(() => res.json('Post deleted.'))
        .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = app;
