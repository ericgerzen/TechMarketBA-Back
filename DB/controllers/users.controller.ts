import usersService from "../services/users.service";
import { AuthenticatedRequest } from "../types/customRequest";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();


const JWTKEY = process.env.JWTKEY as string;

const register = async (req: Request, res: Response):Promise<void> => {
    const { name, surname, email, password } = req.body;

    if (!name || !surname || !email || !password) {
        res.status(400).json({ message: "Missing fields" });
        return;
    }

    try {
        const testMail = await usersService.getUserByEmail(email);
        if (testMail) {
            res.status(400).json({message: "Email already in use"});
            return;
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

const login = async (req: Request, res: Response):Promise<void> => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({ message: "Missing fields" });
        return;
    }

    try {
        const user = await usersService.getUserByEmail(email);
        if (!user) {
            res.status(400).json({ message: "User not found" });
            return;
        }

        console.log("Retrieved user:", user);
        console.log("Retrieved password:", user.password);

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            res.status(400).json({ message: "Wrong password" });
            return;
        }

        const token = jwt.sign({ id: user.id_user }, JWTKEY, { expiresIn: '4h' });
        res.status(200).json({ id: user.id_user, token });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Login error" });
    }
};


const getUsers = async (_: unknown, res: Response):Promise<void> => {
    try {
        const usuarios = await usersService.getAllUsers();
        res.json(usuarios);
    } catch (error) {
        const errorMessage = (error instanceof Error) ? error.message : "Unknown error";
        res.status(500).json({ error: errorMessage });
    }
};

const getUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const requestedId = Number(req.params.id);
    const tokenUserId = req.id_user;

    if (!tokenUserId) {
        res.status(401).json({ message: "Unauthorized: Missing user ID" });
        return;
    }

    try {
        const requestingUser = await usersService.getUserById(tokenUserId);

        if (!requestingUser) {
            res.status(401).json({ message: "Unauthorized: User not found" });
            return;
        }

        const isAdmin = requestingUser.admin;

        if (!isAdmin && requestedId !== tokenUserId) {
            res.status(403).json({ message: "Forbidden: Access denied" });
            return;
        }

        const user = await usersService.getUserById(requestedId);

        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        res.status(200).json(user);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        res.status(500).json({ error: errorMessage });
    }
};



const createUser = async (req: Request, res: Response):Promise<void> => {
    const { name, surname, email, password } = req.body;

    if (!name || !surname || !email || !password) {
        res.status(400).json({ error: "Missing info, fella" });
        return;
    }

    try {
        const newUser = await usersService.createUser(name, surname, email, password);
        res.status(201).json(newUser);
    } catch (error) {
        const errorMessage = (error instanceof Error) ? error.message : "Unknown error";
        res.status(500).json({ error: errorMessage });
    }
};

const updateUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { name, surname, email, password, description } = req.body;
    const id_user = Number(req.params.id);
    const tokenUserId = req.id_user;

    if (!id_user) {
        res.status(400).json({ error: "Missing user ID" });
        return;
    }

    if (!tokenUserId) {
        res.status(401).json({ message: "Unauthorized: Missing user ID in token" });
        return;
    }

    try {
        const requestingUser = await usersService.getUserById(tokenUserId);

        if (!requestingUser) {
            res.status(401).json({ message: "Unauthorized: Requesting user not found" });
            return;
        }

        const isAdmin = requestingUser.admin;

        if (!isAdmin && id_user !== tokenUserId) {
            res.status(403).json({ message: "Forbidden: You can only update your own profile" });
            return;
        }

        let hashedPassword: string | undefined = undefined;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(password, salt);
        }

        await usersService.updateUser(id_user, name, surname, email, hashedPassword, description);
        res.json({ id_user });
    } catch (error) {
        const errorMessage = (error instanceof Error) ? error.message : "Unknown error";
        res.status(500).json({ error: errorMessage });
    }
};

const promoteUser = async (req: Request, res: Response):Promise<void> => {
    const id_user = Number(req.params.id);

    if (!id_user) {
        res.status(400).json({ error: "An id is required" });
        return;
    }

    try {
        const newAdmin = await usersService.promoteUser(id_user);
        res.json(newAdmin)
    } catch (error) {
        const errorMessage = (error instanceof Error) ? error.message : "Unknown error";
        res.status(500).json({ error: errorMessage });
    }
};

const crownUser = async (req: Request, res: Response):Promise<void> => {
    const id_user = Number(req.params.id);

    if (!id_user) {
        res.status(400).json({ error: "An id is required" });
        return;
    }

    try {
        const newAdmin = await usersService.crownUser(id_user);
        res.json(newAdmin)
    } catch (error) {
        const errorMessage = (error instanceof Error) ? error.message : "Unknown error";
        res.status(500).json({ error: errorMessage });
    }
};

const deleteUser = async (req: Request, res: Response):Promise<void> => {
    const id_user = Number(req.params.id);
    try {
        const deletedId = await usersService.deleteUser(id_user);
        res.json(deletedId);
    } catch (error) {
        const errorMessage = (error instanceof Error) ? error.message : "Unknown error";
        res.status(500).json({ error: errorMessage });
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
    crownUser,
    deleteUser,
};