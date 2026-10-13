import { Category } from '../models/Category.js'

export const findAllCategories = async () => {
    return await Category.findAll()
}