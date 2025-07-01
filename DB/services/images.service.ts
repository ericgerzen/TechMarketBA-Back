import { pool } from '../db';
import { Image } from '../models/product.model';

export async function addImage(link: string, id_product: number): Promise<Image> {
    const result = await pool.query(
        'INSERT INTO images (link, id_product) VALUES ($1, $2) RETURNING *',
        [link, id_product]
    );
    return result.rows[0];
}

export async function getImagesByProduct(id_product: number): Promise<Image[]> {
    const result = await pool.query(
        'SELECT * FROM images WHERE id_product = $1',
        [id_product]
    );
    return result.rows;
}

export async function deleteImage(id_image: number): Promise<void> {
    await pool.query('DELETE FROM images WHERE id_image = $1', [id_image]);
}

