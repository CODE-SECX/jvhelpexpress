const express = require("express");
const cors = require("cors");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");
const crypto = require("crypto");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files with proper paths for Vercel
// Serve static files - Vercel handles this via routes in vercel.json
app.use(express.static("public"));
app.use("/css", express.static("public/css"));
app.use("/js", express.static("public/js"));
app.use("/assets", express.static("public/assets"));
app.use("/admin", express.static("public/admin"));

// Initialize Supabase client with service role for admin operations
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase credentials. Please check your .env file.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Admin Authentication Middleware
async function authenticateAdmin(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "No token provided" });
        }

        const token = authHeader.substring(7);

        // Check session in database
        const { data: session, error } = await supabase
            .from("admin_sessions")
            .select(
                `
                *,
                admin_users (
                    id,
                    username,
                    role,
                    is_active
                )
            `,
            )
            .eq("session_token", token)
            .gt("expires_at", new Date().toISOString())
            .single();

        if (error || !session || !session.admin_users.is_active) {
            return res.status(401).json({ error: "Invalid or expired token" });
        }

        req.admin = session.admin_users;
        next();
    } catch (err) {
        console.error("Auth middleware error:", err);
        res.status(500).json({ error: "Authentication error" });
    }
}

// Admin Authentication Routes
app.post("/api/admin/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res
                .status(400)
                .json({ error: "Username and password required" });
        }

        // Hash the provided password using the same method as database
        const { data: hashResult, error: hashError } = await supabase.rpc(
            "hash_password",
            { password },
        );

        if (hashError) {
            console.error("Password hashing error:", hashError);
            return res.status(500).json({ error: "Authentication error" });
        }

        const passwordHash = hashResult;

        // Find admin user with matching credentials - using raw query to bypass RLS
        const { data: adminData, error } = await supabase
            .from("admin_users")
            .select("*")
            .eq("username", username)
            .eq("password_hash", passwordHash)
            .eq("is_active", true);

        if (error) {
            console.error("User lookup error:", error);
            return res.status(500).json({ error: "Authentication error" });
        }

        if (!adminData || adminData.length === 0) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const admin = adminData[0];

        // Generate session token
        const sessionToken = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Create session using raw SQL to bypass RLS
        const { error: sessionError } = await supabase.rpc('exec_sql', {
            sql: `INSERT INTO admin_sessions (admin_id, session_token, expires_at, ip_address, user_agent) 
                  VALUES ($1, $2, $3, $4, $5)`,
            params: [admin.id, sessionToken, expiresAt.toISOString(), req.ip || 'unknown', req.headers["user-agent"] || 'unknown']
        });

        if (sessionError) {
            console.error("Session creation error:", sessionError);
            // Fallback: try direct insert
            const { error: fallbackError } = await supabase
                .from("admin_sessions")
                .insert({
                    admin_id: admin.id,
                    session_token: sessionToken,
                    expires_at: expiresAt.toISOString(),
                    ip_address: req.ip || 'unknown',
                    user_agent: req.headers["user-agent"] || 'unknown',
                });

            if (fallbackError) {
                console.error("Fallback session creation error:", fallbackError);
                // Continue anyway - login will work, session won't be tracked
            }
        }

        // Update last login
        await supabase
            .from("admin_users")
            .update({ last_login: new Date().toISOString() })
            .eq("id", admin.id);

        res.json({
            success: true,
            token: sessionToken,
            expires_at: expiresAt.toISOString(),
            admin: {
                id: admin.id,
                username: admin.username,
                role: admin.role,
            },
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post("/api/admin/logout", authenticateAdmin, async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader.substring(7);

        // Delete session
        await supabase
            .from("admin_sessions")
            .delete()
            .eq("session_token", token);

        res.json({ success: true, message: "Logged out successfully" });
    } catch (err) {
        console.error("Logout error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Admin Dashboard Routes
app.get("/api/admin/dashboard", authenticateAdmin, async (req, res) => {
    try {
        res.json({
            success: true,
            modules: [
                {
                    id: "hero-content",
                    name: "Hero Content",
                    description:
                        "Manage main page hero section content in all languages",
                    icon: "🏠",
                },
                {
                    id: "products",
                    name: "Products",
                    description:
                        "Manage products, pricing, and inventory in all languages",
                    icon: "🛍️",
                },
            ],
        });
    } catch (err) {
        console.error("Dashboard error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Hero Content Management Routes
app.get("/api/admin/hero-content", authenticateAdmin, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("hero_content")
            .select("*")
            .maybeSingle();

        if (error) {
            console.error("Supabase error:", error);
            return res
                .status(500)
                .json({ error: "Failed to fetch hero content" });
        }

        // If no data exists, return empty structure
        const heroData = data || {
            title_en: '',
            title_hi: '',
            title_gu: '',
            subtitle_en: '',
            subtitle_hi: '',
            subtitle_gu: ''
        };

        res.json({
            success: true,
            data: heroData,
        });
    } catch (err) {
        console.error("Hero content fetch error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.put("/api/admin/hero-content", authenticateAdmin, async (req, res) => {
    try {
        const {
            title_en,
            title_hi,
            title_gu,
            subtitle_en,
            subtitle_hi,
            subtitle_gu,
        } = req.body;

        // Validate required fields
        if (!title_en || !subtitle_en) {
            return res
                .status(400)
                .json({ error: "English title and subtitle are required" });
        }

        // Get existing record
        const { data: existing, error: existingError } = await supabase
            .from("hero_content")
            .select("id");

        if (existingError) {
            console.error("Error checking existing content:", existingError);
        }

        const updateData = {
            title_en: title_en.trim(),
            title_hi: title_hi?.trim() || title_en.trim(),
            title_gu: title_gu?.trim() || title_en.trim(),
            subtitle_en: subtitle_en.trim(),
            subtitle_hi: subtitle_hi?.trim() || subtitle_en.trim(),
            subtitle_gu: subtitle_gu?.trim() || subtitle_en.trim(),
            updated_at: new Date().toISOString(),
        };

        let result;
        if (existing && existing.length > 0) {
            // Update existing record
            result = await supabase
                .from("hero_content")
                .update(updateData)
                .eq("id", existing[0].id)
                .select();
        } else {
            // Insert new record
            result = await supabase
                .from("hero_content")
                .insert(updateData)
                .select();
        }

        if (result.error) {
            console.error("Supabase error:", result.error);
            return res
                .status(500)
                .json({ error: "Failed to update hero content" });
        }

        res.json({
            success: true,
            message: "Hero content updated successfully",
            data: result.data?.[0] || result.data,
        });
    } catch (err) {
        console.error("Hero content update error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Products Management Routes
app.get("/api/admin/products", authenticateAdmin, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("products")
            .select("*")
            .order("created_at", { ascending: true });

        if (error) {
            console.error("Supabase error:", error);
            return res
                .status(500)
                .json({ error: "Failed to fetch products" });
        }

        res.json({
            success: true,
            data: data || [],
            total: data ? data.length : 0,
        });
    } catch (err) {
        console.error("Products fetch error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post("/api/admin/products", authenticateAdmin, async (req, res) => {
    try {
        const {
            name_en,
            name_hi,
            name_gu,
            description_en,
            description_hi,
            description_gu,
            short_description_en,
            short_description_hi,
            short_description_gu,
            price,
            category_en,
            category_hi,
            category_gu,
            image_url,
            colors,
            usage_suggestion_en,
            usage_suggestion_hi,
            usage_suggestion_gu,
            height_cm,
            width_cm,
            volume_ml,
        } = req.body;

        // Validate required fields
        if (!name_en || !description_en) {
            return res
                .status(400)
                .json({ error: "English name and description are required" });
        }

        const productData = {
            name_en: name_en.trim(),
            name_hi: name_hi?.trim() || name_en.trim(),
            name_gu: name_gu?.trim() || name_en.trim(),
            description_en: description_en.trim(),
            description_hi: description_hi?.trim() || description_en.trim(),
            description_gu: description_gu?.trim() || description_en.trim(),
            short_description_en: short_description_en?.trim() || '',
            short_description_hi: short_description_hi?.trim() || short_description_en?.trim() || '',
            short_description_gu: short_description_gu?.trim() || short_description_en?.trim() || '',
            price: parseFloat(price) || 0,
            category_en: category_en?.trim() || '',
            category_hi: category_hi?.trim() || category_en?.trim() || '',
            category_gu: category_gu?.trim() || category_en?.trim() || '',
            image_url: image_url?.trim() || '',
            colors: colors || null,
            usage_suggestion_en: usage_suggestion_en?.trim() || '',
            usage_suggestion_hi: usage_suggestion_hi?.trim() || usage_suggestion_en?.trim() || '',
            usage_suggestion_gu: usage_suggestion_gu?.trim() || usage_suggestion_en?.trim() || '',
            height_cm: parseFloat(height_cm) || null,
            width_cm: parseFloat(width_cm) || null,
            volume_ml: parseFloat(volume_ml) || null,
        };

        const { data, error } = await supabase
            .from("products")
            .insert(productData)
            .select()
            .single();

        if (error) {
            console.error("Supabase error:", error);
            return res
                .status(500)
                .json({ error: "Failed to create product" });
        }

        res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: data,
        });
    } catch (err) {
        console.error("Product creation error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.put("/api/admin/products/:id", authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name_en,
            name_hi,
            name_gu,
            description_en,
            description_hi,
            description_gu,
            short_description_en,
            short_description_hi,
            short_description_gu,
            price,
            category_en,
            category_hi,
            category_gu,
            image_url,
            colors,
            usage_suggestion_en,
            usage_suggestion_hi,
            usage_suggestion_gu,
            height_cm,
            width_cm,
            volume_ml,
        } = req.body;

        // Validate required fields
        if (!name_en || !description_en) {
            return res
                .status(400)
                .json({ error: "English name and description are required" });
        }

        const updateData = {
            name_en: name_en.trim(),
            name_hi: name_hi?.trim() || name_en.trim(),
            name_gu: name_gu?.trim() || name_en.trim(),
            description_en: description_en.trim(),
            description_hi: description_hi?.trim() || description_en.trim(),
            description_gu: description_gu?.trim() || description_en.trim(),
            short_description_en: short_description_en?.trim() || '',
            short_description_hi: short_description_hi?.trim() || short_description_en?.trim() || '',
            short_description_gu: short_description_gu?.trim() || short_description_en?.trim() || '',
            price: parseFloat(price) || 0,
            category_en: category_en?.trim() || '',
            category_hi: category_hi?.trim() || category_en?.trim() || '',
            category_gu: category_gu?.trim() || category_en?.trim() || '',
            image_url: image_url?.trim() || '',
            colors: colors || null,
            usage_suggestion_en: usage_suggestion_en?.trim() || '',
            usage_suggestion_hi: usage_suggestion_hi?.trim() || usage_suggestion_en?.trim() || '',
            usage_suggestion_gu: usage_suggestion_gu?.trim() || usage_suggestion_en?.trim() || '',
            height_cm: parseFloat(height_cm) || null,
            width_cm: parseFloat(width_cm) || null,
            volume_ml: parseFloat(volume_ml) || null,
            updated_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
            .from("products")
            .update(updateData)
            .eq("id", id)
            .select()
            .single();

        if (error) {
            console.error("Supabase error:", error);
            return res
                .status(500)
                .json({ error: "Failed to update product" });
        }

        if (!data) {
            return res.status(404).json({ error: "Product not found" });
        }

        res.json({
            success: true,
            message: "Product updated successfully",
            data: data,
        });
    } catch (err) {
        console.error("Product update error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.delete("/api/admin/products/:id", authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from("products")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Supabase error:", error);
            return res
                .status(500)
                .json({ error: "Failed to delete product" });
        }

        res.json({
            success: true,
            message: "Product deleted successfully",
        });
    } catch (err) {
        console.error("Product deletion error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// API Routes
app.get("/api/hero-content", async (req, res) => {
    try {
        const lang = req.query.lang || "en"; // Default to English

        const { data, error } = await supabase
            .from("hero_content")
            .select("*")
            .single();

        if (error) {
            console.error("Supabase error:", error);
            return res.status(500).json({
                error: "Failed to fetch hero content",
                fallback: {
                    title: "JV HELP",
                    subtitle: "Heal Help Protect",
                },
            });
        }

        // Return data with language-specific content
        const response = {
            id: data.id,
            title: data[`title_${lang}`] || data.title_en || "JV HELP",
            subtitle:
                data[`subtitle_${lang}`] ||
                data.subtitle_en ||
                "Heal Help Protect",
            // Include all language versions for frontend caching
            all_languages: {
                en: {
                    title: data.title_en,
                    subtitle: data.subtitle_en,
                },
                hi: {
                    title: data.title_hi,
                    subtitle: data.subtitle_hi,
                },
                gu: {
                    title: data.title_gu,
                    subtitle: data.subtitle_gu,
                },
            },
        };

        res.json(response);
    } catch (err) {
        console.error("Server error:", err);
        res.status(500).json({
            error: "Internal server error",
            fallback: {
                title: "JV HELP",
                subtitle: "Heal Help Protect",
            },
        });
    }
});

// Activities content API
app.get("/api/activities-content", async (req, res) => {
    try {
        const lang = req.query.lang || "en";

        const { data, error } = await supabase
            .from("activities")
            .select("*")
            .eq("is_active", true)
            .order("display_order");

        if (error) {
            console.error("Supabase error:", error);
            return res.status(500).json({
                error: "Failed to fetch activities content",
                data: [],
            });
        }

        // Transform data to include language-specific content
        const transformedData = data.map((item) => ({
            id: item.id,
            title: item[`title_${lang}`] || item.title_en,
            description: item[`description_${lang}`] || item.description_en,
            icon_url: item.icon_url,
            category: item.category,
            display_order: item.display_order,
        }));

        res.json({
            data: transformedData,
            language: lang,
            total: transformedData.length,
        });
    } catch (err) {
        console.error("Server error:", err);
        res.status(500).json({
            error: "Internal server error",
            data: [],
        });
    }
});

// Activities gallery API
app.get("/api/activities-gallery", async (req, res) => {
    try {
        const lang = req.query.lang || "en";

        const { data, error } = await supabase
            .from("activities_gallery")
            .select("*")
            .eq("is_active", true)
            .order("display_order");

        if (error) {
            console.error("Supabase error:", error);
            return res.status(500).json({
                error: "Failed to fetch activities gallery",
                data: [],
            });
        }

        // Transform data and include all images
        const transformedData = data.map((item) => {
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
                    Beneficiaries: getStatNumber(item.display_order),
                    [getSecondStatLabel(item.display_order)]:
                        getSecondStatNumber(item.display_order),
                    [getThirdStatLabel(item.display_order)]: getThirdStatNumber(
                        item.display_order,
                    ),
                },
            };
        });

        res.json({
            data: transformedData,
            language: lang,
            total: transformedData.length,
        });
    } catch (err) {
        console.error("Server error:", err);
        res.status(500).json({
            error: "Internal server error",
            data: [],
        });
    }
});

// Helper functions for gallery stats
function getStatNumber(order) {
    const stats = ["500+", "300+", "50+", "1000+", "200+", "100+"];
    return stats[order - 1] || "100+";
}

function getSecondStatNumber(order) {
    const stats = ["15", "15", "24/7", "365", "5", "100+"];
    return stats[order - 1] || "10";
}

function getSecondStatLabel(order) {
    const labels = [
        "Locations",
        "Schools",
        "Response",
        "Days",
        "Festivals",
        "Locations",
    ];
    return labels[order - 1] || "Locations";
}

function getThirdStatNumber(order) {
    const stats = ["95%", "95%", "90%", "100%", "100%", "85%"];
    return stats[order - 1] || "90%";
}

function getThirdStatLabel(order) {
    const labels = [
        "Success Rate",
        "Success Rate",
        "Recovery Rate",
        "Organic Feed",
        "Satisfaction",
        "Survival Rate",
    ];
    return labels[order - 1] || "Success Rate";
}

// Products API for public access
app.get("/api/products", async (req, res) => {
    try {
        const lang = req.query.lang || "en";
        const category = req.query.category;
        const featured = req.query.featured;

        let query = supabase
            .from("products")
            .select("*")
            .eq("is_active", true)
            .order("created_at", { ascending: true });

        if (category) {
            query = query.ilike(`category_${lang}`, `%${category}%`);
        }

        if (featured === 'true') {
            query = query.eq("is_featured", true);
        }

        const { data, error } = await query;

        if (error) {
            console.error("Supabase error:", error);
            return res.status(500).json({
                error: "Failed to fetch products",
                data: [],
            });
        }

        // Transform data to include language-specific content
        const transformedData = data.map((item) => ({
            id: item.id,
            name: item[`name_${lang}`] || item.name_en,
            description: item[`description_${lang}`] || item.description_en,
            category: item[`category_${lang}`] || item.category_en,
            price: item.price,
            currency: item.currency,
            image_url: item.image_url,
            is_featured: item.is_featured,
            stock_quantity: item.stock_quantity,
            // Include all language versions for frontend caching
            all_languages: {
                en: {
                    name: item.name_en,
                    description: item.description_en,
                    category: item.category_en,
                },
                hi: {
                    name: item.name_hi,
                    description: item.description_hi,
                    category: item.category_hi,
                },
                gu: {
                    name: item.name_gu,
                    description: item.description_gu,
                    category: item.category_gu,
                },
            },
        }));

        res.json({
            data: transformedData,
            language: lang,
            total: transformedData.length,
        });
    } catch (err) {
        console.error("Server error:", err);
        res.status(500).json({
            error: "Internal server error",
            data: [],
        });
    }
});

// Generic multilingual content API
app.get("/api/content/:table", async (req, res) => {
    try {
        const { table } = req.params;
        const lang = req.query.lang || "en";
        const id = req.query.id;

        let query = supabase.from(table).select("*");

        if (id) {
            query = query.eq("id", id);
        }

        const { data, error } = await supabase.from(table).select("*");

        if (error) {
            console.error("Supabase error:", error);
            return res.status(500).json({
                error: `Failed to fetch ${table} content`,
                data: [],
            });
        }

        // Transform data to include language-specific content
        const transformedData = data.map((item) => {
            const transformed = { ...item };

            // Find all multilingual fields and set current language values
            Object.keys(item).forEach((key) => {
                if (key.endsWith("_en")) {
                    const baseKey = key.replace("_en", "");
                    transformed[baseKey] =
                        item[`${baseKey}_${lang}`] ||
                        item[`${baseKey}_en`] ||
                        item[key];
                }
            });

            return transformed;
        });

        res.json({
            data: transformedData,
            language: lang,
            total: transformedData.length,
        });
    } catch (err) {
        console.error("Server error:", err);
        res.status(500).json({
            error: "Internal server error",
            data: [],
        });
    }
});

// User thoughts API endpoints
app.get("/api/user-thoughts", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("user_thoughts")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Supabase error:", error);
            return res.status(500).json({
                error: "Failed to fetch thoughts",
                data: [],
            });
        }

        res.json({
            data: data || [],
            total: data ? data.length : 0,
        });
    } catch (err) {
        console.error("Server error:", err);
        res.status(500).json({
            error: "Internal server error",
            data: [],
        });
    }
});

app.post("/api/user-thoughts", async (req, res) => {
    try {
        const { name, contact_no, thought, language, is_anonymous } = req.body;

        if (!thought || thought.trim() === "") {
            return res.status(400).json({
                error: "Thought content is required",
            });
        }

        const thoughtData = {
            name: is_anonymous ? null : name || null,
            contact_no: is_anonymous ? null : contact_no || null,
            thought: thought.trim(),
            language: language || "en",
            is_anonymous: is_anonymous || false,
        };

        const { data, error } = await supabase
            .from("user_thoughts")
            .insert([thoughtData])
            .select()
            .single();

        if (error) {
            console.error("Supabase error:", error);
            return res.status(500).json({
                error: "Failed to save thought",
            });
        }

        res.status(201).json({
            success: true,
            message: "Thank you for sharing your thoughts!",
            data: data,
        });
    } catch (err) {
        console.error("Server error:", err);
        res.status(500).json({
            error: "Internal server error",
        });
    }
});

// Debug endpoint to check admin users
app.get("/api/debug/admin-users", async (req, res) => {
    try {
        const { data, error } = await supabase.from("admin_users").select("*");

        if (error) {
            console.error("Debug - Supabase error:", error);
            return res.status(500).json({
                error: "Database error",
                details: error,
            });
        }

        res.json({
            success: true,
            count: data ? data.length : 0,
            users: data || [],
            database_connection: "OK",
        });
    } catch (err) {
        console.error("Debug - Server error:", err);
        res.status(500).json({
            error: "Server error",
            details: err.message,
        });
    }
});

// Setup endpoint to create admin user manually
app.post("/api/setup/create-admin", async (req, res) => {
    try {
        // Hash the password using the database function
        const { data: hashResult, error: hashError } = await supabase.rpc(
            "hash_password",
            { password: "JVHelp2025!" },
        );

        if (hashError) {
            console.error("Password hashing error:", hashError);
            return res.status(500).json({ error: "Password hashing failed" });
        }

        const { data, error } = await supabase
            .from("admin_users")
            .insert({
                username: "admin",
                password_hash: hashResult,
                email: "admin@jvhelp.org",
                role: "super_admin",
                is_active: true,
            })
            .select()
            .single();

        if (error) {
            console.error("Admin creation error:", error);
            return res.status(500).json({
                error: "Failed to create admin user",
                details: error,
            });
        }

        res.json({
            success: true,
            message: "Admin user created successfully",
            admin: {
                id: data.id,
                username: data.username,
                role: data.role,
            },
        });
    } catch (err) {
        console.error("Setup error:", err);
        res.status(500).json({
            error: "Internal server error",
            details: err.message,
        });
    }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Serve the main HTML file
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Handle 404
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});

module.exports = app;