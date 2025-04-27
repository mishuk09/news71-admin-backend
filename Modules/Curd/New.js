const express = require('express');
const app = express.Router();
const NewArrival = require('../../Schema/New');
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
        folder: 'NewArrival',
        format: async (req, file) => 'png',
        public_id: (req, file) => `${file.originalname}-${Date.now()}`,
    },
});

const parser = multer({ storage: storage });

// Add a new post (with image upload)
app.post('/add', parser.single('image'), (req, res) => {
    const { category, title, newPrice, oldPrice, stock, color, size, description } = req.body;

    // If image is uploaded, the URL will be available in req.file.path
    const img = req.file ? req.file.path : 'no img path';

    const newPost = new NewArrival({
        img,
        category,
        title,
        newPrice,
        oldPrice,
        stock,
        color,
        size,
        description
    });

    newPost.save()
        .then(() => res.json('Post added!'))
        .catch(err => {
            console.error('Error:', err);
            res.status(400).json('Error: ' + err);
        });
});



app.get("/search", async (req, res) => {
    try {
        let query = req.query.q?.trim();
        if (!query) return res.status(400).json({ message: "Search query is required" });

        const allItems = await NewArrival.find({});
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
    NewArrival.find()
        .then(posts => res.json(posts))
        .catch(err => res.status(400).json('Error: ' + err));
});

// Read a single post
app.get('/:id', (req, res) => {
    NewArrival.findById(req.params.id)
        .then(post => res.json(post))
        .catch(err => res.status(400).json('Error: ' + err));
});

// Update a post
app.post('/newupdate/:id', parser.single('image'), (req, res) => {
    NewArrival.findById(req.params.id)
        .then(post => {
            // If a new image is uploaded, store the Cloudinary URL
            if (req.file) {
                post.img = req.file.path;  // Cloudinary URL of the uploaded image
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

            post.save()
                .then(() => res.json('Post updated!'))
                .catch(err => res.status(400).json('Error: ' + err));
        })
        .catch(err => res.status(400).json('Error: ' + err));
});




// Delete a post
app.delete('/newdelete/:id', (req, res) => {
    NewArrival.findByIdAndDelete(req.params.id)
        .then(() => res.json('Post deleted.'))
        .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = app;
