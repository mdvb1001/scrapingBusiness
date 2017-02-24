var mongoose = require('mongoose');
mongoose.Types.ObjectId.isValid('your id here');

var Schema = mongoose.Schema;
var articlesSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true,
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
     notes: [{
        type: Schema.Types.ObjectId,
        ref: 'Note'
    }]
});
var Business = mongoose.model('Business', articlesSchema);
module.exports = Business;