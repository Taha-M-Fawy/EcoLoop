const Category = require('../models/category.model');

const fetchAllCategories = async () => {
  return await Category.find({});
};

const fetchCategoryById = async (id) => {
  return await Category.findById(id);
};

const createNewCategory = async (categoryData) => {
  const category = new Category(categoryData);
  return await category.save();
};

const updateExistingCategory = async (id, updateData) => {
  return await Category.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
};

const deleteCategoryById = async (id) => {
  return await Category.findByIdAndDelete(id);
};

module.exports = {
  fetchAllCategories,
  fetchCategoryById,
  createNewCategory,
  updateExistingCategory,
  deleteCategoryById
};