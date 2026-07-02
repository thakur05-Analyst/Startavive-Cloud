require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

const path = require('path');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static assets for local development
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/startavive_cloud_logo_1782920911495.png', (req, res) => res.sendFile(path.join(__dirname, 'startavive_cloud_logo_1782920911495.png')));
app.get('/startavive_cloud_fb_cover_1782921360324.png', (req, res) => res.sendFile(path.join(__dirname, 'startavive_cloud_fb_cover_1782921360324.png')));

// Start the server (for local development)
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;
