import { Router } from "express";
import { getAllCategories, addOneCategory, deleteCategory } from "../controllers/categories.controller.js";

const categoriesRouter = Router();

categoriesRouter.get('/', getAllCategories);
categoriesRouter.post('/add', addOneCategory);
categoriesRouter.delete('/:categoryId', deleteCategory);

export default categoriesRouter;