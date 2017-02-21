// Dependencies:
var mongoose = require('mongoose');
var express = require('express');
// Initialize express
var app = express();
// Snatches HTML from URLs
var request = require('request');
// Scrapes our HTML
var cheerio = require('cheerio');
var PORT = 3000;
mongoose.connect('mongodb://localhost/' + PORT);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('MONGOOSE is working');
    // we're connected!
});
var Schema = mongoose.Schema;
var articlesSchema = new Schema({
    title: String,
    link: String
});
var Business = mongoose.model('Business', articlesSchema);
// Make a request call to grab the HTML body from the site of your choice
// First, tell the console what server.js is doing
console.log("\n***********************************\n" + "Grabbing every thread name and link\n" + "from Washington Post's website:" + "\n***********************************\n");
app.get("/all", function (req, res) {
    Business.find(function (err, businesses) {
        if (err) return console.error(err);
        res.json(businesses);
    });
});
app.get("/scrape", function (req, res) {
    // Making a request call for the Washington Post's Business section. The page's HTML is saved as the callback's third argument
    request("https://www.washingtonpost.com/business/", function (error, response, html) {
        // Load the HTML into cheerio and save it to a variable
        // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
        var $ = cheerio.load(html);
        // With cheerio, find each p-tag with the "title" class
        // (i: iterator. element: the current element)
        $(".story-headline h3").each(function (i, element) {
            // Save the text of the element (this) in a "title" variable
            var title = $(this).text();
            // In the currently selected element, look at its child elements (i.e., its a-tags),
            // then save the values for any "href" attributes that the child elements may have
            var link = $(element).children().attr("href");
            // console.log(result);
            // If this title element had both a title and a link
            if (title && link) {
                // Save the data in the scrapedData db
                var listOfArticles = new Business({
                    title: title,
                    link: link
                });
                listOfArticles.save(function (err) {
                    if (err) {
                        return handleError(err);
                        // saved!
                    } else { // Otherwise,
                        // Log the saved data
                        console.log("title of article: " + listOfArticles.title);
                        console.log("link of article: " + listOfArticles.link);
                    }
                });
            }
            // Log the result once cheerio analyzes each of its selected elements
        });
    });
    res.send("Scrape Complete");
});
// This will send a "Scrape Complete" message to the browser
// Listen on port 3000
app.listen(3000, function () {
    console.log("App running on port 3000!");
});