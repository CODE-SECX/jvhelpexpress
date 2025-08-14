
// Admin Authentication Script
document.addEventListener('DOMContentLoaded', function() {
    // Check if already logged in
    const token = localStorage.getItem('admin_token');
    if (token) {
        window.location.href = 'dashboard.html';
        return;
    }

    const loginForm = document.getElementById('admin-login-form');
    const loginMessage = document.getElementById('login-message');
    const loginBtn = document.getElementById('login-btn');

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (!username || !password) {
            showMessage('Please enter both username and password', 'error');
            return;
        }

        try {
            loginBtn.textContent = 'Authenticating...';
            loginBtn.disabled = true;

            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                localStorage.setItem('admin_token', result.token);
                localStorage.setItem('admin_expires', result.expires_at);
                localStorage.setItem('admin_user', JSON.stringify(result.admin));
                
                showMessage('Login successful! Redirecting...', 'success');
                
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                showMessage(result.error || 'Login failed', 'error');
            }

        } catch (error) {
            console.error('Login error:', error);
            showMessage('Network error. Please try again.', 'error');
        } finally {
            loginBtn.textContent = 'Access Admin Panel';
            loginBtn.disabled = false;
        }
    });

    function showMessage(message, type) {
        loginMessage.textContent = message;
        loginMessage.className = `form-message ${type}`;
        loginMessage.style.display = 'block';

        if (type === 'success') {
            setTimeout(() => {
                loginMessage.style.display = 'none';
            }, 3000);
        }
    }
});

// Check if token is expired
function isTokenExpired() {
    const expires = localStorage.getItem('admin_expires');
    if (!expires) return true;
    
    return new Date(expires) < new Date();
}

// Clear expired tokens
if (isTokenExpired()) {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_expires');
    localStorage.removeItem('admin_user');
}
