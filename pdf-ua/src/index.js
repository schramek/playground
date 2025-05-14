const express = require('express');
const multer = require('multer');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Collabora Online configuration
const COLLABORA_URL = process.env.COLLABORA_URL || 'http://localhost:9980';

// Convert endpoint
app.post('/convert', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileName = req.file.originalname;
    const fileExtension = path.extname(fileName).toLowerCase();

    // Check if file is a Word document
    if (!['.doc', '.docx'].includes(fileExtension)) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: 'Only Word documents are supported' });
    }

    // Read the file
    const fileContent = fs.readFileSync(filePath);

    // Prepare the conversion request
    const formData = new FormData();
    formData.append('file', new Blob([fileContent]), fileName);

    // Send to Collabora Online for conversion
    const response = await axios.post(`${COLLABORA_URL}/convert-to/pdf`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Accept': 'application/pdf'
      },
      responseType: 'arraybuffer'
    });

    // Clean up the uploaded file
    fs.unlinkSync(filePath);

    // Send the converted PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName.replace(fileExtension, '.pdf')}`);
    res.send(response.data);

  } catch (error) {
    console.error('Conversion error:', error);
    res.status(500).json({ error: 'Failed to convert document' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 