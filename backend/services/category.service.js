const Category = require('../models/category.model');

let categoriesCache = null;
let lastCategoriesFetch = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const fetchAllCategories = async () => {
  const now = Date.now();
  if (categoriesCache && (now - lastCategoriesFetch < CACHE_TTL)) {
    return categoriesCache;
  }
  try {
    const categories = await Category.find({}).lean();
    if (categories && categories.length > 0) {
      categoriesCache = categories;
      lastCategoriesFetch = now;
    }
    return categories;
  } catch (error) {
    if (categoriesCache) {
      console.warn("Serving categories from cache due to DB error:", error.message);
      return categoriesCache;
    }
    throw error;
  }
};

const invalidateCache = () => {
  categoriesCache = null;
  lastCategoriesFetch = 0;
};

const fetchCategoryById = async (id) => {
  return await Category.findById(id).lean();
};

const createNewCategory = async (categoryData) => {
  const category = new Category(categoryData);
  const saved = await category.save();
  invalidateCache();
  return saved;
};

const updateExistingCategory = async (id, updateData) => {
  const updated = await Category.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  invalidateCache();
  return updated;
};

const deleteCategoryById = async (id) => {
  const deleted = await Category.findByIdAndDelete(id);
  invalidateCache();
  return deleted;
};

module.exports = {
  fetchAllCategories,
  fetchCategoryById,
  createNewCategory,
  updateExistingCategory,
  deleteCategoryById
};