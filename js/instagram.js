// Fefelina Catsitter - Posts recentes do Instagram (dados sincronizados via GitHub Actions + API do Instagram)

const INSTAGRAM_PROFILE_URL = 'https://www.instagram.com/fefelinacatsitter';
const CAPTION_MAX_LENGTH = 90;

document.addEventListener('DOMContentLoaded', function () {
    const gridContainer = document.getElementById('instagram-posts-grid');
    const fallbackMessage = document.getElementById('instagram-fallback');

    if (!gridContainer) {
        return;
    }

    fetch('data/instagram.json', { cache: 'no-store' })
        .then(function (response) {
            if (!response.ok) {
                throw new Error('Não foi possível carregar os posts do Instagram.');
            }
            return response.json();
        })
        .then(function (data) {
            renderPosts(data.posts);
        })
        .catch(function (error) {
            console.warn('Posts do Instagram indisponíveis:', error);
            showFallback();
        });

    function renderPosts(posts) {
        gridContainer.innerHTML = '';

        if (!Array.isArray(posts) || posts.length === 0) {
            showFallback();
            return;
        }

        posts.forEach(function (post) {
            gridContainer.appendChild(buildPostCard(post));
        });
    }

    function buildPostCard(post) {
        const card = document.createElement('article');
        card.className = 'instagram-post';

        const link = document.createElement('a');
        link.className = 'instagram-post-link';
        link.href = post.permalink || INSTAGRAM_PROFILE_URL;
        link.target = '_blank';
        link.rel = 'noopener';

        const imageWrapper = document.createElement('div');
        imageWrapper.className = 'instagram-post-image';

        const image = document.createElement('img');
        image.src = post.image || 'images/InstagramLogo.png';
        image.alt = post.caption ? truncateCaption(post.caption) : 'Post do Instagram da Fefelina Cat Sitter';
        image.loading = 'lazy';
        imageWrapper.appendChild(image);

        const overlay = document.createElement('div');
        overlay.className = 'instagram-overlay';
        const overlayText = document.createElement('span');
        overlayText.className = 'instagram-view-text';
        overlayText.textContent = 'Ver no Instagram';
        overlay.appendChild(overlayText);
        imageWrapper.appendChild(overlay);

        link.appendChild(imageWrapper);

        if (post.caption) {
            const captionWrapper = document.createElement('div');
            captionWrapper.className = 'instagram-post-caption';
            const captionText = document.createElement('p');
            captionText.textContent = truncateCaption(post.caption);
            captionWrapper.appendChild(captionText);
            link.appendChild(captionWrapper);
        }

        card.appendChild(link);
        return card;
    }

    function truncateCaption(caption) {
        const singleLine = caption.replace(/\s+/g, ' ').trim();
        if (singleLine.length <= CAPTION_MAX_LENGTH) {
            return singleLine;
        }
        return `${singleLine.slice(0, CAPTION_MAX_LENGTH).trim()}…`;
    }

    function showFallback() {
        gridContainer.innerHTML = '';
        if (fallbackMessage) {
            fallbackMessage.hidden = false;
        }
    }
});
