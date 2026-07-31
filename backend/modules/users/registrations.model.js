const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db.config');
const Years = require('../temporality/years.model');
const Parents = require('./parents.model');
const Students = require('./students.model');
const Grades = require('../grades/grades.model');
const Sections = require('../sections/sections.model');

const Registrations = sequelize.define('Registrations', {
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
    student_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Students,
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
    parent_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Parents,
            key: 'id'
        }
    },
    registration_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    }
}, {
    tableName: 'registrations',
    timestamps: true
});

Registrations.belongsTo(Years, {
    foreignKey: 'year_id',
    as: 'year',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
});

Registrations.belongsTo(Students, {
    foreignKey: 'student_id',
    as: 'student',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
});

Registrations.belongsTo(Grades, {
    foreignKey: 'grade_id',
    as: 'grade',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
});

Registrations.belongsTo(Sections, {
    foreignKey: 'section_id',
    as: 'section',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
});

Registrations.belongsTo(Parents, {
    foreignKey: 'parent_id',
    as: 'parent',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
});

module.exports = Registrations;