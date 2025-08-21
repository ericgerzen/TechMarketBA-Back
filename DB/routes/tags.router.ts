import { Router } from "express";
import tagsController from "../controllers/tags.controller";
import auth from "../middleware/auth";

const router = Router();

router.get("/", auth.verifyToken, auth.verifyAdmin, tagsController.getAllTags);
router.get("/product/:id", tagsController.getTagsByProductId);
router.post("/", auth.verifyToken, auth.verifySeller, tagsController.createTag);
router.delete("/:id", auth.verifyToken, auth.verifySeller, tagsController.deleteTag);

export default router;
