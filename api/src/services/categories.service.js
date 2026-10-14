import { Category } from '../models/Category.js'

export const findAllCategories = async () => {
    return await Category.findAll()
}

export const createCategory = async (categoryName, description) => {
    return await Category.create({
        categoryName,
        description
    })
}