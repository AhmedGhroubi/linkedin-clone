const express = require('express');
const router = express.Router();

// Import du contrôleur qu'on vient de créer
const feedController = require('../controllers/feedController');

const upload = require('../config/multer');

// --- PAGE D'ACCUEIL ---
// GET http://localhost:3000/
router.get('/', feedController.getFeedPage);

// --- API (Pour le JavaScript / AJAX) ---

// Récupérer la liste des posts
// GET http://localhost:3000/api/posts
router.get('/api/posts', feedController.getPostsAPI);

// Créer un post
// POST http://localhost:3000/api/post
router.post('/api/post', upload.single('imageFile'), feedController.createPostAPI);
// Liker un post (l'ID est dans l'URL)
// POST http://localhost:3000/api/post/like/12345
router.post('/api/post/like/:id', feedController.likePostAPI);

// Commenter un post
// POST http://localhost:3000/api/post/comment/12345
router.post('/api/post/comment/:id', feedController.addCommentAPI);

module.exports = router;