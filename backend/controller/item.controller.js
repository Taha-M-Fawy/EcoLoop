const itemService = require('../services/item.service');

// 1. Get All Items
exports.getAllItems = async (req, res, next) => {
  try {
    const result = await itemService.findAllItems(req.query);

    res.status(200).json({
      success: true,
      pagination: result.pagination,
      data: result.data
    });
  } catch (error) {
    next(error);
  }
};

// 2. Get Item By ID
exports.getItemById = async (req, res, next) => {
  try {
    const item = await itemService.findItemById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'السلعة غير موجودة' });
    }

    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

// 3. Create Item
exports.createItem = async (req, res, next) => {
  try {
    const ownerId = req.headers['x-user-id'] || req.body.ownerId;
    const newItem = await itemService.createNewItem(req.body, ownerId);

    res.status(201).json({
      success: true,
      message: 'تم إضافة السلعة بنجاح',
      data: newItem
    });
  } catch (error) {
    next(error);
  }
};

// 4. Update Item
exports.updateItem = async (req, res, next) => {
  try {
    const updatedItem = await itemService.modifyItem(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: 'تم تحديث السلعة بنجاح',
      data: updatedItem
    });
  } catch (error) {
    next(error);
  }
};

// 5. Delete Item
exports.deleteItem = async (req, res, next) => {
  try {
    await itemService.removeItem(req.item);

    res.status(200).json({
      success: true,
      message: 'تم حذف السلعة بنجاح'
    });
  } catch (error) {
    next(error);
  }
};