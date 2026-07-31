const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db.config');

const PersonalInformation = sequelize.define('PersonalInformation', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    names: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    fathers_surname: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    mothers_surname: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    dni: {
        type: DataTypes.STRING(8),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
    },
    phone_number: {
        type: DataTypes.STRING(9),
        allowNull: false,
        unique: true
    },
    address: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    district: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    province: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    department: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    gender: {
        type: DataTypes.ENUM('M', 'F'),
        allowNull: true
    }
}, {
    tableName: 'personal_information',
    timestamps: true,
});

module.exports = PersonalInformation;