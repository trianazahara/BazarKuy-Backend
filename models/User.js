//models/User.js
const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('umkm', 'Penyelenggara Bazar'),
    allowNull: false
  },
  username: {
    type: DataTypes.STRING,
    unique: true
  },
  profileImage: DataTypes.STRING,
  tiktokLink: DataTypes.STRING,
  facebookLink: DataTypes.STRING,
  instagramLink: DataTypes.STRING
});

// Hash password sebelum save
User.beforeCreate(async (user) => {
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
});

module.exports = User;