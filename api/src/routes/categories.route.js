import { Router } from "express";
import { getAllCategories, addOneCategory, deleteCategory, updateCategory } from "../controllers/categories.controller.js";

const categoriesRouter = Router();

categoriesRouter.get('/', getAllCategories);
categoriesRouter.post('/add', addOneCategory);
categoriesRouter.patch('/:categoryId', updateCategory);
categoriesRouter.delete('/:categoryId', deleteCategory);

export default categoriesRouter;