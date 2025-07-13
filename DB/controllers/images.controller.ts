import imagesService from '../services/images.service.js';
import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types/customRequest.js';

const getAllImages = async (req: Request, res: Response): Promise<void> => {
    try {
        const images = await imagesService.getAllImages();
        res.status(200).json(images);
    } catch (error) {
        console.error("Error fetching images:", error);
        res.status(500).json({ message: "Could not fetch images" });
    }
};

const getImageById = async (req: Request, res: Response): Promise<void> => {
    const id_image = Number(req.params.id);
    if (!id_image) {
        res.status(400).json({ error: "An id is required" });
        return;
    }

    try {
        const image = await imagesService.getImageById(id_image);
        if (!image) {
            res.status(404).json({ message: "Image not found" });
            return;
        }
        res.status(200).json(image);
    } catch (error) {
        console.error("Error fetching image:", error);
        res.status(500).json({ message: "Could not fetch image" });
    }
};

const getImagesByProductId = async (req: Request, res: Response): Promise<void> => {
    const id_product = Number(req.params.id);
    if (!id_product) {
        res.status(400).json({ error: "An id is required" });
        return;
    }

    try {
        const images = await imagesService.getImagesByProductId(id_product);
        res.status(200).json(images);
    } catch (error) {
        console.error("Error fetching images by product ID:", error);
        res.status(500).json({ message: "Could not fetch images by product ID" });
    }
};

export const uploadImages = async (req: Request, res: Response): Promise<void> => {
    try {
        const files = req.files as Express.Multer.File[];
        const id_product = parseInt(req.body.id_product);

        if (!id_product || isNaN(id_product)) {
            res.status(400).json({ error: "id_product is required and must be a number." });
            return;
        }

        if (!files || files.length === 0) {
            res.status(400).json({ error: "No files uploaded." });
            return;
        }

        const uploadedImages = await Promise.all(
            files.map(file => imagesService.createImage(file, id_product))
        );

        res.status(201).json({
            message: "Images uploaded and saved successfully.",
            images: uploadedImages,
        });
    } catch (error) {
        console.error("Error uploading images:", error);
        res.status(500).json({ error: "Failed to upload images." });
    }
};

const deleteImage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const id_image = Number(req.params.id);
    const tokenUserId = req.id_user;

    if (!id_image) {
        res.status(400).json({ error: "An id is required" });
        return;
    }

    if (!tokenUserId) {
        res.status(401).json({ message: "Unauthorized: Missing user ID in token" });
        return;
    }

    try {
        await imagesService.deleteImage(id_image);
        res.status(204).send();
    } catch (error) {
        console.error("Error deleting image:", error);
        res.status(500).json({ message: "Could not delete image" });
    }
};

export default {
    getAllImages,
    getImageById,
    getImagesByProductId,
    uploadImages,
    deleteImage
};