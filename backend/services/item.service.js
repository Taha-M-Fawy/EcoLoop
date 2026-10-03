const Item = require('../models/items.model');
const mongoose = require('mongoose');

// In-Memory Fast Cache for items listing (reduces Atlas latency from 15s to 0ms)
const itemsCache = new Map();
const ITEMS_CACHE_TTL = 45 * 1000; // 45 seconds

const invalidateItemsCache = () => {
  itemsCache.clear();
};
exports.invalidateItemsCache = invalidateItemsCache;

// 1. Get All Items with dynamic filters, pagination, robust regex search, and owner filtering
exports.findAllItems = async (queryParams = {}, authUserId = null) => {
  const cacheKey = `${JSON.stringify(queryParams)}_${authUserId || 'guest'}`;
  const cached = itemsCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < ITEMS_CACHE_TTL)) {
    return cached.data;
  }

  let { 
    category, 
    categoryId, 
    governorate, 
    city, 
    type, 
    search,
    owner,
    ownerId,
    page = 1,
    limit = 8
  } = queryParams;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 8));

  const conditions = [];

  // 1. معالجة فلتر المالك (owner=me أو معرّف محدد)
  const targetOwner = ownerId || owner;
  let resolvedOwnerId = null;

  if (targetOwner === 'me') {
    resolvedOwnerId = authUserId;
  } else if (targetOwner && mongoose.Types.ObjectId.isValid(targetOwner)) {
    resolvedOwnerId = targetOwner;
  }

  if (resolvedOwnerId && mongoose.Types.ObjectId.isValid(resolvedOwnerId)) {
    conditions.push({ ownerId: new mongoose.Types.ObjectId(resolvedOwnerId) });
  } else if (queryParams.status && queryParams.status !== 'all') {
    conditions.push({ status: queryParams.status });
  }

  // 2. معالجة وفك تشفير البحث النصي
  if (search && typeof search === 'string' && search.trim() !== '') {
    let cleanSearch = search.trim();
    try {
      cleanSearch = decodeURIComponent(cleanSearch).trim();
    } catch {
      cleanSearch = search.trim();
    }

    const escapedSearch = cleanSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    conditions.push({
      $or: [
        { title: { $regex: escapedSearch, $options: 'i' } },
        { description: { $regex: escapedSearch, $options: 'i' } }
      ]
    });
  }

  // 3. فلتر التصنيف
  const targetCategory = categoryId || category;
  if (targetCategory && targetCategory !== 'all' && mongoose.Types.ObjectId.isValid(targetCategory)) {
    conditions.push({ categoryId: new mongoose.Types.ObjectId(targetCategory) });
  }

  // 4. فلتر المحافظة
  if (governorate && typeof governorate === 'string' && governorate.trim() !== '' && governorate !== 'all') {
    conditions.push({ governorate: governorate.trim() });
  }

  // 5. فلتر المدينة
  if (city && typeof city === 'string' && city.trim() !== '' && city !== 'all') {
    conditions.push({ city: city.trim() });
  }

  // 6. نوع المعاملة
  if (type && ['donation', 'exchange', 'sell'].includes(type)) {
    conditions.push({ type });
  }

  const finalFilter = conditions.length > 0 ? { $and: conditions } : {};

  const skip = (pageNum - 1) * limitNum;

  const countPromise = conditions.length > 0 
    ? Item.countDocuments(finalFilter) 
    : Item.estimatedDocumentCount();

  const [items, total] = await Promise.all([
    Item.find(finalFilter)
      .sort({ status: 1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('categoryId', 'name')
      .populate('ownerId', 'name username avatar phone rating isVerified')
      .lean(),
    countPromise
  ]);

  const result = {
    pagination: {
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      limit: limitNum
    },
    data: items
  };

  itemsCache.set(cacheKey, { timestamp: Date.now(), data: result });
  return result;
};

// 2. Get Single Item By ID
exports.findItemById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }

  let item = await Item.findById(id)
    .populate('categoryId', 'name')
    .populate('ownerId', 'name username avatar phone rating isVerified')
    .lean();

  if (!item) return null;

  const rawOwnerId = item.ownerId?._id || item.ownerId || item.userId;
  if (rawOwnerId && (typeof item.ownerId === 'string' || item.ownerId instanceof mongoose.Types.ObjectId || !item.ownerId?.name)) {
    try {
      const user = await mongoose.model('User').findById(rawOwnerId).select('name username avatar phone rating isVerified').lean();
      if (user) {
        item.ownerId = user;
      }
    } catch {
      // ignore
    }
  }

  return item;
};

// 3. Create New Item
exports.createNewItem = async (payload, ownerId) => {
  const allowedFields = [
    'title', 'description', 'type', 'price', 'exchangeWith',
    'condition', 'quantity', 'images', 'governorate', 'city', 
    'categoryId', 'expiryDate', 'batchNumber', 'status', 'packagingType', 'isControlledSubstance'
  ];

  const safePayload = {};
  allowedFields.forEach((field) => {
    if (payload[field] !== undefined) {
      safePayload[field] = payload[field];
    }
  });

  safePayload.ownerId = ownerId;
  const createdItem = await Item.create(safePayload);
  if (ownerId) {
    const { createNotificationService } = require('./notifications.service');
    createNotificationService({
      userId: ownerId,
      title: 'تم نشر السلعة بنجاح 📦',
      message: `تم نشر سلعتك "${createdItem.title}" بنجاح في مجتمع EcoLoop! ستصلك إشعارات فور طلب أحد الأعضاء استلامها.`,
      type: 'system',
      relatedEntityId: createdItem._id,
      entityType: 'Item'
    }).catch(() => {});
  }
  invalidateItemsCache();
  return createdItem;
};

// 4. Update Existing Item
exports.modifyItem = async (id, updateData) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }

  const restrictedUpdates = ['_id', 'ownerId', 'createdAt', 'updatedAt', 'isVerified'];
  restrictedUpdates.forEach((key) => delete updateData[key]);

  const updated = await Item.findByIdAndUpdate(id, updateData, {
    returnDocument: 'after',
    runValidators: true
  });
  invalidateItemsCache();
  return updated;
};

// 5. Delete Item
exports.removeItem = async (target) => {
  if (!target) return null;
  let result = null;
  if (typeof target.deleteOne === 'function') {
    result = await target.deleteOne();
  } else {
    const id = target._id || target.id || target;
    if (mongoose.Types.ObjectId.isValid(id)) {
      result = await Item.findByIdAndDelete(id);
    }
  }
  invalidateItemsCache();
  return result;
};