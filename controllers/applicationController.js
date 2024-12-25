//controllers/applicationController.js
const { Application, Bazar, User } = require('../models');
const { createNotification } = require('./notificationController');

// Apply to bazar (UMKM only)
exports.applyToBazar = async (req, res) => {
  try {
    // Validate user role
    if (req.user.role !== 'umkm') {
      return res.status(403).json({ error: 'Only UMKM can apply to bazars' });
    }

    // Validate request body
    const { businessName, businessDescription } = req.body;
    if (!businessName || !businessDescription) {
      return res.status(400).json({ error: 'Business name and description are required' });
    }

    // Check bazar exists and is open
    const bazar = await Bazar.findByPk(req.params.bazarId);
    if (!bazar) {
      return res.status(404).json({ error: 'Bazar not found' });
    }
    if (bazar.status !== 'open') {
      return res.status(400).json({ error: 'Bazar is not open for applications' });
    }

    // Check for existing application
    const existingApplication = await Application.findOne({
      where: {
        bazarId: req.params.bazarId,
        umkmId: req.user.id
      }
    });

    if (existingApplication) {
      return res.status(400).json({ error: 'Already applied to this bazar' });
    }

    // Create application
    const application = await Application.create({
      bazarId: req.params.bazarId,
      umkmId: req.user.id,
      businessName,
      businessDescription,
      status: 'pending'
    });

    // Create notification after successful application
    try {
      await createNotification(
        bazar.organizerId,
        'Pendaftaran Baru',
        `${req.user.name} mendaftar untuk bazar ${bazar.name}`,
        'application_submitted'
      );
    } catch (notifError) {
      console.error('Error creating notification:', notifError);
      // Tidak mengembalikan error ke client karena aplikasi tetap berhasil
    }

    res.status(201).json(application);
  } catch (error) {
    console.error('Error in applyToBazar:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
// Get applications (UMKM sees their own, Penyelenggara sees applications for their bazar)
exports.getApplications = async (req, res) => {
  try {
    let where = {};
    
    if (req.user.role === 'umkm') {
      where.umkmId = req.user.id;
    } else if (req.user.role === 'Penyelenggara Bazar') {
      const bazar = await Bazar.findByPk(req.params.bazarId);
      if (!bazar || bazar.organizerId !== req.user.id) {
        return res.status(403).json({ error: 'Not authorized' });
      }
      where.bazarId = req.params.bazarId;
    }

    const applications = await Application.findAll({
      where,
      include: [
        {
          model: User,
          as: 'umkm',
          attributes: ['name', 'email']
        },
        {
          model: Bazar,
          attributes: ['name', 'eventDate', 'location']
        }
      ]
    });

    res.json(applications);
  } catch (error) {
    console.error('Error in getApplications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update application status (Penyelenggara only)
exports.updateApplicationStatus = async (req, res) => {
  try {
    if (req.user.role !== 'Penyelenggara Bazar') {
      return res.status(403).json({ error: 'Only Penyelenggara can update application status' });
    }

    const { status } = req.body;
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const application = await Application.findOne({
      where: { id: req.params.id },
      include: [{ model: Bazar }]
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    if (application.Bazar.organizerId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await application.update({ status });
    res.json({ message: 'Application status updated', application });
  } catch (error) {
    console.error('Error in updateApplicationStatus:', error);
    res.status(500).json({ error: 'Internal server error' });
  }

  await createNotification(
    application.umkmId,
    'Status Pendaftaran Diperbarui',
    `Pendaftaran Anda untuk ${application.Bazar.name} telah ${status}`,
    'application_status'
  );
};

//Riwayat Daftar
exports.getApplicationHistory = async (req, res) => {
  try {
    if (req.user.role !== 'umkm') {
      return res.status(403).json({ error: 'Only UMKM can access application history' });
    }

    const applications = await Application.findAll({
      where: { umkmId: req.user.id },
      include: [
        {
          model: Bazar,
          attributes: ['name', 'location', 'startEventDate', 'endEventDate', 'status']
        }
      ]
    });

    res.status(200).json(applications);
  } catch (error) {
    console.error('Error fetching application history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};