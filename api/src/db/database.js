import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(
    process.env.DB_NAME, 
    process.env.DB_USER, 
    process.env.DB_PWD, 
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mariadb',
        logging: (...msg) => console.log(msg)
    }
);

export default sequelize;