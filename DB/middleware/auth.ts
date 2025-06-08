import jwt from "jsonwebtoken";
import UsersService from "../services/users.service";
import { JwtPayload} from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const JWTKEY = process.env.JWTKEY as string;

export const verifyToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Empty token or incorrect format" });
    }

    const token = authHeader.split(" ")[1];
    try {
        const verification = jwt.verify(token, JWTKEY);
        if (typeof verification === "object" && verification !== null && "id" in verification) {
            req.id_user = (verification as JwtPayload).id;
            next();
        }
    } catch (error) {
        console.log(error);
        return res.status(401).json({ message: "Invalid token" });
    }
}

export const verifySeller = async (req: any, res: any, next: any) => {
    const id_user = req.id_user;
    try {
        const user = await UsersService.getUserById(id_user);
        if (!user || !user.seller) {
            return res.status(403).json({ message: "Access denied" });
        }
        next();
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error verifying seller status" });
    }
}

export const verifyAdmin = async (req: any, res: any, next: any) => {
    const id_user = req.id_user;
    try {
        const user = await UsersService.getUserById(id_user);
        if (!user || !user.admin) {
            return res.status(403).json({ message: "Access denied" });
        }
        next();
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error verifying admin status" });
    }
}

export default {
    verifyToken,
    verifySeller,
    verifyAdmin
}