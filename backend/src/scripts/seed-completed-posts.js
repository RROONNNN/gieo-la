'use strict';

/**
 * Seed script: tạo các bài post status=completed ngẫu nhiên
 * cho các NGO và individual accounts.
 *
 * Run: node backend/src/scripts/seed-completed-posts.js
 * Options:
 *   --count=<n>   số lượng post cần tạo (default: 20)
 *   --dry-run     chỉ in ra, không lưu vào DB
 */

require('dotenv').config({
  path: require('path').resolve(__dirname, '../../.env'),
});

const mongoose = require('mongoose');

// ── Config ────────────────────────────────────────────────────────────────────
const NGO_IDS = [
  '69f36aac67971d95618feca0',
  '69dd0d8bb88393499da02418',
];

const INDIVIDUAL_IDS = [
  '69eaee580468c09e0f40daad',
  '69f365e167971d95618fe959',
];

const CATEGORIES = ['do_nam', 'do_nu', 'do_tre_em', 'phu_kien'];
const CONDITIONS = ['new_100', 'new_90', 'new_80', 'custom'];

const SAMPLE_TITLES = [
  'Áo sơ mi nam size L còn mới',
  'Quần jean nữ size 28',
  'Bộ đồ trẻ em 3-5 tuổi',
  'Áo khoác mùa đông unisex',
  'Giày thể thao nam size 42',
  'Váy công sở size M',
  'Túi xách nữ hàng hiệu',
  'Mũ lưỡi trai nam nữ',
  'Áo len trẻ em 6-8 tuổi',
  'Quần tây nam size 32',
  'Áo phông nữ nhiều màu',
  'Bộ quần áo bơi trẻ em',
  'Dép sandal nữ size 37',
  'Áo dài truyền thống size M',
  'Bộ đồ thể thao nam',
  'Khăn len quàng cổ',
  'Áo thun nam pack 3 cái',
  'Quần short nữ size S',
  'Balô du lịch còn tốt',
  'Áo bomber jacket unisex',
];

const SAMPLE_DESCRIPTIONS = [
  'Đồ còn mới, dùng ít lần, tặng cho ai cần.',
  'Mua nhầm size, tặng lại cho bạn nào cần.',
  'Con lớn không mặc vừa nữa, tặng cho bé nhà bạn.',
  'Mặc vài lần nhưng còn rất tốt.',
  'Hàng chất lượng tốt, giờ không dùng nữa muốn tặng.',
  null,
  'Đồ thật, không qua sử dụng nhiều.',
  'Còn nguyên tem mác, tặng ai cần.',
];

const CITIES = ['Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng'];
const DISTRICTS = [
  'Quận 1', 'Quận Ba Đình', 'Quận Hoàn Kiếm', 'Quận Hải Châu', 'Quận Ninh Kiều',
];

const SAMPLE_IMAGES = [
  'https://res.cloudinary.com/demo/image/upload/v1/sample.jpg',
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

/** Tạo ngày ngẫu nhiên trong khoảng [daysAgo, 1] ngày trước */
const randDate = (daysAgo = 180) => {
  const now = Date.now();
  const offset = randInt(1, daysAgo) * 24 * 60 * 60 * 1000;
  return new Date(now - offset);
};

// ── Parse CLI args ─────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const countArg = args.find((a) => a.startsWith('--count='));
const POST_COUNT = countArg ? parseInt(countArg.split('=')[1], 10) : 20;
const DRY_RUN = args.includes('--dry-run');

// ── Build post documents ───────────────────────────────────────────────────────
function buildPost() {
  const authorId = pick(NGO_IDS);
  const selectedApplicant = pick(INDIVIDUAL_IDS);
  const createdAt = randDate(180);
  const completedAt = new Date(createdAt.getTime() + randInt(1, 30) * 24 * 60 * 60 * 1000);

  return {
    author: new mongoose.Types.ObjectId(authorId),
    category: pick(CATEGORIES),
    quantity: randInt(1, 10),
    condition: pick(CONDITIONS),
    conditionNote: Math.random() > 0.5 ? 'Còn tốt, sạch sẽ' : null,
    images: [pick(SAMPLE_IMAGES)],
    title: pick(SAMPLE_TITLES),
    description: pick(SAMPLE_DESCRIPTIONS),
    status: 'completed',
    isPinned: false,
    completedAt,
    likes: [],
    likesCount: randInt(0, 30),
    selectedApplicant: new mongoose.Types.ObjectId(selectedApplicant),
    receiverConfirmed: true,
    receiverConfirmedAt: completedAt,
    location: {
      city: pick(CITIES),
      district: pick(DISTRICTS),
      detail: null,
    },
    createdAt,
    updatedAt: completedAt,
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function run() {
  console.log(`\n=== seed-completed-posts ===`);
  console.log(`Posts to create : ${POST_COUNT}`);
  console.log(`Dry run         : ${DRY_RUN}\n`);

  const posts = Array.from({ length: POST_COUNT }, buildPost);

  if (DRY_RUN) {
    console.log('Sample post (first):');
    console.dir(posts[0], { depth: null });
    console.log(`\n[dry-run] Would insert ${posts.length} posts. No DB changes made.`);
    return;
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const result = await mongoose.connection
    .collection('posts')
    .insertMany(posts, { ordered: false });

  console.log(`✓ Inserted ${result.insertedCount} completed posts`);

  // Tạo Application tương ứng (status=accepted) cho mỗi post
  const applications = posts.map((post, i) => ({
    post: result.insertedIds[i],
    applicant: post.selectedApplicant,
    message: 'Tôi rất cần món đồ này, xin cảm ơn NGO.',
    status: 'selected',
    createdAt: post.createdAt,
    updatedAt: post.completedAt,
  }));

  const appResult = await mongoose.connection
    .collection('applications')
    .insertMany(applications, { ordered: false });

  console.log(`✓ Inserted ${appResult.insertedCount} accepted applications`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
