import { Router } from "express";
import productsController from "../controllers/products.controller";
import auth from "../middleware/auth";

const router = Router();

router.get("/", auth.verifyToken, auth.verifyAdmin, productsController.getProducts);
router.get('/approved', productsController.getApprovedProducts);
router.get('/category/:category', productsController.getProductByCategory);
router.get('/:id', auth.verifyToken, auth.verifyAdmin, productsController.getProduct);
router.get('/approved/:id', productsController.getApprovedProduct);
router.get('/user/:id', productsController.getProductByUser);
router.get('/self', auth.verifyToken, productsController.getProductByUserSelf);
router.get('/cart', auth.verifyToken, productsController.getCart);
router.get('/favourite', auth.verifyToken, productsController.getFavourite);
router.post('/', auth.verifyToken, auth.verifySeller, productsController.createProduct);
router.post('/cart', auth.verifyToken, productsController.addToCart);
router.post('/favourite', auth.verifyToken, productsController.addToFavourite);
router.put('/:id', auth.verifyToken, productsController.updateProduct);
router.put('/approve/:id', auth.verifyToken, auth.verifyAdmin, productsController.approveProduct);
router.delete('/:id', auth.verifyToken, productsController.deleteProduct);
router.delete('/cart/:id', auth.verifyToken, productsController.deleteFromCart);
router.delete('/favourite/:id', auth.verifyToken, productsController.deleteFromFavourite);


export default router;
