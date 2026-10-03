const Request = require('../models/requests.model');

let requestsCache = null;
let lastRequestsFetch = 0;
const REQUESTS_CACHE_TTL = 45 * 1000; // 45 seconds

const invalidateRequestsCache = () => {
  requestsCache = null;
  lastRequestsFetch = 0;
};

const fetchAllRequests = async () => {
  const now = Date.now();
  if (requestsCache && (now - lastRequestsFetch < REQUESTS_CACHE_TTL)) {
    return requestsCache;
  }

  const requests = await Request.find({})
    .sort({ _id: -1 })
    .populate('userId', 'username name phone profileImage email')
    .populate('categoryId', 'name')
    .lean();

  requestsCache = requests;
  lastRequestsFetch = now;
  return requests;
};

const fetchRequestById = async (id) => {
  return await Request.findById(id)
    .populate('userId', 'username name phone profileImage email')
    .populate('categoryId', 'name')
    .lean();
};

const createNewRequest = async (requestData) => {
  const request = new Request(requestData);
  const savedRequest = await request.save();
  invalidateRequestsCache();
  if (savedRequest.userId) {
    const { createNotificationService } = require('./notifications.service');
    createNotificationService({
      userId: savedRequest.userId,
      title: 'تم نشر طلب الاحتياج بنجاح 📋',
      message: `تم نشر طلبك "${savedRequest.title}" بنجاح في مجتمع EcoLoop! ستصلك إشعارات فور تقديم أحد الأعضاء المساعدة.`,
      type: 'request',
      relatedEntityId: savedRequest._id,
      entityType: 'Request'
    }).catch(() => {});
  }
  return savedRequest;
};

const updateExistingRequest = async (id, updateData) => {
  const updated = await Request.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  );
  invalidateRequestsCache();
  return updated;
};

const deleteRequestById = async (id) => {
  const deleted = await Request.findByIdAndDelete(id);
  invalidateRequestsCache();
  return deleted;
};

module.exports = {
  fetchAllRequests,
  fetchRequestById,
  createNewRequest,
  updateExistingRequest,
  deleteRequestById,
  invalidateRequestsCache
};