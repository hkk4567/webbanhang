// src/routes/config.route.js (Tạo file mới)

const express = require('express');
const configController = require('../controllers/config.controller');

const router = express.Router();

// GET /api/config/client
router.get('/client', configController.getClientConfig);

module.exports = router;