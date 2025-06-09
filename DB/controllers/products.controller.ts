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

const createProduct = async (req: Request, res: Response): Promise<void> => {
    const { name, description, category, model, condition, approved, id_user, picture, price } = req.body;

    try {
        const newProduct = await productsService.createProduct(name, description, category, model, condition, approved, id_user, picture, price);
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

    const { name, description, category, model, condition, approved, picture, price } = req.body;

    try {
        const product = await productsService.getProductById(id_product); // Make sure this returns the user ID who owns the product

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
            approved,
            picture,
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

export default {
    getProducts,
    getApprovedProducts,
    getProductByCategory,
    getProduct,
    getApprovedProduct,
    createProduct,
    updateProduct,
    approveProduct,
    deleteProduct
};
