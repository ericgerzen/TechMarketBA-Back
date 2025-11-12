import { pool } from "../db";
import { User } from "../models/user.model";
import cloudinary from '../middleware/cloudinary';
import {Image} from "../models/image.model";

const getAllUsers = async ():Promise<User[]> => {
    const { rows } = await pool.query('SELECT * FROM users');
    return rows;
};

const getUserById = async (id_user:number) :Promise<User | null> => {
    const { rows } = await pool.query("SELECT * FROM users WHERE id_user = $1", [id_user]);
    return rows[0] || null;
};

const getUserByEmail = async (email:string): Promise<User | null> => {
    const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    return rows[0] || null;
};

const createUser = async (
    name: string,
    surname: string,
    email: string,
    password: string
): Promise<User> => {
    const { rows } = await pool.query(
        "INSERT INTO users (name, surname, email, password, description, seller, admin, picture) VALUES ($1, $2, $3, $4, '', false, false, null) RETURNING *",
        [name, surname, email, password]
    );
    return rows[0];
};

const updateUser = async (
    id_user: number,
    name?: string,
    surname?: string,
    email?: string,
    password?: string,
    description?: string
): Promise<User> => {
    const fields = [];
    const values = [];
    let query = "UPDATE users SET ";

    if (name) {
        fields.push(`name = $${fields.length + 1}`);
        values.push(name);
    }
    if (surname) {
        fields.push(`surname = $${fields.length + 1}`);
        values.push(surname);
    }
    if (email) {
        fields.push(`email = $${fields.length + 1}`);
        values.push(email);
    }
    if (password) {
        fields.push(`password = $${fields.length + 1}`);
        values.push(password);
    }
    if (description) {
        fields.push(`description = $${fields.length + 1}`);
        values.push(description);
    }

    if (fields.length === 0) {
        throw new Error("No fields to update");
    }

    query += fields.join(", ");
    query += ` WHERE id_user = $${fields.length + 1} RETURNING *`;
    values.push(id_user);

    const { rows } = await pool.query(query, values);
    return rows[0];
};

const setProfilePicture = async (file: Express.Multer.File, id_user: number): Promise<Image> => {
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            { folder: "users" },
            (err, result) => {
                if (err || !result) return reject(err);
                resolve(result);
            }
        ).end(file.buffer);
    });

    const link = result.secure_url;

    const { rows } = await pool.query(
        "UPDATE users SET picture = $1 WHERE id_user = $2", [link, id_user]
    );

    return rows[0];
};

const promoteUser = async (id_user: number): Promise<number> => {
    await pool.query("UPDATE users SET seller = true WHERE id_user = $1", [id_user]);
    return id_user;
};

const crownUser = async (id_user: number): Promise<number> => {
    await pool.query("UPDATE users SET admin = true WHERE id_user = $1", [id_user]);
    return id_user;
};

const deleteUser = async (id_user: number): Promise<number> => {
    await pool.query("DELETE FROM users WHERE id_user = $1", [id_user]);
    return id_user;
};

const getUserForAny = async (id_user: number): Promise<{ name: string; surname: string; description: string } | null> => {
    const { rows } = await pool.query(
        "SELECT name, surname, description, picture FROM users WHERE id_user = $1",
        [id_user]
    );
    return rows[0] || null;
};

export default {
    getAllUsers,
    getUserById,
    getUserByEmail,
    createUser,
    updateUser,
    promoteUser,
    crownUser,
    setProfilePicture,
    deleteUser,
    getUserForAny,
};