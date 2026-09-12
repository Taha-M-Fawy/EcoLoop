const express = require('express');
const router = express.Router();
const itemController = require('../controller/item.controller');
const itemMiddleware = require('../middlewares/item.middleware');

router.get('/', itemController.getAllItems);
router.get('/:id', itemMiddleware.validateObjectId, itemController.getItemById);

router.post('/', itemMiddleware.validateItemPayload, itemController.createItem);
router.put('/:id', itemMiddleware.validateObjectId, itemMiddleware.checkItemOwnership, itemController.updateItem);
router.delete('/:id', itemMiddleware.validateObjectId, itemMiddleware.checkItemOwnership, itemController.deleteItem);

module.exports = router;