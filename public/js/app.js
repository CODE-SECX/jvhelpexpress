// Global variables
let currentLanguage = 'en';
let galleryData = [];
let filteredGalleryData = [];
let currentPage = 1;
const itemsPerPage = 6;
let currentModalSlide = 0;
let modalSlideInterval = null;
let galleryAutoSlideInterval = null;
let currentGallerySlide = 0;

// Language detection and management
function detectUserLanguage() {
    const browserLang = navigator.language || navigator.userLanguage;
    const langCode = browserLang.split('-')[0];
    
    if (['hi', 'gu'].includes(langCode)) {
        return langCode;
    }
    return 'en';
}

function showLanguagePrompt() {
    const detectedLang = detectUserLanguage();
    if (detectedLang !== 'en' && !localStorage.getItem('languagePromptShown')) {
        const prompt = document.getElementById('language-prompt');
        if (prompt) {
            setTimeout(() => {
                prompt.classList.add('show');
                document.querySelector('.language-switcher .language-button').classList.add('pulse');
            }, 3000);
        }
    }
}

function hideLanguagePrompt() {
    const prompt = document.getElementById('language-prompt');
    if (prompt) {
        prompt.classList.remove('show');
        document.querySelector('.language-switcher .language-button').classList.remove('pulse');
        localStorage.setItem('languagePromptShown', 'true');
    }
}

// Language switching functionality
function switchLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('preferredLanguage', lang);
    
    // Update language button
    const languageNames = { en: 'English', hi: 'हिंदी', gu: 'ગુજરાતી' };
    document.querySelector('.current-language').textContent = languageNames[lang];
    
    // Update static content
    updateStaticContent();
    
    // Reload dynamic content
    loadHeroContent();
    loadGalleryData();
    
    hideLanguagePrompt();
}

function updateStaticContent() {
    const elements = document.querySelectorAll('[data-lang-key]');
    elements.forEach(element => {
        const key = element.getAttribute('data-lang-key');
        if (translations[currentLanguage] && translations[currentLanguage][key]) {
            element.textContent = translations[currentLanguage][key];
        }
    });
}

// API functions
async function loadHeroContent() {
    try {
        const response = await fetch(`/api/hero-content?lang=${currentLanguage}`);
        const data = await response.json();
        
        if (data.error) {
            console.warn('Using fallback hero content:', data.fallback);
            document.getElementById('hero-title').textContent = data.fallback.title;
            document.getElementById('hero-slogan').textContent = data.fallback.subtitle;
        } else {
            document.getElementById('hero-title').textContent = data.title;
            document.getElementById('hero-slogan').textContent = data.subtitle;
        }
    } catch (error) {
        console.error('Error loading hero content:', error);
        document.getElementById('hero-title').textContent = 'JV HELP';
        document.getElementById('hero-slogan').textContent = 'Heal Help Protect';
    }
}

async function loadGalleryData() {
    const loadingElement = document.getElementById('gallery-loading');
    const gridElement = document.getElementById('gallery-grid');
    const noResultsElement = document.getElementById('gallery-no-results');
    
    try {
        loadingElement.classList.remove('hidden');
        gridElement.innerHTML = '';
        noResultsElement.classList.add('hidden');
        
        const response = await fetch(`/api/activities-gallery?lang=${currentLanguage}`);
        const result = await response.json();
        
        if (result.error) {
            console.warn('Gallery API error:', result.error);
            galleryData = generateSampleGalleryData();
        } else {
            galleryData = result.data || [];
        }
        
        // If no data from API, use sample data
        if (galleryData.length === 0) {
            galleryData = generateSampleGalleryData();
        }
        
        filteredGalleryData = [...galleryData];
        renderGallery();
        
    } catch (error) {
        console.error('Error loading gallery data:', error);
        galleryData = generateSampleGalleryData();
        filteredGalleryData = [...galleryData];
        renderGallery();
    } finally {
        loadingElement.classList.add('hidden');
    }
}

function generateSampleGalleryData() {
    const sampleImages = [
        'https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1851164/pexels-photo-1851164.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1851165/pexels-photo-1851165.jpeg?auto=compress&cs=tinysrgb&w=800'
    ];
    
    const categories = ['welfare', 'education', 'rescue', 'celebration', 'environment'];
    const categoryTranslations = {
        en: { welfare: 'Welfare', education: 'Education', rescue: 'Rescue', celebration: 'Celebration', environment: 'Environment' },
        hi: { welfare: 'कल्याण', education: 'शिक्षा', rescue: 'बचाव', celebration: 'उत्सव', environment: 'पर्यावरण' },
        gu: { welfare: 'કલ્યાણ', education: 'શિક્ષણ', rescue: 'બચાવ', celebration: 'ઉત્સવ', environment: 'પર્યાવરણ' }
    };
    
    return Array.from({ length: 12 }, (_, i) => {
        const category = categories[i % categories.length];
        const additionalImages = Array.from({ length: 4 }, (_, j) => 
            sampleImages[(i + j + 1) % sampleImages.length]
        );
        
        return {
            id: i + 1,
            title_en: `Activity ${i + 1}`,
            title_hi: `गतिविधि ${i + 1}`,
            title_gu: `પ્રવૃત્તિ ${i + 1}`,
            description_en: `This is a detailed description of activity ${i + 1}. Our team worked tirelessly to make this initiative successful.`,
            description_hi: `यह गतिविधि ${i + 1} का विस्तृत विवरण है। हमारी टीम ने इस पहल को सफल बनाने के लिए अथक परिश्रम किया।`,
            description_gu: `આ પ્રવૃત્તિ ${i + 1} નું વિગતવાર વર્ણન છે. અમારી ટીમે આ પહેલને સફળ બનાવવા માટે અથાક મહેનત કરી.`,
            image: sampleImages[i % sampleImages.length],
            images: [sampleImages[i % sampleImages.length], ...additionalImages],
            category_en: category.toUpperCase(),
            category_hi: categoryTranslations.hi[category],
            category_gu: categoryTranslations.gu[category],
            date: new Date(2024, i % 12, (i % 28) + 1).toISOString().split('T')[0],
            quote_en: `"This activity has made a significant impact on our community." - Volunteer ${i + 1}`,
            quote_hi: `"इस गतिविधि ने हमारे समुदाय पर महत्वपूर्ण प्रभाव डाला है।" - स्वयंसेवक ${i + 1}`,
            quote_gu: `"આ પ્રવૃત્તિએ અમારા સમુદાય પર નોંધપાત્ર અસર કરી છે." - સ્વયંસેવક ${i + 1}`,
            stats: { beneficiaries: `${(i + 1) * 50}+`, locations: `${i + 1}` }
        };
    });
}

function renderGallery() {
    const gridElement = document.getElementById('gallery-grid');
    const noResultsElement = document.getElementById('gallery-no-results');
    
    if (filteredGalleryData.length === 0) {
        gridElement.innerHTML = '';
        noResultsElement.classList.remove('hidden');
        return;
    }
    
    noResultsElement.classList.add('hidden');
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageData = filteredGalleryData.slice(startIndex, endIndex);
    
    gridElement.innerHTML = pageData.map(item => {
        const title = item[`title_${currentLanguage}`] || item.title_en || 'Activity';
        const description = item[`description_${currentLanguage}`] || item.description_en || 'Description';
        const category = item[`category_${currentLanguage}`] || item.category_en || 'General';
        const quote = item[`quote_${currentLanguage}`] || item.quote_en || '';
        
        return `
            <div class="gallery-item" onclick="openGalleryModal(${item.id})">
                <div class="gallery-item-image-container">
                    <img src="${item.image}" alt="${title}" class="gallery-item-image" loading="lazy">
                    <div class="gallery-item-category">${category}</div>
                    <div class="gallery-item-stats">
                        <i class="fas fa-users"></i>
                        <span>${item.stats?.beneficiaries || '100+'}</span>
                    </div>
                </div>
                <div class="gallery-item-content">
                    <h3 class="gallery-item-title">${title}</h3>
                    <p class="gallery-item-description">${description.substring(0, 120)}...</p>
                    <div class="gallery-item-meta">
                        <div class="gallery-item-date">
                            <i class="fas fa-calendar"></i>
                            ${new Date(item.date).toLocaleDateString()}
                        </div>
                        <div class="gallery-item-actions">
                            <button class="action-btn" title="View Details">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="action-btn" title="Share">
                                <i class="fas fa-share"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="gallery-item-overlay">
                    <i class="fas fa-search-plus"></i>
                    <div class="overlay-text">View Details</div>
                    <div class="overlay-subtitle">Click to explore</div>
                </div>
            </div>
        `;
    }).join('');
    
    renderPagination();
}

function renderPagination() {
    const paginationElement = document.getElementById('gallery-pagination');
    const totalPages = Math.ceil(filteredGalleryData.length / itemsPerPage);
    
    if (totalPages <= 1) {
        paginationElement.innerHTML = '';
        return;
    }
    
    let paginationHTML = `
        <button class="pagination-btn" onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i>
        </button>
    `;
    
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            paginationHTML += `
                <button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">
                    ${i}
                </button>
            `;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            paginationHTML += `<span class="pagination-ellipsis">...</span>`;
        }
    }
    
    paginationHTML += `
        <button class="pagination-btn" onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    paginationElement.innerHTML = paginationHTML;
}

function changePage(page) {
    const totalPages = Math.ceil(filteredGalleryData.length / itemsPerPage);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        renderGallery();
        document.querySelector('.gallery-grid').scrollIntoView({ behavior: 'smooth' });
    }
}

function openGalleryModal(itemId) {
    const item = galleryData.find(i => i.id === itemId);
    if (!item) return;
    
    const modal = document.getElementById('gallery-modal') || createGalleryModal();
    const title = item[`title_${currentLanguage}`] || item.title_en || 'Activity';
    const description = item[`description_${currentLanguage}`] || item.description_en || 'Description';
    const quote = item[`quote_${currentLanguage}`] || item.quote_en || '';
    
    // Prepare images array - check for both naming conventions
    let images = [item.image];
    
    // Check for additional images with both naming conventions
    for (let i = 1; i <= 5; i++) {
        const imageLM = item[`image_lm_${i}`];
        const imageLMCaps = item[`image_LM_${i}`];
        
        if (imageLM) {
            images.push(imageLM);
        } else if (imageLMCaps) {
            images.push(imageLMCaps);
        }
    }
    
    // If we have the images array from the item, use that instead
    if (item.images && Array.isArray(item.images) && item.images.length > 1) {
        images = item.images;
    }
    
    // Remove duplicates and filter out empty/null values
    images = [...new Set(images.filter(img => img && img.trim() !== ''))];
    
    // If we only have one image, add some sample images for demonstration
    if (images.length === 1) {
        const sampleImages = [
            'https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg?auto=compress&cs=tinysrgb&w=800',
            'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=800',
            'https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg?auto=compress&cs=tinysrgb&w=800'
        ];
        images = [images[0], ...sampleImages.slice(0, 3)];
    }
    
    modal.innerHTML = `
        <div class="gallery-modal-content">
            <div class="gallery-modal-header">
                <h2 class="gallery-modal-title">${title}</h2>
                <button class="gallery-modal-close" onclick="closeGalleryModal()">&times;</button>
            </div>
            <div class="gallery-modal-body">
                <div class="gallery-modal-carousel">
                    <div class="gallery-modal-carousel-container">
                        ${images.map((img, index) => `
                            <div class="gallery-modal-carousel-slide ${index === 0 ? 'active' : ''}">
                                <img src="${img}" alt="${title} - Image ${index + 1}" loading="lazy">
                            </div>
                        `).join('')}
                    </div>
                    ${images.length > 1 ? `
                        <button class="gallery-modal-carousel-nav prev" onclick="changeModalSlide(-1)">
                            <i class="fas fa-chevron-left"></i>
                        </button>
                        <button class="gallery-modal-carousel-nav next" onclick="changeModalSlide(1)">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                        <div class="gallery-modal-carousel-indicators">
                            ${images.map((_, index) => `
                                <div class="gallery-modal-carousel-dot ${index === 0 ? 'active' : ''}" onclick="goToModalSlide(${index})"></div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
                <div class="gallery-modal-details">
                    ${quote ? `
                        <div class="gallery-modal-quote">
                            ${quote}
                        </div>
                    ` : ''}
                    <div class="gallery-modal-description">
                        ${description}
                    </div>
                    <div class="gallery-modal-meta">
                        <div class="gallery-modal-meta-item">
                            <div class="gallery-modal-meta-label">Date</div>
                            <div class="gallery-modal-meta-value">${new Date(item.date).toLocaleDateString()}</div>
                        </div>
                        <div class="gallery-modal-meta-item">
                            <div class="gallery-modal-meta-label">Beneficiaries</div>
                            <div class="gallery-modal-meta-value">${item.stats?.beneficiaries || '100+'}</div>
                        </div>
                        <div class="gallery-modal-meta-item">
                            <div class="gallery-modal-meta-label">Locations</div>
                            <div class="gallery-modal-meta-value">${item.stats?.locations || '5'}</div>
                        </div>
                        <div class="gallery-modal-meta-item">
                            <div class="gallery-modal-meta-label">Category</div>
                            <div class="gallery-modal-meta-value">${item[`category_${currentLanguage}`] || item.category_en}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Initialize modal carousel
    currentModalSlide = 0;
    startModalAutoSlide(images.length);
}

function createGalleryModal() {
    const modal = document.createElement('div');
    modal.id = 'gallery-modal';
    modal.className = 'gallery-modal';
    document.body.appendChild(modal);
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeGalleryModal();
        }
    });
    
    return modal;
}

function closeGalleryModal() {
    const modal = document.getElementById('gallery-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        stopModalAutoSlide();
    }
}

function changeModalSlide(direction) {
    const slides = document.querySelectorAll('.gallery-modal-carousel-slide');
    const dots = document.querySelectorAll('.gallery-modal-carousel-dot');
    
    if (slides.length === 0) return;
    
    // Remove active class from current slide and dot
    slides[currentModalSlide].classList.remove('active');
    if (dots[currentModalSlide]) {
        dots[currentModalSlide].classList.remove('active');
    }
    
    // Calculate new slide index
    currentModalSlide += direction;
    if (currentModalSlide >= slides.length) {
        currentModalSlide = 0;
    } else if (currentModalSlide < 0) {
        currentModalSlide = slides.length - 1;
    }
    
    // Add active class to new slide and dot
    slides[currentModalSlide].classList.add('active');
    if (dots[currentModalSlide]) {
        dots[currentModalSlide].classList.add('active');
    }
}

function goToModalSlide(index) {
    const slides = document.querySelectorAll('.gallery-modal-carousel-slide');
    const dots = document.querySelectorAll('.gallery-modal-carousel-dot');
    
    if (index >= 0 && index < slides.length) {
        // Remove active class from current slide and dot
        slides[currentModalSlide].classList.remove('active');
        if (dots[currentModalSlide]) {
            dots[currentModalSlide].classList.remove('active');
        }
        
        // Set new slide index
        currentModalSlide = index;
        
        // Add active class to new slide and dot
        slides[currentModalSlide].classList.add('active');
        if (dots[currentModalSlide]) {
            dots[currentModalSlide].classList.add('active');
        }
    }
}

function startModalAutoSlide(totalSlides) {
    if (totalSlides <= 1) return;
    
    stopModalAutoSlide(); // Clear any existing interval
    modalSlideInterval = setInterval(() => {
        changeModalSlide(1);
    }, 3000); // Change slide every 3 seconds
}

function stopModalAutoSlide() {
    if (modalSlideInterval) {
        clearInterval(modalSlideInterval);
        modalSlideInterval = null;
    }
}

// Gallery filtering and sorting
function filterGallery() {
    const searchTerm = document.getElementById('gallery-search-input').value.toLowerCase();
    const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
    const sortValue = document.getElementById('gallery-sort-select').value;
    
    // Filter data
    filteredGalleryData = galleryData.filter(item => {
        const title = (item[`title_${currentLanguage}`] || item.title_en || '').toLowerCase();
        const description = (item[`description_${currentLanguage}`] || item.description_en || '').toLowerCase();
        const category = (item.category_en || '').toLowerCase();
        
        const matchesSearch = title.includes(searchTerm) || description.includes(searchTerm);
        const matchesFilter = activeFilter === 'all' || category === activeFilter;
        
        return matchesSearch && matchesFilter;
    });
    
    // Sort data
    filteredGalleryData.sort((a, b) => {
        switch (sortValue) {
            case 'date-desc':
                return new Date(b.date) - new Date(a.date);
            case 'date-asc':
                return new Date(a.date) - new Date(b.date);
            case 'title-asc':
                const titleA = a[`title_${currentLanguage}`] || a.title_en || '';
                const titleB = b[`title_${currentLanguage}`] || b.title_en || '';
                return titleA.localeCompare(titleB);
            case 'title-desc':
                const titleA2 = a[`title_${currentLanguage}`] || a.title_en || '';
                const titleB2 = b[`title_${currentLanguage}`] || b.title_en || '';
                return titleB2.localeCompare(titleA2);
            default:
                return a.display_order - b.display_order;
        }
    });
    
    currentPage = 1;
    renderGallery();
}

// Animal Friends World functionality
function initializeAnimalFriends() {
    const helpButtons = document.querySelectorAll('.help-button');
    const badges = document.querySelectorAll('.badge');
    const animalCards = document.querySelectorAll('.animal-friend-card');
    
    helpButtons.forEach(button => {
        button.addEventListener('click', function() {
            const action = this.dataset.action;
            const card = this.closest('.animal-friend-card');
            const animal = card.dataset.animal;
            
            handleAnimalHelp(animal, action, card);
        });
    });
    
    // Water drops game
    const waterDrops = document.querySelectorAll('.water-drop');
    waterDrops.forEach(drop => {
        drop.addEventListener('click', function() {
            if (!this.classList.contains('found')) {
                this.classList.add('found');
                const card = this.closest('.animal-friend-card');
                updateHappiness(card, 30);
                
                // Check if all drops are found
                const allDrops = card.querySelectorAll('.water-drop');
                const foundDrops = card.querySelectorAll('.water-drop.found');
                if (foundDrops.length === allDrops.length) {
                    earnBadge('water-helper');
                    showFactBubble(card);
                }
            }
        });
    });
}

function handleAnimalHelp(animal, action, card) {
    const happinessIncrease = 25;
    updateHappiness(card, happinessIncrease);
    
    // Show fact bubble
    showFactBubble(card);
    
    // Add celebration animation
    card.classList.add('celebration');
    setTimeout(() => card.classList.remove('celebration'), 3000);
    
    // Earn badges based on actions
    const badgeMap = {
        'give-water': 'water-helper',
        'give-food': 'animal-friend',
        'give-shelter': 'shelter-provider',
        'give-perch': 'shelter-provider',
        'plant-tree': 'earth-protector',
        'clean-up': 'earth-protector',
        'read-letter': 'animal-friend'
    };
    
    if (badgeMap[action]) {
        earnBadge(badgeMap[action]);
    }
    
    // Special actions
    if (action === 'read-letter') {
        const letterContent = card.querySelector('.letter-content');
        if (letterContent) {
            letterContent.classList.remove('hidden');
        }
    }
}

function updateHappiness(card, increase) {
    const happinessFill = card.querySelector('.happiness-fill');
    const currentWidth = parseInt(happinessFill.style.width) || 20;
    const newWidth = Math.min(currentWidth + increase, 100);
    
    happinessFill.style.width = newWidth + '%';
    
    if (newWidth >= 100) {
        card.classList.add('happy-animation');
        setTimeout(() => card.classList.remove('happy-animation'), 1000);
    }
}

function showFactBubble(card) {
    const factBubble = card.querySelector('.fact-bubble');
    if (factBubble) {
        factBubble.classList.remove('hidden');
        setTimeout(() => factBubble.classList.add('hidden'), 5000);
    }
}

function earnBadge(badgeType) {
    const badge = document.querySelector(`[data-badge="${badgeType}"]`);
    if (badge && !badge.classList.contains('earned')) {
        badge.classList.add('earned');
        
        // Check if all badges are earned
        const allBadges = document.querySelectorAll('.badge');
        const earnedBadges = document.querySelectorAll('.badge.earned');
        
        if (earnedBadges.length === allBadges.length) {
            const badgesContainer = document.querySelector('.badges-container');
            badgesContainer.classList.add('all-complete');
        }
    }
}

// Product modal functionality
function openModal(productId) {
    const modal = document.getElementById(productId + 'Modal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(productId) {
    const modal = document.getElementById(productId + 'Modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function selectColor(colorElement) {
    // Remove selected class from all color options
    const colorOptions = colorElement.parentElement.querySelectorAll('.color-option');
    colorOptions.forEach(option => option.classList.remove('selected'));
    
    // Add selected class to clicked option
    colorElement.classList.add('selected');
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Set initial language from localStorage or browser detection
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage && ['en', 'hi', 'gu'].includes(savedLanguage)) {
        currentLanguage = savedLanguage;
    } else {
        currentLanguage = detectUserLanguage();
    }
    
    // Update language button
    const languageNames = { en: 'English', hi: 'हिंदी', gu: 'ગુજરાતી' };
    document.querySelector('.current-language').textContent = languageNames[currentLanguage];
    
    // Load content
    updateStaticContent();
    loadHeroContent();
    loadGalleryData();
    
    // Initialize animal friends
    initializeAnimalFriends();
    
    // Show language prompt if needed
    showLanguagePrompt();
    
    // Language switcher event listeners
    const languageToggle = document.getElementById('language-toggle');
    const languageMenu = document.getElementById('language-menu');
    const languageOptions = document.querySelectorAll('.language-option');
    
    languageToggle.addEventListener('click', function() {
        languageMenu.classList.toggle('show');
    });
    
    languageOptions.forEach(option => {
        option.addEventListener('click', function() {
            const lang = this.dataset.lang;
            switchLanguage(lang);
            languageMenu.classList.remove('show');
        });
    });
    
    // Language prompt event listeners
    const promptSwitch = document.getElementById('prompt-switch');
    const promptClose = document.getElementById('prompt-close');
    
    if (promptSwitch) {
        promptSwitch.addEventListener('click', function() {
            const detectedLang = detectUserLanguage();
            switchLanguage(detectedLang);
        });
    }
    
    if (promptClose) {
        promptClose.addEventListener('click', hideLanguagePrompt);
    }
    
    // Gallery controls event listeners
    const searchInput = document.getElementById('gallery-search-input');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const sortSelect = document.getElementById('gallery-sort-select');
    
    if (searchInput) {
        searchInput.addEventListener('input', filterGallery);
    }
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            filterGallery();
        });
    });
    
    if (sortSelect) {
        sortSelect.addEventListener('change', filterGallery);
    }
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
        
        if (event.target.classList.contains('gallery-modal')) {
            closeGalleryModal();
        }
        
        // Close language menu when clicking outside
        if (!event.target.closest('.language-switcher')) {
            languageMenu.classList.remove('show');
        }
    });
    
    // Keyboard navigation for modals
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            // Close any open modals
            const openModals = document.querySelectorAll('.modal[style*="block"], .gallery-modal[style*="block"]');
            openModals.forEach(modal => {
                if (modal.classList.contains('gallery-modal')) {
                    closeGalleryModal();
                } else {
                    modal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                }
            });
            
            // Close language menu
            languageMenu.classList.remove('show');
        }
        
        // Arrow key navigation for modal carousel
        if (document.getElementById('gallery-modal') && document.getElementById('gallery-modal').style.display === 'block') {
            if (event.key === 'ArrowLeft') {
                changeModalSlide(-1);
            } else if (event.key === 'ArrowRight') {
                changeModalSlide(1);
            }
        }
    });
});

// Expose functions to global scope for onclick handlers
window.openModal = openModal;
window.closeModal = closeModal;
window.selectColor = selectColor;
window.openGalleryModal = openGalleryModal;
window.closeGalleryModal = closeGalleryModal;
window.changeModalSlide = changeModalSlide;
window.goToModalSlide = goToModalSlide;
window.changePage = changePage;