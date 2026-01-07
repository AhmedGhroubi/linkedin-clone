const express = require('express');
const router = express.Router();

// Import du contrôleur
const messagingController = require('../controllers/messagingController');

// --- PAGE HTML ---
// GET http://localhost:3000/messaging
// (Accepte le paramètre ?uid=... géré par le Frontend)
router.get('/messaging', messagingController.getMessagingPage);

// --- API ---

// Récupérer la liste des contacts (colonne de gauche)
// GET http://localhost:3000/api/conversations
router.get('/api/conversations', messagingController.getConversationsAPI);

// Récupérer les messages avec un utilisateur précis
// GET http://localhost:3000/api/messages/2
router.get('/api/messages/:userId', messagingController.getMessagesAPI);

// Envoyer un message à un utilisateur précis
// POST http://localhost:3000/api/messages/2
router.post('/api/messages/:userId', messagingController.sendMessageAPI);

module.exports = router;