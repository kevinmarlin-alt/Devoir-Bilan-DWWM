import { Router } from 'express';
import { getImages } from '../controllers/images.controller.js';

const imagesRouter = Router();

imagesRouter.get('/', getImages);

export default imagesRouter;
