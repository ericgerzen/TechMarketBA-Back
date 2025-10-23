import productsService from "../services/products.service";
import usersService from "../services/users.service";
import { AuthenticatedRequest} from "../types/customRequest";
import { Request, Response } from "express";

const getProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const products = await productsService.getAllProducts();
        res.status(200).json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: "Could not fetch products" });
    }
};

const getApprovedProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const products = await productsService.getApprovedProducts();
        res.status(200).json(products);
    } catch (error) {
        console.error("Error fetching approved products:", error);
        res.status(500).json({ message: "Could not fetch approved products" });
    }
}

const getProductByCategory = async (req: Request, res: Response): Promise<void> => {
    const category = req.params.category;
    if (!category) {
        res.status(400).json({ error: "A category is required" });
        return;
    }

    try {
        const products = await productsService.getProductByCategory(category);
        res.status(200).json(products);
    } catch (error) {
        console.error("Error fetching products by category:", error);
        res.status(500).json({ message: "Could not fetch products by category" });
    }
}

const getProduct = async (req: Request, res: Response): Promise<void> => {
    const id_product = Number(req.params.id);
    if (!id_product) {
        res.status(400).json({ error: "An id is required" });
        return;
    }

    try {
        const product = await productsService.getProductById(id_product);
        res.status(200).json(product);
    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({ message: "Could not fetch product" });
    }
}

const getApprovedProduct = async (req: Request, res: Response): Promise<void> => {
    const id_product = Number(req.params.id);
    if (!id_product) {
        res.status(400).json({ error: "An id is required" });
        return;
    }

    try {
        const product = await productsService.getApprovedProductById(id_product);
        if (!product) {
            res.status(404).json({ message: "Product not found" });
            return;
        }
        res.status(200).json(product);
    } catch (error) {
        console.error("Error fetching approved product:", error);
        res.status(500).json({ message: "Could not fetch approved product" });
    }
}

const getProductByUser = async (req: Request, res: Response): Promise<void> => {
    const id_user = Number(req.params.id);
    if (!id_user) {
        res.status(400).json({ error: "A user id is required" });
        return;
    }
    try {
        const products = await productsService.getProductByUser(id_user);
        res.status(200).json(products);
    } catch (error) {
        console.error("Error fetching products by user:", error);
        res.status(500).json({ message: "Could not fetch products by user" });
    }
}

const getProductByUserSelf = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const id_user = req.id_user;
    if (!id_user) {
        res.status(401).json({ error: "Unauthorized: missing user ID" });
        return;
    }
    try {
        const products = await productsService.getProductByUserSelf(id_user);
        res.status(200).json(products);
    } catch (error) {
        console.error("Error fetching products for self:", error);
        res.status(500).json({ message: "Could not fetch products for user" });
    }
}

const getCart = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const id_user = req.id_user;
    if (!id_user) {
        res.status(401).json({ error: "Unauthorized: missing user ID" });
        return;
    }
    try {
        const products = await productsService.getCart(id_user);
        res.status(200).json(products);
    } catch (error) {
        console.error("Error fetching cart:", error);
        res.status(500).json({ message: "Could not fetch cart for user" });
    }
}

const getFavourite = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const id_user = req.id_user;
    if (!id_user) {
        res.status(401).json({ error: "Unauthorized: missing user ID" });
        return;
    }
    try {
        const products = await productsService.getFavourite(id_user);
        res.status(200).json(products);
    } catch (error) {
        console.error("Error fetching cart:", error);
        res.status(500).json({ message: "Could not fetch cart for user" });
    }
}

const createProduct = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { name, description, category, model, condition, price } = req.body;
    const id_user = req.id_user;

    if (!id_user) {
        res.status(401).json({ error: "Unauthorized: missing user ID" });
        return;
    }

    try {
        const newProduct = await productsService.createProduct(name, description, category, model, condition, id_user, price);
        res.status(201).json(newProduct);
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ message: "Could not create product" });
    }
};

const updateProduct = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const id_product = Number(req.params.id);
    const tokenUserId = req.id_user;

    if (!id_product) {
        res.status(400).json({ error: "An id is required" });
        return;
    }

    if (!tokenUserId) {
        res.status(401).json({ error: "Unauthorized: missing user ID" });
        return;
    }

    const { name, description, category, model, condition, price } = req.body;

    try {
        const product = await productsService.getProductById(id_product);

        if (!product) {
            res.status(404).json({ message: "Product not found" });
            return;
        }

        if (product.id_user !== tokenUserId) {
            res.status(403).json({ message: "Forbidden: You are not the owner of this product" });
            return;
        }

        const updatedProduct = await productsService.updateProduct(
            id_product,
            name,
            description,
            category,
            model,
            condition,
            price
        );

        res.status(200).json(updatedProduct);
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ message: "Could not update product" });
    }
};

const approveProduct = async (req: Request, res: Response): Promise<void> => {
    const id_product = Number(req.params.id);
    if (!id_product) {
        res.status(400).json({ error: "An id is required" });
        return;
    }

    try {
        const approvedId = await productsService.approveProduct(id_product);
        res.status(200).json({ id_product: approvedId });
    } catch (error) {
        console.error("Error approving product:", error);
        res.status(500).json({ message: "Could not approve product" });
    }
};

const addToCart = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const id_product = Number(req.params.id);
    const id_user = req.id_user;

    if (!id_product) {
        res.status(400).json({ error: "An id is required" });
        return;
    }

    if (!id_user) {
        res.status(401).json({ error: "Unauthorized: missing user ID" });
        return;
    }

    try {
        await productsService.addToCart(id_user, id_product);
        res.status(200).json({ message: "Product added to cart" });
    } catch (error) {
        console.error("Error adding product to cart:", error);
        res.status(500).json({ message: "Could not add product to cart" });
    }
};

const addToFavourite = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const id_product = Number(req.params.id);
    const id_user = req.id_user;

    if (!id_product) {
        res.status(400).json({ error: "An id is required" });
        return;
    }

    if (!id_user) {
        res.status(401).json({ error: "Unauthorized: missing user ID" });
        return;
    }

    try {
        await productsService.addToFavourite(id_user, id_product);
        res.status(200).json({ message: "Product added to cart" });
    } catch (error) {
        console.error("Error adding product to cart:", error);
        res.status(500).json({ message: "Could not add product to cart" });
    }
};

const deleteProduct = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const id_product = Number(req.params.id);
    const tokenUserId = req.id_user;

    if (!id_product) {
        res.status(400).json({ error: "An id is required" });
        return;
    }

    if (!tokenUserId) {
        res.status(401).json({ error: "Unauthorized: missing user ID" });
        return;
    }

    try {
        const product = await productsService.getProductById(id_product); // Must include product.id_user
        if (!product) {
            res.status(404).json({ message: "Product not found" });
            return;
        }

        const requestingUser = await usersService.getUserById(tokenUserId);
        if (!requestingUser) {
            res.status(401).json({ message: "Unauthorized: user not found" });
            return;
        }

        const isAdmin = requestingUser.admin;
        const isOwner = product.id_user === tokenUserId;

        if (!isAdmin && !isOwner) {
            res.status(403).json({ message: "Forbidden: You can only delete your own products" });
            return;
        }

        const deletedId = await productsService.deleteProduct(id_product);
        res.status(200).json({ id_product: deletedId });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ message: "Could not delete product" });
    }
};

const deleteFromCart = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const id_cart = Number(req.params.id);

    if (!id_cart) {
        res.status(400).json({ error: "An id is required" });
        return;
    }

    try {
        await productsService.deleteFromCart(id_cart);
        res.status(200).json({ message: "Product removed from favourite" });
    } catch (error) {
        console.error("Error removing product from favourite:", error);
        res.status(500).json({ message: "Could not remove product from favourite" });
    }
}

const deleteFromFavourite = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const id_cart = Number(req.params.id);

    if (!id_cart) {
        res.status(400).json({ error: "An id is required" });
        return;
    }

    try {
        await productsService.deleteFromFavourite(id_cart);
        res.status(200).json({ message: "Product removed from favourite" });
    } catch (error) {
        console.error("Error removing product from favourite:", error);
        res.status(500).json({ message: "Could not remove product from favourite" });
    }
}

export default {
    getProducts,
    getApprovedProducts,
    getProductByCategory,
    getProduct,
    getApprovedProduct,
    getProductByUser,
    getProductByUserSelf,
    getCart,
    getFavourite,
    createProduct,
    updateProduct,
    approveProduct,
    addToCart,
    addToFavourite,
    deleteProduct,
    deleteFromCart,
    deleteFromFavourite
};
