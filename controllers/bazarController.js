//controllers/bazarController.js
const { Bazar, User } = require('../models');
const { Op } = require('sequelize');

exports.createBazar = async (req, res) => {
    try {
      // Cek role
      if (req.user.role !== 'Penyelenggara Bazar') {
        return res.status(403).json({ error: 'Only Penyelenggara Bazar can create bazars' });
      }
  
      // Cek duplikasi berdasarkan nama dan tanggal
      const existingBazar = await Bazar.findOne({
        where: {
          name: req.body.name,
          startEventDate: req.body.startEventDate,
          endEventDate: req.body.endEventDate
        }
      });
  
      if (existingBazar) {
        return res.status(400).json({ 
          error: 'Bazar dengan nama dan tanggal yang sama sudah ada' 
        });
      }
  
      // Persiapkan data
      const bazarData = {
        ...req.body,
        organizerId: req.user.id
      };
  
      // Tambahkan imageUrl jika ada file
      if (req.file) {
        bazarData.imageUrl = `/uploads/bazars/${req.file.filename}`;
      }
  
      // Buat bazar
      const bazar = await Bazar.create(bazarData);
      res.status(201).json(bazar);
  
    } catch (error) {
      console.error('Create bazar error:', error);
      res.status(400).json({ error: error.message });
    }
  };

exports.getBazars = async (req, res) => {
  try {
    const where = {};
    
    // Filter by status if provided
    if (req.query.status) {
      where.status = req.query.status;
    }

    // If user is Penyelenggara Bazar, only show their bazars
    if (req.user.role === 'Penyelenggara Bazar') {
      where.organizerId = req.user.id;
    }

    const bazars = await Bazar.findAll({
      where,
      include: [{
        model: User,
        as: 'organizer',
        attributes: ['name', 'email']
      }]
    });

    res.json(bazars);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getBazarById = async (req, res) => {
  try {
    const bazar = await Bazar.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'organizer',
        attributes: ['name', 'email']
      }]
    });

    if (!bazar) {
      return res.status(404).json({ error: 'Bazar not found' });
    }

    res.json(bazar);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateBazar = async (req, res) => {
  try {
    const bazar = await Bazar.findByPk(req.params.id);
    
    if (!bazar) {
      return res.status(404).json({ error: 'Bazar not found' });
    }

    if (bazar.organizerId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Update image if new one was uploaded
    if (req.file) {
        // Delete old image if exists
        if (bazar.imageUrl) {
          const fs = require('fs');
          const path = require('path');
          const oldImagePath = path.join(__dirname, '..', bazar.imageUrl);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        updateData.imageUrl = `/uploads/bazars/${req.file.filename}`;
      }
  
      await bazar.update(updateData);
      res.json(bazar);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

exports.deleteBazar = async (req, res) => {
  try {
    const bazar = await Bazar.findByPk(req.params.id);
    
    if (!bazar) {
      return res.status(404).json({ error: 'Bazar not found' });
    }

    if (bazar.organizerId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await bazar.destroy();
    res.json({ message: 'Bazar deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getOngoingBazars = async (req, res) => {
    try {
      const now = new Date();
      const bazars = await Bazar.findAll({
        where: {
          startEventDate: {
            [Op.lte]: now  // Tanggal mulai sudah lewat atau sama dengan sekarang
          },
          endEventDate: {
            [Op.gte]: now  // Tanggal selesai belum lewat
          }
        },
        include: [{
          model: User,
          as: 'organizer',
          attributes: ['name']
        }],
        attributes: [
          'id', 
          'name', 
          'startEventDate', 
          'endEventDate',
          'location', 
          'status',
          'imageUrl'
        ]
      });
  
      res.json(bazars);
    } catch (error) {
      console.error('Error in getOngoingBazars:', error);
      res.status(500).json({ error: error.message });
    }
  };
  
  exports.getComingSoonBazars = async (req, res) => {
    try {
      console.log('Fetching coming soon bazars...'); // Debug log
      
      const comingSoonBazars = await Bazar.findAll({
        where: {
          status: 'draft'
        },
        attributes: [
            'id', 
            'name', 
            'registrationStartDate', 
            'registrationEndDate',
            'location', 
            'status',
            'imageUrl'
          ],
        include: [{
          model: User,
          as: 'organizer',
          attributes: ['name', 'email']
        }]
      });
  
      console.log('Found coming soon bazars:', comingSoonBazars); // Debug log
  
      // Mengubah format date dan memformat response sesuai kebutuhan Kotlin
      const formattedBazars = comingSoonBazars.map(bazar => ({
        id: bazar.id,
        name: bazar.name,
        description: bazar.description,
        // eventDate: new Date(bazar.eventDate).toISOString().split('T')[0],
        location: bazar.location,
        status: bazar.status,
        startRegistrationDate: bazar.registrationStartDate,
        endRegistrationDate: bazar.registrationEndDate,
        organizer: bazar.organizer ? bazar.organizer.name : null
      }));
  
      res.json(formattedBazars); // Mengirim array langsung tanpa wrapper
  
    } catch (error) {
      console.error('Error in getComingSoonBazars:', error);
      res.status(500).json([]); // Mengirim array kosong saat error
    }
  };

  exports.getOpenBazars = async (req, res) => {
    try {
        const now = new Date();
        const bazars = await Bazar.findAll({
            where: {
                status: 'open',
                registrationStartDate: {
                    [Op.lte]: now  // Tanggal registrasi sudah dimulai
                },
                registrationEndDate: {
                    [Op.gte]: now  // Tanggal registrasi belum berakhir
                }
            },
            include: [{
                model: User,
                as: 'organizer',
                attributes: ['name']
            }],
            attributes: [
                'id', 'name', 'registrationStartDate', 
                'registrationEndDate', 'location', 'status',
                'imageUrl', 'startEventDate', 'endEventDate'
            ]
        });

        res.json(bazars);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getBazarHistory = async (req, res) => {
  try {
    if (req.user.role !== 'Penyelenggara Bazar') {
      return res.status(403).json({ error: 'Only Penyelenggara Bazar can access bazar history' });
    }

    const bazars = await Bazar.findAll({
      where: { organizerId: req.user.id },
      attributes: [
        'id',
        'name',
        'location',
        'startEventDate',
        'endEventDate',
        'status',
        'registrationStartDate',
        'registrationEndDate'
      ]
    });

    res.status(200).json(bazars);
  } catch (error) {
    console.error('Error fetching bazar history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};