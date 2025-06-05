import { client } from "../db.ts";

const getAllUsers = async () => {
    const { rows } = await client.query('SELECT * FROM users');
    return rows;
};

const getUserById = async (id_user:number) => {
    const { rows } = await client.query("SELECT * FROM users WHERE id_user = $1", [id_user]);
    return rows[0];
};

const getUserByEmail = async (email:string) => {
    const { rows } = await client.query("SELECT * FROM users WHERE email = $1", [email]);
    return rows[0];
};

const createUser = async (name:string, surname:string, email:string, password:string | undefined) => {
    const { rows } = await client.query("INSERT INTO users (name, surname, email, password, seller) VALUES ($1, $2, $3, $4, false)",
        [name, surname, email, password]);
    return rows[0];
};

const updateUser = async (id_user:number, name:string, surname:string, email:string, password:string | undefined) => {
    const fields = [];
    const values = [];
    let query = "UPDATE users SET ";

    if (name) {
        fields.push(`usuario = $${fields.length + 1}`);
        values.push(name);
    }
    if (surname) {
        fields.push(`apellido = $${fields.length + 1}`);
        values.push(surname);
    }
    if (email) {
        fields.push(`email = $${fields.length + 1}`);
        values.push(email);
    }
    if (password) {
        fields.push(`pass = $${fields.length + 1}`);
        values.push(password);
    }

    if (fields.length === 0) {
        throw new Error("No fields to update");
    }

    query += fields.join(", ");
    query += ` WHERE id = $${fields.length + 1}`;
    values.push(id_user);

    const { rows } = await client.query(query, values);
    return rows[0];
};

const promoteUser = async (id_user:number) => {
    await client.query("UPDATE users SET seller = true WHERE id_user = $1", [id_user]);
    return id_user;
};

const deleteUser = async (id_user:number) => {
    await client.query("DELETE FROM users WHERE id = $1", [id_user]);
    return id_user;
};

export default {
    getAllUsers,
    getUserById,
    getUserByEmail,
    createUser,
    updateUser,
    promoteUser,
    deleteUser,
};