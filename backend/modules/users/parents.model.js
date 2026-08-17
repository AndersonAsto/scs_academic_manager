const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db.config');
const PersonalInformation = require('./personal_information.model');

const Parents = sequelize.define('Parents', {
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
    tableName: 'parents',
    timestamps: true
});

Parents.belongsTo(PersonalInformation, {
    foreignKey: 'personal_information_id',
    as: 'personal_information',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
})

module.exports = Parents;