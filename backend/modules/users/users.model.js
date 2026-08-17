const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db.config');
const PersonalInformation = require("./personal_information.model");
const bcrypt = require("bcrypt");
const SALT_ROUNDS = 10;

const Users = sequelize.define('Users', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    personal_information_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: PersonalInformation,
            key: 'id'
        }
    },
    username: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    hashed_password: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    role: {
        type: DataTypes.ENUM('Administrador', 'Docente', 'Estudiante', 'Apoderado'),
        allowNull: false,
    },
    profile_picture: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'users',
    timestamps: true
});

Users.beforeCreate(async (user) => {
    if (user.hashed_password) {
        user.hashed_password = await bcrypt.hash(
            user.hashed_password,
            SALT_ROUNDS
        );
    }
});

Users.beforeUpdate(async (user, options) => {
    if (user.changed('hashed_password')) {
        user.hashed_password = await bcrypt.hash(user.hashed_password, SALT_ROUNDS);
    }
});

Users.belongsTo(PersonalInformation, {
    foreignKey: 'personal_information_id',
    as: 'personal_information',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
});

module.exports = Users;