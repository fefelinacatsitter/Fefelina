// Fefelina Catsitter Website JavaScript

document.addEventListener('DOMContentLoaded', function() {
    
    // FAQ Accordion functionality - PRIORIDADE
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function(e) {
            e.preventDefault();
            const faqItem = this.parentElement;
            const isActive = faqItem.classList.contains('active');
            
            // Close all other FAQ items
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
                item.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
            });
            
            // Toggle current item
            if (!isActive) {
                faqItem.classList.add('active');
                this.setAttribute('aria-expanded', 'true');
            }
        });
    });
    
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

    // Certificate modal (lightbox)
    let lastFocusedElement = null;

    function openCertificateModal(modal) {
        lastFocusedElement = document.activeElement;
        modal.hidden = false;
        document.body.style.overflow = 'hidden';
        const closeBtn = modal.querySelector('.certificate-modal-close');
        if (closeBtn) closeBtn.focus();
        document.addEventListener('keydown', handleModalKeydown);
    }

    function closeCertificateModal(modal) {
        modal.hidden = true;
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleModalKeydown);
        if (lastFocusedElement) lastFocusedElement.focus();
    }

    function handleModalKeydown(e) {
        const openModal = document.querySelector('.certificate-modal:not([hidden])');
        if (!openModal) return;

        if (e.key === 'Escape') {
            closeCertificateModal(openModal);
            return;
        }

        if (e.key === 'Tab') {
            const focusable = openModal.querySelectorAll('button, [href], img');
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    }

    document.querySelectorAll('.certificate-trigger').forEach(trigger => {
        trigger.addEventListener('click', function() {
            const modal = document.getElementById(this.dataset.modalTarget);
            if (modal) openCertificateModal(modal);
        });
    });

    document.querySelectorAll('.certificate-modal [data-modal-close]').forEach(closeEl => {
        closeEl.addEventListener('click', function() {
            const modal = this.closest('.certificate-modal');
            if (modal) closeCertificateModal(modal);
        });
    });

});
