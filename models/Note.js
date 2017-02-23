var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var noteSchema = new Schema({
    body: {
        type: String,
        dafault: ""
    }
});
var Note = mongoose.model('Note', noteSchema);

module.exports = Note;
