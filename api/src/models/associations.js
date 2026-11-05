import { Category } from './Category.js';
import { Image } from './Image.js';
import { Place } from './Place.js';

Category.hasMany(Place, {
    foreignKey: 'categoryId',
    as: 'places'
})

Place.belongsTo(Category, {
    foreignKey: 'categoryId',
    as: 'category'
});

Place.hasMany(Image, {
    foreignKey: 'placeId',
    as: 'images'
});

Image.belongsTo(Place, {
    foreignKey: 'placeId',
    as: 'place'
});
