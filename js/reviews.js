// Fefelina Catsitter - Avaliações do Google (dados sincronizados via GitHub Actions + SerpApi)

document.addEventListener('DOMContentLoaded', function () {
    const summaryContainer = document.getElementById('google-reviews-summary');
    const gridContainer = document.getElementById('google-reviews-grid');
    const fallbackMessage = document.getElementById('google-reviews-fallback');
    const prevButton = document.querySelector('.reviews-nav-prev');
    const nextButton = document.querySelector('.reviews-nav-next');

    if (!gridContainer) {
        return;
    }

    if (prevButton) {
        prevButton.addEventListener('click', function () {
            scrollByCard(-1);
        });
    }
    if (nextButton) {
        nextButton.addEventListener('click', function () {
            scrollByCard(1);
        });
    }
    if (gridContainer) {
        gridContainer.addEventListener('scroll', updateNavState);
    }

    fetch('data/reviews.json', { cache: 'no-store' })
        .then(function (response) {
            if (!response.ok) {
                throw new Error('Não foi possível carregar as avaliações.');
            }
            return response.json();
        })
        .then(function (data) {
            renderSummary(data.place);
            renderReviews(data.reviews);
        })
        .catch(function (error) {
            console.warn('Avaliações do Google indisponíveis:', error);
            showFallback();
        });

    function scrollByCard(direction) {
        const card = gridContainer.querySelector('.review-card');
        const step = card ? card.getBoundingClientRect().width + 25 : gridContainer.clientWidth;
        gridContainer.scrollBy({ left: step * direction, behavior: 'smooth' });
    }

    function updateNavState() {
        if (!prevButton || !nextButton) {
            return;
        }
        const maxScrollLeft = gridContainer.scrollWidth - gridContainer.clientWidth - 1;
        prevButton.disabled = gridContainer.scrollLeft <= 0;
        nextButton.disabled = gridContainer.scrollLeft >= maxScrollLeft;
    }

    function renderSummary(place) {
        if (!summaryContainer || !place) {
            return;
        }

        summaryContainer.innerHTML = '';

        if (typeof place.rating === 'number') {
            const ratingEl = document.createElement('div');
            ratingEl.className = 'reviews-summary-rating';

            const scoreEl = document.createElement('span');
            scoreEl.className = 'reviews-summary-score';
            scoreEl.textContent = place.rating.toFixed(1);

            const starsEl = document.createElement('span');
            starsEl.className = 'review-stars';
            starsEl.textContent = starsForRating(place.rating);
            starsEl.setAttribute('aria-hidden', 'true');

            ratingEl.appendChild(scoreEl);
            ratingEl.appendChild(starsEl);
            summaryContainer.appendChild(ratingEl);
        }

        if (typeof place.totalReviews === 'number') {
            const countEl = document.createElement('p');
            countEl.className = 'reviews-summary-count';
            countEl.textContent = place.totalReviews + ' avaliações no Google';
            summaryContainer.appendChild(countEl);
        }

        if (place.mapsUrl) {
            const linkEl = document.createElement('a');
            linkEl.className = 'reviews-summary-link';
            linkEl.href = place.mapsUrl;
            linkEl.target = '_blank';
            linkEl.rel = 'noopener';
            linkEl.textContent = 'Ver todas as avaliações no Google';
            summaryContainer.appendChild(linkEl);
        }
    }

    function renderReviews(reviews) {
        gridContainer.innerHTML = '';

        if (!Array.isArray(reviews) || reviews.length === 0) {
            showFallback();
            return;
        }

        reviews.forEach(function (review) {
            gridContainer.appendChild(buildReviewCard(review));
        });

        updateNavState();
    }

    function buildReviewCard(review) {
        const card = document.createElement('article');
        card.className = 'review-card';

        const header = document.createElement('div');
        header.className = 'review-card-header';

        const avatar = document.createElement('img');
        avatar.className = 'review-avatar';
        avatar.src = review.authorPhoto || 'images/LogoFavicon.png';
        avatar.alt = '';
        avatar.loading = 'lazy';
        avatar.addEventListener('error', function () {
            avatar.src = 'images/LogoFavicon.png';
        });

        const authorInfo = document.createElement('div');
        authorInfo.className = 'review-author-info';

        const authorName = document.createElement('p');
        authorName.className = 'review-author-name';
        authorName.textContent = review.author || 'Cliente do Google';

        authorInfo.appendChild(authorName);

        if (review.isLocalGuide) {
            const badge = document.createElement('span');
            badge.className = 'review-local-guide';
            badge.textContent = 'Guia Local';
            authorInfo.appendChild(badge);
        }

        header.appendChild(avatar);
        header.appendChild(authorInfo);
        card.appendChild(header);

        if (typeof review.rating === 'number') {
            const stars = document.createElement('div');
            stars.className = 'review-stars';
            stars.textContent = starsForRating(review.rating);
            stars.setAttribute('aria-label', review.rating + ' de 5 estrelas');
            card.appendChild(stars);
        }

        if (review.relativeDate) {
            const date = document.createElement('p');
            date.className = 'review-date';
            date.textContent = review.relativeDate;
            card.appendChild(date);
        }

        if (review.text) {
            const text = document.createElement('p');
            text.className = 'review-text';
            text.textContent = review.text;
            card.appendChild(text);

            // Texto longo pode ultrapassar o card compacto (quase quadrado);
            // usamos um limite de caracteres como heurística para decidir
            // se vale a pena mostrar o botão de expandir.
            if (review.text.length > 130) {
                const toggle = document.createElement('button');
                toggle.type = 'button';
                toggle.className = 'review-toggle';
                toggle.textContent = 'Ver mais';
                toggle.addEventListener('click', function () {
                    const expanded = card.classList.toggle('expanded');
                    toggle.textContent = expanded ? 'Ver menos' : 'Ver mais';
                });
                card.appendChild(toggle);
            }
        }

        return card;
    }

    function starsForRating(rating) {
        const rounded = Math.round(rating);
        return '★★★★★☆☆☆☆☆'.slice(5 - rounded, 10 - rounded);
    }

    function showFallback() {
        if (gridContainer) {
            gridContainer.innerHTML = '';
        }
        if (fallbackMessage) {
            fallbackMessage.hidden = false;
        }
        if (prevButton) {
            prevButton.disabled = true;
        }
        if (nextButton) {
            nextButton.disabled = true;
        }
    }
});
