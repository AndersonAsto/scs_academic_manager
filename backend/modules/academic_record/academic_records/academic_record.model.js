const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/db.config');
const Registrations = require('../../users/registrations.model');
const SchoolDaysBySchedule = require('../school_days_by_schedule/school_days_by_schedule.model');

const AcademicRecords = sequelize.define('AcademicRecords', {
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
    school_day_by_schedule_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: SchoolDaysBySchedule,
            key: 'id'
        }
    },
    attendance: {
        type: DataTypes.ENUM('P', 'J', 'T', 'F'),
        allowNull: true
    },
    score: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        validate: {
            min: 0,
            max: 20
        }
    },
    incident: {
        type: DataTypes.TEXT,
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
    tableName: 'academic_records',
    timestamps: true
});

AcademicRecords.belongsTo(Registrations, {
    foreignKey: 'registration_id',
    as: 'registration',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
});

AcademicRecords.belongsTo(SchoolDaysBySchedule, {
    foreignKey: 'school_day_by_schedule_id',
    as: 'school_day_by_schedule',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
});

module.exports = AcademicRecords;
