import { pool } from '../db';
import { Tag } from '../models/tag.model';

const getAllTags = async (): Promise<Tag[]> => {
    const { rows } = await pool.query('SELECT * FROM tags');
    return rows;
};

const getTagsByProductId = async (id_product: number): Promise<Tag[]> => {
    const { rows } = await pool.query('SELECT * FROM tags WHERE id_product = $1', [id_product]);
    return rows;
};

const createTag = async (name: string, id_product: number): Promise<Tag> => {
    const { rows } = await pool.query(
        'INSERT INTO tags (name, id_product) VALUES ($1, $2) RETURNING *',
        [name, id_product]
    );
    return rows[0];
};

const deleteTag = async (id_tag: number): Promise<void> => {
    await pool.query('DELETE FROM tags WHERE id_tag = $1', [id_tag]);
};

export default {
    getAllTags,
    getTagsByProductId,
    createTag,
    deleteTag
};

