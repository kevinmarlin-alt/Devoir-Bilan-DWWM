import { Router } from "express";
import { getAllCategories, addOneCategory } from "../controllers/categories.controller.js";

const categoriesRouter = Router();

categoriesRouter.get('/', getAllCategories);
categoriesRouter.post('/add', addOneCategory);

export default categoriesRouter;