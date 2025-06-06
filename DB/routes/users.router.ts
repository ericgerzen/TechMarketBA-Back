import { Router } from "express";
import usersController from "../controllers/users.controller";
import auth from "../middleware/auth";

const router = Router();

router.post("/register", usersController.register);
router.post("/login", usersController.login);
router.get("/", auth.verifyToken, auth.verifyAdmin, usersController.getUsers);
router.get('/:id', auth.verifyToken, usersController.getUser);
router.post('/', auth.verifyToken, auth.verifyAdmin, usersController.createUser);
router.put('/:id', auth.verifyToken, usersController.updateUser);
router.put('/promote/:id', auth.verifyToken, auth.verifyAdmin, usersController.promoteUser);
router.delete('/:id', auth.verifyToken, auth.verifyAdmin, usersController.deleteUser);

export default router;
