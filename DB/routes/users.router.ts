import { Router } from "express";
import usersController from "../controllers/users.controller";
import { upload } from "../middleware/multer";
import auth from "../middleware/auth";

const router = Router();

router.post("/register", usersController.register);
router.post("/login", usersController.login);
router.get("/", auth.verifyToken, auth.verifyAdmin, usersController.getUsers);
router.get('/:id', auth.verifyToken, usersController.getUser);
router.get('/public/:id', usersController.getUserForAny);
router.post('/', auth.verifyToken, auth.verifyAdmin, usersController.createUser);
router.put('/:id', auth.verifyToken, usersController.updateUser);
router.put('/promote/:id', auth.verifyToken, auth.verifyAdmin, usersController.promoteUser);
router.put('/crown/:id', auth.verifyToken, auth.verifyAdmin, usersController.crownUser);
router.put('/picture/:id', auth.verifyToken, upload.single('image') ,usersController.setProfilePicture);
router.delete('/:id', auth.verifyToken, auth.verifyAdmin, usersController.deleteUser);

export default router;
