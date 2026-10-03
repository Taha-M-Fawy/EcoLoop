const express = require('express');

const {
  getRequests,
  getRequestById,
  createRequest,
  updateRequest,
  deleteRequest
} = require('../controller/requests.controller');
const { protect, optionalProtect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', optionalProtect, getRequests);
router.get('/:id', optionalProtect, getRequestById);
router.post('/', protect, createRequest);
router.put('/:id', protect, updateRequest);
router.delete('/:id', protect, deleteRequest);

module.exports = router;