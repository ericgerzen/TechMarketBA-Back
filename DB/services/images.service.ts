import { pool } from "../db";
import { Image } from "../models/image.model";
import cloudinary from '../middleware/cloudinary';

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

const createImage = async (file: Express.Multer.File, id_product: number): Promise<Image> => {
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            { folder: "products" },
            (err, result) => {
                if (err || !result) return reject(err);
                resolve(result);
            }
        ).end(file.buffer);
    });

    const link = result.secure_url;

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