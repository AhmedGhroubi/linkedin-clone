const CURRENT_USER_ID = 1;

$(document).ready(function() {
    
    // 1. Charger les posts et suggestions
    loadFeed();
    loadSidebarSuggestions();
    
    // 2. Bouton Publier du modal
    $('#submitPostBtn').click(function() {
        $('#postForm').submit();
    });

    // 3. Soumission du formulaire (Création de post AVEC FICHIER)
    $('#postForm').on('submit', function(e) {
        e.preventDefault();
        
        // --- CHANGEMENT MAJEUR ICI ---
        // On crée un objet FormData qui contient automatiquement
        // tous les champs du formulaire (texte ET fichier binaire)
        var formData = new FormData(this);

        $.ajax({
            url: '/api/post',
            type: 'POST',
            // On envoie le FormData directement
            data: formData,
            
            // --- LIGNES CRUCIALES POUR L'UPLOAD DE FICHIER ---
            // Dit à jQuery de ne pas transformer les données en chaîne de caractères
            processData: false, 
            // Dit à jQuery de ne pas définir de Content-Type (le navigateur le fera tout seul pour le multipart)
            contentType: false, 
            
            success: function(response) {
                if(response.success) {
                    $('#postModal').modal('hide');
                    $('#postForm')[0].reset();
                    
                    response.post.authorName = "Ahmed Développeur"; 
                    renderPost(response.post, true); 
                }
            },
            error: function(err) {
                console.log(err);
                // Affiche le message d'erreur s'il y en a un (ex: "Seules les images sont autorisées")
                let msg = err.responseJSON && err.responseJSON.message ? err.responseJSON.message : "Erreur lors de la publication";
                alert(msg);
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
            $('#loadingSpinner').hide(); 
            $('#feedContainer').empty();
            posts.forEach(function(post) {
                renderPost(post, false); 
            });
        },
        error: function() {
            $('#loadingSpinner').hide();
            $('#feedContainer').html('<p class="text-center text-danger">Erreur de chargement.</p>');
        }
    });
}

function renderPost(post, isNew) {
    // 1. Gestion propre du TEXTE pour éviter "undefined"
    let rawContent = post.content || post.text;
    // Si vide ou undefined, on met une chaîne vide
    let contentDisplay = rawContent ? rawContent : "";

    // 2. Gestion de la DATE
    let dateStr = "À l'instant";
    if(post.date) {
        dateStr = new Date(post.date).toLocaleDateString() + ' ' + new Date(post.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }

    // 3. Gestion de l'IMAGE (supporte post.image ou post.media)
    let imageSrc = post.image || post.media;
    let imageHtml = imageSrc ? `<img src="${imageSrc}" class="img-fluid rounded mb-3 w-100">` : '';

    // 4. Auteur
    let authorName = post.authorName || post.author || "Utilisateur";
    let authorAvatar = post.authorAvatar || "https://via.placeholder.com/40";
    
    // 5. Likes
    let likesCount = post.likes || 0; 
    let iconClass = "far fa-thumbs-up"; 
    let likeBtnClass = "text-muted";

    // 6. Commentaires HTML
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
                <img src="${authorAvatar}" class="rounded-circle me-2" width="40" height="40">
                <div>
                    <h6 class="fw-bold mb-0">${authorName}</h6>
                    <small class="text-muted">${dateStr}</small>
                </div>
            </div>
            
            <p class="card-text">${contentDisplay}</p>
            
            ${imageHtml}
            
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

// ... (Le reste des fonctions toggleLike, submitComment, etc. reste inchangé) ...
function toggleLike(id) {
    $.ajax({
        url: '/api/post/like/' + id,
        type: 'POST',
        success: function(response) {
            if(response.success) {
                $(`#likes-count-${id}`).text(`(${response.likes})`);
                let btn = $(`#like-btn-${id}`);
                let icon = $(`#like-icon-${id}`);
                if(btn.hasClass('text-muted')) {
                      btn.removeClass('text-muted').addClass('text-primary fw-bold');
                      icon.removeClass('far').addClass('fas');
                } else {
                      btn.removeClass('text-primary fw-bold').addClass('text-muted');
                      icon.removeClass('fas').addClass('far');
                }
            }
        },
        error: function(err) { console.error("Erreur like", err); }
    });
}

function toggleCommentsSection(postId) {
    $(`#comments-section-${postId}`).slideToggle();
    $(`#comment-input-${postId}`).focus();
}

function generateCommentHtml(comment) {
    return `
        <div class="d-flex mb-2">
            <img src="${comment.avatar || 'https://via.placeholder.com/30'}" class="rounded-circle me-2 mt-1" width="30" height="30">
            <div class="bg-white p-2 rounded w-100 shadow-sm">
                <h6 class="fw-bold mb-0 small">${comment.author}</h6>
                <p class="mb-0 small text-dark">${comment.text}</p>
            </div>
        </div>
    `;
}

function submitComment(postId) {
    let inputField = $(`#comment-input-${postId}`);
    let text = inputField.val();
    if (text.trim() === "") return;

    $.ajax({
        url: `/api/post/comment/${postId}`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ text: text }),
        success: function(response) {
            if(response.success) {
                let newCommentHtml = generateCommentHtml(response.comment);
                $(`#comments-list-${postId}`).append(newCommentHtml);
                inputField.val('');
            }
        },
        error: function(err) { console.error(err); alert("Erreur commentaire"); }
    });
}

function loadSidebarSuggestions() {
    $.ajax({
        url: '/api/network',
        type: 'GET',
        success: function(data) {
            const container = $('#sidebar-suggestions');
            container.empty();
            const suggestions = data.suggestions ? data.suggestions.slice(0, 3) : [];
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
                                style="font-size: 12px;" onclick="quickConnect(this, ${user.id})">
                            <i class="fas fa-plus"></i> Suivre
                        </button>
                    </div>
                </div>`;
                container.append(html);
            });
        }
    });
}

function quickConnect(btn, userId) {
    $.ajax({
        url: `/api/network/connect/${userId}`,
        type: 'POST',
        success: function(res) {
            if(res.success) {
                $(btn).removeClass('btn-outline-secondary')
                      .addClass('btn-success text-white border-0')
                      .html('<i class="fas fa-check"></i>')
                      .prop('disabled', true);
            }
        }
    });
}