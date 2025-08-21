import tagsService from "../services/tags.service";
import { Request, Response } from "express";

const getAllTags = async (req: Request, res: Response): Promise<void> => {
    try {
        const tags = await tagsService.getAllTags();
        res.status(200).json(tags);
    } catch (error) {
        console.error("Error fetching tags:", error);
        res.status(500).json({ message: "Could not fetch tags" });
    }
};

const getTagsByProductId = async (req: Request, res: Response): Promise<void> => {
    const id_product = Number(req.params.id);
    if (!id_product) {
        res.status(400).json({ error: "An id is required" });
        return;
    }

    try {
        const tags = await tagsService.getTagsByProductId(id_product);
        res.status(200).json(tags);
    } catch (error) {
        console.error("Error fetching tags by product ID:", error);
        res.status(500).json({ message: "Could not fetch tags by product ID" });
    }
}

const createTag = async (req: Request, res: Response): Promise<void> => {
    const { name, id_product } = req.body;
    if (!name || !id_product) {
        res.status(400).json({ error: "Name and id_product are required" });
        return;
    }

    try {
        const newTag = await tagsService.createTag(name, id_product);
        res.status(201).json(newTag);
    } catch (error) {
        console.error("Error creating tag:", error);
        res.status(500).json({ message: "Could not create tag" });
    }
};

const deleteTag = async (req: Request, res: Response): Promise<void> => {
    const id_tag = Number(req.params.id);
    if (!id_tag) {
        res.status(400).json({ error: "An id is required" });
        return;
    }

    try {
        await tagsService.deleteTag(id_tag);
        res.status(204).send();
    } catch (error) {
        console.error("Error deleting tag:", error);
        res.status(500).json({ message: "Could not delete tag" });
    }
};

export default {
    getAllTags,
    getTagsByProductId,
    createTag,
    deleteTag
};

