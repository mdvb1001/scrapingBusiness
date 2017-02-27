// Dependencies:
var mongoose = require('mongoose');
var express = require('express');
var bodyParser = require("body-parser");
var methodOverride = require("method-override");
var exphbs = require('express-handlebars');
// Initialize express
var app = express();
// Snatches HTML from URLs
var request = require('request');
// Scrapes our HTML
var cheerio = require('cheerio');
var Business = require("./models/Business.js");
var Note = require("./models/Note.js");
// Sets up the Express app to handle data parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.text());
app.use(bodyParser.json({
    type: "application/vnd.api+json"
}));
// Override with POST having ?_method=DELETE
app.use(methodOverride("_method"));
// Set the engine up for handlebars
app.engine("handlebars", exphbs({
    defaultLayout: "main"
}));
app.set("view engine", "handlebars");
// Links the static content (i.e. css and images)
app.use(express.static(__dirname + '/public'));
var PORT = process.env.PORT || 3000;
mongoose.connect("mongodb://heroku_fm3ksx11:fcc311q2u3s5i8qcj1t8avkigd@ds161029.mlab.com:61029/heroku_fm3ksx11");
mongoose.Promise = Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('MONGOOSE is working');
    // we're connected!
});
// Make a request call to grab the HTML body from the site of your choice
// First, tell the console what server.js is doing
console.log("\n***********************************\n" + "Grabbing every thread name and link\n" + "from Washington Post's website:" + "\n***********************************\n");
app.get("/", function(req, res) {
    Business.find().sort({
        _id: -1
    }).then(function(result) {
        // define two categories of burgers
        var articles = result;
        console.log("Articles: " + articles);
        return res.render("index", {
            articles: articles
        });
    });
});
// route to all saved articles
app.get('/saved', function(_request, response) {
    Business.find({saved: 1})
        .populate('notes')
        .exec(function(error, articles) {
            if (error) {
                response.send(error);
            } else {
                var newArticlesArray = articles.map(function(article) {
                return article;

                });
                response.render('saved', {
                    articlesSaved: newArticlesArray
                });
            }
        });
});
// route for deleting notes from saved articles
app.delete('/saved/notes/:id', function(req, res) {
        var noteId = req.params.id;
        Note.remove({ _id: noteId }, function(error, _note) {
            if (error) {
                res.send(error);
            } else {
                res.redirect('/saved');
            }
        });
    });
// Api route to see all notes in JSON format
app.get("/api/notes", function(req, res) {
    Note.find(function(err, notes) {
        if (err) return console.error(err);
        res.json(notes);
    });
});
// route to delete an article from the 'saved' page
app.put("/saved/delete/:id", function(req, res) {
    var articleDelete = req.params.id;
    console.log("articleDelete: " + articleDelete);
    Business.findByIdAndUpdate(articleDelete, {
        $set: {
            saved: 0
        }
    }).then(function(result) {
        res.redirect('/saved');
    });
});
// route to save an article
app.put('/:id', function(req, res) {
    var selectArticleId = req.params.id;
    console.log("selectArticleId: " + selectArticleId);
    Business.findByIdAndUpdate(selectArticleId, {
        $set: {
            saved: 1
        }
    }).then(function(result) {
        res.redirect('/');
    });
});
// Create a new note
app.post("/saved/notes/:id", function(req, res) {
    // Create a new note and pass the req.body to the entry
    var newNote = new Note(req.body);
    console.log("NEWNOTE:" + newNote);
    var selectArticleId = req.params.id;
    console.log("selectArticleId:" + selectArticleId);
    // And save the new note the db
    newNote.save(function(error, doc) {
        // Log any errors
        if (error) {
            console.log(error);
        }
        // Otherwise...
        else {
            // Use the article id to find and update it's note
            console.log("doc._id:" + doc._id);
            Business.findOneAndUpdate({
                "_id": selectArticleId
            }, {
                $push: {
                    "notes": doc._id
                }
            }, {
                new: true
            }, function(err, newdoc) {
                // Send any errors to the browser
                if (err) {
                    res.send(err);
                }
                // Or send the newdoc to the browser
                else {
                    res.redirect("/saved");
                }
            });
        }
    });
});
// Api route to all articles in JSON format
app.get("/all", function(req, res) {
    Business.find(function(err, businesses) {
        if (err) return console.error(err);
        res.json(businesses);
    });
});
// route to scrape and post all articles
app.get("/scrape", function(req, res) {
    // Making a request call for the Washington Post's Business section. The page's HTML is saved as the callback's third argument
    request("https://www.washingtonpost.com/business/", function(error, response, html) {
        // Load the HTML into cheerio and save it to a variable
        // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
        var $ = cheerio.load(html);
        // With cheerio, find each p-tag with the "title" class
        // (i: iterator. element: the current element)
        $(".story-headline h3").each(function(i, element) {
            // Save the text of the element (this) in a "title" variable
            var title = $(this).text();
            // In the currently selected element, look at its child elements (i.e., its a-tags),
            // then save the values for any "href" attributes that the child elements may have
            var link = $(element).children().attr("href");
            // console.log(result);
            // If this title element had both a title and a link
            if (title && link) {
                // Save the data in the scrapedData db
                var entry = new Business({
                    title: title,
                    link: link
                });
                entry.save(function(err, doc) {
                    if (err) {
                        console.log("This is the err: " + err);
                        // saved!
                    } else { // Otherwise,
                        // Log the saved data
                        console.log('Docs: ' + doc);
                        console.log("title of article: " + entry.title);
                        console.log("link of article: " + entry.link);
                    }
                });
            }
        });
    });
    // refresh/pull data on DOM
    res.redirect('/');
});
// This will send a "Scrape Complete" message to the browser
// Listen on port 3000 or process.env.PORT
app.listen(PORT, function() {
    console.log("App running on port 3000!");
});