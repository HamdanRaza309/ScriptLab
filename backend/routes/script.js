const express = require('express');
const router = express.Router();
const { generateScript } = require('../controllers/scriptGenerationController');

router.post('/generate-script', generateScript);

module.exports = router;
