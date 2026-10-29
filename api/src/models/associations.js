import { Category } from './Category.js';
import { Place } from './Place.js';

Category.hasMany(Place, {
    foreignKey: 'categoryId',
    as: 'places'
})

Place.belongsTo(Category, {
    foreignKey: 'categoryId',
    as: 'category'
})