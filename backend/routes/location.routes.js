const express = require('express');
const router = express.Router();
const Location = require('../models/location.model');

router.get('/', async (req, res) => {
  try {
    const locations = await Location.find().sort({ governorate: 1 });
    res.status(200).json({
      success: true,
      data: locations
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'حدث خطأ أثناء جلب المواقع' });
  }
});

module.exports = router;