const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Load environment variables from .env file
const Auth = require('./Schema/Auth'); // Import the Auth model

const post = require('./Modules/Curd/Additems');
const orderRoutes = require('./Modules/Curd/OrderManage'); // Import the Order routes
const home = require('./Modules/Curd/home'); // Import the Order routes
const New = require('./Modules/Curd/New'); // Import the Order routes
const Category = require('./Modules/Curd/Category'); // Import the Order routes

const app = express();
const port = process.env.PORT || 5000;

// MongoDB connection
mongoose.connect(process.env.CONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Middleware
const corsOptions = {
    origin: ' *',
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
};


app.use(cors(corsOptions));

app.use(bodyParser.json({ limit: '50mb' }));
app.use('/uploads', express.static('uploads')); // To serve static files
app.use(bodyParser.urlencoded({ extended: true }));

// Verify token middleware
const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization header is missing' });
    }
    const token = authHeader.split(' ')[1]; // Bearer <token>

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }

        // Token is valid
        req.userId = decoded.userId;
        next();
    });
}

// Routes
app.post('/signup', async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new Auth({
            firstName,
            lastName,
            email,
            password: hashedPassword
        });

        await newUser.save();

        res.status(201).json(newUser);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

app.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await Auth.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({ token });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Use routes
app.use('/posts', post);
app.use('/item', orderRoutes); // Use the order routes
app.use('/home', home); // Use the order routes
app.use('/new', New); // Use the order routes
app.use('/cate', Category); // Use the order routes


// Protected route
app.get('/dashboard', verifyJWT, (req, res) => res.status(200).json({ message: 'Welcome to Dashboard!' }));
app.get('/addpost', verifyJWT, (req, res) => res.status(200).json({ message: 'Welcome to addPost!' }));
app.get('/update/:id', verifyJWT, (req, res) => res.status(200).json({ message: 'Welcome to User!' }));
app.get('/delete/:id', verifyJWT, (req, res) => res.status(200).json({ message: 'Welcome to User!' }));
app.get('/edit', verifyJWT, (req, res) => res.status(200).json({ message: 'Welcome to User!' }));
app.get('/delete', verifyJWT, (req, res) => res.status(200).json({ message: 'Welcome to User!' }));
app.get('/orders', verifyJWT, (req, res) => res.status(200).json({ message: 'Welcome to User!' }));

// Offer section
app.get('/offer', verifyJWT, (req, res) => res.status(200).json({ message: 'Welcome to Offer!' }));
app.get('/addoffer', verifyJWT, (req, res) => res.status(200).json({ message: 'Welcome to Add Offer!' }));
app.get('/editoffer', verifyJWT, (req, res) => res.status(200).json({ message: 'Welcome to Edit Offer!' }));
app.get('/offupdate/:id', verifyJWT, (req, res) => res.status(200).json({ message: 'Welcome to Update Offer!' }));
app.get('/deleteoffer', verifyJWT, (req, res) => res.status(200).json({ message: 'Welcome to Delete Offer!' }));
app.get('/offdelete/:id', verifyJWT, (req, res) => res.status(200).json({ message: 'Welcome to Delete Offer!' }));

// New Arrival Section
app.get('/new', verifyJWT, (req, res) => res.status(200).json({ message: 'Welcome to New Arrival!' }));
app.get('/newadd', verifyJWT, (req, res) => res.status(200).json({ message: 'Welcome to New Add Post!' }));
app.get('/newupdate/:id', verifyJWT, (req, res) => res.status(200).json({ message: 'Welcome to New Update Post!' }));
app.get('/newdelete/:id', verifyJWT, (req, res) => res.status(200).json({ message: 'Welcome to New Delete Post!' }));
app.get('/newedit', verifyJWT, (req, res) => res.status(200).json({ message: 'Welcome to New Edit!' }));
app.get('/newdelete', verifyJWT, (req, res) => res.status(200).json({ message: 'Welcome to New Delete!' }));

// Category Section
app.get('/cate', verifyJWT, (req, res) => res.status(200).json({ message: 'Welcome to Category!' }));
app.get('/cateadd', verifyJWT, (req, res) => res.status(200).json({ message: 'Welcome to Category Add!' }));
app.get('/cateupdate/:id', verifyJWT, (req, res) => res.status(200).json({ message: 'Welcome to Category Update!' }));
app.get('/catedelete/:id', verifyJWT, (req, res) => res.status(200).json({ message: 'Welcome to Category Delete!' }));
app.get('/cateedit', verifyJWT, (req, res) => res.status(200).json({ message: 'Welcome to Category Edit!' }));
app.get('/catedelete', verifyJWT, (req, res) => res.status(200).json({ message: 'Welcome to Category Delete!' }));




// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

const crypto = require('crypto');

const generateSecretKey = () => {
    const secretKey = crypto.randomBytes(64).toString('hex');
    return secretKey;
};

module.exports = generateSecretKey;
