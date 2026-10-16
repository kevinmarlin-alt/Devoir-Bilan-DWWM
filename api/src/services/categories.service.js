import { findCategoryById, findAllCategories, createCategory, udpadeOne, deleteOneById } from '../repositories/categories.repository.js'
import { AppError } from '../errors/AppError.js'

export const getCategoryById = async (categoryId) => {
    return await findCategoryById(categoryId)
}

export const getAllCategories = async () => {
    return await findAllCategories()
}

export const addCategory = async (data) => {
    return await createCategory(data)
}

export const udpadeCategory = async (categoryId, data) => {
    const category = await getCategoryById(categoryId);

    if(!category) {
        throw new AppError('La catégorie n\'existe pas', {
            statusCode: 404,
            code: 'NOT_FOUND'
        })
    }

    for (const [key, value] of Object.entries(data)) {
        category[key] = data[key]
    }

    return await udpadeOne(data)
}

export const deleteOne = async (categoryId) => {
    const category = await findCategoryById(categoryId);

    if(!category) {
        throw new AppError('La catégorie n\'existe pas', {
            statusCode: 404,
            code: 'NOT_FOUND'
        })
    }

    return await deleteOneById(categoryId)
}