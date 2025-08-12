
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
    const moduleContent = document.getElementById(`${moduleId}-content`);
    if (moduleContent) {
        moduleContent.classList.remove('hidden');
        
        // Load module-specific data
        if (moduleId === 'thoughts') {
            await loadThoughtsModule();
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

async function loadThoughtsModule() {
    try {
        await Promise.all([
            loadThoughtsStats(),
            loadThoughtsTable(1)
        ]);
    } catch (error) {
        console.error('Thoughts module load error:', error);
        showError('Failed to load thoughts data');
    }
}

async function loadThoughtsStats() {
    try {
        const response = await fetchWithAuth('/api/admin/thoughts?limit=1000');
        const result = await response.json();

        if (response.ok) {
            const thoughts = result.data;
            const total = thoughts.length;
            const anonymous = thoughts.filter(t => t.is_anonymous).length;
            
            // Calculate recent thoughts (last 7 days)
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            const recent = thoughts.filter(t => new Date(t.created_at) > weekAgo).length;

            document.getElementById('total-thoughts').textContent = total;
            document.getElementById('anonymous-thoughts').textContent = anonymous;
            document.getElementById('recent-thoughts').textContent = recent;
        }
    } catch (error) {
        console.error('Stats load error:', error);
    }
}

async function loadThoughtsTable(page = 1) {
    try {
        const response = await fetchWithAuth(`/api/admin/thoughts?page=${page}&limit=20`);
        const result = await response.json();

        if (response.ok) {
            displayThoughtsTable(result.data);
            displayPagination(result.pagination);
        } else {
            throw new Error(result.error || 'Failed to load thoughts');
        }

    } catch (error) {
        console.error('Thoughts table load error:', error);
        showError('Failed to load thoughts table');
    }
}

function displayThoughtsTable(thoughts) {
    const tableContainer = document.getElementById('thoughts-table');
    
    if (thoughts.length === 0) {
        tableContainer.innerHTML = '<div style="padding: 2rem; text-align: center; color: #718096;">No thoughts found</div>';
        return;
    }

    const tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Name</th>
                    <th>Contact</th>
                    <th>Thought</th>
                    <th>Language</th>
                    <th>Type</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${thoughts.map(thought => `
                    <tr>
                        <td>${new Date(thought.created_at).toLocaleDateString()}</td>
                        <td>${thought.is_anonymous ? 'Anonymous' : (thought.name || 'N/A')}</td>
                        <td>${thought.is_anonymous ? 'Hidden' : (thought.contact_no || 'N/A')}</td>
                        <td class="thought-content" title="${thought.thought}">
                            ${thought.thought.length > 50 ? thought.thought.substring(0, 50) + '...' : thought.thought}
                        </td>
                        <td>${thought.language?.toUpperCase() || 'EN'}</td>
                        <td>${thought.is_anonymous ? 'Anonymous' : 'Named'}</td>
                        <td>
                            <button class="delete-btn" onclick="deleteThought('${thought.id}')">
                                Delete
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    tableContainer.innerHTML = tableHTML;
}

function displayPagination(pagination) {
    const paginationContainer = document.getElementById('pagination');
    
    const { page, totalPages } = pagination;
    
    let paginationHTML = `
        <button ${page <= 1 ? 'disabled' : ''} onclick="loadThoughtsTable(${page - 1})">
            Previous
        </button>
        <span>Page ${page} of ${totalPages}</span>
        <button ${page >= totalPages ? 'disabled' : ''} onclick="loadThoughtsTable(${page + 1})">
            Next
        </button>
    `;

    paginationContainer.innerHTML = paginationHTML;
}

async function deleteThought(thoughtId) {
    if (!confirm('Are you sure you want to delete this thought? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await fetchWithAuth(`/api/admin/thoughts/${thoughtId}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (response.ok && result.success) {
            // Reload the current page
            const currentPage = getCurrentPage();
            await loadThoughtsTable(currentPage);
            await loadThoughtsStats(); // Refresh stats
            showSuccess('Thought deleted successfully');
        } else {
            throw new Error(result.error || 'Failed to delete thought');
        }

    } catch (error) {
        console.error('Delete error:', error);
        showError('Failed to delete thought');
    }
}

function getCurrentPage() {
    const paginationSpan = document.querySelector('#pagination span');
    if (paginationSpan) {
        const match = paginationSpan.textContent.match(/Page (\d+)/);
        return match ? parseInt(match[1]) : 1;
    }
    return 1;
}

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

// Make functions global for onclick handlers
window.openModule = openModule;
window.showDashboard = showDashboard;
window.loadThoughtsTable = loadThoughtsTable;
window.deleteThought = deleteThought;
