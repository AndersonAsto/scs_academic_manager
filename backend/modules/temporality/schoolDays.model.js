const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db.config');
const TeachingBlocks = require('./teachingBlocks.model');

const SchoolDays = sequelize.define('SchoolDays', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    teaching_block_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: TeachingBlocks,
            key: 'id'
        }
    },
    school_day: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    day: {
        type: DataTypes.ENUM('Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'),
        allowNull: false
    },
    week_number: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    type: {
        type: DataTypes.ENUM('Día Lectivo', 'Día Feriado'),
        allowNull: true
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
    tableName: 'school_days',
    timestamps: true
});

SchoolDays.belongsTo(TeachingBlocks, {
    foreignKey: 'teaching_block_id',
    as: 'teaching_block',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
});

module.exports = SchoolDays;