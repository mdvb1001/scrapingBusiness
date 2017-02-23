var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// Create the Note schema
var NoteSchema = new Schema({
  // Just a string
  title: {
    type: String
  },
  // Just a string
  body: {
    type: String
  }
});

var Note = mongoose.model('Note', NoteSchema);

module.exports = Note;
