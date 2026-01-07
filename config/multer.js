// config/multer.js
const multer = require('multer');
const path = require('path');

// Configuration du stockage
const storage = multer.diskStorage({
    // Où stocker le fichier ?
    destination: function (req, file, cb) {
        // Le chemin doit être relatif à la racine du projet
        cb(null, 'public/uploads/'); 
    },
    // Quel nom lui donner ?
    filename: function (req, file, cb) {
        // On génère un nom unique : timestamp + nom original
        // ex: 167888888-monimage.jpg
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// Initialisation de l'upload avec des filtres (optionnel mais conseillé)
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limite à 5MB par exemple
    fileFilter: function (req, file, cb) {
        // Accepter uniquement les images
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
             return cb(new Error('Seules les images sont autorisées !'), false);
        }
        cb(null, true);
    }
});

module.exports = upload;