import { Category } from './Category.js';
import { Image } from './Image.js';
import { Place } from './Place.js';
import { ExploitationType } from './ExploitationType.js';

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

Place.belongsToMany(ExploitationType, {
    through: 'place_exploitation_type',
    foreignKey: 'placeId',
    otherKey: 'exploitationTypeId',
    as: 'exploitationTypes'
});

ExploitationType.belongsToMany(Place, {
    through: 'place_exploitation_type',
    foreignKey: 'exploitationTypeId',
    otherKey: 'placeId',
    as: 'places'
});
