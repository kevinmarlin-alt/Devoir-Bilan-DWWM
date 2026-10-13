import { AppError } from "../errors/AppError.js";
import { findAllCategories } from '../services/categories.service.js'

export const getAllCategories = async (req, res) => {
    const categories = await findAllCategories();

    if(categories.length === 0) {
        throw new AppError('Aucune catégorie enregistrée',
            {
                status: 204,
                code: "NO_CONTENT"
            }
        )
    }

    res.status(200).json({ categories })
} 