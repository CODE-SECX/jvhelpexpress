// Global language state
let currentLanguage = 'en';
let contentCache = {};

// Fetch hero content from API
async function loadHeroContent(language = 'en') {
    try {
        const response = await fetch(`/api/hero-content?lang=${language}`);
        const data = await response.json();
        
        if (data.error) {
            console.warn('Using fallback content:', data.fallback);
            // Use fallback content if there's an error
            updateHeroContent(data.fallback.title, data.fallback.subtitle);
        } else {
            // Cache all language data
            contentCache.hero = data.all_languages;
            
            // Use language-specific data from Supabase
            updateHeroContent(data.title, data.subtitle);
        }
    } catch (error) {
        console.error('Failed to load hero content:', error);
        // Use default fallback
        updateHeroContent('JV HELP', 'Heal Help Protect');
    }
}

// Update hero content in DOM
function updateHeroContent(title, subtitle) {
    const titleElement = document.getElementById('hero-title');
    const subtitleElement = document.getElementById('hero-slogan');
    
    if (titleElement) titleElement.textContent = title;
    if (subtitleElement) subtitleElement.textContent = subtitle;
}

// Generic function to load multilingual content
async function loadMultilingualContent(table, language = 'en') {
    try {
        const response = await fetch(`/api/content/${table}?lang=${language}`);
        const result = await response.json();
        
        if (result.error) {
            console.warn(`Failed to load ${table} content:`, result.error);
            return [];
        }
        
        // Cache the content
        contentCache[table] = result.data;
        return result.data;
    } catch (error) {
        console.error(`Failed to load ${table} content:`, error);
        return [];
    }
}

// Switch language globally
function switchLanguageGlobally(newLanguage) {
    currentLanguage = newLanguage;
    
    // Update hero content
    if (contentCache.hero && contentCache.hero[newLanguage]) {
        updateHeroContent(
            contentCache.hero[newLanguage].title,
            contentCache.hero[newLanguage].subtitle
        );
    } else {
        loadHeroContent(newLanguage);
    }
    
    // Update other content sections
    updateAllContentSections(newLanguage);
    
    // Update gallery language
    updateGalleryLanguage(newLanguage);
    
    // Update language switcher display
    updateLanguageDisplay(newLanguage);
    
    // Load products in new language
    loadProducts(newLanguage);
    
    // Reload activities gallery in new language
    loadActivitiesGallery(newLanguage).then(activities => {
        if (activities.length > 0) {
            allGalleryItems = activities;
            filteredGalleryItems = [...allGalleryItems];
            applyFiltersAndSort();
        }
    });
}

// Update all content sections with new language
function updateAllContentSections(language) {
    // Update static translations using existing translation system
    const existingTranslations = {
        'hi': {
            'hero-title': 'जेवी_हेल्प',
            'hero-slogan': 'हील हेल्प प्रोटेक्ट',
            'section-title': 'श्री जयवीर जीवदया ग्रुप द्वारा परोपकारी गतिविधियां',
            'winter-care': 'सर्दी की देखभाल',
            'winter-desc': 'सर्दी के मौसम में वंचित बच्चों को स्वेटर और कंबल का वितरण।',
            'festival-joy': 'त्योहार की खुशी',
            'festival-desc': 'दिवाली त्योहार के दौरान बच्चों को मिठाई और नाश्ते का वितरण।',
            'animal-welfare': 'पशु कल्याण',
            'animal-desc': 'गर्मियों के दौरान जानवरों और पक्षियों को हाइड्रेटेड रखने के लिए पानी के कटोरे का मुफ्त वितरण।',
            'wildlife-conservation': 'वन्यजीव संरक्षण',
            'wildlife-desc': 'वन्यजीव संरक्षण को प्रोत्साहित करने के लिए गौरैया के लिए पक्षीघरों का मुफ्त वितरण।',
            'daily-feeding': 'दैनिक भोजन',
            'daily-desc': 'पक्षियों को अनाज का दैनिक खिलाना।',
            'educational-support': 'शैक्षिक सहायता',
            'educational-desc': 'शैक्षिक सहायता की आवश्यकता वाले वंचित बच्चों को मुफ्त नोटबुक का प्रावधान।',
            'animal-rescue': 'पशु बचाव',
            'animal-rescue-desc': 'संकटग्रस्त जानवरों, पक्षियों और सांपों का बचाव और सुरक्षित पुनर्स्थापना।',
            'year-round-support': 'वर्ष भर सहायता',
            'year-round-desc': 'पशु कल्याण को बढ़ावा देने के लिए पक्षीघरों, पक्षी फीडर और पानी के कटोरे का 365 दिन वितरण।',
        },
        'gu': {
            'hero-title': 'જેવી_હેલ્પ',
            'hero-slogan': 'હીલ હેલ્પ પ્રોટેક્ટ',
            'section-title': 'શ્રી જયવીર જીવદયા ગ્રુપ દ્વારા પરોપકારી પ્રવૃત્તિઓ',
            'winter-care': 'શિયાળાની સંભાળ',
            'winter-desc': 'શિયાળાની ઋતુ દરમિયાન વંચિત બાળકોને સ્વેટર અને ધાબળાનું વિતરણ.',
            'festival-joy': 'તહેવારની ખુશી',
            'festival-desc': 'દિવાળી તહેવાર દરમિયાન બાળકોને મીઠાઈ અને નાસ્તાનું વિતરણ.',
            'animal-welfare': 'પશુ કલ્યાણ',
            'animal-desc': 'ઉનાળા દરમિયાન પ્રાણીઓ અને પક્ષીઓને હાઇડ્રેટેડ રાખવા માટે પાણીના વાટકાનું મફત વિતરણ.',
            'wildlife-conservation': 'વન્યજીવન સંરક્ષણ',
            'wildlife-desc': 'વન્યજીવન સંરક્ષણને પ્રોત્સાહન આપવા માટે ચકલીઓ માટે પક્ષીઘરનું મફત વિતરણ.',
            'daily-feeding': 'રોજનું ખવડાવવું',
            'daily-desc': 'પક્ષીઓને અનાજનું દૈનિક ખવડાવવું.',
            'educational-support': 'શૈક્ષણિક સહાય',
            'educational-desc': 'શૈક્ષણિક સહાયની જરૂર હોય તેવા વંચિત બાળકોને મફત નોટબુકની જોગવાઈ.',
            'animal-rescue': 'પશુ બચાવ',
            'animal-rescue-desc': 'સંકટમાં પડેલા પ્રાણીઓ, પક્ષીઓ અને સાપનું બચાવ અને સુરક્ષિત પુનઃસ્થાપન.',
            'year-round-support': 'વર્ષભર સહાય',
            'year-round-desc': 'પશુ કલ્યાણને પ્રોત્સાહન આપવા માટે પક્ષીઘર, પક્ષી ફીડર અને પાણીના વાટકાનું 365-દિવસનું વિતરણ.',
        }
    };
    
    // Apply translations to static content
    if (language !== 'en' && existingTranslations[language]) {
        document.querySelectorAll('[data-lang-key]').forEach(element => {
            const key = element.getAttribute('data-lang-key');
            if (existingTranslations[language][key]) {
                element.textContent = existingTranslations[language][key];
            }
        });
    } else {
        // Reset to English
        document.querySelectorAll('[data-lang-key]').forEach(element => {
            const originalText = element.getAttribute('data-original-text');
            if (originalText) {
                element.textContent = originalText;
            }
        });
    }
}

// Update language display in switcher
function updateLanguageDisplay(language) {
    const languageNames = {
        'en': 'English',
        'hi': 'हिंदी',
        'gu': 'ગુજરાતી'
    };
    
    const currentLanguageDisplay = document.querySelector('.current-language');
    if (currentLanguageDisplay) {
        currentLanguageDisplay.textContent = languageNames[language] || 'English';
    }
}

// Load products from API
async function loadProducts(language = 'en') {
    try {
        const response = await fetch(`/api/content/products?lang=${language}`);
        const result = await response.json();
        
        if (result.error) {
            console.warn('Failed to load products:', result.error);
            return;
        }
        
        // Cache the products
        contentCache.products = result.data;
        
        // Update products display
        updateProductsDisplay(result.data);
    } catch (error) {
        console.error('Failed to load products:', error);
    }
}

// Update products display in DOM
function updateProductsDisplay(products) {
    const productsGrid = document.querySelector('.products-grid');
    if (!productsGrid) return;
    
    // Clear existing products
    productsGrid.innerHTML = '';
    
    // Create product cards
    products.forEach((product, index) => {
        const productCard = createProductCard(product, index + 1);
        productsGrid.appendChild(productCard);
    });
}

// Create a product card element
function createProductCard(product, index) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.onclick = () => openModal(`product${index}`);
    
    // Parse colors if it's a JSON string
    let colors = [];
    try {
        colors = typeof product.colors === 'string' ? JSON.parse(product.colors) : (product.colors || []);
    } catch (e) {
        colors = [];
    }
    
    card.innerHTML = `
        <img src="${product.image_url || 'https://via.placeholder.com/300x250'}" 
             alt="${product.name}" 
             class="product-image">
        <div class="product-info">
            <div class="product-name">${product.name}</div>
            <div class="product-price">₹${product.price}</div>
            <div class="product-category">${product.category}</div>
            <div class="product-description-short">${product.short_description}</div>
            <button class="view-more-btn">View More</button>
        </div>
    `;
    
    // Create and append modal
    const modal = createProductModal(product, index, colors);
    document.body.appendChild(modal);
    
    return card;
}

// Create product modal
function createProductModal(product, index, colors) {
    const modal = document.createElement('div');
    modal.id = `product${index}Modal`;
    modal.className = 'modal';
    
    // Create color options HTML
    const colorOptionsHTML = colors.map(color => 
        `<div class="color-option" style="background-color: ${color};" onclick="selectColor(this)"></div>`
    ).join('');
    
    // Create dimensions HTML
    const dimensionsHTML = `
        ${product.height_cm ? `
            <div class="dimension-item">
                <div class="dimension-label">Height</div>
                <div class="dimension-value">${product.height_cm} cm</div>
            </div>
        ` : ''}
        ${product.width_cm ? `
            <div class="dimension-item">
                <div class="dimension-label">Width</div>
                <div class="dimension-value">${product.width_cm} cm</div>
            </div>
        ` : ''}
        ${product.volume_ml ? `
            <div class="dimension-item">
                <div class="dimension-label">Volume</div>
                <div class="dimension-value">${product.volume_ml} ml</div>
            </div>
        ` : ''}
    `;
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="modal-title">Product Details</h2>
                <button class="close" onclick="closeModal('product${index}')">&times;</button>
            </div>
            <div class="modal-body">
                <div class="product-details">
                    <img src="${product.image_url || 'https://via.placeholder.com/500x500'}" 
                         alt="${product.name}" 
                         class="product-image-large">
                    <div class="product-details-text">
                        <h2>${product.name}</h2>
                        <div class="product-price-large">₹${product.price}</div>
                        <div class="product-category">${product.category}</div>
                        <div class="product-description-full">
                            ${product.description}
                        </div>
                        ${product.usage_suggestion ? `
                            <div class="product-suggestion">
                                <h4>💡 Usage Suggestion</h4>
                                <p>${product.usage_suggestion}</p>
                            </div>
                        ` : ''}
                        ${dimensionsHTML ? `
                            <div class="product-dimensions">
                                <h4>📏 Dimensions</h4>
                                <div class="dimensions-grid">
                                    ${dimensionsHTML}
                                </div>
                            </div>
                        ` : ''}
                        ${colors.length > 0 ? `
                            <div class="color-picker-section">
                                <h4>🎨 Available Colors</h4>
                                <div class="color-options">
                                    ${colorOptionsHTML}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    return modal;
}

// Initialize Three.js background
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('background-shapes').appendChild(renderer.domElement);

// Create floating shapes
const shapes = [];
for (let i = 0; i < 10; i++) {
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshBasicMaterial({
        color: 0x1a237e,
        transparent: true,
        opacity: 0.1
    });
    const shape = new THREE.Mesh(geometry, material);
    shape.position.set(
        Math.random() * 40 - 20,
        Math.random() * 40 - 20,
        Math.random() * 40 - 20
    );
    shapes.push(shape);
    scene.add(shape);
}

camera.position.z = 30;

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    shapes.forEach(shape => {
        shape.rotation.x += 0.01;
        shape.rotation.y += 0.01;
    });
    renderer.render(scene, camera);
}
animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Load activity icons with contextual animations
const activityAnimations = {
    'winter-icon': 'https://assets6.lottiefiles.com/packages/lf20_FP2uV9.json',
    'diwali-icon': 'https://assets9.lottiefiles.com/packages/lf20_m9zragkd.json',
    'water-icon': 'https://lottie.host/4c48890e-e58e-4ec1-9268-996a62ab772a/8ATjLwiT15.lottie',
    'birdhouse-icon': 'https://assets6.lottiefiles.com/packages/lf20_syqnfe7c.json',
    'feeding-icon': 'https://assets3.lottiefiles.com/packages/lf20_wdfng7n6.json',
    'education-icon': 'https://assets6.lottiefiles.com/packages/lf20_w51pcehl.json',
    'rescue-icon': 'https://assets9.lottiefiles.com/packages/lf20_pbkjxppc.json',
    'year-round-icon': 'https://assets5.lottiefiles.com/packages/lf20_qpsh9lay.json'
};

// Load animations for each activity icon
Object.entries(activityAnimations).forEach(([iconId, animationPath]) => {
    const element = document.getElementById(iconId);
    if (element) {
        lottie.loadAnimation({
            container: element,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            path: animationPath
        });
    }
});

// Load initial content when page loads
document.addEventListener('DOMContentLoaded', function () {
    // Load hero content from API
    loadHeroContent();
    
    // Load products from API
    loadProducts();
    
    // Initialize gallery
    initializeEnhancedGallery();
});

// Enhanced Activities Gallery functionality
let currentPage = 1;
let itemsPerPage = 6;
let allGalleryItems = [];
let filteredGalleryItems = [];
let currentFilter = 'all';
let currentSort = 'date-desc';
let searchQuery = '';

// Modal carousel variables
let currentModalSlide = 0;
let modalCarouselInterval = null;

// Load activities gallery from API
async function loadActivitiesGallery(language = 'en') {
    try {
        const response = await fetch(`/api/activities-gallery?lang=${language}`);
        const result = await response.json();
        
        if (result.error) {
            console.warn('Failed to load activities gallery:', result.error);
            return [];
        }
        
        return result.data;
    } catch (error) {
        console.error('Failed to load activities gallery:', error);
        return [];
    }
}

// Initialize enhanced gallery
async function initializeEnhancedGallery() {
    showLoading();
    
    try {
        // Load activities from API instead of using hardcoded data
        const activities = await loadActivitiesGallery(currentLanguage);
        
        if (activities.length > 0) {
            allGalleryItems = activities;
            filteredGalleryItems = [...allGalleryItems];
        } else {
            // Fallback to empty array if API fails
            allGalleryItems = [];
            filteredGalleryItems = [];
        }
        
        setupGalleryEventListeners();
        renderGallery();
    } catch (error) {
        console.error('Failed to initialize gallery:', error);
        allGalleryItems = [];
        filteredGalleryItems = [];
        renderGallery();
    } finally {
        hideLoading();
    }
}

// Setup event listeners for gallery controls
function setupGalleryEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('gallery-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }
    
    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', handleFilter);
    });
    
    // Sort dropdown
    const sortSelect = document.getElementById('gallery-sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', handleSort);
    }
}

// Handle search functionality
function handleSearch(event) {
    searchQuery = event.target.value.toLowerCase();
    applyFiltersAndSort();
}

// Handle filter functionality
function handleFilter(event) {
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    currentFilter = event.target.dataset.filter;
    currentPage = 1; // Reset to first page
    applyFiltersAndSort();
}

// Handle sort functionality
function handleSort(event) {
    currentSort = event.target.value;
    currentPage = 1; // Reset to first page
    applyFiltersAndSort();
}

// Apply filters and sorting
function applyFiltersAndSort() {
    showLoading();
    
    // Filter items
    filteredGalleryItems = allGalleryItems.filter(item => {
        // Convert filter to uppercase to match database categories
        const filterCategory = currentFilter.toUpperCase();
        const matchesFilter = currentFilter === 'all' || item.category_en === filterCategory;
        const matchesSearch = searchQuery === '' || 
            item.title_en.toLowerCase().includes(searchQuery) ||
            item.description_en.toLowerCase().includes(searchQuery);
        
        return matchesFilter && matchesSearch;
    });
    
    // Sort items
    filteredGalleryItems.sort((a, b) => {
        switch (currentSort) {
            case 'date-desc':
                return new Date(b.created_at || b.date) - new Date(a.created_at || a.date);
            case 'date-asc':
                return new Date(a.created_at || a.date) - new Date(b.created_at || b.date);
            case 'title-asc':
                return a.title_en.localeCompare(b.title_en);
            case 'title-desc':
                return b.title_en.localeCompare(a.title_en);
            default:
                return (a.display_order || 0) - (b.display_order || 0);
        }
    });
    
    setTimeout(() => {
        renderGallery();
        hideLoading();
    }, 500); // Simulate loading time
}

// Render gallery items
function renderGallery() {
    const galleryGrid = document.getElementById('gallery-grid');
    const noResults = document.getElementById('gallery-no-results');
    
    if (!galleryGrid) return;
    
    // Clear existing content
    galleryGrid.innerHTML = '';
    
    // Check if there are results
    if (filteredGalleryItems.length === 0) {
        noResults.classList.remove('hidden');
        return;
    } else {
        noResults.classList.add('hidden');
    }
    
    // Calculate pagination
    const totalPages = Math.ceil(filteredGalleryItems.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = filteredGalleryItems.slice(startIndex, endIndex);
    
    // Create gallery items
    currentItems.forEach(item => {
        const galleryItem = createEnhancedGalleryItem(item);
        galleryGrid.appendChild(galleryItem);
    });
    
    // Update pagination
    renderPagination(totalPages);
    
    // Create modal if it doesn't exist
    createEnhancedGalleryModal();
}

// Create enhanced gallery item element
function createEnhancedGalleryItem(item) {
    const galleryItem = document.createElement('div');
    galleryItem.className = 'gallery-item';
    galleryItem.onclick = () => openEnhancedGalleryModal(item);
    
    const lang = currentLanguage || 'en';
    const title = item[`title_${lang}`] || item.title_en;
    const description = item[`description_${lang}`] || item.description_en;
    const category = item[`category_${lang}`] || item.category_en;
    
    galleryItem.innerHTML = `
        <div class="gallery-item-image-container">
            <img src="${item.image}" alt="${title}" class="gallery-item-image" loading="lazy">
            <div class="gallery-item-category">${category}</div>
            <div class="gallery-item-stats">
                <i class="fas fa-users"></i>
                ${Object.values(item.stats)[0]}
            </div>
        </div>
        <div class="gallery-item-content">
            <h3 class="gallery-item-title">${title}</h3>
            <p class="gallery-item-description">${description.substring(0, 120)}...</p>
            <div class="gallery-item-meta">
                <div class="gallery-item-date">
                    <i class="fas fa-calendar"></i>
                    ${item.date}
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
    `;
    
    return galleryItem;
}

// Render pagination
function renderPagination(totalPages) {
    const paginationContainer = document.getElementById('gallery-pagination');
    if (!paginationContainer || totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `
        <button class="pagination-btn ${currentPage === 1 ? 'disabled' : ''}" 
                onclick="changePage(${currentPage - 1})" 
                ${currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i>
        </button>
    `;
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            paginationHTML += `
                <button class="pagination-btn ${i === currentPage ? 'active' : ''}" 
                        onclick="changePage(${i})">
                    ${i}
                </button>
            `;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            paginationHTML += '<span class="pagination-ellipsis">...</span>';
        }
    }
    
    // Next button
    paginationHTML += `
        <button class="pagination-btn ${currentPage === totalPages ? 'disabled' : ''}" 
                onclick="changePage(${currentPage + 1})" 
                ${currentPage === totalPages ? 'disabled' : ''}>
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    paginationContainer.innerHTML = paginationHTML;
}

// Change page
function changePage(page) {
    if (page < 1 || page > Math.ceil(filteredGalleryItems.length / itemsPerPage)) return;
    
    currentPage = page;
    renderGallery();
    
    // Scroll to top of gallery
    document.querySelector('.activities-gallery-section').scrollIntoView({ 
        behavior: 'smooth' 
    });
}

// Show loading state
function showLoading() {
    const loading = document.getElementById('gallery-loading');
    const grid = document.getElementById('gallery-grid');
    const noResults = document.getElementById('gallery-no-results');
    
    if (loading) loading.classList.remove('hidden');
    if (grid) grid.style.opacity = '0.5';
    if (noResults) noResults.classList.add('hidden');
}

// Hide loading state
function hideLoading() {
    const loading = document.getElementById('gallery-loading');
    const grid = document.getElementById('gallery-grid');
    
    if (loading) loading.classList.add('hidden');
    if (grid) grid.style.opacity = '1';
}

// Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Create enhanced gallery modal
function createEnhancedGalleryModal() {
    const existingModal = document.getElementById('gallery-modal');
    if (existingModal) return;
    
    const modal = document.createElement('div');
    modal.id = 'gallery-modal';
    modal.className = 'gallery-modal';
    
    modal.innerHTML = `
        <div class="gallery-modal-content">
            <div class="gallery-modal-header">
                <h2 class="gallery-modal-title" id="gallery-modal-title">Activity Details</h2>
                <button class="gallery-modal-close" onclick="closeEnhancedGalleryModal()">&times;</button>
            </div>
            <div class="gallery-modal-body">
                <div id="gallery-modal-carousel" class="gallery-modal-carousel">
                    <div id="gallery-modal-carousel-container" class="gallery-modal-carousel-container">
                        <!-- Carousel slides will be inserted here -->
                    </div>
                    <button class="gallery-modal-carousel-nav prev" onclick="prevModalSlide()">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <button class="gallery-modal-carousel-nav next" onclick="nextModalSlide()">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                    <div id="gallery-modal-carousel-indicators" class="gallery-modal-carousel-indicators">
                        <!-- Indicators will be inserted here -->
                    </div>
                </div>
                <div class="gallery-modal-details">
                    <div id="gallery-modal-quote" class="gallery-modal-quote"></div>
                    <p id="gallery-modal-description" class="gallery-modal-description"></p>
                    <div class="gallery-modal-meta" id="gallery-modal-meta">
                        <!-- Meta items will be inserted here -->
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeEnhancedGalleryModal();
        }
    });
}

// Open enhanced gallery modal
function openEnhancedGalleryModal(item) {
    const modal = document.getElementById('gallery-modal');
    const title = document.getElementById('gallery-modal-title');
    const quote = document.getElementById('gallery-modal-quote');
    const description = document.getElementById('gallery-modal-description');
    const meta = document.getElementById('gallery-modal-meta');
    
    if (!modal || !title || !quote || !description || !meta) return;
    
    const lang = currentLanguage || 'en';
    
    title.textContent = item[`title_${lang}`] || item.title_en;
    quote.textContent = item[`quote_${lang}`] || item.quote_en || '';
    description.textContent = item[`description_${lang}`] || item.description_en;
    
    // Create meta items
    let metaHTML = '';
    metaHTML += `
        <div class="gallery-modal-meta-item">
            <div class="gallery-modal-meta-label">Date</div>
            <div class="gallery-modal-meta-value">${item.date}</div>
        </div>
        <div class="gallery-modal-meta-item">
            <div class="gallery-modal-meta-label">Category</div>
            <div class="gallery-modal-meta-value">${item[`category_${lang}`] || item.category_en}</div>
        </div>
    `;
    
    // Add stats
    Object.entries(item.stats).forEach(([key, value]) => {
        metaHTML += `
            <div class="gallery-modal-meta-item">
                <div class="gallery-modal-meta-label">${key}</div>
                <div class="gallery-modal-meta-value">${value}</div>
            </div>
        `;
    });
    
    meta.innerHTML = metaHTML;
    
    // Create and start carousel
    createEnhancedModalCarousel(item);
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Close enhanced gallery modal
window.closeEnhancedGalleryModal = function() {
    const modal = document.getElementById('gallery-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        stopModalCarousel();
    }
}

// Create enhanced modal carousel
function createEnhancedModalCarousel(item) {
    const carouselContainer = document.getElementById('gallery-modal-carousel-container');
    const indicatorsContainer = document.getElementById('gallery-modal-carousel-indicators');
    
    if (!carouselContainer || !indicatorsContainer) return;
    
    // Clear existing content
    carouselContainer.innerHTML = '';
    indicatorsContainer.innerHTML = '';
    
    const images = item.images || [item.image];
    
    // Create slides
    images.forEach((imageUrl, index) => {
        const slide = document.createElement('div');
        slide.className = 'gallery-modal-carousel-slide';
        slide.innerHTML = `<img src="${imageUrl}" alt="Activity Image ${index + 1}" loading="lazy">`;
        carouselContainer.appendChild(slide);
        
        // Create indicator
        const indicator = document.createElement('div');
        indicator.className = `gallery-modal-carousel-dot ${index === 0 ? 'active' : ''}`;
        indicator.addEventListener('click', () => goToEnhancedModalSlide(index));
        indicatorsContainer.appendChild(indicator);
    });
    
    // Reset to first slide
    currentModalSlide = 0;
    updateEnhancedModalCarousel();
    
    // Start auto-scroll if multiple images
    if (images.length > 1) {
        startModalCarousel(images.length);
    }
}

// Update enhanced modal carousel position
function updateEnhancedModalCarousel() {
    const carouselContainer = document.getElementById('gallery-modal-carousel-container');
    const indicators = document.querySelectorAll('.gallery-modal-carousel-dot');
    
    if (carouselContainer) {
        carouselContainer.style.transform = `translateX(-${currentModalSlide * 20}%)`;
    }
    
    // Update indicators
    indicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index === currentModalSlide);
    });
}

// Go to specific enhanced modal slide
function goToEnhancedModalSlide(slideIndex) {
    const indicators = document.querySelectorAll('.gallery-modal-carousel-dot');
    currentModalSlide = slideIndex;
    updateEnhancedModalCarousel();
    
    // Restart auto-scroll
    if (modalCarouselInterval) {
        clearInterval(modalCarouselInterval);
        startModalCarousel(indicators.length);
    }
}

// Previous modal slide
window.prevModalSlide = function() {
    const indicators = document.querySelectorAll('.gallery-modal-carousel-dot');
    currentModalSlide = currentModalSlide > 0 ? currentModalSlide - 1 : indicators.length - 1;
    updateEnhancedModalCarousel();
}

// Next modal slide
window.nextModalSlide = function() {
    const indicators = document.querySelectorAll('.gallery-modal-carousel-dot');
    currentModalSlide = (currentModalSlide + 1) % indicators.length;
    updateEnhancedModalCarousel();
}

// Start modal carousel auto-scroll
function startModalCarousel(totalSlides) {
    if (modalCarouselInterval) {
        clearInterval(modalCarouselInterval);
    }
    
    if (totalSlides > 1) {
        modalCarouselInterval = setInterval(() => {
            currentModalSlide = (currentModalSlide + 1) % totalSlides;
            updateEnhancedModalCarousel();
        }, 4000); // Change slide every 4 seconds
    }
}

// Stop modal carousel auto-scroll
function stopModalCarousel() {
    if (modalCarouselInterval) {
        clearInterval(modalCarouselInterval);
        modalCarouselInterval = null;
    }
}

// Initialize gallery when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeEnhancedGallery();
});

// Helper functions for gallery stats and categories
function getCategoryName(itemId) {
    const categories = {
        1: 'WELFARE',
        2: 'CONSERVATION', 
        3: 'EDUCATION',
        4: 'RESCUE',
        5: 'CELEBRATION',
        6: 'ENVIRONMENT'
    };
    return categories[itemId] || 'ACTIVITY';
}

function getStatNumber(itemId) {
    const stats = {
        1: '500+',
        2: '1000+',
        3: '250+',
        4: '50+',
        5: '200+',
        6: '∞'
    };
    return stats[itemId] || '100+';
}

function getStatLabel(itemId) {
    const labels = {
        1: 'CHILDREN HELPED',
        2: 'BIRDS FED DAILY',
        3: 'STUDENTS TRAINED',
        4: 'ANIMALS RESCUED',
        5: 'FAMILIES REACHED',
        6: 'ANIMALS HELPED'
    };
    return labels[itemId] || 'BENEFICIARIES';
}

function getSecondStatNumber(itemId) {
    const stats = {
        1: '15',
        2: '365',
        3: '15',
        4: '24/7',
        5: '5',
        6: '100+'
    };
    return stats[itemId] || '10';
}

function getSecondStatLabel(itemId) {
    const labels = {
        1: 'LOCATIONS',
        2: 'DAYS A YEAR',
        3: 'PARTNER SCHOOLS',
        4: 'EMERGENCY RESPONSE',
        5: 'FESTIVALS',
        6: 'LOCATIONS'
    };
    return labels[itemId] || 'LOCATIONS';
}

function getThirdStatNumber(itemId) {
    const stats = {
        1: '95%',
        2: '100%',
        3: '95%',
        4: '90%',
        5: '100%',
        6: '85%'
    };
    return stats[itemId] || '90%';
}

function getThirdStatLabel(itemId) {
    const labels = {
        1: 'SUCCESS RATE',
        2: 'ORGANIC FEED',
        3: 'SUCCESS RATE',
        4: 'RECOVERY RATE',
        5: 'SATISFACTION',
        6: 'SURVIVAL RATE'
    };
    return labels[itemId] || 'SUCCESS RATE';
}

// Animal Friends World Interactions
document.addEventListener('DOMContentLoaded', function () {
    // Initialize the animals with default state
    const animals = {
        'pets': {
            name: 'Buddy',
            happiness: 20,
            conversations: [
                'Hi friend! I\'m Buddy! Can you help me find some water? I\'m very thirsty!',
                'Thank you for the water! I feel much better now. Could I have some food too?',
                'Woof! You\'re the best! I\'m so happy now!'
            ],
            facts: [
                'Did you know? Dogs and cats need fresh water every day to stay healthy!',
                'Did you know? Pets need regular exercise to stay happy and healthy!'
            ],
            currentStep: 0
        },
        'parrot': {
            name: 'Rio',
            happiness: 20,
            conversations: [
                'Squawk! Hello there! I\'m Rio! I need a safe place to rest. Can you help me?',
                'Thank you for the shelter! I feel safer now. Could I have a perch to sit on?',
                'Squawk! This is perfect! I\'m so happy in my new home!'
            ],
            facts: [
                'Did you know? Parrots are among the smartest birds and can learn many words!',
                'Did you know? Some parrots can live for over 80 years!'
            ],
            currentStep: 0
        },
        'earth': {
            name: 'Earth',
            happiness: 20,
            conversations: [
                'I\'m Earth, home to all animals! I need your help to stay clean and healthy!',
                'Thank you for planting a tree! That helps me breathe. Can you clean up some trash too?',
                'You\'re amazing! When you help keep me clean, all animals have a better home!'
            ],
            facts: [
                'Did you know? Planting just one tree helps provide oxygen and homes for many animals!',
                'Did you know? Picking up trash helps keep animals safe from getting hurt!'
            ],
            currentStep: 0
        },
        'water': {
            name: 'Droplet',
            happiness: 20,
            conversations: [
                'Splash! I\'m Droplet! Can you help find 3 places to save water?',
                'You found one way to save water! Can you find two more?',
                'You found all three ways to save water! You\'re a water-saving hero!'
            ],
            facts: [
                'Did you know? Turning off the tap while brushing your teeth saves lots of water!',
                'Did you know? Many animals need clean water to survive!'
            ],
            currentStep: 0,
            dropsFound: 0
        },
        'bird-letter': {
            name: 'Chirpy',
            happiness: 20,
            conversations: [
                'Tweet! I\'m Chirpy! I have a special letter for you! Click to read it!',
                'Thank you for reading my letter! You\'ve helped all my animal friends!',
                'Tweet! You\'ve earned all your helper badges! You\'re a true animal friend!'
            ],
            facts: [
                'Did you know? Small birds like me need birdhouses to stay safe!',
                'Did you know? Leaving out water for birds helps us during hot summer days!'
            ],
            currentStep: 0
        }
    };

    // Set up event listeners for all help buttons
    document.querySelectorAll('.help-button').forEach(button => {
        button.addEventListener('click', function () {
            const action = this.getAttribute('data-action');
            const animalCard = this.closest('.animal-friend-card');
            const animalType = animalCard.getAttribute('data-animal');
            const animal = animals[animalType];

            // Update the animal's state based on the action
            handleAnimalInteraction(animalType, action);
        });
    });

    // Set up event listeners for water drops
    document.querySelectorAll('.water-drop').forEach(drop => {
        drop.addEventListener('click', function () {
            const dropNumber = this.getAttribute('data-drop');
            const animal = animals['water'];

            if (!this.classList.contains('found')) {
                this.classList.add('found');
                animal.dropsFound++;

                // Update happiness and conversation based on drops found
                if (animal.dropsFound === 1) {
                    updateAnimalState('water', 40, 1);
                } else if (animal.dropsFound === 2) {
                    updateAnimalState('water', 70, 1);
                } else if (animal.dropsFound === 3) {
                    updateAnimalState('water', 100, 2);
                    awardBadge('water-helper');
                }
            }
        });
    });

    function handleAnimalInteraction(animalType, action) {
        const animal = animals[animalType];

        // Handle different actions for different animals
        switch (animalType) {
            case 'pets':
                if (action === 'give-water' && animal.currentStep === 0) {
                    updateAnimalState(animalType, 60, 1);
                } else if (action === 'give-food' && animal.currentStep === 1) {
                    updateAnimalState(animalType, 100, 2);
                    awardBadge('animal-friend');
                }
                break;

            case 'parrot':
                if (action === 'give-shelter' && animal.currentStep === 0) {
                    updateAnimalState(animalType, 60, 1);
                } else if (action === 'give-perch' && animal.currentStep === 1) {
                    updateAnimalState(animalType, 100, 2);
                    awardBadge('shelter-provider');
                }
                break;

            case 'earth':
                if (action === 'plant-tree' && animal.currentStep === 0) {
                    updateAnimalState(animalType, 60, 1);
                } else if (action === 'clean-up' && animal.currentStep === 1) {
                    updateAnimalState(animalType, 100, 2);
                    awardBadge('earth-protector');
                }
                break;

            case 'bird-letter':
                if (action === 'read-letter') {
                    updateAnimalState(animalType, 100, 1);
                    // Show the letter content
                    const letterContent = document.querySelector(`[data-animal="bird-letter"] .letter-content`);
                    letterContent.classList.remove('hidden');

                    // Check if all badges are earned
                    checkAllBadges();
                }
                break;
        }
    }

    function updateAnimalState(animalType, happiness, conversationStep) {
        const animal = animals[animalType];
        animal.happiness = happiness;
        animal.currentStep = conversationStep;

        // Update the happiness meter
        const happinessMeter = document.querySelector(`[data-animal="${animalType}"] .happiness-fill`);
        happinessMeter.style.width = `${animal.happiness}%`;

        // Update the conversation text
        const speechBubble = document.querySelector(`[data-animal="${animalType}"] .speech-bubble p`);
        speechBubble.textContent = animal.conversations[conversationStep];

        // Show a fact
        const factBubble = document.querySelector(`[data-animal="${animalType}"] .fact-bubble`);
        factBubble.classList.remove('hidden');

        // Add visual effects for happiness
        const animalCard = document.querySelector(`[data-animal="${animalType}"]`);
        animalCard.classList.add('happy-animation');
        setTimeout(() => {
            animalCard.classList.remove('happy-animation');
        }, 1000);
    }

    function awardBadge(badgeType) {
        const badge = document.querySelector(`[data-badge="${badgeType}"]`);
        badge.classList.add('earned');

        // Add celebration effect
        badge.classList.add('celebration');
        setTimeout(() => {
            badge.classList.remove('celebration');
        }, 3000);
    }

    function checkAllBadges() {
        const allBadges = document.querySelectorAll('.badge.earned');
        if (allBadges.length === 4) {
            // All badges earned - show final celebration
            document.querySelector('.badges-container').classList.add('all-complete');

            // Update Chirpy's message
            updateAnimalState('bird-letter', 100, 2);
        }
    }
});

// Gallery functionality
let activitiesGalleryData = [];
let activitiesSlider = null;

// Activities Gallery Slider Class
class ActivitiesGallerySlider {
    constructor() {
        this.slider = document.getElementById('activitiesSlider');
        this.slides = [];
        this.currentSlide = 0;
        this.totalSlides = 0;
        this.isPlaying = true;
        this.autoplayDelay = 6000;
        this.progressBar = document.getElementById('activitiesProgressBar');
        this.data = [];
        
        this.init();
    }

    async init() {
        await this.loadData();
        this.createSlides();
        this.createDots();
        this.setupEventListeners();
        this.startAutoplay();
        this.updateProgressBar();
        this.updateNavigationState();
    }

    async loadData() {
        try {
            const response = await fetch('/api/activities-gallery');
            const result = await response.json();
            this.data = result.data || [];
            this.totalSlides = this.data.length;
        } catch (error) {
            console.error('Error loading activities gallery data:', error);
            this.data = [];
            this.totalSlides = 0;
        }
    }

    createSlides() {
        if (!this.data.length) {
            this.slider.innerHTML = '<div class="slide"><div class="slide-content"><p>No activities available</p></div></div>';
            return;
        }

        this.slider.innerHTML = this.data.map(item => {
            const stats = this.generateStats(item);
            return `
                <div class="slide">
                    <div class="slide-content">
                        <div class="slide-image" onclick="openGalleryModal('${escapeHtmlAttribute(item.id)}')">
                            <img src="${escapeHtmlAttribute(item.image)}" alt="${escapeHtmlAttribute(item.title_en)}">
                        </div>
                        <div class="slide-text">
                            <span class="slide-category">${escapeTemplateString(item.category_en)}</span>
                            <h2 class="slide-title" onclick="openGalleryModal('${escapeHtmlAttribute(item.id)}')">${escapeTemplateString(item.title_en)}</h2>
                            <p class="slide-description">${escapeTemplateString(item.description_en)}</p>
                            <div class="slide-stats">
                                ${stats.map(stat => `
                                    <div class="stat">
                                        <span class="stat-number">${stat.value}</span>
                                        <span class="stat-label">${stat.label}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        this.slides = this.slider.children;
    }

    generateStats(item) {
        const statsMap = {
            'WELFARE': [
                { value: '500+', label: 'Beneficiaries' },
                { value: '15', label: 'Locations' },
                { value: '100%', label: 'Success Rate' }
            ],
            'EDUCATION': [
                { value: '300+', label: 'Students' },
                { value: '15', label: 'Schools' },
                { value: '95%', label: 'Success Rate' }
            ],
            'RESCUE': [
                { value: '50+', label: 'Animals Rescued' },
                { value: '24/7', label: 'Response Time' },
                { value: '100%', label: 'Recovery Rate' }
            ],
            'CONSERVATION': [
                { value: '1000+', label: 'Birds Helped' },
                { value: '365', label: 'Days Active' },
                { value: '50+', label: 'Locations' }
            ],
            'CELEBRATION': [
                { value: '200+', label: 'Families' },
                { value: '5', label: 'Festivals' },
                { value: '1000+', label: 'Children' }
            ],
            'ENVIRONMENT': [
                { value: '100+', label: 'Water Bowls' },
                { value: '100+', label: 'Locations' },
                { value: '365', label: 'Days Active' }
            ]
        };
        
        return statsMap[item.category_en] || [
            { value: '100+', label: 'Beneficiaries' },
            { value: '10', label: 'Locations' },
            { value: '90%', label: 'Success Rate' }
        ];
    }

    createDots() {
        const dotsContainer = document.getElementById('activitiesDotsContainer');
        dotsContainer.innerHTML = '';
        
        for (let i = 0; i < this.totalSlides; i++) {
            const dot = document.createElement('div');
            dot.className = `dot ${i === 0 ? 'active' : ''}`;
            dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
            dot.setAttribute('tabindex', '0');
            dot.addEventListener('click', () => this.goToSlide(i));
            dot.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.goToSlide(i);
                }
            });
            dotsContainer.appendChild(dot);
        }
    }

    setupEventListeners() {
        const container = document.querySelector('.slider-container');
        const prevBtn = document.getElementById('activitiesPrevBtn');
        const nextBtn = document.getElementById('activitiesNextBtn');

        // Pause on hover
        container.addEventListener('mouseenter', () => {
            this.pauseAutoplay();
        });

        container.addEventListener('mouseleave', () => {
            this.resumeAutoplay();
        });

        // Navigation buttons
        prevBtn.addEventListener('click', () => this.previousSlide());
        nextBtn.addEventListener('click', () => this.nextSlide());

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.previousSlide();
            } else if (e.key === 'ArrowRight') {
                this.nextSlide();
            }
        });

        // Touch/swipe support
        let startX = 0;
        let startY = 0;
        
        container.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            this.pauseAutoplay();
        });

        container.addEventListener('touchend', (e) => {
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const diffX = startX - endX;
            const diffY = startY - endY;

            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    this.nextSlide();
                } else {
                    this.previousSlide();
                }
            }
            this.resumeAutoplay();
        });
    }

    goToSlide(index) {
        this.currentSlide = index;
        this.updateSlider();
        this.resetAutoplay();
    }

    nextSlide() {
        this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
        this.updateSlider();
    }

    previousSlide() {
        this.currentSlide = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
        this.updateSlider();
    }

    updateSlider() {
        const offset = -this.currentSlide * 100;
        this.slider.style.transform = `translateX(${offset}%)`;
        this.updateDots();
        this.updateProgressBar();
        this.updateNavigationState();
    }

    updateDots() {
        const dots = document.querySelectorAll('#activitiesDotsContainer .dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentSlide);
        });
    }

    updateProgressBar() {
        const progress = ((this.currentSlide + 1) / this.totalSlides) * 100;
        this.progressBar.style.width = `${progress}%`;
    }

    updateNavigationState() {
        const prevBtn = document.getElementById('activitiesPrevBtn');
        const nextBtn = document.getElementById('activitiesNextBtn');
        
        prevBtn.disabled = false;
        nextBtn.disabled = false;
    }

    startAutoplay() {
        this.autoplayInterval = setInterval(() => {
            if (this.isPlaying) {
                this.nextSlide();
            }
        }, this.autoplayDelay);
    }

    pauseAutoplay() {
        this.isPlaying = false;
    }

    resumeAutoplay() {
        this.isPlaying = true;
    }

    resetAutoplay() {
        clearInterval(this.autoplayInterval);
        this.startAutoplay();
    }
}

// Load gallery data (keeping for modal functionality)
async function loadGalleryData() {
    const loadingElement = document.getElementById('gallery-loading');
    
    try {
        loadingElement.classList.remove('hidden');
        
        const response = await fetch('/api/activities-gallery');
        const result = await response.json();
        
        activitiesGalleryData = result.data || [];
        
    } catch (error) {
        console.error('Error loading gallery data:', error);
        console.log('Failed to load activities. Please try again later.');
    } finally {
        loadingElement.classList.add('hidden');
    }
}

// Open gallery modal
function openGalleryModal(itemId) {
    const item = activitiesGalleryData.find(item => item.id === itemId);
    if (!item) return;
    
    // Create modal if it doesn't exist
    createGalleryModal();
    
    const modal = document.getElementById('gallery-modal');
    const title = document.getElementById('gallery-modal-title');
    const description = document.getElementById('gallery-modal-description');
    const date = document.getElementById('gallery-modal-date');
    const category = document.getElementById('gallery-modal-category');
    const stats = document.getElementById('gallery-modal-stats');
    
    // Update modal content
    title.textContent = item.title_en;
    description.textContent = item.description_en;
    date.textContent = new Date(item.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    category.textContent = item.category_en;
    
    // Update stats
    const activityStats = getActivityStats(item.category_en, item.id);
    stats.innerHTML = Object.entries(activityStats).map(([key, value]) => 
        `<div class="stat-item">
            <div class="stat-value">${value}</div>
            <div class="stat-label">${key}</div>
        </div>`
    ).join('');
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Initialize carousel
    initializeModalCarousel(item);
}

// Create gallery modal
function createGalleryModal() {
    const existingModal = document.getElementById('gallery-modal');
    if (existingModal) return;
    
    const modal = document.createElement('div');
    modal.id = 'gallery-modal';
    modal.className = 'gallery-modal';
    
    modal.innerHTML = `
        <div class="gallery-modal-content">
            <div class="gallery-modal-header">
                <h2 id="gallery-modal-title">Activity Details</h2>
                <button class="gallery-modal-close" onclick="closeGalleryModal()">&times;</button>
            </div>
            <div class="gallery-modal-body">
                <div class="gallery-modal-carousel">
                    <div class="gallery-modal-carousel-container">
                        <!-- Carousel slides will be inserted here -->
                    </div>
                    <button class="gallery-modal-carousel-nav prev" onclick="prevCarouselSlide()">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <button class="gallery-modal-carousel-nav next" onclick="nextCarouselSlide()">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                    <div class="gallery-modal-carousel-indicators">
                        <!-- Indicators will be inserted here -->
                    </div>
                </div>
                <div class="gallery-modal-details">
                    <p id="gallery-modal-description"></p>
                    <div class="gallery-modal-meta">
                        <div class="meta-item">
                            <strong>Date:</strong>
                            <span id="gallery-modal-date"></span>
                        </div>
                        <div class="meta-item">
                            <strong>Category:</strong>
                            <span id="gallery-modal-category"></span>
                        </div>
                    </div>
                    <div id="gallery-modal-stats" class="gallery-modal-stats">
                        <!-- Stats will be inserted here -->
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeGalleryModal();
        }
    });
}

// Close gallery modal
function closeGalleryModal() {
    const modal = document.getElementById('gallery-modal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Initialize gallery modal carousel
function initializeModalCarousel(item) {
    const carouselContainer = document.querySelector('.gallery-modal-carousel-container');
    const indicatorsContainer = document.querySelector('.gallery-modal-carousel-indicators');
    
    // Clear existing content
    carouselContainer.innerHTML = '';
    indicatorsContainer.innerHTML = '';
    
    const images = item.images || [item.image];
    
    // Create slides
    images.forEach((imageUrl, index) => {
        const slide = document.createElement('div');
        slide.className = 'gallery-modal-carousel-slide';
        slide.innerHTML = `<img src="${imageUrl}" alt="Activity Image ${index + 1}">`;
        carouselContainer.appendChild(slide);
        
        // Create indicator
        const indicator = document.createElement('div');
        indicator.className = `gallery-modal-carousel-dot ${index === 0 ? 'active' : ''}`;
        indicator.addEventListener('click', () => goToCarouselSlide(index));
        indicatorsContainer.appendChild(indicator);
    });
    
    // Initialize carousel state
    window.currentCarouselSlide = 0;
    updateCarouselPosition();
    
    // Start auto-scroll if multiple images
    if (images.length > 1) {
        startCarouselAutoScroll(images.length);
    }
}

// Carousel navigation functions
window.prevCarouselSlide = function() {
    const slides = document.querySelectorAll('.gallery-modal-carousel-slide');
    window.currentCarouselSlide = window.currentCarouselSlide > 0 ? 
        window.currentCarouselSlide - 1 : slides.length - 1;
    updateCarouselPosition();
}

window.nextCarouselSlide = function() {
    const slides = document.querySelectorAll('.gallery-modal-carousel-slide');
    window.currentCarouselSlide = (window.currentCarouselSlide + 1) % slides.length;
    updateCarouselPosition();
}

function goToCarouselSlide(slideIndex) {
    window.currentCarouselSlide = slideIndex;
    updateCarouselPosition();
}

function updateCarouselPosition() {
    const carouselContainer = document.querySelector('.gallery-modal-carousel-container');
    const offset = -window.currentCarouselSlide * 100;
    carouselContainer.style.transform = `translateX(${offset}%)`;
    updateCarouselIndicators(window.currentCarouselSlide);
}

function startCarouselAutoScroll(totalSlides) {
    if (window.carouselInterval) {
        clearInterval(window.carouselInterval);
    }
    
    window.carouselInterval = setInterval(() => {
        window.currentCarouselSlide = (window.currentCarouselSlide + 1) % totalSlides;
        updateCarouselPosition();
    }, 4000);
}

function updateCarouselIndicators(currentIndex) {
    const indicators = document.querySelectorAll('.gallery-modal-carousel-dot');
    indicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index === currentIndex);
    });
}

// Animal Friends World functionality
let animalProgress = {
    pets: 20,
    parrot: 20,
    earth: 20,
    water: 20,
    'bird-letter': 20
};

let badges = {
    'animal-friend': false,
    'shelter-provider': false,
    'earth-protector': false,
    'water-helper': false
};

// Setup animal interactions
function setupAnimalInteractions() {
    // Help buttons
    document.querySelectorAll('.help-button').forEach(button => {
        button.addEventListener('click', function() {
            const action = this.dataset.action;
            const animalCard = this.closest('.animal-friend-card');
            const animalType = animalCard.dataset.animal;
            
            handleAnimalAction(animalType, action);
        });
    });
    
    // Water drops
    document.querySelectorAll('.water-drop').forEach(drop => {
        drop.addEventListener('click', function() {
            if (!this.classList.contains('found')) {
                this.classList.add('found');
                handleWaterDrop();
            }
        });
    });
}

function handleAnimalAction(animalType, action) {
    const progressBar = document.querySelector(`[data-animal="${animalType}"] .happiness-fill`);
    const speechBubble = document.querySelector(`[data-animal="${animalType}"] .speech-bubble p`);
    
    // Update progress based on animal and action
    switch (animalType) {
        case 'pets':
            if (action === 'give-water') {
                animalProgress.pets = 60;
                speechBubble.textContent = "Thank you for the water! I feel much better now. Could I have some food too?";
            } else if (action === 'give-food') {
                animalProgress.pets = 100;
                speechBubble.textContent = "Woof! You're the best! I'm so happy now!";
                earnBadge('animal-friend');
            }
            break;
            
        case 'parrot':
            if (action === 'give-shelter') {
                animalProgress.parrot = 60;
                speechBubble.textContent = "Thank you for the shelter! I feel safer now. Could I have a perch to sit on?";
            } else if (action === 'give-perch') {
                animalProgress.parrot = 100;
                speechBubble.textContent = "Squawk! This is perfect! I'm so happy in my new home!";
                earnBadge('shelter-provider');
            }
            break;
            
        case 'earth':
            if (action === 'plant-tree') {
                animalProgress.earth = 60;
                speechBubble.textContent = "Thank you for planting a tree! That helps me breathe. Can you clean up some trash too?";
            } else if (action === 'clean-up') {
                animalProgress.earth = 100;
                speechBubble.textContent = "You're amazing! When you help keep me clean, all animals have a better home!";
                earnBadge('earth-protector');
            }
            break;
            
        case 'bird-letter':
            if (action === 'read-letter') {
                animalProgress['bird-letter'] = 100;
                speechBubble.textContent = "Thank you for reading my letter! You've helped all my animal friends!";
                document.querySelector(`[data-animal="bird-letter"] .letter-content`).classList.remove('hidden');
                checkAllBadges();
            }
            break;
    }
    
    // Update progress bar
    progressBar.style.width = `${animalProgress[animalType]}%`;
    
    // Add happy animation
    const animalCard = document.querySelector(`[data-animal="${animalType}"]`);
    animalCard.classList.add('happy-animation');
    setTimeout(() => {
        animalCard.classList.remove('happy-animation');
    }, 1000);
}

let waterDropsFound = 0;

function handleWaterDrop() {
    waterDropsFound++;
    const speechBubble = document.querySelector(`[data-animal="water"] .speech-bubble p`);
    const progressBar = document.querySelector(`[data-animal="water"] .happiness-fill`);
    
    if (waterDropsFound === 1) {
        animalProgress.water = 40;
        speechBubble.textContent = "You found one way to save water! Can you find two more?";
    } else if (waterDropsFound === 2) {
        animalProgress.water = 70;
        speechBubble.textContent = "Great! You found another way! Just one more to go!";
    } else if (waterDropsFound === 3) {
        animalProgress.water = 100;
        speechBubble.textContent = "You found all three ways to save water! You're a water-saving hero!";
        earnBadge('water-helper');
    }
    
    progressBar.style.width = `${animalProgress.water}%`;
}

function earnBadge(badgeType) {
    badges[badgeType] = true;
    const badge = document.querySelector(`[data-badge="${badgeType}"]`);
    badge.classList.add('earned');
    
    // Add celebration effect
    badge.classList.add('celebration');
    setTimeout(() => {
        badge.classList.remove('celebration');
    }, 3000);
}

function checkAllBadges() {
    const earnedBadges = Object.values(badges).filter(earned => earned).length;
    if (earnedBadges === 4) {
        document.querySelector('.badges-container').classList.add('all-complete');
        const chirpySpeech = document.querySelector(`[data-animal="bird-letter"] .speech-bubble p`);
        chirpySpeech.textContent = "Tweet! You've earned all your helper badges! You're a true animal friend!";
    }
}

// Utility functions for escaping HTML
function escapeHtmlAttribute(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function escapeTemplateString(text) {
    return text.replace(/&/g, '&amp;')
               .replace(/</g, '&lt;')
               .replace(/>/g, '&gt;')
               .replace(/"/g, '&quot;')
               .replace(/'/g, '&#39;');
}

// Modal functionality for products
window.openModal = function (productId) {
    const modal = document.getElementById(productId + 'Modal');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

window.closeModal = function (productId) {
    const modal = document.getElementById(productId + 'Modal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Close modal when clicking outside
window.onclick = function (event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Color picker functionality
window.selectColor = function (element) {
    // Remove selected class from all color options in the same modal
    const colorOptions = element.parentNode.querySelectorAll('.color-option');
    colorOptions.forEach(option => option.classList.remove('selected'));

    // Add selected class to clicked option
    element.classList.add('selected');
}

// Language Switcher JavaScript
document.addEventListener('DOMContentLoaded', function () {
    // Language dictionaries
    const translations = {
        'hi': {
            'hero-title': 'जेवी_हेल्प',
            'hero-slogan': 'हील हेल्प प्रोटेक्ट',
            'section-title': 'श्री जयवीर जीवदया ग्रुप द्वारा परोपकारी गतिविधियां',
            'winter-care': 'सर्दी की देखभाल',
            'winter-desc': 'सर्दी के मौसम में वंचित बच्चों को स्वेटर और कंबल का वितरण।',
            'festival-joy': 'त्योहार की खुशी',
            'festival-desc': 'दिवाली त्योहार के दौरान बच्चों को मिठाई और नाश्ते का वितरण।',
            'animal-welfare': 'पशु कल्याण',
            'animal-desc': 'गर्मियों के दौरान जानवरों और पक्षियों को हाइड्रेटेड रखने के लिए पानी के कटोरे का मुफ्त वितरण।',
            'wildlife-conservation': 'वन्यजीव संरक्षण',
            'wildlife-desc': 'वन्यजीव संरक्षण को प्रोत्साहित करने के लिए गौरैया के लिए पक्षीघरों का मुफ्त वितरण।',
            'daily-feeding': 'दैनिक भोजन',
            'daily-desc': 'पक्षियों को अनाज का दैनिक खिलाना।',
            'educational-support': 'शैक्षिक सहायता',
            'educational-desc': 'शैक्षिक सहायता की आवश्यकता वाले वंचित बच्चों को मुफ्त नोटबुक का प्रावधान।',
            'animal-rescue': 'पशु बचाव',
            'animal-rescue-desc': 'संकटग्रस्त जानवरों, पक्षियों और सांपों का बचाव और सुरक्षित पुनर्स्थापना।',
            'year-round-support': 'वर्ष भर सहायता',
            'year-round-desc': 'पशु कल्याण को बढ़ावा देने के लिए पक्षीघरों, पक्षी फीडर और पानी के कटोरे का 365 दिन वितरण।',
        },
        'gu': {
            'hero-title': 'જેવી_હેલ્પ',
            'hero-slogan': 'હીલ હેલ્પ પ્રોટેક્ટ',
            'section-title': 'શ્રી જયવીર જીવદયા ગ્રુપ દ્વારા પરોપકારી પ્રવૃત્તિઓ',
            'winter-care': 'શિયાળાની સંભાળ',
            'winter-desc': 'શિયાળાની ઋતુ દરમિયાન વંચિત બાળકોને સ્વેટર અને ધાબળાનું વિતરણ.',
            'festival-joy': 'તહેવારની ખુશી',
            'festival-desc': 'દિવાળી તહેવાર દરમિયાન બાળકોને મીઠાઈ અને નાસ્તાનું વિતરણ.',
            'animal-welfare': 'પશુ કલ્યાણ',
            'animal-desc': 'ઉનાળા દરમિયાન પ્રાણીઓ અને પક્ષીઓને હાઇડ્રેટેડ રાખવા માટે પાણીના વાટકાનું મફત વિતરણ.',
            'wildlife-conservation': 'વન્યજીવન સંરક્ષણ',
            'wildlife-desc': 'વન્યજીવન સંરક્ષણને પ્રોત્સાહન આપવા માટે ચકલીઓ માટે પક્ષીઘરનું મફત વિતરણ.',
            'daily-feeding': 'રોજનું ખવડાવવું',
            'daily-desc': 'પક્ષીઓને અનાજનું દૈનિક ખવડાવવું.',
            'educational-support': 'શૈક્ષણિક સહાય',
            'educational-desc': 'શૈક્ષણિક સહાયની જરૂર હોય તેવા વંચિત બાળકોને મફત નોટબુકની જોગવાઈ.',
            'animal-rescue': 'પશુ બચાવ',
            'animal-rescue-desc': 'સંકટમાં પડેલા પ્રાણીઓ, પક્ષીઓ અને સાપનું બચાવ અને સુરક્ષિત પુનઃસ્થાપન.',
            'year-round-support': 'વર્ષભર સહાય',
            'year-round-desc': 'પશુ કલ્યાણને પ્રોત્સાહન આપવા માટે પક્ષીઘર, પક્ષી ફીડર અને પાણીના વાટકાનું 365-દિવસનું વિતરણ.',
        }
    };

    // DOM Elements
    const languageToggle = document.getElementById('language-toggle');
    const languageMenu = document.getElementById('language-menu');
    const languageOptions = document.querySelectorAll('.language-option');
    const currentLanguageDisplay = document.querySelector('.current-language');
    const languagePrompt = document.getElementById('language-prompt');
    const promptSwitchBtn = document.getElementById('prompt-switch');
    const promptCloseBtn = document.getElementById('prompt-close');

    // Add pulse effect to language toggle initially
    languageToggle.classList.add('pulse');
    setTimeout(() => {
        languageToggle.classList.remove('pulse');
    }, 3000);

    // Show/hide language menu
    languageToggle.addEventListener('click', function () {
        languageMenu.classList.toggle('show');
    });

    // Handle language selection
    languageOptions.forEach(option => {
        option.addEventListener('click', function () {
            const language = this.getAttribute('data-lang');
            switchLanguageGlobally(language);
            currentLanguageDisplay.textContent = this.textContent;
            languageMenu.classList.remove('show');

            // Show animation feedback
            languageToggle.classList.add('pulse');
            setTimeout(() => {
                languageToggle.classList.remove('pulse');
            }, 1000);
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function (event) {
        if (!event.target.closest('.language-switcher')) {
            languageMenu.classList.remove('show');
        }
    });

    // Add data-lang-key attributes to elements
    function initTranslatableElements() {
        const elementsToTranslate = [
            { selector: '.hero-title', key: 'hero-title' },
            { selector: '.hero-slogan', key: 'hero-slogan' },
            { selector: '.activities-section .section-title', key: 'section-title' },
            { selector: '.activity-card:nth-child(1) .activity-title', key: 'winter-care' },
            { selector: '.activity-card:nth-child(1) .activity-description', key: 'winter-desc' },
            { selector: '.activity-card:nth-child(2) .activity-title', key: 'festival-joy' },
            { selector: '.activity-card:nth-child(2) .activity-description', key: 'festival-desc' },
            { selector: '.activity-card:nth-child(3) .activity-title', key: 'animal-welfare' },
            { selector: '.activity-card:nth-child(3) .activity-description', key: 'animal-desc' },
            { selector: '.activity-card:nth-child(4) .activity-title', key: 'wildlife-conservation' },
            { selector: '.activity-card:nth-child(4) .activity-description', key: 'wildlife-desc' },
            { selector: '.activity-card:nth-child(5) .activity-title', key: 'daily-feeding' },
            { selector: '.activity-card:nth-child(5) .activity-description', key: 'daily-desc' },
            { selector: '.activity-card:nth-child(6) .activity-title', key: 'educational-support' },
            { selector: '.activity-card:nth-child(6) .activity-description', key: 'educational-desc' },
            { selector: '.activity-card:nth-child(7) .activity-title', key: 'animal-rescue' },
            { selector: '.activity-card:nth-child(7) .activity-description', key: 'animal-rescue-desc' },
            { selector: '.activity-card:nth-child(8) .activity-title', key: 'year-round-support' },
            { selector: '.activity-card:nth-child(8) .activity-description', key: 'year-round-desc' },
        ];

        elementsToTranslate.forEach(item => {
            const elements = document.querySelectorAll(item.selector);
            elements.forEach(element => {
                element.setAttribute('data-lang-key', item.key);
            });
        });
    }

    initTranslatableElements();

    // Show language prompt after 10 seconds
    setTimeout(() => {
        showLanguagePrompt();
    }, 10000);

    function showLanguagePrompt() {
        languagePrompt.classList.add('show');
        languageToggle.classList.add('pulse');
        setTimeout(() => {
            languageToggle.classList.remove('pulse');
        }, 3000);
    }

    // Prompt buttons
    promptSwitchBtn.addEventListener('click', function () {
        languageMenu.classList.add('show');
        languagePrompt.classList.remove('show');
    });

    promptCloseBtn.addEventListener('click', function () {
        languagePrompt.classList.remove('show');
    });
});

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load hero content
    loadHeroContent();
    
    // Load gallery data for modals
    loadGalleryData();
    
    // Initialize activities gallery slider
    activitiesSlider = new ActivitiesGallerySlider();
    
    // Setup animal friends interactions
    setupAnimalInteractions();
    
    // Load products
    loadProducts();
});