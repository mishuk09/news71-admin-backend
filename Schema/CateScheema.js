const mongoose = require('mongoose');

const New = new mongoose.Schema({
    img: { type: [String], required: true },  // Store multiple image paths
    category: { type: String, required: true },
    title: { type: String, required: true },
    newPrice: { type: Number, required: true },
    oldPrice: { type: Number, required: true },
    stock: { type: Number, required: true },
    color: { type: [String], required: false },
    size: { type: [String], required: false },
    description: { type: String, required: false },
});



module.exports = mongoose.model('CateScheema', New);
