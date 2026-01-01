const express = require('express');
const app = express();
const path = require('path');
const multer = require('multer');

// Configuration EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuration Multer (Upload images)
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage: storage });

// --- DONNÉES SIMULÉES (En mémoire) ---
// On met quelques faux posts pour tester l'affichage au démarrage
const CURRENT_USER_ID = 1; // Simulé pour les likes
let posts = [
    {
        id: 1,
        author: "Sarah Designer",
        text: "Je viens de finir mon portfolio ! Qu'en pensez-vous ?",
        media: null,
        date: new Date(),
        likes: 5,
        comments: [],
        likedBy: [2, 3]
    },
    {
        id: 2,
        author: "Marc Lead Dev",
        text: "Node.js est vraiment puissant pour le temps réel.",
        media: null,
        date: new Date(),
        likes: 12,
        comments: [],
        likedBy: [1, 3]
    }
];

const users = [
    { id: 2, name: "Sophie RH", job: "Recruteuse Tech", avatar: "https://i.pravatar.cc/150?u=2" },
    { id: 3, name: "Lucas Frontend", job: "Développeur React", avatar: "https://i.pravatar.cc/150?u=3" },
    { id: 4, name: "Emma Data", job: "Data Scientist", avatar: "https://i.pravatar.cc/150?u=4" },
    { id: 5, name: "Paul Manager", job: "CTO", avatar: "https://i.pravatar.cc/150?u=5" }
];

// Liste des connexions (Relations)
// Status possibles: 'pending' (en attente), 'accepted' (amis)
let connections = [
    // Exemple : L'utilisateur 2 (Sophie) a invité l'utilisateur 1 (Toi)
    { requesterId: 2, recipientId: 1, status: 'pending' } 
];


let messages = [
    { id: 1, senderId: 2, recipientId: 1, text: "Salut ! Tu as vu mon dernier post ?", date: new Date() },
    { id: 2, senderId: 1, recipientId: 2, text: "Oui, super intéressant !", date: new Date() }
];

// --- ROUTES VUES (EJS) ---
app.get('/', (req, res) => {
    res.render('index'); 
});

// --- API REST ---

// 1. GET : Récupérer tous les posts (Pour le Feed)
app.get('/api/posts', (req, res) => {
    res.json(posts); 
});

// 2. POST : Créer un nouveau post
app.post('/api/posts', upload.single('media'), (req, res) => {
    const { text, author } = req.body;
    const newPost = {
        id: posts.length + 1,
        author: author || "Moi", 
        text: text,
        media: req.file ? `/uploads/${req.file.filename}` : null,
        date: new Date(),
        likes: 0,
        comments: [],
        likedBy: []
    };
    posts.unshift(newPost); // Ajoute au début
    res.json({ success: true, post: newPost });
});

// 3.TOGGLE LIKE (J'aime / Je n'aime plus) ---
app.post('/api/posts/:id/like', (req, res) => {
    const postId = parseInt(req.params.id);
    const post = posts.find(p => p.id === postId);

    if (post) {
        // Vérifie si l'utilisateur a déjà liké
        const index = post.likedBy.indexOf(CURRENT_USER_ID);

        if (index === -1) {
            // Il n'a pas liké -> On ajoute le like
            post.likedBy.push(CURRENT_USER_ID);
            var action = 'liked';
        } else {
            // Il a déjà liké -> On retire le like (Unlike)
            post.likedBy.splice(index, 1);
            var action = 'unliked';
        }

        // On renvoie le nouveau nombre de likes et l'état actuel
        res.json({ 
            success: true, 
            likesCount: post.likedBy.length, 
            action: action 
        });
    } else {
        res.status(404).json({ success: false, message: "Post introuvable" });
    }
});


// 4.--- ROUTE : AJOUTER UN COMMENTAIRE ---
app.post('/api/posts/:id/comment', (req, res) => {
    const postId = parseInt(req.params.id);
    const { text } = req.body; // On reçoit le texte du commentaire

    const post = posts.find(p => p.id === postId);

    if (post) {
        // Création du commentaire
        const newComment = {
            id: Date.now(), // ID unique basé sur le temps
            author: "Ahmed Développeur", // Simulé (plus tard via session)
            text: text,
            date: new Date()
        };

        // Si le tableau comments n'existe pas (anciens posts), on le crée
        if (!post.comments) {
            post.comments = [];
        }

        post.comments.push(newComment);

        // On renvoie le commentaire créé pour l'afficher tout de suite
        res.json({ success: true, comment: newComment });
    } else {
        res.status(404).json({ success: false, message: "Post introuvable" });
    }
});

// --- ROUTES POUR LE RÉSEAU ---

// 1. Afficher la page Réseau
app.get('/network', (req, res) => {
    res.render('network'); // On va créer ce fichier juste après
});

// 2. API : Récupérer les données du réseau
app.get('/api/network', (req, res) => {
    
    // A. Mes invitations reçues (pending)
    const myInvitations = connections
        .filter(c => c.recipientId === CURRENT_USER_ID && c.status === 'pending')
        .map(c => {
            const user = users.find(u => u.id === c.requesterId);
            return { ...user, connectionId: c.requesterId };
        });

    // B. Mes relations acceptées (accepted) -> NOUVEAU !
    const myConnections = connections
        .filter(c => c.status === 'accepted' && (c.requesterId === CURRENT_USER_ID || c.recipientId === CURRENT_USER_ID))
        .map(c => {
            // On cherche l'ID de l'autre personne (soit l'envoyeur, soit le receveur)
            const friendId = (c.requesterId === CURRENT_USER_ID) ? c.recipientId : c.requesterId;
            return users.find(u => u.id === friendId);
        });

    // C. Suggestions (Ni pending, ni accepted)
    // On récupère tous les IDs avec qui j'ai une relation (peu importe le statut)
    const myRelationsIds = connections
        .filter(c => c.requesterId === CURRENT_USER_ID || c.recipientId === CURRENT_USER_ID)
        .map(c => (c.requesterId === CURRENT_USER_ID) ? c.recipientId : c.requesterId);

    const suggestions = users.filter(u => !myRelationsIds.includes(u.id) && u.id !== CURRENT_USER_ID);

    // On renvoie les 3 listes
    res.json({ 
        invitations: myInvitations, 
        connections: myConnections, 
        suggestions: suggestions 
    });
});

// 3. API : Accepter une invitation
app.post('/api/network/accept/:userId', (req, res) => {
    const targetId = parseInt(req.params.userId);
    // Trouver la demande
    const conn = connections.find(c => c.requesterId === targetId && c.recipientId === CURRENT_USER_ID);
    
    if (conn) {
        conn.status = 'accepted';
        res.json({ success: true });
    } else {
        res.status(404).json({ success: false });
    }
});

// 4. API : Envoyer une invitation (Connecter)
app.post('/api/network/connect/:userId', (req, res) => {
    const targetId = parseInt(req.params.userId);
    
    // Créer la nouvelle connexion
    connections.push({
        requesterId: CURRENT_USER_ID,
        recipientId: targetId,
        status: 'pending' // En attente
    });

    res.json({ success: true });
});
// 5. API : Supprimer une connexion (Ignorer OU Annuler)
app.delete('/api/network/:userId', (req, res) => {
    const targetId = parseInt(req.params.userId);

    // On cherche l'index de la connexion dans le tableau (dans les deux sens)
    const index = connections.findIndex(c => 
        (c.requesterId === CURRENT_USER_ID && c.recipientId === targetId) || // J'ai envoyé
        (c.requesterId === targetId && c.recipientId === CURRENT_USER_ID)    // J'ai reçu
    );

    if (index !== -1) {
        connections.splice(index, 1); // On supprime l'élément du tableau
        res.json({ success: true });
    } else {
        res.status(404).json({ success: false, message: "Connexion introuvable" });
    }
});

// --- ROUTES MESSAGERIE ---

// 1. Page de messagerie
app.get('/messaging', (req, res) => {
    res.render('messaging');
});

// 2. API : Récupérer la liste des conversations (Mes amis)
app.get('/api/conversations', (req, res) => {
    // Dans un vrai cas, on ferait une jointure SQL.
    // Ici, on renvoie simplement tous les utilisateurs sauf moi pour simplifier la démo.
    const contacts = users.filter(u => u.id !== CURRENT_USER_ID);
    res.json(contacts);
});

// 3. API : Récupérer les messages avec un utilisateur spécifique
app.get('/api/messages/:userId', (req, res) => {
    const otherUserId = parseInt(req.params.userId);

    // On filtre les messages échangés entre MOI et L'AUTRE
    const conversation = messages.filter(m => 
        (m.senderId === CURRENT_USER_ID && m.recipientId === otherUserId) ||
        (m.senderId === otherUserId && m.recipientId === CURRENT_USER_ID)
    );

    res.json(conversation);
});

// 4. API : Envoyer un message
app.post('/api/messages/:userId', (req, res) => {
    const recipientId = parseInt(req.params.userId);
    const { text } = req.body;

    const newMessage = {
        id: Date.now(),
        senderId: CURRENT_USER_ID,
        recipientId: recipientId,
        text: text,
        date: new Date()
    };

    messages.push(newMessage);
    res.json({ success: true, message: newMessage });
});

app.listen(3000, () => {
    console.log('Serveur lancé sur http://localhost:3000');
});