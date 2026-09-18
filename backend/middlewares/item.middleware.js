const mongoose = require('mongoose');
const Item = require('../models/items.model');

exports.validateObjectId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: 'معرّف السلعة غير صالح'
    });
  }
  next();
};

exports.validateItemPayload = (req, res, next) => {
  const { title, description, condition, categoryId, type, price, governorate, city } = req.body;

  if (!title || !description || !condition || !categoryId || !governorate || !city) {
    return res.status(400).json({
      success: false,
      message: 'جميع الحقول الأساسية مطلوبة (العنوان، الوصف، الحالة، المحافظة، المدينة، القسم)'
    });
  }

  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    return res.status(400).json({
      success: false,
      message: 'معرف التصنيف (categoryId) غير صالح'
    });
  }

  if (type === 'sell' && (price === undefined || price === null || Number(price) < 0)) {
    return res.status(400).json({
      success: false,
      message: 'يجب تحديد سعر صالح (0 أو أكبر) عند اختيار نوع البيع'
    });
  }

  next();
};

exports.checkItemOwnership = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'السلعة غير موجودة'
      });
    }

    const currentUserId = req.headers['x-user-id'] || req.body.ownerId;

    if (currentUserId && item.ownerId.toString() !== currentUserId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك بإجراء هذه العملية، لست صاحب السلعة'
      });
    }

    req.item = item;
    next();
  } catch (error) {
    next(error);
  }
};