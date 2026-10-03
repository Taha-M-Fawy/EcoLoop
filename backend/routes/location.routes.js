const express = require('express');
const router = express.Router();
const Location = require('../models/location.model');

let locationsCache = null;
let lastLocationsFetch = 0;
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

router.get('/', async (req, res) => {
  const now = Date.now();
  if (locationsCache && (now - lastLocationsFetch < CACHE_TTL)) {
    return res.status(200).json({
      success: true,
      data: locationsCache
    });
  }

  try {
    const locations = await Location.find().sort({ governorate: 1 }).lean();
    if (locations && locations.length > 0) {
      locationsCache = locations;
      lastLocationsFetch = now;
    }
    res.status(200).json({
      success: true,
      data: locations
    });
  } catch (err) {
    if (locationsCache) {
      console.warn("Serving locations from cache due to DB error:", err.message);
      return res.status(200).json({
        success: true,
        data: locationsCache
      });
    }
    res.status(500).json({ success: false, message: 'حدث خطأ أثناء جلب المواقع' });
  }
});

module.exports = router;