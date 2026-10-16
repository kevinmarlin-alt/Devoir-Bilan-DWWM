import { Router } from "express";
import { getCategories, addOneCategory, deleteCategory, updateCategory, getCategory } from "../controllers/categories.controller.js";

const categoriesRouter = Router();

categoriesRouter.get('/', getCategories);
categoriesRouter.get('/:categoryId', getCategory);
categoriesRouter.post('/add', addOneCategory);
categoriesRouter.patch('/:categoryId', updateCategory);
categoriesRouter.delete('/:categoryId', deleteCategory);

export default categoriesRouter;