import { Router } from 'express';
import { getImages, getAvailableImages } from '../controllers/images.controller.js';

const imagesRouter = Router();

imagesRouter.get('/available', getAvailableImages);
imagesRouter.get('/', getImages);

export default imagesRouter;
