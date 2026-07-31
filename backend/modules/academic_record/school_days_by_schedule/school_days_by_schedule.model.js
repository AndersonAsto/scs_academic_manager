const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/db.config');
const SchoolDays = require('../../temporality/schoolDays.model');
const Schedules = require('../schedules/schedules.model');

const SchoolDaysBySchedule = sequelize.define('SchoolDaysBySchedule', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    schedule_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Schedules,
            key: 'id'
        }
    },
    school_day_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: SchoolDays,
            key: 'id'
        }
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
    tableName: 'school_days_by_schedule',
    timestamps: true
});

SchoolDaysBySchedule.belongsTo(Schedules, {
    foreignKey: 'schedule_id',
    as: 'schedule',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
});

SchoolDaysBySchedule.belongsTo(SchoolDays, {
    foreignKey: 'school_day_id',
    as: 'school_day',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
});

module.exports = SchoolDaysBySchedule;