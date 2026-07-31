const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db.config');

const Grades = sequelize.define('Grades', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    grade: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
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
    tableName: 'grades',
    timestamps: true
});

module.exports = Grades;