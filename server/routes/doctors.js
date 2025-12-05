const express = require('express');
const router = express.Router();
const { applyForDoctor } = require('../controllers/doctorController');

router.post('/apply', applyForDoctor);

module.exports = router;

