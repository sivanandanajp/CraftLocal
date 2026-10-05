const express = require('express');
const router = express.Router();

// Temporary route to prevent app.use crash
router.get('/', (req, res) => res.json({ message: 'Cart endpoint working' }));

module.exports = router;