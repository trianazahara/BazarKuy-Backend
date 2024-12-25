//controllers/userController.js
const { User } = require('../models');
const bcrypt = require('bcryptjs');

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching profile' });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, username, tiktokLink, facebookLink, instagramLink } = req.body;
    
    // Check if username is taken
    if (username) {
      const existingUser = await User.findOne({
        where: { username },
        where: { id: { [Op.ne]: req.user.id } }
      });
      if (existingUser) {
        return res.status(400).json({ error: 'Username already taken' });
      }
    }

    const updateData = {
      name,
      username,
      tiktokLink,
      facebookLink,
      instagramLink
    };

    // Add profile image if uploaded
    if (req.file) {
      updateData.profileImage = `/uploads/profiles/${req.file.filename}`;
    }

    await User.update(updateData, {
      where: { id: req.user.id }
    });

    const updatedUser = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ error: 'Error updating profile' });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findByPk(req.user.id);
    
    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await user.update({ password: hashedPassword });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error changing password' });
  }
};

// Delete profile image
exports.deleteProfileImage = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    
    if (user.profileImage) {
      // Delete file from storage
      const fs = require('fs');
      const path = require('path');
      const imagePath = path.join(__dirname, '..', user.profileImage);
      
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }

      // Remove image path from database
      await user.update({ profileImage: null });
    }

    res.json({ message: 'Profile image deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting profile image' });
  }
};