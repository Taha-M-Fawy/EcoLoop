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
    const authUserId = req.user?.id || req.user?._id;
    if (!authUserId) {
      return res.status(401).json({ message: 'يجب تسجيل الدخول أولاً لإنشاء طلب' });
    }

    const payload = { ...req.body, userId: authUserId };
    const newRequest = await requestService.createNewRequest(payload);
    res.status(201).json(newRequest);
  } catch (error) {
    next(error);
  }
};

const updateRequest = async (req, res, next) => {
  try {
    const existing = await requestService.fetchRequestById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'الطلب غير موجود' });
    }

    const authUserId = req.user?.id || req.user?._id;
    if (!authUserId) {
      return res.status(401).json({ message: 'يجب تسجيل الدخول أولاً' });
    }

    const isAdmin = req.user?.role === 'admin';
    const ownerId = existing.userId?._id || existing.userId;

    if (!ownerId || (String(ownerId) !== String(authUserId) && !isAdmin)) {
      return res.status(403).json({ message: 'غير مصرح لك بتعديل هذا الطلب' });
    }

    const updatedRequest = await requestService.updateExistingRequest(
      req.params.id,
      req.body
    );

    res.status(200).json(updatedRequest);
  } catch (error) {
    next(error);
  }
};

const deleteRequest = async (req, res, next) => {
  try {
    const existing = await requestService.fetchRequestById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'الطلب غير موجود' });
    }

    const authUserId = req.user?.id || req.user?._id;
    if (!authUserId) {
      return res.status(401).json({ message: 'يجب تسجيل الدخول أولاً' });
    }

    const isAdmin = req.user?.role === 'admin';
    const ownerId = existing.userId?._id || existing.userId;

    if (!ownerId || (String(ownerId) !== String(authUserId) && !isAdmin)) {
      return res.status(403).json({ message: 'غير مصرح لك بحذف هذا الطلب، فقط صاحب الطلب يمكنه حذفه' });
    }

    await requestService.deleteRequestById(req.params.id);

    res.status(200).json({
      message: 'تم حذف الطلب بنجاح'
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