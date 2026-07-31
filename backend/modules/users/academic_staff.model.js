const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db.config');
const PersonalInformation = require('./personal_information.model');

const AcademicStaff = sequelize.define('AcademicStaff', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    personal_information_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: PersonalInformation,
            key: 'id'
        }
    },
    staff_type: {
        type: DataTypes.ENUM('Administrador', 'Docente'),
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
    tableName: 'academic_staff',
    timestamps: true
});

AcademicStaff.belongsTo(PersonalInformation, {
    foreignKey: 'personal_information_id',
    as: 'personal_information',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
});

module.exports = AcademicStaff;