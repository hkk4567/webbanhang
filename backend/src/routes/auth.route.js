// src/routes/auth.route.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// [POST] /api/auth/login
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/admin/login', authController.loginAdmin);
router.get('/admin/logout', authController.logoutAdmin);
module.exports = router;