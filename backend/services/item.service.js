const Item = require('../models/items.model');
const mongoose = require('mongoose');

// 1. Get All Items with dynamic filters, pagination, and robust regex search
exports.findAllItems = async (queryParams = {}) => {
  let { 
    category, 
    categoryId, 
    governorate, 
    city, 
    type, 
    search,
    page = 1,
    limit = 8
  } = queryParams;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 8));

  // مصفوفة الشروط المجمعة
  const conditions = [
    {
      $or: [
        { status: 'available' },
        { status: { $exists: false } }
      ]
    }
  ];

  // 1. معالجة وفك تشفير البحث النصي
  if (search && typeof search === 'string' && search.trim() !== '') {
    let cleanSearch = search.trim();
    try {
      cleanSearch = decodeURIComponent(cleanSearch).trim();
    } catch {
      cleanSearch = search.trim();
    }

    // تنظيف الحروف الخاصة لتفادي أخطاء الـ Regex
    const escapedSearch = cleanSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    conditions.push({
      $or: [
        { title: { $regex: escapedSearch, $options: 'i' } },
        { description: { $regex: escapedSearch, $options: 'i' } }
      ]
    });
  }

  // 2. فلتر التصنيف (دعم category و categoryId)
  const targetCategory = categoryId || category;
  if (targetCategory && targetCategory !== 'all' && mongoose.Types.ObjectId.isValid(targetCategory)) {
    conditions.push({ categoryId: new mongoose.Types.ObjectId(targetCategory) });
  }

  // 3. فلتر المحافظة
  if (governorate && typeof governorate === 'string' && governorate.trim() !== '' && governorate !== 'all') {
    conditions.push({ governorate: governorate.trim() });
  }

  // 4. فلتر المدينة
  if (city && typeof city === 'string' && city.trim() !== '' && city !== 'all') {
    conditions.push({ city: city.trim() });
  }

  // 5. نوع المعاملة
  if (type && ['donation', 'exchange', 'sell'].includes(type)) {
    conditions.push({ type });
  }

  // دمج كافة الشروط في فلتر موحد
  const finalFilter = conditions.length > 0 ? { $and: conditions } : {};

  const skip = (pageNum - 1) * limitNum;

  const [items, total] = await Promise.all([
    Item.find(finalFilter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('categoryId', 'name')
      .populate('ownerId', 'name username avatar phone')
      .lean(),
    Item.countDocuments(finalFilter)
  ]);

  return {
    pagination: {
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      limit: limitNum
    },
    data: items
  };
};

// 2. Get Single Item By ID
exports.findItemById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }

  return await Item.findById(id)
    .populate('categoryId', 'name')
    .populate('ownerId', 'name username avatar phone rating')
    .lean();
};

// 3. Create New Item
exports.createNewItem = async (payload, ownerId) => {
  const allowedFields = [
    'title', 'description', 'type', 'price', 'exchangeWith',
    'condition', 'quantity', 'images', 'governorate', 'city', 
    'categoryId', 'expiryDate', 'batchNumber', 'status'
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

// 4. Update Existing Item
exports.modifyItem = async (id, updateData) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }

  const restrictedUpdates = ['_id', 'ownerId', 'createdAt', 'updatedAt', 'isVerified'];
  restrictedUpdates.forEach((key) => delete updateData[key]);

  return await Item.findByIdAndUpdate(id, updateData, {
    returnDocument: 'after',
    runValidators: true
  });
};

// 5. Delete Item
exports.removeItem = async (itemDoc) => {
  return await itemDoc.deleteOne();
};