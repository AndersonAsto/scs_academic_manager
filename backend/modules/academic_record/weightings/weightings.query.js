const Years = require('../../temporality/years.model');

const weightingsQuery = (where = {}, order = []) => ({
    where,
    include: {
        model: Years,
        as: 'year'
    },
    order
});

module.exports = weightingsQuery;