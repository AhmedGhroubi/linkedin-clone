const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

// --- CONFIGURATION ---
const PORT = 3000;

// --- MIDDLEWARES GLOBAUX ---
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// Middleware personnalisé (Simulation Auth)
const authMiddleware = require('./middleware/auth');
app.use(authMiddleware); // S'applique à toutes les routes

// --- ROUTES ---
const feedRoutes = require('./routes/feedRoutes');
const networkRoutes = require('./routes/networkRoutes');
const messagingRoutes = require('./routes/messagingRoutes'); // À faire toi-même

app.use('/', feedRoutes);
app.use('/', networkRoutes); 
app.use('/', messagingRoutes);

// --- DÉMARRAGE ---
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});