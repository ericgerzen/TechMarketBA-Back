import { Router } from "express";
import imagesController from "../controllers/images.controller";
import auth from "../middleware/auth";

const router = Router();
router.get("/", auth.verifyToken, auth.verifyAdmin, imagesController.getAllImages);
router.get("/:id", auth.verifyToken, auth.verifyAdmin, imagesController.getImageById);
router.get("/product/:id", auth.verifyToken, auth.verifyAdmin, imagesController.getImagesByProductId);
router.post("/", auth.verifyToken, auth.verifySeller, imagesController.createImage);
router.delete("/:id", auth.verifyToken, auth.verifyAdmin, imagesController.deleteImage);

export default router;