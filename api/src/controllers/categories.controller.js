import { getAllCategories, addCategory, deleteOne, getCategoryById, udpadeCategory } from '../services/categories.service.js'
import {AppError} from '../errors/AppError.js'

export const getCategories = async (req, res) => {
    const categories = await getAllCategories();

    res.status(200).json( categories )
} 

export const getCategory = async (req, res) => {
    if(!req.params.categoryId) {
        throw new AppError('Le paramettre "categoryId" de la requêtte HTTP est vide', {
            statusCode: 402,
            code: 'NO_CONTENT'
        })
    }
    const categoryId = req.params.categoryId;

    const category = await getCategoryById(categoryId);

    if(!category) {
        throw new AppError('La catégorie n\'existe pas', {
            statusCode: 404,
            code: 'NOT_FOUND'
        })
    }

    res.status(200).json( category )
}

export const addOneCategory = async (req, res) => {
    if(!req.body) {
        throw new AppError('Le corps de la requêtte HTTP est vide', {
            statusCode: 402,
            code: 'NO_CONTENT'
        })
    }
    const category = await addCategory(req.body);

    res.status(201).json( category );
} 

export const updateCategory = async (req, res) => {
    if(!req.params.categoryId) {
        throw new AppError('Le paramettre "categoryId" de la requêtte HTTP est vide', {
            statusCode: 402,
            code: 'NO_CONTENT'
        })
    }
    const categoryId = req.params.categoryId;

    if(!req.body) {
        throw new AppError('Le corps de la requêtte HTTP est vide', {
            statusCode: 402,
            code: 'NO_CONTENT'
        })
    }

    await udpadeCategory(categoryId, req.body);

    res.sendStatus(204)
} 

export const deleteCategory = async (req, res) => {
    if(!req.params.categoryId) {
        throw new AppError('Le paramettre "categoryId" de la requêtte HTTP est vide', {
            statusCode: 402,
            code: 'NO_CONTENT'
        })
    }
    const categoryId = req.params.categoryId;

    await deleteOne(categoryId);

    res.sendStatus(201);
}