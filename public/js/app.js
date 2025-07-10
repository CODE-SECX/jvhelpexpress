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
    
    // Update language switcher display
    updateLanguageDisplay(newLanguage);
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

// Animal Friends World Interactions
document.addEventListener('DOMContentLoaded', function () {
    // Load hero content from API
    loadHeroContent();

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
            switchLanguage(language);
            currentLanguageDisplay.textContent = this.textContent;
            languageMenu.classList.remove('show');

            // Show animation feedback
            languageToggle.classList.add('pulse');
            setTimeout(() => {
                languageToggle.classList.remove('pulse');
            }, 1000);
            
            // Use the global language switching function
            switchLanguageGlobally(language);
        });
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