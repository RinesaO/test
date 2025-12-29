const Pharmacy = require('../models/Pharmacy');
const Product = require('../models/Product');
const Promotion = require('../models/Promotion');

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

// @desc    Get active advertisements (promoted products)
// @route   GET /api/public/ads
// @access  Public
exports.getActiveAds = async (req, res) => {
  try {
    // Get all active promotions with pharmacy and product info
    const promotions = await Promotion.find({ active: true })
      .populate({
        path: 'pharmacy',
        select: 'name isActive',
        match: { isActive: true }
      })
      .populate('product', 'name price category image')
      .lean();

    // Filter out promotions where pharmacy is inactive or doesn't exist
    const activeAds = promotions
      .filter(promo => promo.pharmacy && promo.product)
      .map(promo => ({
        _id: promo._id,
        promotionId: promo._id,
        pharmacyId: promo.pharmacy._id,
        pharmacyName: promo.pharmacy.name,
        image: promo.image,
        offerText: promo.offerText,
        product: promo.product
      }));

    res.json({ success: true, ads: activeAds });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

