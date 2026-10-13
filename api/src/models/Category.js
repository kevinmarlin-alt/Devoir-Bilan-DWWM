import { DataTypes, Model } from "sequelize";
import sequelize from '../db/database.js'

export class Category extends Model {};

Category.init(
    {
        categoryId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            field: 'category_id'
        },
        categoryName: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
            field: 'category_name'
        },
        description: {
            type: DataTypes.STRING(500),
            allowNull: false,
            field: 'description'
        },
        isActive: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
            field: 'is_active'
        },
        createdAt: {
            type: DataTypes.DATE(),
            allowNull: false,
            field: 'created_at'
        },
        updatedAt: {
            type: DataTypes.DATE(),
            allowNull: false,
            field: 'updated_at'
        }
    },
    {
        sequelize,
        modelName: 'Category',
        tableName: 'category',
        timestamps: false
    }
)