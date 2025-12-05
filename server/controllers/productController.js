const Product = require('../models/Product');
const Pharmacy = require('../models/Pharmacy');
const upload = require('../config/upload');

// @desc    Get all products for a pharmacy
// @route   GET /api/products/pharmacy/:pharmacyId
// @access  Public
exports.getProductsByPharmacy = async (req, res) => {
  try {
    const { pharmacyId } = req.params;
    const products = await Product.find({ pharmacy: pharmacyId }).sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all products for logged in pharmacy
// @route   GET /api/products
// @access  Private (Pharmacy)
exports.getMyProducts = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ user: req.user.id });
    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }

    const products = await Product.find({ pharmacy: pharmacy._id }).sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('pharmacy', 'name');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private (Pharmacy)
exports.createProduct = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ user: req.user.id });
    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }

    const { name, description, price, category, inStock, stockQuantity } = req.body;

    const product = await Product.create({
      name,
      description,
      price,
      category,
      inStock: inStock !== undefined ? inStock : true,
      stockQuantity: stockQuantity || 0,
      pharmacy: pharmacy._id
    });

    res.status(201).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Pharmacy)
exports.updateProduct = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ user: req.user.id });
    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if product belongs to pharmacy
    if (product.pharmacy.toString() !== pharmacy._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { name, description, price, category, inStock, stockQuantity } = req.body;

    if (name) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = price;
    if (category) product.category = category;
    if (inStock !== undefined) product.inStock = inStock;
    if (stockQuantity !== undefined) product.stockQuantity = stockQuantity;

    await product.save();

    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Pharmacy)
exports.deleteProduct = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ user: req.user.id });
    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if product belongs to pharmacy
    if (product.pharmacy.toString() !== pharmacy._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Product.findByIdAndDelete(product._id);

    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload product image
// @route   POST /api/products/:id/image
// @access  Private (Pharmacy)
exports.uploadProductImage = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ user: req.user.id });
    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.pharmacy.toString() !== pharmacy._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const uploadSingle = upload.single('image');
    
    uploadSingle(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'Please upload a file' });
      }

      product.image = `/uploads/${req.file.filename}`;
      await product.save();

      res.json({ success: true, image: product.image });
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get product categories
// @route   GET /api/products/categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

