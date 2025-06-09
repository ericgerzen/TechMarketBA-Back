import { Router } from "express";
import productsController from "../controllers/products.controller";
import auth from "../middleware/auth";

const router = Router();

router.get("/", auth.verifyToken, auth.verifyAdmin, productsController.getProducts);
router.get('/approved', productsController.getApprovedProducts);
router.get('/category/:category', productsController.getProductByCategory);
router.get('/:id', auth.verifyToken, auth.verifyAdmin, productsController.getProduct);
router.get('/approved/:id', productsController.getApprovedProduct);
router.post('/', auth.verifyToken, auth.verifySeller, productsController.createProduct);
router.put('/:id', auth.verifyToken,     productsController.updateProduct);
router.put('/approve/:id', auth.verifyToken, auth.verifyAdmin, productsController.approveProduct);
router.delete('/:id', auth.verifyToken, productsController.deleteProduct);

export default router;
