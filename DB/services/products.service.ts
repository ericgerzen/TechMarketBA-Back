import { pool } from "../db";
import { Product } from "../models/product.model";

const getAllProducts = async ():Promise<Product[]> => {
    const { rows } = await pool.query('SELECT * FROM products');
    return rows;
};

const getApprovedProducts = async ():Promise<Product[]> => {
    const { rows } = await pool.query('SELECT * FROM products WHERE approved = true');
    return rows;
}

const getProductByCategory = async (category: string): Promise<Product[]> => {
    const { rows } = await pool.query("SELECT * FROM products WHERE category = $1", [category]);
    return rows;
}

const getProductById = async (id_product:number) :Promise<Product | null> => {
    const { rows } = await pool.query("SELECT * FROM products WHERE id_product = $1", [id_product]);
    return rows[0] || null;
};

const getProductByUser = async (id_user:number): Promise<Product | null> => {
    const { rows } = await pool.query("SELECT * FROM products WHERE id_user = $1", [id_user]);
    return rows[0] || null;
};

const createProduct = async (
    name: string,
    description: string,
    category: string,
    model: string,
    condition: string,
    approved: boolean,
    id_user: number,
    picture: string,
    price: number
): Promise<Product> => {
    const { rows } = await pool.query(
        "INSERT INTO products (name, description, category, model, condition, approved, id_user, picture, price) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
        [name, description, category, model, condition, approved, id_user, picture, price]
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
    picture?: string,
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
    if (picture) {
        fields.push(`picture = $${fields.length + 1}`);
        values.push(picture);
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
}

const deleteProduct = async (id_product: number): Promise<number> => {
    await pool.query("DELETE FROM products WHERE id_product = $1", [id_product]);
    return id_product;
};

export default {
    getAllProducts,
    getApprovedProducts,
    getProductByCategory,
    getProductById,
    getProductByUser,
    createProduct,
    updateProduct,
    approveProduct,
    deleteProduct
};