//models/Index.js
const User = require('./User');
const Bazar = require('./Bazar');
const Application = require('./Application');
const Notification = require('./Notification');

// Existing associations
User.hasMany(Bazar, { foreignKey: 'organizerId' });
Bazar.belongsTo(User, { foreignKey: 'organizerId', as: 'organizer' });

// Applications associations
User.hasMany(Application, { foreignKey: 'umkmId' });
Application.belongsTo(User, { foreignKey: 'umkmId', as: 'umkm' });

Bazar.hasMany(Application, { foreignKey: 'bazarId' });
Application.belongsTo(Bazar, { foreignKey: 'bazarId' });

User.hasMany(Notification, { foreignKey: 'userId' });
Notification.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  User,
  Bazar,
  Application,
  Notification
};