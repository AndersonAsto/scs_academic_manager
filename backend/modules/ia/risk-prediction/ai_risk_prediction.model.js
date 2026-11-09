const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/db.config');
const TeacherGroups = require('../../academic_record/teacher_groups/teacher_groups.model');
const Registrations = require('../../users/registrations.model');
const TeachingBlocks = require('../../temporality/teachingBlocks.model');
const Announcements = require('../../announcements/announcements.model');

const AiRiskPrediction = sequelize.define('AiRiskPrediction', {
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
            model: TeachingBlocks,
            key: 'id'
        }
    },
    risk_level: {
        type: DataTypes.ENUM('Bajo', 'Medio', 'Alto'),
        allowNull: false
    },
    probability: {
        type: DataTypes.DECIMAL(5, 4),
        allowNull: true
    },
    model_version: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    features_snapshot: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    announcement_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: Announcements,
            key: 'id'
        }
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
    }
}, {
    tableName: 'ai_risk_predictions',
    timestamps: true
});

AiRiskPrediction.belongsTo(Registrations, {
    foreignKey: 'registration_id',
    as: 'registration',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
});

AiRiskPrediction.belongsTo(TeacherGroups, {
    foreignKey: 'teacher_group_id',
    as: 'teacher_group',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
});

AiRiskPrediction.belongsTo(TeachingBlocks, {
    foreignKey: 'teaching_block_id',
    as: 'teaching_block',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
});

AiRiskPrediction.belongsTo(Announcements, {
    foreignKey: 'announcement_id',
    as: 'announcement',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
});

module.exports = AiRiskPrediction;