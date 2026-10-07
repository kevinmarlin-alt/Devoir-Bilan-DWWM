import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(
    process.env.DB_NAME, 
    process.env.DB_USER, 
    process.env.DB_PWD, 
    {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        dialect: 'mariadb',
        logging: console.log
    }
);

export default sequelize;