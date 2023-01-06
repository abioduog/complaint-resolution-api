const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  'ogdata-number': String,
  'whatsapp-contact': String,
  'issue-type': String,
  'issue-description': String,
  'issue-img': String
});

const Issue = mongoose.model('Issue', issueSchema);

module.exports = Issue;
