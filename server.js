const express = require('express');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files with proper paths for Vercel
// Serve static files - Vercel handles this via routes in vercel.json
app.use(express.static('public'));
app.use('/css', express.static('public/css'));
app.use('/js', express.static('public/js'));
app.use('/assets', express.static('public/assets'));

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials. Please check your .env file.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// API Routes
app.get('/api/hero-content', async (req, res) => {
    try {
        const lang = req.query.lang || 'en'; // Default to English
        
        const { data, error } = await supabase
            .from('hero_content')
            .select('*')
            .single();

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ 
                error: 'Failed to fetch hero content',
                fallback: {
                    title: 'JV HELP',
                    subtitle: 'Heal Help Protect'
                }
            });
        }

        // Return data with language-specific content
        const response = {
            id: data.id,
            title: data[`title_${lang}`] || data.title_en || 'JV HELP',
            subtitle: data[`subtitle_${lang}`] || data.subtitle_en || 'Heal Help Protect',
            // Include all language versions for frontend caching
            all_languages: {
                en: {
                    title: data.title_en,
                    subtitle: data.subtitle_en
                },
                hi: {
                    title: data.title_hi,
                    subtitle: data.subtitle_hi
                },
                gu: {
                    title: data.title_gu,
                    subtitle: data.subtitle_gu
                }
            }
        };
        
        res.json(response);
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ 
            error: 'Internal server error',
            fallback: {
                title: 'JV HELP',
                subtitle: 'Heal Help Protect'
            }
        });
    }
});

// Activities content API
app.get('/api/activities-content', async (req, res) => {
    try {
        const lang = req.query.lang || 'en';
        
        const { data, error } = await supabase
            .from('activities')
            .select('*')
            .eq('is_active', true)
            .order('display_order');

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ 
                error: 'Failed to fetch activities content',
                data: []
            });
        }

        // Transform data to include language-specific content
        const transformedData = data.map(item => ({
            id: item.id,
            title: item[`title_${lang}`] || item.title_en,
            description: item[`description_${lang}`] || item.description_en,
            icon_url: item.icon_url,
            category: item.category,
            display_order: item.display_order
        }));

        res.json({
            data: transformedData,
            language: lang,
            total: transformedData.length
        });
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ 
            error: 'Internal server error',
            data: []
        });
    }
});

// Activities gallery API
app.get('/api/activities-gallery', async (req, res) => {
    try {
        const lang = req.query.lang || 'en';
        
        const { data, error } = await supabase
            .from('activities_gallery')
            .select('*')
            .eq('is_active', true)
            .order('display_order');

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ 
                error: 'Failed to fetch activities gallery',
                data: []
            });
        }

        // Transform data and include all images
        const transformedData = data.map(item => {
            const images = [item.image];
            
            // Add additional images if they exist
            for (let i = 1; i <= 5; i++) {
                if (item[`image_lm_${i}`]) images.push(item[`image_lm_${i}`]);
                if (item[`image_LM_${i}`]) images.push(item[`image_LM_${i}`]);
            }
            
            return {
                id: item.id,
                title_en: item.title_en,
                title_hi: item.title_hi,
                title_gu: item.title_gu,
                description_en: item.description_en,
                description_hi: item.description_hi,
                description_gu: item.description_gu,
                category_en: item.category_en,
                category_hi: item.category_hi,
                category_gu: item.category_gu,
                quote_en: item.quote_en,
                quote_hi: item.quote_hi,
                quote_gu: item.quote_gu,
                image: item.image,
                images: images,
                date: item.date,
                display_order: item.display_order,
                created_at: item.created_at,
                stats: {
                    'Beneficiaries': getStatNumber(item.display_order),
                    [getSecondStatLabel(item.display_order)]: getSecondStatNumber(item.display_order),
                    [getThirdStatLabel(item.display_order)]: getThirdStatNumber(item.display_order)
                }
            };
        });

        res.json({
            data: transformedData,
            language: lang,
            total: transformedData.length
        });
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ 
            error: 'Internal server error',
            data: []
        });
    }
});

// Helper functions for gallery stats
function getStatNumber(order) {
    const stats = ['500+', '300+', '50+', '1000+', '200+', '100+'];
    return stats[order - 1] || '100+';
}

function getSecondStatNumber(order) {
    const stats = ['15', '15', '24/7', '365', '5', '100+'];
    return stats[order - 1] || '10';
}

function getSecondStatLabel(order) {
    const labels = ['Locations', 'Schools', 'Response', 'Days', 'Festivals', 'Locations'];
    return labels[order - 1] || 'Locations';
}

function getThirdStatNumber(order) {
    const stats = ['95%', '95%', '90%', '100%', '100%', '85%'];
    return stats[order - 1] || '90%';
}

function getThirdStatLabel(order) {
    const labels = ['Success Rate', 'Success Rate', 'Recovery Rate', 'Organic Feed', 'Satisfaction', 'Survival Rate'];
    return labels[order - 1] || 'Success Rate';
}

// Generic multilingual content API
app.get('/api/content/:table', async (req, res) => {
    try {
        const { table } = req.params;
        const lang = req.query.lang || 'en';
        const id = req.query.id;
        
        let query = supabase.from(table).select('*');
        
        if (id) {
            query = query.eq('id', id);
        }
        
        const { data, error } = await supabase.from(table).select('*');

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ 
                error: `Failed to fetch ${table} content`,
                data: []
            });
        }

        // Transform data to include language-specific content
        const transformedData = data.map(item => {
            const transformed = { ...item };
            
            // Find all multilingual fields and set current language values
            Object.keys(item).forEach(key => {
                if (key.endsWith('_en')) {
                    const baseKey = key.replace('_en', '');
                    transformed[baseKey] = item[`${baseKey}_${lang}`] || item[`${baseKey}_en`] || item[key];
                }
            });
            
            return transformed;
        });

        res.json({
            data: transformedData,
            language: lang,
            total: transformedData.length
        });
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ 
            error: 'Internal server error',
            data: []
        });
    }
});



// User thoughts API endpoints
app.get('/api/user-thoughts', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('user_thoughts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ 
                error: 'Failed to fetch thoughts',
                data: []
            });
        }

        res.json({
            data: data || [],
            total: data ? data.length : 0
        });
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ 
            error: 'Internal server error',
            data: []
        });
    }
});

app.post('/api/user-thoughts', async (req, res) => {
    try {
        const { name, contact_no, thought, language, is_anonymous } = req.body;

        if (!thought || thought.trim() === '') {
            return res.status(400).json({ 
                error: 'Thought content is required' 
            });
        }

        const thoughtData = {
            name: is_anonymous ? null : (name || null),
            contact_no: is_anonymous ? null : (contact_no || null),
            thought: thought.trim(),
            language: language || 'en',
            is_anonymous: is_anonymous || false
        };

        const { data, error } = await supabase
            .from('user_thoughts')
            .insert([thoughtData])
            .select()
            .single();

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ 
                error: 'Failed to save thought' 
            });
        }

        res.status(201).json({
            success: true,
            message: 'Thank you for sharing your thoughts!',
            data: data
        });
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ 
            error: 'Internal server error' 
        });
    }
});

// Admin authentication endpoints
const crypto = require('crypto');

// Helper function to hash credentials
function hashCredential(credential, salt) {
    return crypto.createHash('sha256').update(credential + salt).digest('hex');
}

// Helper function to generate session token
function generateSessionToken() {
    return crypto.randomBytes(32).toString('hex');
}

// Admin login endpoint
app.post('/api/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }

        // Hash the provided credentials
        const salt = 'jvhelp_salt_2025';
        const usernameHash = hashCredential(username, salt);
        const passwordHash = hashCredential(password, salt);

        // Check credentials in database
        const { data: adminData, error: adminError } = await supabase
            .from('admin_credentials')
            .select('id')
            .eq('username_hash', usernameHash)
            .eq('password_hash', passwordHash)
            .single();

        if (adminError || !adminData) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Create session
        const sessionToken = generateSessionToken();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        const { error: sessionError } = await supabase
            .from('admin_sessions')
            .insert([{
                session_token: sessionToken,
                admin_id: adminData.id,
                expires_at: expiresAt.toISOString()
            }]);

        if (sessionError) {
            console.error('Session creation error:', sessionError);
            return res.status(500).json({ error: 'Failed to create session' });
        }

        res.json({
            success: true,
            token: sessionToken,
            expires_at: expiresAt.toISOString()
        });

    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Middleware to verify admin session
async function verifyAdminSession(req, res, next) {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ error: 'No session token provided' });
        }

        const { data: sessionData, error: sessionError } = await supabase
            .from('admin_sessions')
            .select('admin_id, expires_at')
            .eq('session_token', token)
            .single();

        if (sessionError || !sessionData) {
            return res.status(401).json({ error: 'Invalid session' });
        }

        // Check if session is expired
        if (new Date(sessionData.expires_at) < new Date()) {
            // Delete expired session
            await supabase
                .from('admin_sessions')
                .delete()
                .eq('session_token', token);

            return res.status(401).json({ error: 'Session expired' });
        }

        // Update last accessed time
        await supabase
            .from('admin_sessions')
            .update({ last_accessed: new Date().toISOString() })
            .eq('session_token', token);

        req.adminId = sessionData.admin_id;
        next();

    } catch (error) {
        console.error('Session verification error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Admin dashboard endpoints
app.get('/api/admin/dashboard', verifyAdminSession, (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to admin dashboard',
        modules: [
            {
                id: 'thoughts',
                name: 'User Thoughts',
                description: 'Manage and view user feedback and thoughts',
                icon: '💭',
                path: '/admin/thoughts'
            },
            {
                id: 'analytics',
                name: 'Analytics',
                description: 'View website analytics and statistics',
                icon: '📊',
                path: '/admin/analytics'
            },
            {
                id: 'content',
                name: 'Content Management',
                description: 'Manage website content and activities',
                icon: '📝',
                path: '/admin/content'
            }
        ]
    });
});

// Admin thoughts management
app.get('/api/admin/thoughts', verifyAdminSession, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        const { data, error, count } = await supabase
            .from('user_thoughts')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            console.error('Admin thoughts fetch error:', error);
            return res.status(500).json({ error: 'Failed to fetch thoughts' });
        }

        res.json({
            data: data || [],
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit)
            }
        });

    } catch (error) {
        console.error('Admin thoughts error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete thought endpoint
app.delete('/api/admin/thoughts/:id', verifyAdminSession, async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('user_thoughts')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Delete thought error:', error);
            return res.status(500).json({ error: 'Failed to delete thought' });
        }

        res.json({ success: true, message: 'Thought deleted successfully' });

    } catch (error) {
        console.error('Delete thought error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Admin logout
app.post('/api/admin/logout', verifyAdminSession, async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        await supabase
            .from('admin_sessions')
            .delete()
            .eq('session_token', token);

        res.json({ success: true, message: 'Logged out successfully' });

    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Admin route (obfuscated path)
app.get('/WVdSdGFYND0', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'index.html'));
});

// Admin dashboard route
app.get('/admin/dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'dashboard.html'));
});

// Serve admin static files
app.use('/admin', express.static('public/admin'));

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle 404
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;