const express = require('express');

const {
  getRequests,
  getRequestById,
  createRequest,
  updateRequest,
  deleteRequest
} = require('../controller/requests.controller');

const router = express.Router();

router.get('/', getRequests);

router.get('/:id', getRequestById);

router.post('/', createRequest);

router.put('/:id', updateRequest);

router.delete('/:id', deleteRequest);

module.exports = router;