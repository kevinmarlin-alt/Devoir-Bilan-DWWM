import { json, Router } from 'express';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import { createPlaceEvent } from '../controllers/placeEvents.controller.js';
import { AppError } from '../errors/AppError.js';

const parseJson = json({ limit: '1kb' });

function parseEventBody(req, res, next) {
    parseJson(req, res, (error) => {
        if (error?.status >= 400 && error.status < 500) {
            return next(new AppError('Le corps de la requête doit être un objet JSON valide et ne pas dépasser 1 Kio.', {
                status: 400,
                code: 'INVALID_PLACE_EVENT'
            }));
        }
        next(error);
    });
}

function readShowcaseOrigin(value) {
    try {
        const url = new URL(value);
        if (['http:', 'https:'].includes(url.protocol) && url.origin === value) return value;
    } catch {
        return undefined;
    }
}

function createEventLimiter(windowMs, configuredLimit, defaultLimit) {
    const limit = Number(configuredLimit);
    return rateLimit({
        windowMs,
        limit: Number.isSafeInteger(limit) && limit > 0 ? limit : defaultLimit,
        standardHeaders: 'draft-8',
        legacyHeaders: false,
        handler: (req, res, next) => next(new AppError('Trop d’événements. Réessayez plus tard.', {
            status: 429,
            code: 'PLACE_EVENT_RATE_LIMIT'
        }))
    });
}

export function createPublicPlaceEventsRouter() {
    const router = Router();
    const showcaseOrigin = readShowcaseOrigin(process.env.SHOWCASE_ORIGIN);
    const publicCors = cors({
        origin(origin, callback) {
            if (origin === undefined) return callback(null, false);
            if (origin === showcaseOrigin) return callback(null, true);
            callback(new AppError('Cette origine n’est pas autorisée pour les événements de lieu.', {
                status: 403,
                code: 'PLACE_EVENT_ORIGIN_FORBIDDEN'
            }));
        },
        methods: ['POST'],
        allowedHeaders: ['Content-Type']
    });
    const limitViews = createEventLimiter(60_000, process.env.PLACE_EVENT_VIEW_LIMIT, 60);
    const limitInquiries = createEventLimiter(600_000, process.env.PLACE_EVENT_INQUIRY_LIMIT, 10);

    router.options('/', publicCors, (req, res) => res.status(204).end());
    router.post('/', publicCors, parseEventBody, (req, res, next) => {
        const limiter = req.body?.type === 'inquiry' ? limitInquiries : limitViews;
        return limiter(req, res, next);
    }, createPlaceEvent);

    return router;
}
