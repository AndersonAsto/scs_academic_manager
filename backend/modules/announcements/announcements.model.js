const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db.config');
const TeacherGroups = require('../academic_record/teacher_groups/teacher_groups.model');
const Registrations = require('../users/registrations.model');

const Announcements = sequelize.define('Announcements', {
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
    teacher_group_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: TeacherGroups,
            key: 'id'
        }
    },
    type: {
        type: DataTypes.ENUM(
            'Reuniones',
            'Avisos',
            'Inasistencias',
            'Bajo rendimiento',
            'Eventos',
            'Otros'
        ),
        allowNull: false,
    },
    priority: {
        type: DataTypes.ENUM('Baja', 'Media', 'Alta'),
        allowNull: true
    },
    affair: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    registration_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    reading: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
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
    tableName: 'announcements',
    timestamps: true
});

Announcements.belongsTo(Registrations, {
    foreignKey: 'registration_id',
    as: 'registration',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
});

Announcements.belongsTo(TeacherGroups, {
    foreignKey: 'teacher_group_id',
    as: 'teacher_group',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
});

module.exports = Announcements;
