import { Router } from "express";
import imagesController from "../controllers/images.controller";
import { upload } from "../middleware/multer";
import auth from "../middleware/auth";

const router = Router();
router.get("/", auth.verifyToken, auth.verifyAdmin, imagesController.getAllImages);
router.get("/:id", auth.verifyToken, imagesController.getImageById);
router.get("/product/:id", imagesController.getImagesByProductId);
router.post("/", auth.verifyToken, auth.verifySeller, upload.array('images', 10), imagesController.uploadImages);
router.delete("/:id", auth.verifyToken, auth.verifyAdmin, imagesController.deleteImage);

export default router;