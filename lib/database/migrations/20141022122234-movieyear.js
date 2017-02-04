module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.addColumn('Movies', 'year', Sequelize.INTEGER);
    },
    down: function (queryInterface) {
        return queryInterface.removeColumn('Movies', 'year');
    }
};
