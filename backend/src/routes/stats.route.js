const express = require('express');
const router = express.Router();
const statsController = require('../controllers/stats.controller.js');
const { protect, restrictTo } = require('../middlewares/auth.middleware.js');

// Tất cả các API thống kê đều yêu cầu quyền admin/staff
router.use(protect, restrictTo('admin', 'staff'));

router.get('/overview', statsController.getOverviewStats);
router.get('/sales-chart', statsController.getSalesChartData);
router.get('/top-products', statsController.getTopProducts);
router.get('/top-customers', statsController.getTopCustomers);
router.get('/product-sales/:productId', statsController.getProductSalesDetails);
module.exports = router;