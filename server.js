// const express = require('express');
// const bodyParser = require('body-parser');
// const mongoose = require('mongoose');
// require('dotenv').config();

// const Issue = require('./models/issue.model');
// const port = process.env.PORT || 5001;

// const app = express();

// // Use body-parser middleware to parse request bodies
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());
// mongoose.set('strictQuery', false);

// // Connect to MongoDB database
// mongoose.connect(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true });

// // Set up a simple route
// app.get('/', (req, res) => {
//   res.send('Hello World!');
// });

// // add new issue
// app.post('/new-issue', (req, res) => {
//     const newIssue = new Issue({
//         'ogdata-number': req.body.ogdataNumber,
//         'whatsapp-contact': req.body.whatsappContact,
//         'issue-type': req.body.issueType,
//         'issue-description': req.body.issueDescription,
//         'issue-img': req.body.issueImg
//       });
      
//       newIssue.save((error) => {
//         if (error) {
//           res.send('error')
//           console.log(error);
//         } else {
//           res.send('success')
//           console.log('Issue saved successfully');
//         }
//       });
// });

// // get issue

// // get all issues

// // Start the server
// app.listen(port, () => {
//   console.log(`Server listening on port ${port}`);
// });


const express = require('express');
const multer = require('multer');
const firebase = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Firebase Admin SDK with service account credentials
firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    storageBucket: 'gs://airtel-skit-fb.appspot.com'
});

// Initialize Firebase app


// Get a reference to the Firebase Storage bucket
const bucket = firebase.storage().bucket();

// Create a Multer middleware instance for handling file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 20 * 1024 * 1024 // 20 MB limit
    }
});

// Define a route for handling video file uploads
app.post('/upload', upload.single('video'), async (req, res) => {
    if (!req.file) {
        res.status(400).send({ error: 'No video file uploaded' });
        return;
    }

    const { originalname, buffer } = req.file;

    // // Get metadata from request body
    // const { firstname, lastname, email, title, description } = req.body;

    // // Upload the video file to Firebase Storage with metadata
    const file = bucket.file(req.body.title + '.mp4');

    const metadata = {
        metadata: {
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            videoUrl: `https://storage.googleapis.com/${bucket.name}/${file.name}`,
            //   videoUrl: req.body.videoUrl,
            title: req.body.title,
            description: req.body.description,
        }
    };
    const writeStream = file.createWriteStream({ metadata });

    writeStream.on('error', (error) => {
        console.error('Error uploading video:', error);
        res.status(500).send({ error: 'Error uploading video' });
    });

    writeStream.on('finish', () => {
        console.log('Video uploaded successfully');
        res.send({ message: 'Video uploaded successfully' });
    });

    writeStream.end(buffer);
});

// 
app.post('/applicant-upload', async (req, res) => {
    const { 
        firstname, 
        lastname, 
        email, 
        title, 
        description,
        airtelNumber, 
        director, 
        actors, 
        producers, 
        videoUrl } = req.body;
    
    try {
      const applicantRef = await db.collection('applicants').add({
        firstname,
        lastname,
        email,
        title,
        description,
        airtelNumber, 
        director, 
        actors, 
        producers,
        videoUrls: [videoUrl], // Store videoUrl as an array of strings
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      console.log(`Applicant with ID ${applicantRef.id} added to collection`);
      res.send({ message: 'Data added to collection' });
    } catch (error) {
      console.error('Error adding applicant to collection:', error);
      res.status(500).send({ error: 'Error adding applicant to collection' });
    }
  });
  


// Define routes for Firebase authentication
// Sign up with email and password
const db = firebase.firestore();

app.post('/signup', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Create the user account in Firebase Auth
      const userRecord = await firebase.auth().createUser({
        email,
        password,
      });
  
      // Store the user information in the "applicants" collection in Firestore
      const db = firebase.firestore();
      const docRef = await db.collection('applicants').add({
        email,
        uid: userRecord.uid,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
  
      res.status(201).send({ message: 'User created successfully', id: docRef.id });
    } catch (error) {
      console.error('Error signing up user:', error);
      res.status(400).send({ error: error.message });
    }
  });
  

// Login with email and password
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
      const user = userCredential.user;
  
      res.status(200).send(user.toJSON());
    } catch (error) {
      console.error('Error logging in user:', error);
      res.status(400).send({ error: error.message });
    }
  });
  


// Define a route for streaming the uploaded video to the client
app.get('/video/:filename', async (req, res) => {
    const filename = req.params.filename;

    // Get a signed URL for the video file from Firebase Storage
    const file = bucket.file(filename);
    const [signedUrl] = await file.getSignedUrl({
        action: 'read',
        expires: '03-01-2500' // Set a far-future expiration date
    });

    // Redirect the client to the signed URL to stream the video
    res.redirect(signedUrl);
});

// Start the server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
