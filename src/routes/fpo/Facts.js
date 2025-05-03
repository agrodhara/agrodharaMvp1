const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { auth, validation } = require('../../middleware');

// Path to the JSON file
const factsFilePath = path.join(__dirname, './districtfacts.json');

router.get('/', (req, res) => {
  fs.readFile(factsFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error("Error reading facts file:", err);
      return res.status(500).json({ error: 'Failed to load district facts.' });
    }

    try {
      const facts = JSON.parse(data);
      res.json(facts);
    } catch (parseErr) {
      console.error("Error parsing JSON:", parseErr);
      res.status(500).json({ error: 'Failed to parse district facts.' });
    }
  });
});

module.exports = router;
