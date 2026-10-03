const Transaction = require('../models/transactions.model');
const Item = require('../models/items.model');
const Request = require('../models/requests.model');
const User = require('../models/user.model');
const { createNotificationService } = require('./notifications.service');
const { invalidateItemsCache } = require('./item.service');
const { invalidateRequestsCache } = require('./request.service');

const maskPhoneNumber = (phone) => {
  if (!phone || typeof phone !== 'string') return '010*****00';
  const trimmed = phone.trim();
  if (trimmed.length <= 4) return '010*****00';
  const prefix = trimmed.slice(0, 3);
  const suffix = trimmed.slice(-2);
  return `${prefix}*****${suffix}`;
};

const sanitizeTransactionPrivacy = (tx, currentUserId, role = 'user') => {
  if (!tx) return tx;
  const isSell = tx.itemId?.type === 'sell' || (tx.platformFee && tx.platformFee > 0);
  const isPending = tx.status === 'pending';
  const isCancelled = tx.status === 'cancelled';
  const isCompleted = tx.status === 'completed';

  // Anti-Leakage & Privacy Rules:
  // 1. In pending: Phone is ALWAYS masked for both parties to prevent bypass before acceptance.
  // 2. In sell transactions: Phone is ALWAYS masked to ensure platform fee & escrow protection.
  // 3. In approved donation/exchange: Phone is revealed for physical meetup coordination.
  const shouldMaskPhone = role !== 'admin' && (isPending || isSell || isCancelled || isCompleted);

  const txCopy = { ...tx };

  if (shouldMaskPhone) {
    if (txCopy.donorOrSellerId && txCopy.donorOrSellerId.phone) {
      txCopy.donorOrSellerId = {
        ...txCopy.donorOrSellerId,
        phone: maskPhoneNumber(txCopy.donorOrSellerId.phone),
        isPhoneMasked: true
      };
    }
    if (txCopy.receiverId && txCopy.receiverId.phone) {
      txCopy.receiverId = {
        ...txCopy.receiverId,
        phone: maskPhoneNumber(txCopy.receiverId.phone),
        isPhoneMasked: true
      };
    }
  } else {
    if (txCopy.donorOrSellerId) {
      txCopy.donorOrSellerId = { ...txCopy.donorOrSellerId, isPhoneMasked: false };
    }
    if (txCopy.receiverId) {
      txCopy.receiverId = { ...txCopy.receiverId, isPhoneMasked: false };
    }
  }

  // OTP Handshake Security (Pure Escrow):
  // The secret Handshake OTP belongs EXCLUSIVELY to the receiver.
  // The donor/seller must NEVER see the OTP across the API until the transaction is completed.
  const receiverIdStr = txCopy.receiverId?._id ? String(txCopy.receiverId._id) : String(txCopy.receiverId);
  const isReceiver = String(currentUserId) === receiverIdStr;
  const isAdmin = role === 'admin';

  if (!isAdmin && !isReceiver && !isCompleted) {
    delete txCopy.handshakeOTP;
  }

  txCopy.privacyProtection = {
    isPhoneMasked: shouldMaskPhone,
    isOtpProtected: !isAdmin && !isReceiver,
    reason: isPending 
      ? 'pending_verification' 
      : (isSell ? 'sell_escrow_protection' : (isCompleted ? 'transaction_completed' : 'standard_privacy'))
  };

  return txCopy;
};

const getTransactionByIdService = async (id, userId, role = 'user') => {
  const transaction = await Transaction.findById(id)
    .populate('itemId')
    .populate('requestId')
    .populate('donorOrSellerId', 'username name email phone profileImage ratingAverage')
    .populate('receiverId', 'username name email phone profileImage ratingAverage')
    .lean();

  if (!transaction) {
    throw new Error('المعاملة غير موجودة');
  }

  return sanitizeTransactionPrivacy(transaction, userId, role);
};

const createTransactionService = async ({ itemId, requestId, donorOrSellerId, receiverId, notes }, currentUserId, role = 'user') => {
  if (String(donorOrSellerId) === String(receiverId)) {
    throw new Error('لا يمكنك إنشاء معاملة مع نفسك');
  }

  // Check if item or request exists
  let itemTitle = 'السلعة';
  let requestTitle = 'الطلب';

  if (itemId) {
    const item = await Item.findById(itemId);
    if (!item) throw new Error('السلعة المطلوبة غير موجودة');
    itemTitle = item.title;
    donorOrSellerId = item.ownerId; // Ensure donor is true owner
  }

  if (requestId) {
    const reqItem = await Request.findById(requestId);
    if (!reqItem) throw new Error('الطلب المطلوب غير موجود');
    requestTitle = reqItem.title;
    receiverId = reqItem.userId; // Ensure receiver is true requester
  }

  // Prevent duplicate pending transaction
  const existing = await Transaction.findOne({
    ...(itemId ? { itemId } : {}),
    ...(requestId ? { requestId } : {}),
    donorOrSellerId,
    receiverId,
    status: { $in: ['pending', 'approved'] }
  });

  if (existing) {
    throw new Error('توجد معاملة جارية بالفعل لنفس هذا العنصر والطرفين');
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  let itemPrice = 0;
  let platformFee = 0;
  let totalAmount = 0;

  if (itemId) {
    const itemObj = await Item.findById(itemId).select('type price').lean();
    if (itemObj?.type === 'sell' && itemObj?.price > 0) {
      itemPrice = Number(itemObj.price);
      platformFee = Math.max(5, Math.round(itemPrice * 0.05)); // 5% رسم حماية المشتري (حد أدنى 5 جنيه)
      totalAmount = itemPrice + platformFee;
    }
  }

  const transaction = await Transaction.create({
    itemId: itemId || null,
    requestId: requestId || null,
    donorOrSellerId,
    receiverId,
    handshakeOTP: otp,
    status: 'pending',
    itemPrice,
    platformFee,
    totalAmount,
    notes: notes || ''
  });

  // Fetch creator info to send friendly notification
  const [donorUser, receiverUser] = await Promise.all([
    User.findById(donorOrSellerId).select('username name phone').lean(),
    User.findById(receiverId).select('username name phone').lean()
  ]);

  if (itemId) {
    // Receiver initiated request for an item -> Notify Donor
    await createNotificationService({
      userId: donorOrSellerId,
      title: 'طلب استلام سلعة جديد 📦',
      message: `طلب ${receiverUser?.username || receiverUser?.name || 'مستخدم'} استلام سلعتك: "${itemTitle}". يرجى قبول أو رفض المعاملة من صفحة المعاملات.`,
      type: 'transaction',
      relatedEntityId: transaction._id,
      entityType: 'Transaction'
    }).catch(() => {});

    // Notify Receiver (Confirmation)
    await createNotificationService({
      userId: receiverId,
      title: 'تم إرسال طلب استلام السلعة بنجاح ✅',
      message: `تم إرسال طلبك لاستلام سلعة "${itemTitle}" بنجاح! ستصلك رسالة فور موافقة المانح وظهور كود الاستلام (OTP).`,
      type: 'transaction',
      relatedEntityId: transaction._id,
      entityType: 'Transaction'
    }).catch(() => {});
  } else if (requestId) {
    // Donor offered help for a request -> Notify Receiver
    await createNotificationService({
      userId: receiverId,
      title: 'عرض مساعدة جديد لطلبك 🤝',
      message: `عرض ${donorUser?.username || donorUser?.name || 'مستخدم'} تلبية وتوفير طلبك: "${requestTitle}". تفقد صفحة المعاملات لتأكيد الاستلام!`,
      type: 'transaction',
      relatedEntityId: transaction._id,
      entityType: 'Transaction'
    }).catch(() => {});

    // Notify Donor (Confirmation)
    await createNotificationService({
      userId: donorOrSellerId,
      title: 'تم تقديم عرض المساعدة بنجاح ✅',
      message: `تم تقديم عرضك لتوفير طلب "${requestTitle}" بنجاح! شكراً لمبادرتك الطيبة. تفقد صفحة المعاملات لمتابعة الطلب.`,
      type: 'transaction',
      relatedEntityId: transaction._id,
      entityType: 'Transaction'
    }).catch(() => {});
  }

  return getTransactionByIdService(transaction._id, currentUserId || donorOrSellerId, role);
};

const getTransactionsService = async (userId, role = 'user', query = {}) => {
  let filter = {};

  if (role === 'admin' && query.all === 'true') {
    // Admin seeing all
    filter = {};
  } else if (query.as === 'donor') {
    filter = { donorOrSellerId: userId };
  } else if (query.as === 'receiver') {
    filter = { receiverId: userId };
  } else {
    filter = {
      $or: [{ donorOrSellerId: userId }, { receiverId: userId }]
    };
  }

  if (query.status && query.status !== 'all') {
    filter.status = query.status;
  }

  const transactions = await Transaction.find(filter)
    .sort({ createdAt: -1 })
    .populate('itemId', 'title images price type condition status governorate city')
    .populate('requestId', 'title quantity urgency status governorate city')
    .populate('donorOrSellerId', 'username name email phone profileImage ratingAverage')
    .populate('receiverId', 'username name email phone profileImage ratingAverage')
    .lean();

  return transactions.map(tx => sanitizeTransactionPrivacy(tx, userId, role));
};

const updateTransactionStatusService = async (id, userId, { status, otp, notes }, role = 'user') => {
  const transaction = await Transaction.findById(id);
  if (!transaction) {
    throw new Error('المعاملة غير موجودة');
  }

  const isDonor = String(transaction.donorOrSellerId) === String(userId);
  const isReceiver = String(transaction.receiverId) === String(userId);

  if (!isDonor && !isReceiver) {
    throw new Error('غير مصرح لك بتعديل هذه المعاملة');
  }

  // 1. الموافقة (Approve) - يقوم بها المانح/صاحب السلعة
  if (status === 'approved') {
    if (!isDonor) {
      throw new Error('صاحب السلعة أو المانح فقط هو من يملك صلاحية قبول الطلب');
    }
    if (transaction.status !== 'pending') {
      throw new Error('لا يمكن قبول هذه المعاملة لأنها ليست قيد الانتظار');
    }

    transaction.status = 'approved';
    if (notes) transaction.notes = notes;
    await transaction.save();

    // تحديث حالة السلعة إلى محجوز (قيد التسليم)
    if (transaction.itemId) {
      await Item.findByIdAndUpdate(transaction.itemId, { status: 'reserved' }).catch(() => {});
      invalidateItemsCache();
    }

    // إشعار المستلم بالموافقة مع كود الاستلام
    await createNotificationService({
      userId: transaction.receiverId,
      title: 'تمت الموافقة على طلبك! 🎉',
      message: `وافق الطرف الآخر على معاملة التبادل! كود الاستلام السري الخاص بك هو (${transaction.handshakeOTP}). أعطه للطرف الآخر عند المقابلة لتأكيد الاستلام.`,
      type: 'transaction',
      relatedEntityId: transaction._id,
      entityType: 'Transaction'
    }).catch(() => {});

    // إشعار المانح بالتأكيد
    await createNotificationService({
      userId: transaction.donorOrSellerId,
      title: 'وافقت على المعاملة بنجاح ✅',
      message: `تم قبول المعاملة رقم #${transaction._id.toString().slice(-6)}. يرجى إدخال كود الاستلام (OTP) من المستلم عند المقابلة لإتمام المعاملة.`,
      type: 'transaction',
      relatedEntityId: transaction._id,
      entityType: 'Transaction'
    }).catch(() => {});

    return getTransactionByIdService(id, userId, role);
  }

  // 2. الإلغاء (Cancel)
  if (status === 'cancelled') {
    if (transaction.status === 'completed') {
      throw new Error('لا يمكن إلغاء معاملة تم اكتمالها بنجاح');
    }

    transaction.status = 'cancelled';
    if (notes) transaction.notes = notes;
    await transaction.save();

    // إعادة حالة السلعة إلى متاحة
    if (transaction.itemId) {
      await Item.findByIdAndUpdate(transaction.itemId, { status: 'available' }).catch(() => {});
      invalidateItemsCache();
    }

    // إشعار الطرف الآخر
    const otherUserId = isDonor ? transaction.receiverId : transaction.donorOrSellerId;
    const cancelledBy = isDonor ? 'المانح' : 'المستلم';
    await createNotificationService({
      userId: otherUserId,
      title: 'تم إلغاء المعاملة ⚠️',
      message: `قام ${cancelledBy} بإلغاء المعاملة رقم #${transaction._id.toString().slice(-6)}.`,
      type: 'transaction',
      relatedEntityId: transaction._id,
      entityType: 'Transaction'
    }).catch(() => {});

    // إشعار الشخص الذي قام بالإلغاء
    await createNotificationService({
      userId: userId,
      title: 'تم إلغاء المعاملة بنجاح',
      message: `تم إلغاء المعاملة رقم #${transaction._id.toString().slice(-6)} بنجاح.`,
      type: 'transaction',
      relatedEntityId: transaction._id,
      entityType: 'Transaction'
    }).catch(() => {});

    return getTransactionByIdService(id, userId, role);
  }

  // 3. تأكيد الاكتمال (Complete via Handshake OTP or Direct Confirmation)
  if (status === 'completed') {
    if (transaction.status !== 'approved') {
      throw new Error('يجب الموافقة على المعاملة أولاً قبل تأكيد اكتمالها');
    }

    // التحقق من كود الـ Handshake OTP في حال تم تمريره
    if (otp) {
      if (String(otp).trim() !== String(transaction.handshakeOTP).trim()) {
        throw new Error('كود الاستلام (OTP) غير صحيح! يرجى التأكد من الكود مع المستلم');
      }
    }

    transaction.status = 'completed';
    if (notes) transaction.notes = notes;
    await transaction.save();

    // تحديث حالة السلعة إن وجدت إلى completed
    if (transaction.itemId) {
      await Item.findByIdAndUpdate(transaction.itemId, { status: 'completed' }).catch(() => {});
      invalidateItemsCache();
    }

    // تحديث حالة الطلب إن وجد إلى Closed
    if (transaction.requestId) {
      await Request.findByIdAndUpdate(transaction.requestId, { status: 'Closed' }).catch(() => {});
      invalidateRequestsCache();
    }

    // زيادة الـ impactScore للطرفين
    await Promise.all([
      User.findByIdAndUpdate(transaction.donorOrSellerId, { $inc: { impactScore: 10 } }).catch(() => {}),
      User.findByIdAndUpdate(transaction.receiverId, { $inc: { impactScore: 5 } }).catch(() => {})
    ]);

    // إرسال إشعار لكلا الطرفين بالتقييم
    const donorMsg = `تم إتمام عملية التبادل بنجاح! شكراً لمساهمتك المجتمعية. يمكنك الآن تقييم المستلم.`;
    const receiverMsg = `تم استلامك للسلعة واكتمال المعاملة بنجاح! يرجى تقييم تجربتك مع المانح.`;

    await Promise.all([
      createNotificationService({
        userId: transaction.donorOrSellerId,
        title: 'اكتملت المعاملة بنجاح!',
        message: donorMsg,
        type: 'transaction',
        relatedEntityId: transaction._id,
        entityType: 'Transaction'
      }).catch(() => {}),
      createNotificationService({
        userId: transaction.receiverId,
        title: 'اكتملت المعاملة بنجاح!',
        message: receiverMsg,
        type: 'transaction',
        relatedEntityId: transaction._id,
        entityType: 'Transaction'
      }).catch(() => {})
    ]);

    return getTransactionByIdService(id, userId, role);
  }

  throw new Error('حالة المعاملة المطلوبة غير صالحة');
};

const deleteTransactionService = async (id, userId) => {
  return Transaction.findByIdAndDelete(id);
};

module.exports = {
  createTransactionService,
  getTransactionsService,
  getTransactionByIdService,
  updateTransactionStatusService,
  deleteTransactionService
};
