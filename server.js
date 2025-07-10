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
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));
app.use(express.static(path.join(__dirname, 'public')));

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

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

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