# Notes

## multer

**Dùng để làm gì?**
Middleware cho Express xử lý upload file (multipart/form-data). Lưu file vào disk hoặc memory, validate mimetype và kích thước trước khi handler chạy.

### Ví dụ cơ bản
```js
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: 'uploads/verifications/',
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    cb(null, allowed.includes(file.mimetype));
  },
});

// Route
router.post('/image', protect, upload.single('image'), uploadImageHandler);
```

### Lưu ý & Mẹo
- `upload.single('fieldName')` — chỉ nhận 1 file với tên field đó
- Lỗi `LIMIT_FILE_SIZE` phải được bắt trong error handler Express (multer ném ra `MulterError`)
- Không set `Content-Type: application/json` khi gửi FormData từ frontend — browser tự thêm boundary
- Thư mục `destination` phải tồn tại trước khi app chạy — tạo thủ công hoặc dùng `mkdirSync`
- Để xem file đã upload, cần mount static: `app.use('/uploads', express.static('uploads'))`

---

## Zod

**Zod** là thư viện **schema validation** cho TypeScript/JavaScript.

### Dùng để làm gì?
Validate và parse dữ liệu đầu vào (request body, query params, env vars, v.v.) theo một schema định nghĩa sẵn.

### Ví dụ cơ bản
```js
const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

const result = registerSchema.safeParse(req.body);
if (!result.success) {
  // result.error.errors chứa danh sách lỗi chi tiết
}
```

### Điểm mạnh
- **Type-safe**: tự infer TypeScript type từ schema.
- **Chi tiết lỗi**: trả về message lỗi rõ ràng cho từng field.
- **Composable**: có thể kết hợp schema, extend, pick, omit dễ dàng.
- **Parse, không chỉ validate**: `z.parse()` vừa validate vừa trả về data đã được transform.

### So sánh với Joi / express-validator
| | Zod | Joi | express-validator |
|---|---|---|---|
| TypeScript support | Tốt nhất | Trung bình | Trung bình |
| Bundle size | Nhỏ | Lớn hơn | Lớn hơn |
| Syntax | Fluent, ngắn gọn | Fluent | Decorator-based |

### Trong project này
Dùng Zod trong `src/validators/authValidators.js` và `src/validators/verificationValidators.js` để validate request body trước khi xử lý trong controller.

---

## Middleware Chain trong Express

Trong Express, một route có thể có **nhiều hàm xử lý nối tiếp nhau** (middleware chain). Mỗi hàm nhận `(req, res, next)` — gọi `next()` để chuyển sang hàm tiếp theo, hoặc trả về response để dừng chuỗi.

### Ví dụ: bảo vệ route với protect + restrictTo

```js
router.patch('/:id/account-status', protect, restrictTo('admin'), updateAccountStatus);
```

Thứ tự thực thi:
1. `protect` — kiểm tra JWT, gán `req.user`
2. `restrictTo('admin')` — kiểm tra `req.user.role === 'admin'`
3. `updateAccountStatus` — xử lý logic chính

Nếu bước 1 hoặc 2 thất bại, Express trả về response ngay lập tức, bước sau không chạy.

### Dùng `router.use()` để áp dụng middleware cho cả nhóm route

```js
router.use(protect, restrictTo('admin')); // áp dụng cho mọi route phía dưới
router.get('/verification-requests', listVerificationRequests);
router.patch('/:id/account-status', updateAccountStatus);
```

---

## AuditLog Pattern

`AuditLog` là collection ghi lại lịch sử hành động trong hệ thống — ai làm gì, với đối tượng nào, lúc nào. Dùng để admin tra cứu khi có khiếu nại.

### Cấu trúc một log entry

```js
AuditLog.create({
  actorId,       // _id của người thực hiện (admin)
  targetType,    // 'User' | 'VerificationRequest' | ...
  targetId,      // _id của đối tượng bị tác động
  action,        // chuỗi mô tả: 'verification.approve', 'user.account_status_banned', ...
  metadata,      // object tuỳ ý chứa thêm context (lý do, giá trị cũ, ...)
  ip,            // IP của request
  userAgent,     // trình duyệt / client
});
```

### Trong project này

Mọi hành động admin (duyệt/từ chối xác minh, cấp/thu hồi NGO, khóa tài khoản) đều tạo một AuditLog entry — xem `src/controllers/verificationController.js`.

---

## Promise.all — Chạy nhiều query MongoDB song song

Thay vì chờ từng query xong mới chạy query tiếp, `Promise.all` chạy tất cả cùng lúc, giảm thời gian chờ.

```js
// ❌ Tuần tự — chậm hơn
const requests = await VerificationRequest.find(filter);
const total    = await VerificationRequest.countDocuments(filter);

// ✅ Song song — nhanh hơn
const [requests, total] = await Promise.all([
  VerificationRequest.find(filter),
  VerificationRequest.countDocuments(filter),
]);
```

Dùng khi các query **không phụ thuộc vào kết quả của nhau**.

---

## Populate trong Mongoose

`populate()` thay thế một ObjectId reference bằng document thực tế từ collection khác — tương tự JOIN trong SQL.

```js
VerificationRequest.find({ status: 'pending' })
  .populate('userId', 'name email role')   // chỉ lấy 3 field của User
  .populate('reviewedBy', 'name email');
```

Kết quả: thay vì thấy `userId: "507f1f77bcf86cd799439011"`, bạn thấy:
```json
"userId": { "_id": "...", "name": "Nguyễn Văn A", "email": "a@example.com", "role": "individual" }
```

**Lưu ý**: chỉ populate những field cần thiết (tham số thứ 2) để tránh lộ thông tin nhạy cảm như `passwordHash`.
