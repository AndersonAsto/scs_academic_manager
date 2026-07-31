const { DataTypes, INTEGER } = require('sequelize');
const sequelize = require('../../../config/db.config');
const Years = require('../../temporality/years.model');

const Weightings = sequelize.define('Weightings', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    year_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Years,
            key: 'id'
        }
    },
    weighting: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('Calificación Diaria', 'Práctica', 'Examen'),
        allowNull: false
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
    tableName: 'weightings',
    timestamps: true
});

Weightings.belongsTo(Years, {
    foreignKey: 'year_id',
    as: 'year',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
});

module.exports = Weightings;