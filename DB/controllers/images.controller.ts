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

const createImage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { link, id_product } = req.body;

    if (!link || !id_product) {
        res.status(400).json({ error: "Link and product ID are required" });
        return;
    }

    try {
        const newImage = await imagesService.createImage(link, id_product);
        res.status(201).json(newImage);
    } catch (error) {
        console.error("Error creating image:", error);
        res.status(500).json({ message: "Could not create image" });
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
    createImage,
    deleteImage
};