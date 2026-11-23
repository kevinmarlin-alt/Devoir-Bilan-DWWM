import { Router } from 'express';
import { getAvailableImages, getImages } from '../controllers/images.controller.js';

const imagesRouter = Router();

imagesRouter.get('/available', getAvailableImages);
imagesRouter.get('/', getImages);

export default imagesRouter;
