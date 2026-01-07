// On importe nos "fausses" données partagées
const { posts, users } = require('../models/mockData');

// 1. Afficher la page d'accueil (Vue)
exports.getFeedPage = (req, res) => {
    // On récupère l'utilisateur connecté via le middleware (req.user.id)
    const currentUser = users.find(u => u.id === req.user.id);
    
    // On rend la vue 'index.ejs' en lui passant les infos de l'utilisateur
    res.render('index', { user: currentUser });
};

// 2. API : Récupérer tous les posts (JSON)
exports.getPostsAPI = (req, res) => {
    // On "enrichit" les posts : on remplace le simple userId par les infos complètes de l'auteur
    const enrichedPosts = posts.map(post => {
        const author = users.find(u => u.id === post.userId);
        return { 
            ...post, 
            authorName: author.name, 
            authorAvatar: author.avatar, 
            authorJob: author.job 
        };
    });

    // Tri : du plus récent au plus ancien
    enrichedPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(enrichedPosts);
};

// 3. API : Créer un nouveau post
exports.createPostAPI = (req, res) => {
    // Si Multer a bloqué le fichier (ex: trop gros), il renvoie une erreur
    if (req.fileValidationError) {
        return res.status(400).json({ success: false, message: req.fileValidationError });
    }

    const { content } = req.body;
    let imageUrl = "";

    // --- MAGIE DE MULTER ICI ---
    // Si un fichier a été uploadé avec succès, il est dans req.file
    if (req.file) {
        // On construit le chemin d'accès public pour le navigateur
        // ex: /uploads/167888888-monimage.jpg
        imageUrl = '/uploads/' + req.file.filename;
    }

    const newPost = {
        id: Date.now(),
        userId: req.user.id,
        content: content,
        image: imageUrl, // On utilise le chemin généré
        likes: 0,
        comments: [],
        date: new Date()
    };

    posts.push(newPost);
    res.json({ success: true, post: newPost });
};
// 4. API : Liker un post
exports.likePostAPI = (req, res) => {
    const postId = parseInt(req.params.id);
    const post = posts.find(p => p.id === postId);

    if (post) {
        post.likes += 1; // Incrémente le compteur
        res.json({ success: true, likes: post.likes });
    } else {
        res.status(404).json({ success: false, message: "Post introuvable" });
    }
};

// 5. API : Ajouter un commentaire
exports.addCommentAPI = (req, res) => {
    const postId = parseInt(req.params.id);
    const { text } = req.body;
    const currentUser = users.find(u => u.id === req.user.id);

    const post = posts.find(p => p.id === postId);

    if (post) {
        const newComment = {
            author: currentUser.name,
            avatar: currentUser.avatar,
            text: text,
            date: new Date()
        };
        
        post.comments.push(newComment);
        res.json({ success: true, comment: newComment });
    } else {
        res.status(404).json({ success: false });
    }
};