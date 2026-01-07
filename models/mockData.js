const users = [
    { id: 1, name: "Moi", job: "Étudiant Fullstack", avatar: "https://via.placeholder.com/150" },
    { id: 2, name: "Sophie RH", job: "Recruteuse Tech", avatar: "https://via.placeholder.com/150" },
    { id: 3, name: "Lucas Dev", job: "Frontend Senior", avatar: "https://via.placeholder.com/150" },
    { id: 4, name: "Emma Data", job: "Data Scientist", avatar: "https://via.placeholder.com/150" },
    { id: 5, name: "Paul CTO", job: "Directeur Technique", avatar: "https://via.placeholder.com/150" }
];

const posts = [
    { id: 1, userId: 2, content: "Nous recrutons des développeurs !", image: "", likes: 10, comments: [], date: new Date() },
    { id: 2, userId: 3, content: "Le CSS c'est la vie.", image: "https://via.placeholder.com/600x300", likes: 5, comments: [], date: new Date() }
];

const connections = [
    { requesterId: 2, recipientId: 1, status: 'pending' }, 
    { requesterId: 3, recipientId: 1, status: 'accepted' } 
];

const messages = [
    { id: 1, senderId: 2, recipientId: 1, text: "Salut ! Tu as vu mon dernier post ?", date: new Date() },
    { id: 2, senderId: 1, recipientId: 2, text: "Oui, super intéressant !", date: new Date() }
];

module.exports = { users, posts, connections, messages };