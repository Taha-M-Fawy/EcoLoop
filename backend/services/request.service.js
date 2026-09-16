const Request = require('../models/requests.model');

const fetchAllRequests = async () => {
  return await Request.find({});
};

const fetchRequestById = async (id) => {
  return await Request.findById(id);
};

const createNewRequest = async (requestData) => {
  const request = new Request(requestData);
  return await request.save();
};

const updateExistingRequest = async (id, updateData) => {
  return await Request.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  );
};

const deleteRequestById = async (id) => {
  return await Request.findByIdAndDelete(id);
};

module.exports = {
  fetchAllRequests,
  fetchRequestById,
  createNewRequest,
  updateExistingRequest,
  deleteRequestById
};