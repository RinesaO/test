const Pharmacy = require('../models/Pharmacy');
const upload = require('../config/upload');

// @desc    Get pharmacy profile
// @route   GET /api/pharmacy/profile
// @access  Private (Pharmacy)
exports.getProfile = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ user: req.user.id })
      .populate('user', 'email');
    
    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }

    res.json({ success: true, pharmacy });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update pharmacy profile
// @route   PUT /api/pharmacy/profile
// @access  Private (Pharmacy)
exports.updateProfile = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ user: req.user.id });
    
    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }

    const {
      name,
      description,
      address,
      contact,
      openingHours,
      services
    } = req.body;

    if (name) pharmacy.name = name;
    if (description) pharmacy.description = description;
    if (address) pharmacy.address = { ...pharmacy.address, ...address };
    if (contact) pharmacy.contact = { ...pharmacy.contact, ...contact };
    if (openingHours) pharmacy.openingHours = { ...pharmacy.openingHours, ...openingHours };
    if (services) pharmacy.services = services;

    await pharmacy.save();

    res.json({ success: true, pharmacy });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload pharmacy logo
// @route   POST /api/pharmacy/logo
// @access  Private (Pharmacy)
exports.uploadLogo = async (req, res) => {
  try {
    const uploadSingle = upload.single('logo');
    
    uploadSingle(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'Please upload a file' });
      }

      const pharmacy = await Pharmacy.findOne({ user: req.user.id });
      if (!pharmacy) {
        return res.status(404).json({ message: 'Pharmacy not found' });
      }

      pharmacy.logo = `/uploads/${req.file.filename}`;
      await pharmacy.save();

      res.json({ success: true, logo: pharmacy.logo });
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get pharmacy analytics
// @route   GET /api/pharmacy/analytics
// @access  Private (Pharmacy)
exports.getAnalytics = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ user: req.user.id });
    
    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }

    res.json({
      success: true,
      analytics: {
        views: pharmacy.views,
        clicks: pharmacy.clicks,
        subscriptionStatus: pharmacy.subscription.status,
        isActive: pharmacy.isActive
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Increment pharmacy views
// @route   POST /api/pharmacy/view
// @access  Public
exports.incrementView = async (req, res) => {
  try {
    const { pharmacyId } = req.body;
    const pharmacy = await Pharmacy.findById(pharmacyId);
    
    if (pharmacy) {
      pharmacy.views += 1;
      await pharmacy.save();
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Purchase ad slot (UI only - placeholder)
// @route   POST /api/pharmacy/purchase-ad
// @access  Private (Pharmacy)
exports.purchaseAdSlot = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ user: req.user.id });
    
    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }

    pharmacy.advertisement = pharmacy.advertisement || {};
    pharmacy.advertisement.paid = true;
    await pharmacy.save();

    res.json({ success: true, message: 'Ad slot purchased successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Publish advertisement
// @route   POST /api/pharmacy/publish-ad
// @access  Private (Pharmacy)
exports.publishAd = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ user: req.user.id });
    
    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }

    if (!pharmacy.advertisement?.paid) {
      return res.status(400).json({ message: 'Please purchase an ad slot first' });
    }

    const uploadSingle = upload.single('image');
    
    uploadSingle(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      pharmacy.advertisement = pharmacy.advertisement || {};
      pharmacy.advertisement.offerText = req.body.offerText || '';
      pharmacy.advertisement.product = req.body.productId || null;
      
      if (req.file) {
        pharmacy.advertisement.image = `/uploads/${req.file.filename}`;
      }
      
      pharmacy.advertisement.active = true;
      await pharmacy.save();

      res.json({ success: true, advertisement: pharmacy.advertisement });
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

