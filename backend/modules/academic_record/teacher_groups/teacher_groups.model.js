const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/db.config');
const AcademicStaffContracts = require('../../users/academic_staff_contracts.model');
const Courses = require('../../courses/courses.model');
const Grades = require('../../grades/grades.model');
const Sections = require('../../sections/sections.model');

const TeacherGroups = sequelize.define('TeacherGroups', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    academic_staff_contract_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: AcademicStaffContracts,
            key: 'id'
        }
    },
    course_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Courses,
            key: 'id'
        }
    },
    grade_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Grades,
            key: 'id'
        }
    },
    section_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Sections,
            key: 'id'
        }
    },
    tutor: {
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
    tableName: 'teacher_groups',
    timestamps: true
});

TeacherGroups.belongsTo(AcademicStaffContracts, {
    foreignKey: 'academic_staff_contract_id',
    as: 'academic_staff_contract',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
});

TeacherGroups.belongsTo(Courses, {
    foreignKey: 'course_id',
    as: 'course',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
});

TeacherGroups.belongsTo(Grades, {
    foreignKey: 'grade_id',
    as: 'grade',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
});

TeacherGroups.belongsTo(Sections, {
    foreignKey: 'section_id',
    as: 'section',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
});

module.exports = TeacherGroups;