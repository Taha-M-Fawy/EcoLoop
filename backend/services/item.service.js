const Item = require('../models/items.model');
const mongoose = require('mongoose');

exports.findAllItems = async (queryParams) => {
  const { category, governorate, type, search } = queryParams;

  const page = Math.max(1, parseInt(queryParams.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(queryParams.limit, 10) || 10));

  const filter = { status: 'available' };

  if (category && mongoose.Types.ObjectId.isValid(category)) {
    filter.categoryId = category;
  }
  if (governorate && typeof governorate === 'string') {
    filter.governorate = governorate.trim();
  }
  if (type && ['donation', 'exchange', 'sell'].includes(type)) {
    filter.type = type;
  }
  if (search && typeof search === 'string') {
    filter.$text = { $search: search };
  }

  const items = await Item.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await Item.countDocuments(filter);

  return {
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
      limit
    },
    data: items
  };
};

exports.findItemById = async (id) => {
  return await Item.findById(id);
};

exports.createNewItem = async (payload, ownerId) => {
  const allowedFields = [
    'title', 'description', 'type', 'price', 'exchangeWith',
    'condition', 'quantity', 'images', 'governorate', 'city', 'categoryId'
  ];

  const safePayload = {};
  allowedFields.forEach((field) => {
    if (payload[field] !== undefined) {
      safePayload[field] = payload[field];
    }
  });

  safePayload.ownerId = ownerId;

  return await Item.create(safePayload);
};

exports.modifyItem = async (id, updateData) => {
  const restrictedUpdates = ['_id', 'ownerId', 'createdAt', 'updatedAt', 'isVerified'];
  restrictedUpdates.forEach((key) => delete updateData[key]);

  return await Item.findByIdAndUpdate(id, updateData, {
    returnDocument: 'after',
    runValidators: true
  });
};
exports.removeItem = async (itemDoc) => {
  return await itemDoc.deleteOne();
};