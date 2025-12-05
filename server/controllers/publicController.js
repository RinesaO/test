const Pharmacy = require('../models/Pharmacy');
const Product = require('../models/Product');

// @desc    Get all active pharmacies
// @route   GET /api/public/pharmacies
// @access  Public
exports.getPharmacies = async (req, res) => {
  try {
    const { search, city, sort } = req.query;
    
    // Show pharmacies that are active
    // Note: In production, you may want to also check subscription.status === 'active'
    // For now, we show any pharmacy that isActive (can be manually activated by admin)
    let query = {
      isActive: true
    };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'address.city': { $regex: search, $options: 'i' } }
      ];
    }

    if (city) {
      query['address.city'] = { $regex: city, $options: 'i' };
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'name') {
      sortOption = { name: 1 };
    } else if (sort === 'views') {
      sortOption = { views: -1 };
    }

    const pharmacies = await Pharmacy.find(query)
      .select('-subscription -user')
      .sort(sortOption);

    res.json({ success: true, pharmacies });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single pharmacy (public)
// @route   GET /api/public/pharmacies/:id
// @access  Public
exports.getPharmacy = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id)
      .select('-subscription -user');

    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }

    // Check if pharmacy is active (either has active subscription or is manually activated)
    if (!pharmacy.isActive) {
      return res.status(404).json({ message: 'Pharmacy not found or inactive' });
    }

    // Increment views
    pharmacy.views += 1;
    await pharmacy.save();

    res.json({ success: true, pharmacy });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get products for a pharmacy (public)
// @route   GET /api/public/pharmacies/:id/products
// @access  Public
exports.getPharmacyProducts = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id);

    if (!pharmacy || !pharmacy.isActive) {
      return res.status(404).json({ message: 'Pharmacy not found or inactive' });
    }

    const { category, search } = req.query;
    let query = { pharmacy: req.params.id };

    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(query).sort({ createdAt: -1 });

    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get cities list
// @route   GET /api/public/cities
// @access  Public
exports.getCities = async (req, res) => {
  try {
    const cities = await Pharmacy.distinct('address.city', {
      isActive: true,
      'address.city': { $exists: true, $ne: '' }
    });

    res.json({ success: true, cities });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get active advertisements
// @route   GET /api/public/ads
// @access  Public
exports.getActiveAds = async (req, res) => {
  try {
    const pharmacies = await Pharmacy.find({
      isActive: true,
      'advertisement.paid': true,
      'advertisement.active': true
    })
      .select('name advertisement')
      .populate('advertisement.product', 'name price')
      .lean();

    const ads = pharmacies
      .filter(pharmacy => pharmacy.advertisement && pharmacy.advertisement.active)
      .map(pharmacy => ({
        pharmacyId: pharmacy._id,
        pharmacyName: pharmacy.name,
        image: pharmacy.advertisement.image,
        offerText: pharmacy.advertisement.offerText,
        product: pharmacy.advertisement.product
      }));

    res.json({ success: true, ads });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

