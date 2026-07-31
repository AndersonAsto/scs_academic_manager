const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db.config');

const Years = sequelize.define('Years', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    year: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
    }
}, {
    tableName: 'years',
    timestamps: true
});

module.exports = Years;