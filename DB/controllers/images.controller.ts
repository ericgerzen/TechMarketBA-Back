import { Request, Response } from 'express';
import cloudinary from '../cloudinary';
import { addImage, getImagesByProduct, deleteImage } from '../services/images.service';

// 1. Upload image to Cloudinary and save link in DB
export const uploadImageController = async (req: Request, res: Response) => {
    try {
        const { id_product } = req.body;
        if (!req.file || !id_product) {
            return res.status(400).json({ message: 'Image file and id_product are required.' });
        }
        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'products',
        });
        // Save link in DB
        const image = await addImage(result.secure_url, id_product);
        res.status(201).json(image);
    } catch (error) {
        res.status(500).json({ message: 'Error uploading image', error });
    }
};

// 2. Get all images for a product
export const getImagesByProductController = async (req: Request, res: Response) => {
    try {
        const { id_product } = req.params;
        const images = await getImagesByProduct(Number(id_product));
        res.json(images);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching images', error });
    }
};

// 3. Delete an image by ID
export const deleteImageController = async (req: Request, res: Response) => {
    try {
        const { id_image } = req.params;
        await deleteImage(Number(id_image));
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting image', error });
    }
};

