const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://nathanielperry:lEa48UHVH3CADETV@cs20perry.xso7g.mongodb.net/?retryWrites=true&w=majority&appName=CS20Perry";

const express = require('express');
const app = express();
var url = require('url');
const port = process.env.PORT || 3000;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

//form
var formInfo = '<!DOCTYPE html> <html lang="en">';
formInfo += '<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Stock Ticker App Part2</title></head>';
formInfo += '<body><h1>Home</h1> <form action="/process" method="GET"><label for="query">Enter a Stock Ticker Symbol or a Company Name:</label><br><input type="text" id="query" name="query" required><br>';
formInfo += '<label><input type="radio" name="searchType" value="Ticker" required>Ticker Symbol</label>';
formInfo += '<label><input type="radio" name="searchType" value="Company">Company Name</label><br><br>';
formInfo += '<button type="submit">Search</button></form></body></html>';


//View 1
app.use(function(req, res, next) {
    if (req.path === '/') {
        res.send(formInfo);
    } else {
        next();
    }
});

//View 2
app.get('/process', async function(req, res) {
    //get form info
    var qobj = url.parse(req.url, true).query;
    var search = qobj.query;
    var which = qobj.searchType;

    async function run() {

        try {

            await client.connect();

            var dbo = client.db("Stock");
            var collection = dbo.collection('PublicCompanies');

            var theQuery = {};

            //If searching for Ticker or Company
            if (which == "Ticker") {
                    theQuery = { "Ticker": search };
            } else {
                    theQuery = { "Company": search };
            }

            //search datatbase
            const items = await collection.find(theQuery).toArray();

            //if search is not in database
            if (items.length == 0) {
                console.log("No " + which + " was found with that name.");
            } else {
                var infomatiion = "";
                items.forEach(function(item) {
                    //send to console
                    console.log("Company: " + item.Company + ";  Stock Ticker Symbol: " + item.Ticker + ";  Price: " + item.Price);
                    infomatiion += "Company: " + item.Company + ";  Stock Ticker Symbol: " + item.Ticker + ";  Price: " + item.Price + "<br>";
                });
                res.send(infomatiion);
            }

        } finally {
            await client.close();
        }
    }

    run().catch(console.dir);

});

app.listen(port);
