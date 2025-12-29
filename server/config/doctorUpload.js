const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create doctor uploads directory structure
const createDoctorUploadDir = (doctorId) => {
  const doctorDir = path.join(__dirname, '../uploads/doctors', doctorId.toString());
  if (!fs.existsSync(doctorDir)) {
    fs.mkdirSync(doctorDir, { recursive: true });
  }
  return doctorDir;
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create base doctors directory
    const baseDir = path.join(__dirname, '../uploads/doctors');
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }
    // Use temp directory first, then move to doctor-specific folder after doctorId is known
    cb(null, baseDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  // License field: images only, no PDFs
  if (file.fieldname === 'license') {
    const allowedImageMimes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (allowedImageMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('License must be an image file (JPEG or PNG). PDF files are not accepted.'), false);
    }
    return;
  }
  
  // Other fields (idCard, certificate): Accept PDFs and images
  const allowedMimes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png'
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and image files (PNG, JPG, JPEG) are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: fileFilter
});

module.exports = { upload, createDoctorUploadDir };

