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

// Activities gallery API endpoint
app.get('/api/activities-gallery', async (req, res) => {
    try {
        const lang = req.query.lang || 'en';
        const category = req.query.category;
        const search = req.query.search;
        const sort = req.query.sort || 'display_order';
        const order = req.query.order || 'asc';
        
        let query = supabase
            .from('activities_gallery')
            .select('*')
            .eq('is_active', true);
        
        // Apply category filter
        if (category && category !== 'all') {
            query = query.eq('category_en', category.toUpperCase());
        }
        
        // Apply search filter
        if (search) {
            query = query.or(`title_en.ilike.%${search}%,description_en.ilike.%${search}%`);
        }
        
        // Apply sorting
        const ascending = order === 'asc';
        if (sort === 'date') {
            query = query.order('created_at', { ascending });
        } else if (sort === 'title') {
            query = query.order('title_en', { ascending });
        } else {
            query = query.order('display_order', { ascending: true });
        }
        
        const { data, error } = await query;

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ 
                error: 'Failed to fetch activities gallery',
                data: []
            });
        }

        // Transform data for frontend consumption
        const transformedData = data.map(item => {
            // Create images array from individual image fields
            const images = [item.image];
            for (let i = 1; i <= 5; i++) {
                const imageField = item[`image_LM_${i}`];
                if (imageField) {
                    images.push(imageField);
                }
            }
            
            return {
                id: item.id,
                title_en: item.title_en,
                title_hi: item.title_hi,
                title_gu: item.title_gu,
                description_en: item.description_en,
                description_hi: item.description_hi,
                description_gu: item.description_gu,
                image: item.image,
                images: images,
                category_en: item.category_en,
                category_hi: item.category_hi,
                category_gu: item.category_gu,
                date: item.date,
                quote_en: item.quote_en,
                quote_hi: item.quote_hi,
                quote_gu: item.quote_gu,
                display_order: item.display_order,
                created_at: item.created_at,
                // Add computed stats based on category
                stats: getActivityStats(item.category_en, item.id)
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

// Helper function to generate activity stats
function getActivityStats(category, id) {
    const statsMap = {
        'WELFARE': { beneficiaries: '500+', locations: '15' },
        'CONSERVATION': { beneficiaries: '1000+', frequency: '365 days' },
        'EDUCATION': { beneficiaries: '300+', schools: '15' },
        'RESCUE': { rescued: '50+', response: '24/7' },
        'CELEBRATION': { families: '200+', festivals: '5' },
        'ENVIRONMENT': { bowls: '100+', locations: '100+' }
    };
    
    return statsMap[category] || { beneficiaries: '100+', locations: '10' };
}

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