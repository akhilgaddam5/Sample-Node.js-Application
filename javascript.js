const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

// Serve static files from the "public" directory
app.use(express.static('public'));

// File upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
  const file = req.file;
  const fileName = file.originalname;

  // Check if the file already exists
  if (fs.existsSync(path.join(upload.dest, fileName))) {
    // If the file exists and the "override" query parameter is set, delete the existing file
    if (req.query.override === 'true') {
      fs.unlinkSync(path.join(upload.dest, fileName));
    } else {
      return res.status(409).send('File already exists.');
    }
  }

  // Move the uploaded file to the "uploads" directory
  fs.renameSync(file.path, path.join(upload.dest, fileName));
  res.send('File uploaded successfully.');
});

// File download endpoint
app.get('/download/:filename', (req, res) => {
  const fileName = req.params.filename;
  const filePath = path.join(upload.dest, fileName);

  // Check if the file exists
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).send('File not found.');
  }
});

// File listing endpoint
app.get('/files', (req, res) => {
  fs.readdir(upload.dest, (err, files) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error retrieving files.');
    }
    res.json(files);
  });
});

// File deletion endpoint
app.delete('/delete/:filename', (req, res) => {
  const fileName = req.params.filename;
  const filePath = path.join(upload.dest, fileName);

  // Check if the file exists
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    res.send('File deleted successfully.');
  } else {
    res.status(404).send('File not found.');
  }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});