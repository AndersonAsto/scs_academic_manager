const Years = require('./years.model');

const teachingBlocksQuery = (where = {}, order = []) => ({
    where,
    include: {
        model: Years,
        as: 'year',
        attributes: ['id', 'year', 'status']
    },
    order
});

module.exports = teachingBlocksQuery;