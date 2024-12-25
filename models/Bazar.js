//models/Bazar.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Bazar = sequelize.define('Bazar', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  startEventDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endEventDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  registrationStartDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  registrationEndDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  termsAndConditions: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('draft', 'open', 'ongoing', 'completed'),
    defaultValue: 'draft'
  },
  organizerId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  hooks: {
    beforeCreate: (bazar) => {
      // Update status based on dates
      const now = new Date();
      if (now < bazar.registrationStartDate) {
        bazar.status = 'draft';
      } else if (now >= bazar.registrationStartDate && now <= bazar.registrationEndDate) {
        bazar.status = 'open';
      } else if (now > bazar.startEventDate && now <= bazar.endEventDate) {
        bazar.status = 'ongoing';
      } else {
        bazar.status = 'completed';
      }
    }
  }
});

module.exports = Bazar;