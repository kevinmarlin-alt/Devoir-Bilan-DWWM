import { DataTypes, Model } from "sequelize";
import sequelize from '../db/database.js'

export class AppUser extends Model {};

AppUser.init(
    {
        userId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            field: 'user_id'
        },
        firstName: {
            type: DataTypes.STRING(50),
            allowNull: false,
            field: 'first_name'
        },
        lastName: {
            type: DataTypes.STRING(50),
            allowNull: false,
            field: 'last_name'
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
            field: 'email'
        },
        passwordHash: {
            type: DataTypes.STRING(255),
            allowNull: false,
            field: 'password_hash'
        },
    },
    {
        sequelize,
        modelName: 'AppUser',
        tableName: 'app_user',
        timestamps: false
    }
)