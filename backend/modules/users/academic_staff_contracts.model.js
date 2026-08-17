const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db.config');
const AcademicStaff = require('./academic_staff.model');
const Years = require('../temporality/years.model');

const AcademicStaffContracts = sequelize.define('AcademicStaffContracts', {
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
    academic_staff_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: AcademicStaff,
            key: 'id'
        }
    },
    start_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    end_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    position: {
        type: DataTypes.STRING(255),
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
    tableName: 'academic_staff_contracts',
    timestamps: true
});

AcademicStaffContracts.belongsTo(Years, {
    foreignKey: 'year_id',
    as: 'year',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
});

AcademicStaffContracts.belongsTo(AcademicStaff, {
    foreignKey: 'academic_staff_id',
    as: 'academic_staff',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
});

module.exports = AcademicStaffContracts;