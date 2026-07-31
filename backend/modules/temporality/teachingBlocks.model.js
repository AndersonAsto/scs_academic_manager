const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db.config');
const Years = require('./years.model');

const TeachingBlocks = sequelize.define('TeachingBlocks', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    year_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Years,
            key: 'id'
        }
    },
    teaching_block: {
        type: DataTypes.ENUM('1° Bimestre', '2° Bimestre', '3° Bimestre', '4° Bimestre'),
        allowNull: false
    },
    start_day: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    end_day: {
        type: DataTypes.DATEONLY,
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
    tableName: 'teaching_blocks',
    timestamps: true
});

TeachingBlocks.belongsTo(Years, {
    foreignKey: 'year_id',
    as: 'year',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
});

module.exports = TeachingBlocks;