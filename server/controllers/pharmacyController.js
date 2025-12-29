const Pharmacy = require('../models/Pharmacy');
const Promotion = require('../models/Promotion');
const Product = require('../models/Product');
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

// @desc    Get all promotions for pharmacy with stats
// @route   GET /api/pharmacy/promotions
// @access  Private (Pharmacy)
exports.getPromotions = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ user: req.user.id });
    
    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }

    const promotions = await Promotion.find({ pharmacy: pharmacy._id })
      .populate('product', 'name price category')
      .sort({ createdAt: -1 });

    res.json({ success: true, promotions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Track promotion click
// @route   POST /api/promotions/:id/click
// @access  Public
exports.trackPromotionClick = async (req, res) => {
  try {
    const { id } = req.params;
    const promotion = await Promotion.findById(id);
    
    if (promotion && promotion.active) {
      promotion.clicks += 1;
      await promotion.save();
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Track promotion purchase
// @route   POST /api/promotions/:id/purchase
// @access  Public
exports.trackPromotionPurchase = async (req, res) => {
  try {
    const { id } = req.params;
    const promotion = await Promotion.findById(id);
    
    if (promotion) {
      promotion.purchases += 1;
      await promotion.save();
    }

    res.json({ success: true });
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

// @desc    Purchase ad slot - allows multiple promotions
// @route   POST /api/pharmacy/purchase-ad
// @access  Private (Pharmacy)
exports.purchaseAdSlot = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ user: req.user.id });
    
    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }

    // Set paid flag to allow promotion creation
    // This flag doesn't get reset, allowing multiple promotions
    pharmacy.advertisement = pharmacy.advertisement || {};
    pharmacy.advertisement.paid = true;
    await pharmacy.save();

    res.json({ success: true, message: 'Ad slot purchased successfully. You can now promote products.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Publish advertisement - creates a new Promotion
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

      const { productId, offerText } = req.body;

      if (!productId) {
        return res.status(400).json({ message: 'Product ID is required' });
      }

      // Verify product belongs to pharmacy
      const product = await Product.findById(productId);
      if (!product || product.pharmacy.toString() !== pharmacy._id.toString()) {
        return res.status(403).json({ message: 'Product not found or does not belong to your pharmacy' });
      }

      // Create new promotion
      const promotionData = {
        pharmacy: pharmacy._id,
        product: productId,
        offerText: offerText || '',
        image: req.file ? `/uploads/${req.file.filename}` : '',
        startDate: new Date(),
        active: true
      };

      const promotion = await Promotion.create(promotionData);

      res.json({ success: true, promotion, message: 'Advertisement published successfully' });
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

