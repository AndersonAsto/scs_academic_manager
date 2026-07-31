const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db.config');

const TimeSlots = sequelize.define('TimeSlots', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    time_slot: {
        type: DataTypes.ENUM('Mañana 1', 'Mañana 2', 'Receso 1', 'Tarde 1', 'Receso 2', 'Tarde 2'),
        allowNull: false,
    },
    start_time: {
        type: DataTypes.TIME,
        allowNull: false
    },
    end_time: {
        type: DataTypes.TIME,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('Clase', 'Receso'),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'time_slots',
    timestamps: true
});

module.exports = TimeSlots;