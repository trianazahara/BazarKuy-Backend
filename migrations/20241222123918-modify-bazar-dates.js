'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Hapus kolom eventDate
    await queryInterface.removeColumn('Bazars', 'eventDate');

    // Tambah kolom baru dengan nilai default yang valid
    await queryInterface.addColumn('Bazars', 'startEventDate', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')  // Tambahkan default value
    });

    await queryInterface.addColumn('Bazars', 'endEventDate', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')  // Tambahkan default value
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Kembalikan kolom eventDate
    await queryInterface.addColumn('Bazars', 'eventDate', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    });

    // Hapus kolom baru
    await queryInterface.removeColumn('Bazars', 'startEventDate');
    await queryInterface.removeColumn('Bazars', 'endEventDate');
  }
};