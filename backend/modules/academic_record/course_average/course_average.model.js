const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/db.config');
const Registrations = require('../../users/registrations.model');
const TeacherGroups = require('../teacher_groups/teacher_groups.model');

const CourseAverage = sequelize.define('CourseAverage', {
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
    overall_course_average: {
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
    tableName: 'course_average',
    timestamps: true
});

CourseAverage.belongsTo(Registrations, {
    foreignKey: 'registration_id',
    as: 'registration',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
});

CourseAverage.belongsTo(TeacherGroups, {
    foreignKey: 'teacher_group_id',
    as: 'teacher_group',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
});

module.exports = CourseAverage;