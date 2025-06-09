import { Router } from "express";
import productsController from "../controllers/products.controller";
import auth from "../middleware/auth";

const router = Router();

router.get("/", productsController.getProducts);
router.get('/:id', productsController.getProduct);
router.post('/', auth.verifyToken, auth.verifySeller, productsController.createProduct);
router.put('/:id', auth.verifyToken, productsController.updateProduct);
router.put('/approve/:id', auth.verifyToken, auth.verifyAdmin, productsController.approveProduct);
router.delete('/:id', auth.verifyToken, productsController.deleteProduct);

export default router;
