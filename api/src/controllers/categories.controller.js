import { findAllCategories, createCategory, deleteOne, findCategoryById, udpadeCategory } from '../services/categories.service.js'
import {AppError} from '../errors/AppError.js'

export const getAllCategories = async (req, res) => {
    const categories = await findAllCategories();

    res.status(200).json({ categories })
} 

export const getCategory = async (req, res) => {
    const categoryId = req.params.categoryId
    const category = await findCategoryById(categoryId)
    if(!category) {
        throw new AppError('La catégorie n\'existe pas', {
            statusCode: 404,
            code: 'NOT_FOUND'
        })
    }

    res.status(200).json( category )
}

export const addOneCategory = async (req, res) => {
    const { categoryName, description } = req.body;
    const category = await createCategory(categoryName, description);

    res.status(201).json({ category })
} 

export const updateCategory = async (req, res) => {
    const categoryId = req.params.categoryId;
    const category = await findCategoryById(categoryId);
    console.log(category)
    if(!category) {
        throw new AppError('La catégorie n\'existe pas', {
            statusCode: 404,
            code: 'NOT_FOUND'
        })
    }
    
    if(!req.body) {
        throw new AppError('Le corps de la requette HTTP est vide', {
            statusCode: 402,
            code: 'NO_CONTENT'
        })
    }

    for (const [key, value] of Object.entries(req.body)) {
        category[key] = req.body[key]
    }

    await udpadeCategory(category);

    res.sendStatus(204)
} 

export const deleteCategory = async (req, res) => {
    const categoryId = req.params.categoryId;
    await deleteOne(categoryId);

    res.sendStatus(201);
}