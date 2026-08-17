const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db.config');

const Sections = sequelize.define('Sections', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    section: {
        type: DataTypes.STRING(2),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'sections',
    timestamps: true
});

module.exports = Sections;
