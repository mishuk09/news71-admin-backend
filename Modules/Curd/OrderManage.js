const express = require('express');
const router = express.Router();
const Order = require('../../Schema/Order'); // Adjust the path as needed
const Fuse = require("fuse.js");

// Controller function for creating an order
const createOrder = async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        await newOrder.save();
        res.status(201).json({ message: 'Order created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error creating order', error });
    }
};



const searchOrder = async (req, res) => {
    try {
        let query = req.query.q?.trim();
        if (!query) return res.status(400).json({ message: "Search query is required" });

        const allItems = await Order.find({});
        const fuse = new Fuse(allItems, { keys: ["email"], threshold: 0.3 });

        const results = fuse.search(query).map(result => result.item);
        res.json({ items: results });

    } catch (error) {
        console.error("Search error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Controller function for fetching all orders
const getOrders = async (req, res) => {
    try {
        const orders = await Order.find();
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error });
    }
};


// Controller function for completing an order
const completeOrder = async (req, res) => {
    try {
        const orderId = req.params.id;
        await Order.findByIdAndDelete(orderId);
        res.status(200).json({ message: 'Order completed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error completing order', error });
    }
};


// Define the routes
router.post('/orders', createOrder);
router.get('/search', searchOrder);
router.get('/orders', getOrders);

// Define the route
router.delete('/orders/:id', completeOrder);

module.exports = router;
