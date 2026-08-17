const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/db.config');
const TeacherGroups = require('../teacher_groups/teacher_groups.model');
const TimeSlots = require('../../time_slots/time_slots.model');

const Schedules = sequelize.define('Schedules', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    teacher_group_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: TeacherGroups,
            key: 'id'
        }
    },
    time_slot_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: TimeSlots,
            key: 'id'
        }
    },
    day: {
        type: DataTypes.ENUM('Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'),
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
    tableName: 'schedules',
    timestamps: true
});

Schedules.belongsTo(TeacherGroups, {
    foreignKey: 'teacher_group_id',
    as: 'teacher_group',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
});

Schedules.belongsTo(TimeSlots, {
    foreignKey: 'time_slot_id',
    as: 'time_slot',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
});

module.exports = Schedules;