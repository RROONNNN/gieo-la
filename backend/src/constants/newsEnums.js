'use strict';

const NEWS_CATEGORIES = Object.freeze({
  ANNOUNCEMENT: 'announcement', // Thông báo
  STORY: 'story',               // Câu chuyện cảm hứng
  GUIDE: 'guide',               // Hướng dẫn sử dụng
  EVENT: 'event',               // Hoạt động cộng đồng
});

const NEWS_STATUSES = Object.freeze({
  DRAFT: 'draft',         // Nháp
  PUBLISHED: 'published', // Đã đăng
  HIDDEN: 'hidden',       // Ẩn
});

const NEWS_CATEGORY_VALUES = Object.freeze(Object.values(NEWS_CATEGORIES));
const NEWS_STATUS_VALUES = Object.freeze(Object.values(NEWS_STATUSES));

module.exports = {
  NEWS_CATEGORIES,
  NEWS_STATUSES,
  NEWS_CATEGORY_VALUES,
  NEWS_STATUS_VALUES,
};
