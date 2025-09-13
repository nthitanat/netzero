/**
 * Connection Routes
 * Routes for testing connectivity and system status
 */

const express = require('express');
const ConnectionController = require('../controllers/ConnectionController');

const router = express.Router();

/**
 * @route   GET /api/v1/connection/test
 * @desc    Test basic connection from remote
 * @access  Public
 */
router.get('/test', ConnectionController.testConnection);

/**
 * @route   GET /api/v1/connection/ping
 * @desc    Simple ping endpoint
 * @access  Public
 */
router.get('/ping', ConnectionController.ping);

/**
 * @route   GET /api/v1/connection/database
 * @desc    Test database connectivity
 * @access  Public
 */
router.get('/database', ConnectionController.testDatabaseConnection);

/**
 * @route   GET /api/v1/connection/status
 * @desc    Comprehensive system status
 * @access  Public
 */
router.get('/status', ConnectionController.getSystemStatus);

/**
 * @route   GET|POST /api/v1/connection/echo
 * @desc    Echo request details
 * @access  Public
 */
router.all('/echo', ConnectionController.echo);

module.exports = router;
