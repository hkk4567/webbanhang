// src/routes/auth.route.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// [POST] /api/auth/login
router.post('/login', authController.login);

console.log('--- Trong auth.route.js, sắp export router có kiểu là:', typeof router);
module.exports = router;