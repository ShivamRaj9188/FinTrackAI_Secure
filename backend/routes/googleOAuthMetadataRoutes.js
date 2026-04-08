const express = require('express');
const { getGoogleOAuthUrl } = require('../controllers/googleOAuthController');

const router = express.Router();

router.get('/google/url', getGoogleOAuthUrl);

module.exports = router;
