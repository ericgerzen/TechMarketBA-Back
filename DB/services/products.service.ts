import { pool } from "../db";
import { Product } from "../models/product.model";

const getAllProducts = async (): Promise<any[]> => {
    const { rows } = await pool.query(`
        SELECT 
            p.*, 
            COALESCE(array_agg(i.link) FILTER (WHERE i.link IS NOT NULL), '{}') AS images
        FROM products p
        LEFT JOIN images i ON p.id_product = i.id_product
        GROUP BY p.id_product
    `);
    return rows;
};

const getApprovedProducts = async (): Promise<any[]> => {
    const { rows } = await pool.query(`
        SELECT 
            p.*, 
            u.name AS seller_name,
            u.surname AS seller_surname,
            COALESCE(array_agg(i.link) FILTER (WHERE i.link IS NOT NULL), '{}') AS images
        FROM products p
        LEFT JOIN images i ON p.id_product = i.id_product
        LEFT JOIN users u ON p.id_user = u.id_user
        WHERE p.approved = true
        GROUP BY p.id_product, u.name, u.surname
    `);
    return rows;
};

const getProductByCategory = async (category: string): Promise<any[]> => {
    const { rows } = await pool.query(`
        SELECT 
            p.*, 
            u.name AS seller_name,
            u.surname AS seller_surname,
            COALESCE(array_agg(i.link) FILTER (WHERE i.link IS NOT NULL), '{}') AS images
        FROM products p
        LEFT JOIN images i ON p.id_product = i.id_product
        LEFT JOIN users u ON p.id_user = u.id_user
        WHERE p.category = $1 AND p.approved = true
        GROUP BY p.id_product, u.name, u.surname
    `, [category]);
    return rows;
};

const getProductById = async (id_product: number): Promise<any | null> => {
    const { rows } = await pool.query(`
        SELECT 
            p.*, 
            u.name AS seller_name,
            u.surname AS seller_surname,
            COALESCE(array_agg(i.link) FILTER (WHERE i.link IS NOT NULL), '{}') AS images
        FROM products p
        LEFT JOIN images i ON p.id_product = i.id_product
        LEFT JOIN users u ON p.id_user = u.id_user
        WHERE p.id_product = $1
        GROUP BY p.id_product, u.name, u.surname
    `, [id_product]);
    return rows[0] || null;
};

const getApprovedProductById = async (id_product: number): Promise<any | null> => {
    const { rows } = await pool.query(`
        SELECT 
            p.*, 
            u.name AS seller_name,
            u.surname AS seller_surname,
            COALESCE(array_agg(i.link) FILTER (WHERE i.link IS NOT NULL), '{}') AS images
        FROM products p
        LEFT JOIN images i ON p.id_product = i.id_product
        LEFT JOIN users u ON p.id_user = u.id_user
        WHERE p.id_product = $1 AND p.approved = true
        GROUP BY p.id_product, u.name, u.surname
    `, [id_product]);
    return rows[0] || null;
};

const getProductByUser = async (id_user: number): Promise<any[]> => {
    const { rows } = await pool.query(`
        SELECT 
            p.*, 
            u.name AS seller_name,
            u.surname AS seller_surname,
            COALESCE(array_agg(i.link) FILTER (WHERE i.link IS NOT NULL), '{}') AS images
        FROM products p
        LEFT JOIN images i ON p.id_product = i.id_product
        LEFT JOIN users u ON p.id_user = u.id_user
        WHERE p.id_user = $1 AND p.approved = true
        GROUP BY p.id_product, u.name, u.surname
    `, [id_user]);
    return rows;
};

const getProductByUserSelf = async (id_user: number): Promise<any[]> => {
    const { rows } = await pool.query(`
        SELECT 
            p.*, 
            COALESCE(array_agg(i.link) FILTER (WHERE i.link IS NOT NULL), '{}') AS images
        FROM products p
        LEFT JOIN images i ON p.id_product = i.id_product
        WHERE p.id_user = $1
        GROUP BY p.id_product
    `, [id_user]);
    return rows;
};

const getCart = async (id_user: number): Promise<any[]> => {
    const { rows } = await pool.query(`
        SELECT 
            p.*, 
            COALESCE(array_agg(i.link) FILTER (WHERE i.link IS NOT NULL), '{}') AS images
        FROM cart c
        JOIN products p ON c.id_product = p.id_product
        LEFT JOIN images i ON p.id_product = i.id_product
        WHERE c.id_user = $1
        GROUP BY p.id_product
    `, [id_user]);
    return rows;
}

const getFavourite = async (id_user: number): Promise<any[]> => {
    const { rows } = await pool.query(`
        SELECT 
            p.*, 
            COALESCE(array_agg(i.link) FILTER (WHERE i.link IS NOT NULL), '{}') AS images
        FROM favourite f
        JOIN products p ON c.id_product = p.id_product
        LEFT JOIN images i ON p.id_product = i.id_product
        WHERE f.id_user = $1
        GROUP BY p.id_product
    `, [id_user]);
    return rows;
}

const searchProducts = async (
    searchTerm: string,
    limit: number = 20,
    offset: number = 0
): Promise<any[]> => {

    const exactMatchTerm = searchTerm;
    const wildcardSearchTerm = `%${searchTerm}%`;

    const { rows } = await pool.query(`
        SELECT 
            p.*, 
            u.name AS seller_name,
            u.surname AS seller_surname,
            COALESCE(array_agg(i.link) FILTER (WHERE i.link IS NOT NULL), '{}') AS images,
            
            -- This CASE statement creates the "relevance" score
            -- Lower numbers are MORE relevant
            CASE
                WHEN p.name ILIKE $1 THEN 1  -- Exact name match = 1st priority
                WHEN p.name ILIKE $2 THEN 2  -- Partial name match = 2nd priority
                WHEN p.category ILIKE $2 THEN 3 -- Category match = 3rd priority
                WHEN p.model ILIKE $2 THEN 4 -- Model match = 4th priority
                WHEN p.description ILIKE $2 THEN 5 -- Description match = 5th priority
                ELSE 6 -- Should not happen due to WHERE clause, but good practice
            END as relevance
            
        FROM products p
        LEFT JOIN images i ON p.id_product = i.id_product
        LEFT JOIN users u ON p.id_user = u.id_user
        WHERE 
            p.approved = true 
            AND (
                -- The WHERE clause finds ALL possible matches
                p.name ILIKE $2 OR
                p.description ILIKE $2 OR
                p.category ILIKE $2 OR
                p.model ILIKE $2
            )
        GROUP BY p.id_product, u.name, u.surname
        ORDER BY
            relevance ASC,  -- Sort by our relevance score (1, 2, 3...)
            p.name ASC      -- As a tie-breaker, sort alphabetically
        LIMIT $3  -- Apply pagination limit
        OFFSET $4 -- Apply pagination offset
    `, [exactMatchTerm, wildcardSearchTerm, limit, offset]);

    return rows;
};

const createProduct = async (
    name: string,
    description: string,
    category: string,
    model: string,
    condition: string,
    id_user: number,
    price: number
): Promise<Product> => {
    const { rows } = await pool.query(
        "INSERT INTO products (name, description, category, model, condition, approved, id_user, price) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
        [name, description, category, model, condition, true, id_user, price]
    );
    return rows[0];
};

const updateProduct = async (
    id_product: number,
    name?: string,
    description?: string,
    category?: string,
    model?: string,
    condition?: string,
    approved?: boolean,
    price?: number
): Promise<Product> => {
    const fields = [];
    const values = [];
    let query = "UPDATE products SET ";

    if (name) {
        fields.push(`name = $${fields.length + 1}`);
        values.push(name);
    }
    if (description) {
        fields.push(`description = $${fields.length + 1}`);
        values.push(description);
    }
    if (category) {
        fields.push(`category = $${fields.length + 1}`);
        values.push(category);
    }
    if (model) {
        fields.push(`model = $${fields.length + 1}`);
        values.push(model);
    }
    if (condition) {
        fields.push(`condition = $${fields.length + 1}`);
        values.push(condition);
    }
    if (approved !== undefined) {
        fields.push(`approved = $${fields.length + 1}`);
        values.push(approved);
    }
    if (price !== undefined) {
        fields.push(`price = $${fields.length + 1}`);
        values.push(price);
    }

    if (fields.length === 0) {
        throw new Error("No fields to update");
    }

    query += fields.join(", ") + ` WHERE id_product = $${fields.length + 1} RETURNING *`;

    values.push(id_product);

    const { rows } = await pool.query(query, values);

    return rows[0];
};

const approveProduct = async (id_product: number): Promise<number> => {
    await pool.query("UPDATE products SET approved = true WHERE id_product = $1", [id_product]);
    return id_product;
};

const addToCart = async (id_user: number, id_product: number): Promise<any> => {
    const { rows } = await pool.query(
        "INSERT INTO cart (id_user, id_product) VALUES ($1, $2) RETURNING *",
        [id_user, id_product]
    );
    return rows[0];
};

const addToFavourite = async (id_user: number, id_product: number): Promise<any> => {
    const { rows } = await pool.query(
        "INSERT INTO favourite (id_user, id_product) VALUES ($1, $2) RETURNING *",
        [id_user, id_product]
    );
    return rows[0];
};

const deleteProduct = async (id_product: number): Promise<number> => {
    await pool.query("DELETE FROM products WHERE id_product = $1", [id_product]);
    return id_product;
};

const deleteFromCart = async (id_cart: number): Promise<void> => {
    await pool.query("DELETE FROM cart WHERE id_cart = $1", [id_cart]);
}

const deleteFromFavourite = async (id_favourite: number): Promise<void> => {
    await pool.query("DELETE FROM favourite WHERE id_favourite = $1", [id_favourite]);
}

export default {
    getAllProducts,
    getApprovedProducts,
    getProductByCategory,
    getProductById,
    getApprovedProductById,
    getProductByUser,
    getProductByUserSelf,
    getCart,
    searchProducts,
    getFavourite,
    createProduct,
    updateProduct,
    approveProduct,
    addToCart,
    addToFavourite,
    deleteProduct,
    deleteFromCart,
    deleteFromFavourite
};
