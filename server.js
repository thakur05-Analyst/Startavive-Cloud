require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

const app = express();
const PORT = process.env.PORT || 5000;

const path = require('path');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static assets
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/startavive_cloud_logo_1782920911495.png', (req, res) => res.sendFile(path.join(__dirname, 'startavive_cloud_logo_1782920911495.png')));
app.get('/startavive_cloud_fb_cover_1782921360324.png', (req, res) => res.sendFile(path.join(__dirname, 'startavive_cloud_fb_cover_1782921360324.png')));

// Initialize auth
const serviceAccountAuth = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n') : '',
    scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
    ],
});

// The endpoint to receive form submissions
app.post('/api/contact', async (req, res) => {
    try {
        const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
        
        // Connect to sheet
        await doc.loadInfo();
        
        // Grab the first tab in the sheet
        const sheet = doc.sheetsByIndex[0];
        
        // Data from the form (these keys should match the 'name' attributes on frontend if using FormData,
        // but here we are using standard req.body)
        // Ensure your Google Sheet has header columns exactly matching:
        // 'Date', 'Client Name', 'Email', 'Project Target', 'Project Details'
        const newRow = {
            'Date': new Date().toLocaleString(),
            'Client Name': req.body['Client Name'] || 'N/A',
            'Email': req.body['Email'] || 'N/A',
            'Project Target': req.body['Project Target'] || 'N/A',
            'Project Details': req.body['Project Details'] || 'N/A'
        };

        // Append to the sheet
        await sheet.addRow(newRow);
        
        // Redirect back or return JSON success
        console.log("New lead added to Google Sheet!");
        
        // If it's a direct HTML form post without AJAX, we can redirect back to index.html
        res.redirect('/?success=true');
        // Or if using AJAX: res.json({ success: true, message: 'Row added' });
        
    } catch (error) {
        console.error('Error saving to Google Sheets:', error);
        res.status(500).json({ error: 'Failed to process request.' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Make sure you have your Google Credentials loaded in .env`);
});
