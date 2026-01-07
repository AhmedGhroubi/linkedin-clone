const express = require('express');
const router = express.Router();
const networkController = require('../controllers/networkController');

// Pages
router.get('/network', networkController.getNetworkPage);

// API
router.get('/api/network', networkController.getNetworkAPI);
router.post('/api/network/connect/:userId', networkController.connectUser);
router.post('/api/network/accept/:userId', networkController.acceptInvite);
router.delete('/api/network/:userId', networkController.removeConnection);

module.exports = router;