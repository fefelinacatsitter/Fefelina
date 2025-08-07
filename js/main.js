// Fefelina Catsitter Website JavaScript

document.addEventListener('DOMContentLoaded', function() {
    
    // Load Instagram feed
    loadInstagramFeed();
    
    // Add hover effect to service items
    const serviceItems = document.querySelectorAll('.service-item');
    serviceItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Error handling for images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('error', function() {
            console.warn('Image failed to load:', this.src);
            // You can add a fallback image here if needed
        });
    });

    // Instagram Feed functionality
    function loadInstagramFeed() {
        const instagramContainer = document.getElementById('instagram-feed');
        
        // Simulated Instagram posts (você pode substituir por dados reais da API)
        const instagramPosts = [
            {
                id: '1',
                image: 'https://via.placeholder.com/300x300/E1306C/white?text=Post+1',
                caption: 'Cuidando do gatinho mais fofo hoje! 🐱💕',
                permalink: 'https://www.instagram.com/fefelinacatsitter',
                timestamp: '2025-01-07'
            },
            {
                id: '2', 
                image: 'https://via.placeholder.com/300x300/405DE6/white?text=Post+2',
                caption: 'Sessão de brincadeiras com muito amor! 🎾',
                permalink: 'https://www.instagram.com/fefelinacatsitter',
                timestamp: '2025-01-06'
            },
            {
                id: '3',
                image: 'https://via.placeholder.com/300x300/5851DB/white?text=Post+3', 
                caption: 'Medicação feita com carinho e paciência ❤️',
                permalink: 'https://www.instagram.com/fefelinacatsitter',
                timestamp: '2025-01-05'
            },
            {
                id: '4',
                image: 'https://via.placeholder.com/300x300/833AB4/white?text=Post+4',
                caption: 'Mais um cliente feliz! 😸',
                permalink: 'https://www.instagram.com/fefelinacatsitter', 
                timestamp: '2025-01-04'
            }
        ];

        // Clear loading spinner
        instagramContainer.innerHTML = '';
        
        // Create posts grid
        instagramPosts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'instagram-post';
            postElement.innerHTML = `
                <a href="${post.permalink}" target="_blank" class="instagram-post-link">
                    <div class="instagram-post-image">
                        <img src="${post.image}" alt="Instagram post" loading="lazy">
                        <div class="instagram-overlay">
                            <span class="instagram-view-text">Ver no Instagram</span>
                        </div>
                    </div>
                    <div class="instagram-post-caption">
                        <p>${post.caption}</p>
                    </div>
                </a>
            `;
            instagramContainer.appendChild(postElement);
        });

        // If no posts loaded, show fallback
        if (instagramPosts.length === 0) {
            instagramContainer.innerHTML = `
                <div class="instagram-placeholder">
                    <p>📸 Visite nosso Instagram para ver fotos dos nossos gatinhos clientes!</p>
                    <a href="https://www.instagram.com/fefelinacatsitter" target="_blank" class="instagram-cta">
                        Ver no Instagram
                    </a>
                </div>
            `;
        }
    }

    // Load Instagram feed on page load
    loadInstagramFeed();
});
