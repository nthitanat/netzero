const express = require('express');
const ConnectionController = require('../controllers/ConnectionController');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

router.get('/test', asyncHandler(ConnectionController.testConnection));
router.get('/ping', asyncHandler(ConnectionController.ping));
router.get('/database', asyncHandler(ConnectionController.testDatabaseConnection));
router.get('/status', asyncHandler(ConnectionController.getSystemStatus));
router.all('/echo', asyncHandler(ConnectionController.echo));

module.exports = router;
