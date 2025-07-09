import { pool } from "../db";
import { Image } from "../models/image.model";

const getAllImages = async (): Promise<Image[]> => {
    const { rows } = await pool.query('SELECT * FROM images');
    return rows;
};

const getImageById = async (id_image: number): Promise<Image | null> => {
    const { rows } = await pool.query("SELECT * FROM images WHERE id_image = $1", [id_image]);
    return rows[0] || null;
};

const getImagesByProductId = async (id_product: number): Promise<Image[]> => {
    const { rows } = await pool.query("SELECT * FROM images WHERE id_product = $1", [id_product]);
    return rows;
};

const createImage = async (link: string, id_product: number): Promise<Image> => {
    const { rows } = await pool.query(
        "INSERT INTO images (link, id_product) VALUES ($1, $2) RETURNING *",
        [link, id_product]
    );
    return rows[0];
};

const deleteImage = async (id_image: number): Promise<void> => {
    await pool.query("DELETE FROM images WHERE id_image = $1", [id_image]);
}

export default {
    getAllImages,
    getImageById,
    getImagesByProductId,
    createImage,
    deleteImage
}