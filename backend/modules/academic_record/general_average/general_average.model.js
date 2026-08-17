const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/db.config');
const Registrations = require('../../users/registrations.model');

const GeneralAverage = sequelize.define('GeneralAverage', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    registration_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Registrations,
            key: 'id'
        }
    },
    general_average: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        validate: {
            min: 0,
            max: 20
        }
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
    tableName: 'general_average',
    timestamps: true
});

GeneralAverage.belongsTo(Registrations, {
    foreignKey: 'registration_id',
    as: 'registration',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
});

module.exports = GeneralAverage;