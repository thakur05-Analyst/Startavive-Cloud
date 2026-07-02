const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

module.exports = async function(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !process.env.GOOGLE_SHEET_ID) {
            console.error("Missing Google credentials in environment variables.");
            return res.status(500).json({ error: 'Server misconfiguration. Please add environment variables.' });
        }

        const serviceAccountAuth = new JWT({
            email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            scopes: [
                'https://www.googleapis.com/auth/spreadsheets',
            ],
        });

        const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
        
        await doc.loadInfo();
        const sheet = doc.sheetsByIndex[0];
        
        const newRow = {
            'Date': new Date().toLocaleString(),
            'Client Name': req.body['Client Name'] || 'N/A',
            'Email': req.body['Email'] || 'N/A',
            'Project Target': req.body['Project Target'] || 'N/A',
            'Project Details': req.body['Project Details'] || 'N/A'
        };

        await sheet.addRow(newRow);
        
        console.log("New lead added to Google Sheet!");
        res.redirect('/?success=true');
        
    } catch (error) {
        console.error('Error saving to Google Sheets:', error);
        res.status(500).json({ error: 'Failed to process request.' });
    }
};
