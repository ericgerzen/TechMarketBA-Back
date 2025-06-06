import usersService from "../services/users.service.ts";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();


const JWT_KEY = process.env.JWT_KEY as string;

const register = async (req: Request, res: Response) => {
    const { name, surname, email, password } = req.body;

    if (!name || !surname || !email || !password) {
        return res.status(400).json({ message: "Missing fields" });
    }

    try {
        const testMail = await usersService.getUserByEmail(email);
        if (testMail) {
            return res.status(400).json({message: "Email already in use"});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        await usersService.createUser(name, surname, email, hashedPassword);
        res.status(201).json({ message: "User registered succesfully" });

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Could not register user" });
    }
};

const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Missing fields" });
    }

    try {
        const user = await usersService.getUserByEmail(email);
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        console.log("Retrieved user:", user);
        console.log("Retrieved password:", user.pass);

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: "Contraseña incorrecta" });
        }

        const token = jwt.sign({ id_user: user.id }, JWT_KEY, { expiresIn: '4h' });
        res.status(200).json({ id_user: user.id, token });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Error al iniciar sesión" });
    }
};


const getUsers = async (_: unknown, res: Response) => {
    try {
        const usuarios = await usersService.getAllUsers();
        return res.json(usuarios);
    } catch (error) {
        const errorMessage = (error instanceof Error) ? error.message : "Unknown error";
        return res.status(500).json({ error: errorMessage });
    }
};

const getUser = async (req: Request, res: Response) => {
    const id_user = Number(req.params.id);

    if (!id_user) {
        return res.status(400).json("An id is required")
    }

    try {
        const user = await usersService.getUserById(id_user);
        return res.json(user);
    } catch (error) {
        const errorMessage = (error instanceof Error) ? error.message : "Unknown error";
        return res.status(500).json({ error: errorMessage });
    }
};

const createUser = async (req: Request, res: Response) => {
    const { name, surname, email, password } = req.body;

    if (!name || !surname || !email || !password) {
        return res.status(400).json({ error: "Missing info, fella" });
    }

    try {
        const newUser = await usersService.createUser(name, surname, email, password);
        return res.status(201).json(newUser);
    } catch (error) {
        const errorMessage = (error instanceof Error) ? error.message : "Unknown error";
        return res.status(500).json({ error: errorMessage });
    }
};

const updateUser = async (req: Request, res: Response) => {
    const { name, surname, email, password } = req.body;
    const id_user = Number(req.params.id);

    if (!id_user) {
        return res.status(400).json({ error: "Missing user ID" });
    }

    let hashedPassword: string | undefined = undefined;
    if (password) {
        const salt = await bcrypt.genSalt(10);
        hashedPassword = await bcrypt.hash(password, salt);
    }

    try {
        await usersService.updateUser(id_user, name, surname, email, hashedPassword);
        return res.json(id_user);
    } catch (error) {
        const errorMessage = (error instanceof Error) ? error.message : "Unknown error";
        return res.status(500).json({ error: errorMessage });
    }
};

const promoteUser = async (req: Request, res: Response) => {
    const id_user = Number(req.params.id);

    if (!id_user) {
        return res.status(400).json({ error: "An id is required" });
    }

    try {
        const newAdmin = await usersService.promoteUser(id_user);
        return res.json(newAdmin)
    } catch (error) {
        const errorMessage = (error instanceof Error) ? error.message : "Unknown error";
        return res.status(500).json({ error: errorMessage });
    }
};

const deleteUser = async (req: Request, res: Response) => {
    const id_user = Number(req.params.id);
    try {
        const deletedId = await usersService.deleteUser(id_user);
        return res.json(deletedId);
    } catch (error) {
        const errorMessage = (error instanceof Error) ? error.message : "Unknown error";
        return res.status(500).json({ error: errorMessage });
    }
};

export default {
    login,
    register,
    getUsers,
    getUser,
    createUser,
    updateUser,
    promoteUser,
    deleteUser,
};