import { AppError } from "../errors/AppError.js";
import { findAllCategories } from '../services/categories.service.js'

export const getAllCategories = async (req, res) => {
    const categories = await findAllCategories();

    res.status(200).json({ categories })
} 