const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db.config');
const PersonalInformation = require('./personal_information.model');

const Students = sequelize.define('Students', {
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
    tableName: 'students',
    timestamps: true
});

Students.belongsTo(PersonalInformation, {
    foreignKey: 'personal_information_id',
    as: 'personal_information',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
})

module.exports = Students;