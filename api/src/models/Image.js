import { DataTypes, Model } from 'sequelize';
import sequelize from '../db/database.js';

export class Image extends Model {}

Image.init(
    {
        imageId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            field: 'image_id'
        },
        slug: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true
        },
        filename: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true
        },
        alt: {
            type: DataTypes.STRING(255)
        },
        isMain: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'is_main'
        },
        placeId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'place_id'
        }
    },
    {
        sequelize,
        modelName: 'Image',
        tableName: 'image',
        timestamps: false
    }
);
