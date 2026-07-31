const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db.config');

const Courses = sequelize.define('Courses', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    course: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
    },
    recurrence: {
        type: DataTypes.INTEGER,
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
    tableName: 'courses',
    timestamps: true
});

module.exports = Courses;