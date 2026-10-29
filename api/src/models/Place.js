import { DataTypes, Model } from "sequelize";
import sequelize from "../db/database.js";

export class Place extends Model {};

Place.init(
    {
        placeId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            field: 'place_id'
        },
        slug: {
            type: DataTypes.STRING(50),
            unique: true,
            field: 'slug'
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
            field: 'name'
        },
        description: {
            type: DataTypes.STRING,
            field: 'description'
        },
        additionalInformation: {
            type: DataTypes.STRING,
            field: 'additional_information'
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'draft',
            field: 'status',
            validate: {
                isIn: [['draft', 'published', 'archived']]
            }
        },
        categoryId: {
            type: DataTypes.INTEGER,
            field: 'category_id'
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            field: 'created_at'
        },
        updatedAt: {
            type: DataTypes.DATE,
            defaultValue: null,
            field: 'updated_at'
        }
    },
    {
        sequelize,
        modelName: 'Place',
        tableName: 'place',
        timestamps: false
    }
)