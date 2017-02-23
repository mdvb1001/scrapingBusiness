var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var articlesSchema = new Schema({
    title: String,
    link: {
        type: String,
        // unique: true, // this would work
        validate: {
            validator: function (linkOfArticle, cb) {
                Business.find({
                    link: linkOfArticle
                }, function (err, docs) {
                    cb(docs.length === 0);
                });
            },
            message: "Article link already exists"
        }
    },
    saved: {
        type: Number,
        default: 0
    },
    note: {
        type: String,
        required: false,
        default: ""
    }
});
var Business = mongoose.model('Business', articlesSchema);

module.exports = Business;
