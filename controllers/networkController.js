const { users, connections } = require('../models/mockData');

exports.getNetworkPage = (req, res) => {
    res.render('network');
};

exports.getNetworkAPI = (req, res) => {
    const currentId = req.user.id;
    
    const myInvitations = connections
        .filter(c => c.recipientId === currentId && c.status === 'pending')
        .map(c => {
            const user = users.find(u => u.id === c.requesterId);
            return { ...user, connectionId: c.requesterId };
        });

    const myConnections = connections
        .filter(c => c.status === 'accepted' && (c.requesterId === currentId || c.recipientId === currentId))
        .map(c => {
            const friendId = (c.requesterId === currentId) ? c.recipientId : c.requesterId;
            return users.find(u => u.id === friendId);
        });

    const myRelationsIds = connections
        .filter(c => c.requesterId === currentId || c.recipientId === currentId)
        .map(c => (c.requesterId === currentId) ? c.recipientId : c.requesterId);

    const suggestions = users.filter(u => !myRelationsIds.includes(u.id) && u.id !== currentId);

    res.json({ invitations: myInvitations, connections: myConnections, suggestions: suggestions });
};

exports.connectUser = (req, res) => {
    const targetId = parseInt(req.params.userId);
    connections.push({ requesterId: req.user.id, recipientId: targetId, status: 'pending' });
    res.json({ success: true });
};

exports.removeConnection = (req, res) => {
    const targetId = parseInt(req.params.userId);
    const index = connections.findIndex(c => 
        (c.requesterId === req.user.id && c.recipientId === targetId) || 
        (c.requesterId === targetId && c.recipientId === req.user.id)
    );
    if (index !== -1) {
        connections.splice(index, 1);
        res.json({ success: true });
    } else {
        res.status(404).json({ success: false });
    }
};

exports.acceptInvite = (req, res) => {
    const targetId = parseInt(req.params.userId);
    const conn = connections.find(c => c.requesterId === targetId && c.recipientId === req.user.id);
    if(conn) {
        conn.status = 'accepted';
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
};