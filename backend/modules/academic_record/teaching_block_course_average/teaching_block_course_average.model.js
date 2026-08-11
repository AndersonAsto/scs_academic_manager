const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/db.config');
const Registrations = require('../../users/registrations.model');
const TeacherGroups = require('../teacher_groups/teacher_groups.model');
const TeachingBlocks = require('../../temporality/teachingBlocks.model');

const TeachingBlockCourseAverage = sequelize.define('TeachingBlockCourseAverage', {
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
    teaching_block_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: TeachingBlocks
        }
    },
    daily_average: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        validate: {
            min: 0,
            max: 20
        }
    },
    practice_average: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        validate: {
            min: 0,
            max: 20
        }
    },
    exam_average: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        validate: {
            min: 0,
            max: 20
        }
    },
    attendance_average: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        validate: {
            min: 0,
            max: 20
        }
    },
    teaching_block_average: {
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
    tableName: 'teaching_block_course_average',
    timestamps: true
});

TeachingBlockCourseAverage.belongsTo(Registrations, {
    foreignKey: 'registration_id',
    as: 'registration',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
});

TeachingBlockCourseAverage.belongsTo(TeacherGroups, {
    foreignKey: 'teacher_group_id',
    as: 'teacher_group',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
});

TeachingBlockCourseAverage.belongsTo(TeachingBlocks, {
    foreignKey: 'teaching_block_id',
    as: 'teaching_block',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
});

module.exports = TeachingBlockCourseAverage;
