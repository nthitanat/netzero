const express = require('express');
const SystemController = require('../controllers/SystemController');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

router.get('/health', asyncHandler(SystemController.getHealth));
router.get('/', asyncHandler(SystemController.getApiInfo));
router.get('/db-test', asyncHandler(SystemController.checkDatabase));

module.exports = router;
