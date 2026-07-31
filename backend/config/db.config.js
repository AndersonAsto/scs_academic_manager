require('dotenv').config({ quiet: true });
const { Sequelize } = require('sequelize');

const env = process.env.NODE_ENV === 'production' ? 'production' : 'development';

const dbName =
    env === 'production'
        ? process.env.DB_PROD_NAME || process.env.DB_NAME
        : process.env.DB_NAME;

const sequelize = new Sequelize(
    dbName,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: process.env.DB_DIALECT,
        timezone: process.env.DB_TIMEZONE,
        dialectOptions: {
            dateStrings: true,
            typeCast: true,
        },
        logging: env === 'production' ? false : console.log,
    }
);

module.exports = sequelize;
