'use strict';

const POST_CATEGORIES = Object.freeze({
  DO_NAM: 'do_nam',
  DO_NU: 'do_nu',
  DO_TRE_EM: 'do_tre_em',
  PHU_KIEN: 'phu_kien',
});

const POST_CONDITIONS = Object.freeze({
  NEW_100: 'new_100',
  NEW_90: 'new_90',
  NEW_80: 'new_80',
  CUSTOM: 'custom',
});

const POST_STATUSES = Object.freeze({
  AVAILABLE: 'available',       // Sẵn sàng
  IN_TRANSACTION: 'in_transaction', // Đang giao dịch
  TRADED: 'traded',             // Đã giao dịch
  COMPLETED: 'completed',       // Hoàn thành (Admin set)
});

const POST_CATEGORY_VALUES = Object.freeze(Object.values(POST_CATEGORIES));
const POST_CONDITION_VALUES = Object.freeze(Object.values(POST_CONDITIONS));
const POST_STATUS_VALUES = Object.freeze(Object.values(POST_STATUSES));

module.exports = {
  POST_CATEGORIES,
  POST_CONDITIONS,
  POST_STATUSES,
  POST_CATEGORY_VALUES,
  POST_CONDITION_VALUES,
  POST_STATUS_VALUES,
};
