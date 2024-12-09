const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3000;

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const companySchema = new mongoose.Schema({
    name: String,
    ticker: String,
    price: Number,
});

const Company = mongoose.model('PublicCompany', companySchema);

app.get('/process', async (req, res) => {
    const { query, searchType } = req.query;

    if (!query || !searchType) {
        return res.status(400).send('Invalid request');
    }

    try {
        const filter = searchType === 'ticker' ? { ticker: query } : { name: new RegExp(query, 'i') };
        const results = await Company.find(filter);

        if (results.length === 0) {
            return res.send('No matching companies found.');
        }

        let responseHTML = '<h1>Search Results</h1><ul>';
        results.forEach(company => {
            responseHTML += `<li>${company.name} (${company.ticker}) - $${company.price}</li>`;
        });
        responseHTML += '</ul>';
        res.send(responseHTML); // Extra credit: Display results on a web page.

        console.log('Search Results:', results); // Log results to the console.
    } catch (err) {
        console.error('Error fetching data:', err);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, () => {
    console.log(`App running at http://localhost:${port}`);
});
