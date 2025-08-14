// Admin Dashboard Script
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const token = localStorage.getItem('admin_token');
    if (!token || isTokenExpired()) {
        window.location.href = 'index.html';
        return;
    }

    // Initialize dashboard
    loadDashboard();
    setupEventListeners();
});

// Function to check if token is expired
function isTokenExpired() {
    try {
        const expiresAt = localStorage.getItem('admin_token_expires');
        if (!expiresAt) return true;
        return new Date(expiresAt) <= new Date();
    } catch (error) {
        return true;
    }
}

function setupEventListeners() {
    // Logout button
    document.getElementById('logout-btn').addEventListener('click', logout);
}

async function loadDashboard() {
    try {
        const response = await fetchWithAuth('/api/admin/dashboard');
        const result = await response.json();

        if (response.ok && result.success) {
            displayModules(result.modules);
        } else {
            throw new Error(result.error || 'Failed to load dashboard');
        }

    } catch (error) {
        console.error('Dashboard load error:', error);
        showError('Failed to load dashboard');
    }
}

function displayModules(modules) {
    const modulesGrid = document.getElementById('modules-grid');
    if (!modulesGrid) return;

    modulesGrid.innerHTML = '';

    modules.forEach(module => {
        const moduleCard = document.createElement('div');
        moduleCard.className = 'module-card';
        moduleCard.innerHTML = `
            <div class="module-icon">${module.icon}</div>
            <h3 class="module-name">${module.name}</h3>
            <p class="module-description">${module.description}</p>
        `;

        moduleCard.addEventListener('click', () => {
            if (module.id === 'hero-content') {
                showHeroContentSection();
            } else if (module.id === 'products') {
                showProductsSection();
            }
        });

        modulesGrid.appendChild(moduleCard);
    });
}

function showDashboard() {
    // Hide all module contents
    document.querySelectorAll('.module-content').forEach(content => {
        content.classList.add('hidden');
    });

    // Show dashboard
    document.querySelector('.dashboard-container').classList.remove('hidden');
}

function showHeroContentSection() {
    // Hide dashboard
    document.querySelector('.dashboard-container').classList.add('hidden');

    // Hide other module contents
    document.querySelectorAll('.module-content').forEach(content => {
        content.classList.add('hidden');
    });

    // Show hero content section
    document.getElementById('hero_content_content').classList.remove('hidden');

    // Load hero content data
    loadHeroContent();
    setupHeroContentEventListeners();
}

function showProductsSection() {
    // Hide dashboard
    document.querySelector('.dashboard-container').classList.add('hidden');

    // Hide other module contents
    document.querySelectorAll('.module-content').forEach(content => {
        content.classList.add('hidden');
    });

    // Show products section
    document.getElementById('products_content').classList.remove('hidden');

    // Load products data
    loadProductsList();
    setupProductsEventListeners();
}

function displayProductsList(products) {
    const tbody = document.getElementById('products-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (!products || products.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-state">
                    No products found. <button onclick="openProductModal()" class="btn btn-small btn-primary">Add your first product</button>
                </td>
            </tr>
        `;
        return;
    }

    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                ${product.image_url ? 
                    `<img src="${product.image_url}" alt="${product.name_en}" class="product-thumbnail">` : 
                    '<div class="product-thumbnail-placeholder">📷</div>'
                }
            </td>
            <td>${product.name_en}</td>
            <td>${product.category_en || 'Uncategorized'}</td>
            <td>${product.currency} ${product.price.toFixed(2)}</td>
            <td>${product.stock_quantity}</td>
            <td>
                <span class="status-badge ${product.is_active ? 'active' : 'inactive'}">
                    ${product.is_active ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td>
                <span class="featured-badge ${product.is_featured ? 'featured' : ''}">
                    ${product.is_featured ? '⭐ Featured' : ''}
                </span>
            </td>
            <td class="actions">
                <button onclick="editProduct('${product.id}')" class="btn btn-small btn-secondary" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteProduct('${product.id}')" class="btn btn-small btn-danger" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function setupProductsEventListeners() {
    // Add product button
    const addBtn = document.getElementById('add-product-btn');
    if (addBtn) {
        addBtn.onclick = () => openProductModal();
    }

    // Refresh button
    const refreshBtn = document.getElementById('refresh-products-btn');
    if (refreshBtn) {
        refreshBtn.onclick = loadProductsList;
    }

    // Product form
    const form = document.getElementById('product-form');
    if (form) {
        form.onsubmit = handleProductSubmit;
    }
}

function openProductModal(productId = null) {
    const modal = document.getElementById('product-form-modal');
    const title = document.getElementById('product-form-title');
    const form = document.getElementById('product-form');

    if (productId) {
        title.textContent = 'Edit Product';
        // Load product data for editing
        loadProductForEdit(productId);
    } else {
        title.textContent = 'Add New Product';
        form.reset();
    }

    modal.classList.remove('hidden');
}

function closeProductModal() {
    const modal = document.getElementById('product-form-modal');
    modal.classList.add('hidden');
}

async function handleProductSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const productData = Object.fromEntries(formData.entries());

    // Convert checkboxes
    productData.is_active = formData.has('is_active');
    productData.is_featured = formData.has('is_featured');

    try {
        const isEditing = e.target.dataset.productId;
        const url = isEditing ? `/api/admin/products/${isEditing}` : '/api/admin/products';
        const method = isEditing ? 'PUT' : 'POST';

        const response = await fetchWithAuth(url, {
            method,
            body: JSON.stringify(productData)
        });

        const result = await response.json();

        if (response.ok) {
            showSuccess(result.message || 'Product saved successfully');
            closeProductModal();
            loadProductsList();
        } else {
            throw new Error(result.error || 'Failed to save product');
        }
    } catch (error) {
        console.error('Product save error:', error);
        showError('Failed to save product');
    }
}

async function editProduct(productId) {
    try {
        const response = await fetchWithAuth(`/api/admin/products`);
        const result = await response.json();

        if (response.ok) {
            const product = result.data.find(p => p.id === productId);
            if (product) {
                populateProductForm(product);
                openProductModal(productId);
            }
        }
    } catch (error) {
        console.error('Product edit error:', error);
        showError('Failed to load product for editing');
    }
}

function populateProductForm(product) {
    const form = document.getElementById('product-form');
    form.dataset.productId = product.id;

    // Populate form fields
    const fields = [
        'name_en', 'name_hi', 'name_gu',
        'description_en', 'description_hi', 'description_gu',
        'category_en', 'category_hi', 'category_gu',
        'price', 'currency', 'stock_quantity', 'image_url'
    ];

    fields.forEach(field => {
        const input = form.querySelector(`[name="${field}"]`);
        if (input && product[field] !== undefined) {
            input.value = product[field] || '';
        }
    });

    // Handle checkboxes
    form.querySelector('[name="is_active"]').checked = product.is_active;
    form.querySelector('[name="is_featured"]').checked = product.is_featured;
}

async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await fetchWithAuth(`/api/admin/products/${productId}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (response.ok) {
            showSuccess('Product deleted successfully');
            loadProductsList();
        } else {
            throw new Error(result.error || 'Failed to delete product');
        }
    } catch (error) {
        console.error('Product delete error:', error);
        showError('Failed to delete product');
    }
}

// Hero Content Management
async function loadHeroContent() {
    try {
        const response = await fetchWithAuth('/api/admin/hero-content');
        const result = await response.json();

        if (response.ok) {
            populateHeroForm(result.data || {});
            updatePreview();
        } else {
            throw new Error(result.error || 'Failed to load hero content');
        }
    } catch (error) {
        console.error('Hero content load error:', error);
        showError('Failed to load hero content');
    }
}

function populateHeroForm(data) {
    const fields = ['title_en', 'title_hi', 'title_gu', 'subtitle_en', 'subtitle_hi', 'subtitle_gu'];

    fields.forEach(field => {
        const input = document.getElementById(field);
        if (input) {
            input.value = data[field] || '';
        }
    });
}

function setupHeroContentEventListeners() {
    // Save button
    const saveBtn = document.getElementById('save-hero-btn');
    if (saveBtn) {
        saveBtn.onclick = saveHeroContent;
    }

    // Reset button
    const resetBtn = document.getElementById('reset-hero-btn');
    if (resetBtn) {
        resetBtn.onclick = loadHeroContent;
    }

    // Preview language selector
    const previewLang = document.getElementById('preview-lang');
    if (previewLang) {
        previewLang.onchange = updatePreview;
    }

    // Auto-update preview on input change
    const inputs = document.querySelectorAll('.hero-content-form input');
    inputs.forEach(input => {
        input.addEventListener('input', updatePreview);
    });
}

function updatePreview() {
    const lang = document.getElementById('preview-lang')?.value || 'en';
    const titleInput = document.getElementById(`title_${lang}`);
    const subtitleInput = document.getElementById(`subtitle_${lang}`);

    const previewTitle = document.getElementById('preview-title');
    const previewSubtitle = document.getElementById('preview-subtitle');

    if (previewTitle && titleInput) {
        previewTitle.textContent = titleInput.value || 'Preview Title';
    }

    if (previewSubtitle && subtitleInput) {
        previewSubtitle.textContent = subtitleInput.value || 'Preview Subtitle';
    }
}

async function saveHeroContent() {
    try {
        const formData = {
            title_en: document.getElementById('title_en')?.value || '',
            title_hi: document.getElementById('title_hi')?.value || '',
            title_gu: document.getElementById('title_gu')?.value || '',
            subtitle_en: document.getElementById('subtitle_en')?.value || '',
            subtitle_hi: document.getElementById('subtitle_hi')?.value || '',
            subtitle_gu: document.getElementById('subtitle_gu')?.value || '',
        };

        const response = await fetchWithAuth('/api/admin/hero-content', {
            method: 'PUT',
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok) {
            showSuccess('Hero content updated successfully');
        } else {
            throw new Error(result.error || 'Failed to update hero content');
        }
    } catch (error) {
        console.error('Hero content save error:', error);
        showError('Failed to save hero content');
    }
}

function displayModules(modules) {
    const modulesGrid = document.getElementById('modules-grid');

    modulesGrid.innerHTML = modules.map(module => `
        <div class="module-card" onclick="openModule('${module.id}')">
            <div class="module-icon">${module.icon}</div>
            <div class="module-name">${module.name}</div>
            <div class="module-description">${module.description}</div>
        </div>
    `).join('');
}

async function openModule(moduleId) {
    // Hide dashboard
    document.querySelector('.dashboard-container').classList.add('hidden');

    // Show module content
    const moduleContent = document.getElementById(`${moduleId.replace('-', '_')}_content`);
    if (moduleContent) {
        moduleContent.classList.remove('hidden');

        // Load module-specific data
        if (moduleId === 'hero-content') {
            await loadHeroContentModule();
        } else if (moduleId === 'products') {
            await loadProductsModule();
        }
    }
}

function showDashboard() {
    // Hide all module contents
    document.querySelectorAll('.module-content').forEach(content => {
        content.classList.add('hidden');
    });

    // Show dashboard
    document.querySelector('.dashboard-container').classList.remove('hidden');
}

async function loadHeroContentModule() {
    try {
        await loadHeroContent();
    } catch (error) {
        console.error('Hero content module load error:', error);
        showError('Failed to load hero content data');
    }
}

async function loadHeroContent() {
    try {
        const response = await fetchWithAuth('/api/admin/hero-content');
        const result = await response.json();

        if (response.ok) {
            const heroData = result.data;
            populateHeroForm(heroData);
        } else {
            throw new Error(result.error || 'Failed to load hero content');
        }
    } catch (error) {
        console.error('Hero content load error:', error);
        showError('Failed to load hero content');
    }
}

function populateHeroForm(data) {
    document.getElementById('title_en').value = data.title_en || '';
    document.getElementById('title_hi').value = data.title_hi || '';
    document.getElementById('title_gu').value = data.title_gu || '';
    document.getElementById('subtitle_en').value = data.subtitle_en || '';
    document.getElementById('subtitle_hi').value = data.subtitle_hi || '';
    document.getElementById('subtitle_gu').value = data.subtitle_gu || '';

    // Update preview
    updatePreview();
}

async function saveHeroContent() {
    try {
        const formData = {
            title_en: document.getElementById('title_en').value.trim(),
            title_hi: document.getElementById('title_hi').value.trim(),
            title_gu: document.getElementById('title_gu').value.trim(),
            subtitle_en: document.getElementById('subtitle_en').value.trim(),
            subtitle_hi: document.getElementById('subtitle_hi').value.trim(),
            subtitle_gu: document.getElementById('subtitle_gu').value.trim()
        };

        // Validate required fields
        if (!formData.title_en || !formData.subtitle_en) {
            showError('English title and subtitle are required');
            return;
        }

        const saveBtn = document.getElementById('save-hero-btn');
        const originalText = saveBtn.textContent;
        saveBtn.textContent = 'Saving...';
        saveBtn.disabled = true;

        const response = await fetchWithAuth('/api/admin/hero-content', {
            method: 'PUT',
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok && result.success) {
            showSuccess('Hero content updated successfully!');
            updatePreview();
        } else {
            throw new Error(result.error || 'Failed to save hero content');
        }

        saveBtn.textContent = originalText;
        saveBtn.disabled = false;

    } catch (error) {
        console.error('Save error:', error);
        showError('Failed to save hero content: ' + error.message);

        const saveBtn = document.getElementById('save-hero-btn');
        saveBtn.textContent = 'Save Changes';
        saveBtn.disabled = false;
    }
}

function updatePreview() {
    const currentLang = document.getElementById('preview-lang').value;
    const titleField = `title_${currentLang}`;
    const subtitleField = `subtitle_${currentLang}`;

    const title = document.getElementById(titleField).value || 'Preview Title';
    const subtitle = document.getElementById(subtitleField).value || 'Preview Subtitle';

    document.getElementById('preview-title').textContent = title;
    document.getElementById('preview-subtitle').textContent = subtitle;
}

function resetForm() {
    if (confirm('Are you sure you want to reset all changes? This will reload the original content.')) {
        loadHeroContent();
    }
}

function previewWebsite() {
    window.open('/', '_blank');
}

// Setup form event listeners
function setupHeroContentListeners() {
    // Save button
    document.getElementById('save-hero-btn').addEventListener('click', saveHeroContent);

    // Reset button
    document.getElementById('reset-hero-btn').addEventListener('click', resetForm);

    // Preview button
    document.getElementById('preview-website-btn').addEventListener('click', previewWebsite);

    // Preview language selector
    document.getElementById('preview-lang').addEventListener('change', updatePreview);

    // Auto-update preview when typing
    const inputs = ['title_en', 'title_hi', 'title_gu', 'subtitle_en', 'subtitle_hi', 'subtitle_gu'];
    inputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('input', updatePreview);
        }
    });

    // Auto-fill other languages if empty
    document.getElementById('title_en').addEventListener('blur', function() {
        if (!document.getElementById('title_hi').value) {
            document.getElementById('title_hi').value = this.value;
        }
        if (!document.getElementById('title_gu').value) {
            document.getElementById('title_gu').value = this.value;
        }
        updatePreview();
    });

    document.getElementById('subtitle_en').addEventListener('blur', function() {
        if (!document.getElementById('subtitle_hi').value) {
            document.getElementById('subtitle_hi').value = this.value;
        }
        if (!document.getElementById('subtitle_gu').value) {
            document.getElementById('subtitle_gu').value = this.value;
        }
        updatePreview();
    });
}

// Initialize hero content listeners when module loads
document.addEventListener('DOMContentLoaded', function() {
    try {
        setupHeroContentListeners();
    } catch (error) {
        console.error('Setup error:', error);
    }
});

async function logout() {
    try {
        await fetchWithAuth('/api/admin/logout', {
            method: 'POST'
        });
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_expires');
        window.location.href = 'index.html';
    }
}

// Utility functions
async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('admin_token');

    return fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
}

function isTokenExpired() {
    const expires = localStorage.getItem('admin_expires');
    if (!expires) return true;

    return new Date(expires) < new Date();
}

function showError(message) {
    // Simple error display - you can enhance this
    alert('Error: ' + message);
}

function showSuccess(message) {
    // Simple success display - you can enhance this
    alert('Success: ' + message);
}

// Products Management Functions
let currentEditingProduct = null;

async function loadProductsModule() {
    try {
        await loadProductsList();
        setupProductsEventListeners();
    } catch (error) {
        console.error('Products module load error:', error);
        showError('Failed to load products data');
    }
}

function setupProductsEventListeners() {
    // Add product button
    document.getElementById('add-product-btn').addEventListener('click', () => {
        openProductModal();
    });

    // Refresh products button
    document.getElementById('refresh-products-btn').addEventListener('click', loadProductsList);

    // Product form submit
    document.getElementById('product-form').addEventListener('submit', saveProduct);

    // Auto-fill translations
    document.getElementById('product-name-en').addEventListener('blur', function() {
        if (!document.getElementById('product-name-hi').value) {
            document.getElementById('product-name-hi').value = this.value;
        }
        if (!document.getElementById('product-name-gu').value) {
            document.getElementById('product-name-gu').value = this.value;
        }
    });

    document.getElementById('product-description-en').addEventListener('blur', function() {
        if (!document.getElementById('product-description-hi').value) {
            document.getElementById('product-description-hi').value = this.value;
        }
        if (!document.getElementById('product-description-gu').value) {
            document.getElementById('product-description-gu').value = this.value;
        }
    });

    document.getElementById('product-short-description-en').addEventListener('blur', function() {
        if (!document.getElementById('product-short-description-hi').value) {
            document.getElementById('product-short-description-hi').value = this.value;
        }
        if (!document.getElementById('product-short-description-gu').value) {
            document.getElementById('product-short-description-gu').value = this.value;
        }
    });

    document.getElementById('product-usage-suggestion-en').addEventListener('blur', function() {
        if (!document.getElementById('product-usage-suggestion-hi').value) {
            document.getElementById('product-usage-suggestion-hi').value = this.value;
        }
        if (!document.getElementById('product-usage-suggestion-gu').value) {
            document.getElementById('product-usage-suggestion-gu').value = this.value;
        }
    });

    document.getElementById('product-category-en').addEventListener('blur', function() {
        if (!document.getElementById('product-category-hi').value) {
            document.getElementById('product-category-hi').value = this.value;
        }
        if (!document.getElementById('product-category-gu').value) {
            document.getElementById('product-category-gu').value = this.value;
        }
    });
}

// Utility functions
async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('admin_token');
    return fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
}

function showError(message) {
    console.error(message);
    // You can implement a toast notification here
    alert(message);
}

function showSuccess(message) {
    console.log(message);
    // You can implement a toast notification here
    alert(message);
}

async function logout() {
    try {
        await fetchWithAuth('/api/admin/logout', { method: 'POST' });
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_token_expires');
        window.location.href = 'index.html';
    }
}

async function loadProductsList() {
    try {
        const response = await fetchWithAuth('/api/admin/products');
        const result = await response.json();

        if (response.ok) {
            displayProductsList(result.data || []);
        } else {
            throw new Error(result.error || 'Failed to load products');
        }
    } catch (error) {
        console.error('Products load error:', error);
        showError('Failed to load products');
    }
}

function displayProductsList(products) {
    const tableBody = document.getElementById('products-table-body');

    if (products.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">No products found. Click "Add New Product" to create one.</td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = products.map(product => {
        const dimensions = [];
        if (product.height_cm) dimensions.push(`H: ${product.height_cm}cm`);
        if (product.width_cm) dimensions.push(`W: ${product.width_cm}cm`);
        if (product.volume_ml) dimensions.push(`V: ${product.volume_ml}ml`);
        const dimensionText = dimensions.length > 0 ? dimensions.join(', ') : 'N/A';

        return `
            <tr>
                <td>
                    ${product.image_url ? 
                        `<img src="${product.image_url}" alt="${product.name_en}" class="product-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                         <div class="product-image-placeholder" style="display:none;"><i class="fas fa-image"></i></div>` 
                        : 
                        `<div class="product-image-placeholder"><i class="fas fa-image"></i></div>`
                    }
                </td>
                <td>
                    <strong>${product.name_en}</strong>
                    ${product.name_hi ? `<br><small style="color: #666;">${product.name_hi}</small>` : ''}
                    ${product.short_description_en ? `<br><small style="color: #888; font-style: italic;">${product.short_description_en}</small>` : ''}
                </td>
                <td>${product.category_en || 'Uncategorized'}</td>
                <td>
                    <strong>₹${product.price || '0.00'}</strong>
                </td>
                <td>
                    <small>${dimensionText}</small>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-edit btn-small" onclick="editProduct('${product.id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-delete btn-small" onclick="deleteProduct('${product.id}', '${product.name_en}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function openProductModal(product = null) {
    currentEditingProduct = product;
    const modal = document.getElementById('product-form-modal');
    const form = document.getElementById('product-form');
    const title = document.getElementById('product-form-title');

    // Reset form
    form.reset();
    
    // Set default values for new products
    const activeCheckbox = form.querySelector('[name="is_active"]');
    if (activeCheckbox) activeCheckbox.checked = true;

    if (product) {
        title.textContent = 'Edit Product';
        populateProductForm(product);
    } else {
        title.textContent = 'Add New Product';
    }

    modal.classList.remove('hidden');
}

function populateProductForm(product) {
    const form = document.getElementById('product-form');
    if (!form) return;

    // Helper function to safely set form field values
    const setFieldValue = (fieldName, value) => {
        const field = form.querySelector(`[name="${fieldName}"]`);
        if (field) field.value = value || '';
    };

    // Set text field values
    setFieldValue('name_en', product.name_en);
    setFieldValue('name_hi', product.name_hi);
    setFieldValue('name_gu', product.name_gu);
    setFieldValue('description_en', product.description_en);
    setFieldValue('description_hi', product.description_hi);
    setFieldValue('description_gu', product.description_gu);
    setFieldValue('short_description_en', product.short_description_en);
    setFieldValue('short_description_hi', product.short_description_hi);
    setFieldValue('short_description_gu', product.short_description_gu);
    setFieldValue('price', product.price);
    setFieldValue('category_en', product.category_en);
    setFieldValue('category_hi', product.category_hi);
    setFieldValue('category_gu', product.category_gu);
    setFieldValue('image_url', product.image_url);
    setFieldValue('usage_suggestion_en', product.usage_suggestion_en);
    setFieldValue('usage_suggestion_hi', product.usage_suggestion_hi);
    setFieldValue('usage_suggestion_gu', product.usage_suggestion_gu);
    setFieldValue('height_cm', product.height_cm);
    setFieldValue('width_cm', product.width_cm);
    setFieldValue('volume_ml', product.volume_ml);
    setFieldValue('colors', product.colors ? JSON.stringify(product.colors, null, 2) : '');

    // Set checkbox states
    const featuredCheckbox = form.querySelector('[name="is_featured"]');
    if (featuredCheckbox) featuredCheckbox.checked = !!product.is_featured;

    const activeCheckbox = form.querySelector('[name="is_active"]');
    if (activeCheckbox) activeCheckbox.checked = product.is_active !== false;
}

function closeProductModal() {
    document.getElementById('product-form-modal').classList.add('hidden');
    currentEditingProduct = null;
}

async function saveProduct(e) {
    e.preventDefault();

    try {
        const formData = new FormData(e.target);
        
        // Parse colors JSON
        let colors = null;
        const colorsText = formData.get('colors');
        if (colorsText && colorsText.trim()) {
            try {
                colors = JSON.parse(colorsText);
            } catch (err) {
                showError('Invalid JSON format for colors');
                return;
            }
        }

        const productData = {
            name_en: formData.get('name_en'),
            name_hi: formData.get('name_hi'),
            name_gu: formData.get('name_gu'),
            description_en: formData.get('description_en'),
            description_hi: formData.get('description_hi'),
            description_gu: formData.get('description_gu'),
            short_description_en: formData.get('short_description_en'),
            short_description_hi: formData.get('short_description_hi'),
            short_description_gu: formData.get('short_description_gu'),
            price: parseFloat(formData.get('price')) || 0,
            category_en: formData.get('category_en'),
            category_hi: formData.get('category_hi'),
            category_gu: formData.get('category_gu'),
            image_url: formData.get('image_url'),
            usage_suggestion_en: formData.get('usage_suggestion_en'),
            usage_suggestion_hi: formData.get('usage_suggestion_hi'),
            usage_suggestion_gu: formData.get('usage_suggestion_gu'),
            height_cm: parseFloat(formData.get('height_cm')) || null,
            width_cm: parseFloat(formData.get('width_cm')) || null,
            volume_ml: parseFloat(formData.get('volume_ml')) || null,
            colors: colors,
        };

        // Validate required fields
        if (!productData.name_en || !productData.description_en) {
            showError('English name and description are required');
            return;
        }

        const saveBtn = document.getElementById('save-product-btn');
        const originalText = saveBtn.textContent;
        saveBtn.textContent = 'Saving...';
        saveBtn.disabled = true;

        let response;
        if (currentEditingProduct) {
            response = await fetchWithAuth(`/api/admin/products/${currentEditingProduct.id}`, {
                method: 'PUT',
                body: JSON.stringify(productData)
            });
        } else {
            response = await fetchWithAuth('/api/admin/products', {
                method: 'POST',
                body: JSON.stringify(productData)
            });
        }

        const result = await response.json();

        if (response.ok && result.success) {
            showSuccess(result.message);
            closeProductModal();
            await loadProductsList();
        } else {
            throw new Error(result.error || 'Failed to save product');
        }

        saveBtn.textContent = originalText;
        saveBtn.disabled = false;

    } catch (error) {
        console.error('Save error:', error);
        showError('Failed to save product: ' + error.message);

        const saveBtn = document.getElementById('save-product-btn');
        saveBtn.textContent = 'Save Product';
        saveBtn.disabled = false;
    }
}

async function editProduct(productId) {
    try {
        // Find product from current list
        const response = await fetchWithAuth('/api/admin/products');
        const result = await response.json();

        if (response.ok) {
            const product = result.data.find(p => p.id === productId);
            if (product) {
                openProductModal(product);
            } else {
                showError('Product not found');
            }
        } else {
            throw new Error(result.error || 'Failed to load product');
        }
    } catch (error) {
        console.error('Edit product error:', error);
        showError('Failed to load product for editing');
    }
}

async function deleteProduct(productId, productName) {
    if (!confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
        return;
    }

    try {
        const response = await fetchWithAuth(`/api/admin/products/${productId}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (response.ok && result.success) {
            showSuccess(result.message);
            await loadProductsList();
        } else {
            throw new Error(result.error || 'Failed to delete product');
        }
    } catch (error) {
        console.error('Delete error:', error);
        showError('Failed to delete product: ' + error.message);
    }
}

// Make functions global for onclick handlers
window.openModule = openModule;
window.showDashboard = showDashboard;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.closeProductModal = closeProductModal;