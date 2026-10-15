import { Category } from '../models/Category.js'

export const findCategoryById = async (categoryId) => {
    return await Category.findOne({
        where: {
            categoryId
        }
    })
}

export const findAllCategories = async () => {
    return await Category.findAll()
}

export const createCategory = async (categoryName, description) => {
    return await Category.create({
        categoryName,
        description
    })
}

export const udpadeCategory = async (category) => {
    return await Category.update(
        {
            categoryName: category.categoryName,
            description: category.description,
            isActive: category.isActive,
            updatedAt: Date.now()
        },
        {
            where: {
                categoryId: category.categoryId
            }
        }
    )
}

export const deleteOne = async (categoryId) => {
    return await Category.destroy({
        where: {
            categoryId
        }
    })
}