const requestService = require('../services/request.service');

const getRequests = async (req, res, next) => {
  try {
    const requests = await requestService.fetchAllRequests();
    res.status(200).json(requests);
  } catch (error) {
    next(error);
  }
};

const getRequestById = async (req, res, next) => {
  try {
    const request = await requestService.fetchRequestById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.status(200).json(request);
  } catch (error) {
    next(error);
  }
};

const createRequest = async (req, res, next) => {
  try {
    const newRequest = await requestService.createNewRequest(req.body);
    res.status(201).json(newRequest);
  } catch (error) {
    next(error);
  }
};

const updateRequest = async (req, res, next) => {
  try {
    const updatedRequest = await requestService.updateExistingRequest(
      req.params.id,
      req.body
    );

    if (!updatedRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.status(200).json(updatedRequest);
  } catch (error) {
    next(error);
  }
};

const deleteRequest = async (req, res, next) => {
  try {
    const deletedRequest = await requestService.deleteRequestById(req.params.id);

    if (!deletedRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.status(200).json({
      message: 'Request deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRequests,
  getRequestById,
  createRequest,
  updateRequest,
  deleteRequest
};