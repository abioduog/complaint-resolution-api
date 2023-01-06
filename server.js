const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();

const Issue = require('./models/issue.model');
const port = process.env.PORT || 5001;

const app = express();

// Use body-parser middleware to parse request bodies
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
mongoose.set('strictQuery', false);

// Connect to MongoDB database
mongoose.connect('mongodb://localhost:27017/complaint-resolution', { useNewUrlParser: true, useUnifiedTopology: true });
 
// Set up a simple route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// add new issue
app.post('/new-issue', (req, res) => {
    const newIssue = new Issue({
        'ogdata-number': req.body.ogdataNumber,
        'whatsapp-contact': req.body.whatsappContact,
        'issue-type': req.body.issueType,
        'issue-description': req.body.issueDescription,
        'issue-img': req.body.issueImg
      });
      
      newIssue.save((error) => {
        if (error) {
          console.log(error);
        } else {
          console.log('Issue saved successfully');
        }
      });
});

// get issue

// get all issues

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
