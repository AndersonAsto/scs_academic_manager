const TeachingBlocksModel = require("./teachingBlocks.model");
const YearsModel = require('./years.model');

const schoolDaysQuery = (where = {}, order = []) => ({
    where,
    include: {
        model: TeachingBlocksModel,
        as: 'teaching_block',
        include: {
            model: YearsModel,
            as: 'year',
            attributes: ['id', 'year', 'status'],
            order: [['year', 'ASC']]
        },
        attributes: ['id', 'year_id', 'teaching_block', 'start_day', 'end_day', 'status']
    },
    order
});

module.exports = schoolDaysQuery;