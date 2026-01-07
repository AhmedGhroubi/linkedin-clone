const { users, messages } = require('../models/mockData');

// 1. Afficher la page de messagerie (Vue)
exports.getMessagingPage = (req, res) => {
    // On passe l'utilisateur connecté à la vue si besoin (optionnel selon ta vue)
    const currentUser = users.find(u => u.id === req.user.id);
    res.render('messaging', { user: currentUser });
};

// 2. API : Récupérer la liste des conversations (Mes contacts)
exports.getConversationsAPI = (req, res) => {
    const currentUserId = req.user.id;

    // Dans cette version simplifiée, on considère tous les autres utilisateurs comme des contacts
    // (Dans un vrai projet, on ferait une jointure avec la table 'connections')
    const contacts = users.filter(u => u.id !== currentUserId);
    
    res.json(contacts);
};

// 3. API : Récupérer l'historique des messages avec une personne
exports.getMessagesAPI = (req, res) => {
    const currentUserId = req.user.id;
    const otherUserId = parseInt(req.params.userId);

    // On filtre : Je veux les messages où (Moi -> Lui) OU (Lui -> Moi)
    const conversation = messages.filter(m => 
        (m.senderId === currentUserId && m.recipientId === otherUserId) ||
        (m.senderId === otherUserId && m.recipientId === currentUserId)
    );

    // Optionnel : Trier par date (du plus vieux au plus récent pour le chat)
    conversation.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json(conversation);
};

// 4. API : Envoyer un message
exports.sendMessageAPI = (req, res) => {
    const currentUserId = req.user.id;
    const recipientId = parseInt(req.params.userId);
    const { text } = req.body;

    if (!text || text.trim() === "") {
        return res.status(400).json({ success: false, message: "Message vide" });
    }

    const newMessage = {
        id: Date.now(),
        senderId: currentUserId,
        recipientId: recipientId,
        text: text,
        date: new Date()
    };

    // On ajoute le message à notre tableau (fausse BDD)
    messages.push(newMessage);

    res.json({ success: true, message: newMessage });
};