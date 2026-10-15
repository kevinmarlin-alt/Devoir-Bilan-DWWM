import { findAllCategories, createCategory, deleteOne } from '../services/categories.service.js'

export const getAllCategories = async (req, res) => {
    const categories = await findAllCategories();

    res.status(200).json({ categories })
} 

export const addOneCategory = async (req, res) => {
    const { categoryName, description } = req.body;
    const category = await createCategory(categoryName, description);

    res.status(201).json({ category })
} 

export const deleteCategory = async (req, res) => {
    const categoryId = req.params.categoryId;
    await deleteOne(categoryId);

    res.sendStatus(201);
}