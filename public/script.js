const CURRENT_USER_ID = 1;

$(document).ready(function() {
    
    // 1. Charger les posts au démarrage
    loadFeed();
    loadSidebarSuggestions();
    

    // 2. Gestion du bouton Publier dans le Modal
    $('#submitPostBtn').click(function() {
        $('#postForm').submit();
    });

    // 3. Soumission du formulaire (Création)
    $('#postForm').on('submit', function(e) {
        e.preventDefault();
        var formData = new FormData(this);
        formData.append('author', 'Ahmed Développeur'); // Simulé

        $.ajax({
            url: '/api/posts',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                if(response.success) {
                    // Fermer le modal
                    $('#postModal').modal('hide');
                    $('#postForm')[0].reset();
                    
                    // Ajouter le nouveau post en haut de la liste
                    renderPost(response.post, true); 
                }
            }
        });
    });

});

// --- FONCTIONS ---

function loadFeed() {
    $.ajax({
        url: '/api/posts',
        type: 'GET',
        success: function(posts) {
            $('#loadingSpinner').hide(); // Cacher le chargement
            $('#feedContainer').empty(); // Vider le conteneur par sécurité
            
            // Boucle sur chaque post reçu
            posts.forEach(function(post) {
                renderPost(post, false); // false = ajouter à la fin (append)
            });
        },
        error: function() {
            alert("Erreur lors du chargement du fil d'actualité.");
        }
    });
}

// Fonction utilitaire pour générer le HTML d'un post
function renderPost(post, isNew) {
    // Formater la date
    let dateStr = new Date(post.date).toLocaleDateString() + ' à ' + new Date(post.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

    let html = `
    <div class="card shadow-sm" id="post-${post.id}">
        <div class="card-body">
            <div class="d-flex mb-3">
                <img src="https://via.placeholder.com/40" class="rounded-circle me-2" width="40" height="40">
                <div>
                    <h6 class="fw-bold mb-0">${post.author}</h6>
                    <small class="text-muted">${dateStr}</small>
                </div>
            </div>
            
            <p class="card-text">${post.text}</p>
            
            ${post.media ? `<img src="${post.media}" class="img-fluid rounded mb-3 w-100" style="max-height: 400px; object-fit: cover;">` : ''}
            
            <div class="d-flex justify-content-between border-top pt-2">
                <button class="btn btn-reaction w-100" onclick="likePost(${post.id})">
                    <i class="far fa-thumbs-up"></i> J'aime <span id="likes-count-${post.id}">(${post.likes})</span>
                </button>
                <button class="btn btn-reaction w-100">
                    <i class="far fa-comment-dots"></i> Commenter
                </button>
                <button class="btn btn-reaction w-100">
                    <i class="fas fa-share"></i> Partager
                </button>
            </div>
        </div>
    </div>
    `;

    if (isNew) {
        $('#feedContainer').prepend(html).hide().fadeIn(); // Animation
    } else {
        $('#feedContainer').append(html);
    }
}

function renderPost(post, isNew) {
    let dateStr = new Date(post.date).toLocaleDateString();
    let likesCount = post.likedBy ? post.likedBy.length : 0;
    let isLikedByMe = post.likedBy && post.likedBy.includes(CURRENT_USER_ID);
    
    let likeBtnClass = isLikedByMe ? "text-primary fw-bold" : "text-muted";
    let iconClass = isLikedByMe ? "fas fa-thumbs-up" : "far fa-thumbs-up";

    // Préparer le HTML des commentaires existants
    let commentsHtml = '';
    if (post.comments && post.comments.length > 0) {
        post.comments.forEach(comment => {
            commentsHtml += generateCommentHtml(comment);
        });
    }

    let html = `
    <div class="card shadow-sm mb-3" id="post-${post.id}">
        <div class="card-body">
            <div class="d-flex mb-3">
                <img src="https://via.placeholder.com/40" class="rounded-circle me-2" width="40" height="40">
                <div>
                    <h6 class="fw-bold mb-0">${post.author}</h6>
                    <small class="text-muted">${dateStr}</small>
                </div>
            </div>
            
            <p class="card-text">${post.text}</p>
            ${post.media ? `<img src="${post.media}" class="img-fluid rounded mb-3 w-100">` : ''}
            
            <div class="d-flex justify-content-between border-top pt-2">
                <button class="btn btn-reaction w-100 ${likeBtnClass}" id="like-btn-${post.id}" onclick="toggleLike(${post.id})">
                    <i class="${iconClass}" id="like-icon-${post.id}"></i> J'aime <span id="likes-count-${post.id}">(${likesCount})</span>
                </button>
                <button class="btn btn-reaction w-100 text-muted" onclick="toggleCommentsSection(${post.id})">
                    <i class="far fa-comment-dots"></i> Commenter
                </button>
            </div>

            <div id="comments-section-${post.id}" class="mt-3" style="display: none; background-color: #f9f9f9; padding: 10px; border-radius: 8px;">
                
                <div id="comments-list-${post.id}" class="mb-2">
                    ${commentsHtml}
                </div>

                <div class="d-flex align-items-center">
                    <img src="https://via.placeholder.com/30" class="rounded-circle me-2" width="30">
                    <input type="text" id="comment-input-${post.id}" class="form-control rounded-pill" placeholder="Ajouter un commentaire...">
                    <button class="btn btn-primary btn-sm rounded-pill ms-2" onclick="submitComment(${post.id})">Envoyer</button>
                </div>
            </div>
        </div>
    </div>
    `;

    if (isNew) {
        $('#feedContainer').prepend(html).hide().fadeIn();
    } else {
        $('#feedContainer').append(html);
    }
}

// Fonction AJAX pour le Like
function toggleLike(id) {
    $.ajax({
        url: '/api/posts/' + id + '/like',
        type: 'POST',
        success: function(response) {
            if(response.success) {
                // 1. Mettre à jour le compteur
                $(`#likes-count-${id}`).text(`(${response.likesCount})`);

                // 2. Changer la couleur du bouton et l'icône
                let btn = $(`#like-btn-${id}`);
                let icon = $(`#like-icon-${id}`);

                if (response.action === 'liked') {
                    btn.removeClass('text-muted').addClass('text-primary fw-bold');
                    icon.removeClass('far').addClass('fas'); // Icône pleine
                } else {
                    btn.removeClass('text-primary fw-bold').addClass('text-muted');
                    icon.removeClass('fas').addClass('far'); // Icône vide
                }
            }
        },
        error: function(err) {
            console.error("Erreur like", err);
        }
    });
}

// 1. Afficher / Masquer la zone de commentaires
function toggleCommentsSection(postId) {
    $(`#comments-section-${postId}`).slideToggle(); // Animation jQuery fluide
    $(`#comment-input-${postId}`).focus(); // Met le curseur dans le champ
}

// 2. Générer le HTML d'un seul commentaire (pour éviter la répétition)
function generateCommentHtml(comment) {
    return `
        <div class="d-flex mb-2">
            <img src="https://via.placeholder.com/30" class="rounded-circle me-2 mt-1" width="30" height="30">
            <div class="bg-white p-2 rounded w-100 shadow-sm">
                <h6 class="fw-bold mb-0 small">${comment.author}</h6>
                <p class="mb-0 small text-dark">${comment.text}</p>
            </div>
        </div>
    `;
}

// 3. Envoyer le commentaire via AJAX
function submitComment(postId) {
    let inputField = $(`#comment-input-${postId}`);
    let text = inputField.val();

    if (text.trim() === "") return; // Ne rien faire si vide

    $.ajax({
        url: `/api/posts/${postId}/comment`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ text: text }), // Envoi en JSON
        success: function(response) {
            if(response.success) {
                // Créer le HTML du nouveau commentaire
                let newCommentHtml = generateCommentHtml(response.comment);
                
                // L'ajouter à la liste avec une petite animation
                $(`#comments-list-${postId}`).append(newCommentHtml);
                
                // Vider le champ de saisie
                inputField.val('');
            }
        },
        error: function(err) {
            console.error(err);
            alert("Erreur lors de l'envoi du commentaire");
        }
    });
}

function loadSidebarSuggestions() {
    $.ajax({
        url: '/api/network',
        type: 'GET',
        success: function(data) {
            const container = $('#sidebar-suggestions');
            container.empty();

            // On prend seulement les 3 premiers (slice)
            const suggestions = data.suggestions.slice(0, 3);

            if (suggestions.length === 0) {
                container.html('<p class="text-muted small text-center p-3">Aucune suggestion.</p>');
                return;
            }

            suggestions.forEach(user => {
                const html = `
                <div class="d-flex align-items-start p-3 border-bottom position-relative">
                    <img src="${user.avatar}" class="rounded-circle me-2" width="40" height="40">
                    <div class="overflow-hidden">
                        <h6 class="fw-bold mb-0 small text-truncate">${user.name}</h6>
                        <p class="text-muted small mb-2 text-truncate" style="font-size: 11px;">${user.job}</p>
                        
                        <button class="btn btn-outline-secondary btn-sm rounded-pill py-0 px-2" 
                                style="font-size: 12px;"
                                onclick="quickConnect(this, ${user.id})">
                            <i class="fas fa-plus"></i> Suivre
                        </button>
                    </div>
                </div>
                `;
                container.append(html);
            });
        }
    });
}

// Fonction pour connecter depuis la sidebar (Similaire à celle du réseau)
function quickConnect(btn, userId) {
    $.ajax({
        url: `/api/network/connect/${userId}`,
        type: 'POST',
        success: function(res) {
            if(res.success) {
                // Change le bouton en "Check" vert
                $(btn).removeClass('btn-outline-secondary')
                      .addClass('btn-success text-white border-0')
                      .html('<i class="fas fa-check"></i>')
                      .prop('disabled', true);
            }
        }
    });
}