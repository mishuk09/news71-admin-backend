const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    img: { type: [String], required: false },  // Store multiple image paths
    category: { type: String, required: true },


    divission: { type: String, required: false },
    district: { type: String, required: false },
    upazila: { type: String, required: false },
    createdAt: { type: Date, default: Date.now },

 

    description: { type: String, required: true },
});

const Allnews = mongoose.model('Allnews', postSchema);

module.exports = Allnews;
