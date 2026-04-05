# Cấp độ 1: Cơ bản MongoDB

## 1. Mục tiêu cấp độ
- Nắm tư duy NoSQL theo mô hình document.
- Tự setup được môi trường học và kết nối ứng dụng.
- Thành thạo CRUD + query cơ bản.
- Biết thiết kế schema cơ bản và tối ưu bước đầu bằng index.
- Làm được pipeline aggregation đơn giản cho báo cáo cơ bản.

## 2. Thứ tự học khuyến nghị (tránh overwhelmed)
- Nguyên tắc học mỗi buổi: học khái niệm ngắn (15-20 phút) -> làm lab ngay (30-45 phút) -> tự kiểm tra (10-15 phút).
- Bộ dữ liệu mẫu dùng xuyên suốt: `users`, `books`, `orders`.
- Thứ tự:
  1. Tư duy NoSQL và Document Model.
  2. Setup môi trường (Atlas + mongosh + app connection).
  3. CRUD nền tảng.
  4. Query operators quan trọng.
  5. Data modeling cơ bản (embed vs reference).
  6. Index cơ bản.
  7. Aggregation căn bản.
  8. Security tối thiểu.

## 3. Chủ đề trọng tâm theo thứ tự học

### 3.1 Tư duy NoSQL và Document Model
- Nội dung cần học:
  - Database, Collection, Document, BSON, `_id`.
  - Dữ liệu lồng nhau (embedded document), array, dot notation.
  - Khác biệt tư duy giữa SQL và MongoDB (schema linh hoạt, tối ưu theo access pattern).
- Vì sao cần học:
  - Đây là nền móng để hiểu cách MongoDB lưu trữ và truy vấn dữ liệu.
  - Nếu không nắm phần này, việc thiết kế schema về sau rất dễ sai hướng.
- Ví dụ thực hành (mongosh):

```javascript
use bookstore

db.books.insertOne({
  _id: "b1",
  title: "MongoDB Co Ban",
  price: 120000,
  tags: ["mongodb", "backend"],
  author: { name: "Minh", country: "VN" }
})

db.books.find({ "author.name": "Minh" })
```

- Lỗi thường gặp:
  - Dùng sai kiểu dữ liệu ngày (lưu string thay vì `ISODate`).
  - Nghĩ schema linh hoạt nghĩa là không cần quy ước kiểu dữ liệu.
- Checklist hoàn thành:
  - [ ] Giải thích được Document Model bằng ví dụ thực tế.
  - [ ] Viết được truy vấn vào field lồng nhau bằng dot notation.

### 3.2 Setup môi trường thực hành
- Nội dung cần học:
  - Tạo cluster trên MongoDB Atlas.
  - Tạo Database User có quyền tối thiểu.
  - Cấu hình Network Access (IP allowlist).
  - Kết nối bằng mongosh và backend app.
- Vì sao cần học:
  - Có môi trường chạy thật giúp học đến đâu kiểm chứng đến đó.
  - Tránh kẹt ở lý thuyết, tăng tốc độ tiến bộ.
- Ví dụ thực hành:

```bash
mongosh "mongodb+srv://<cluster>.mongodb.net/bookstore" --apiVersion 1 --username app_user
```

```javascript
db.runCommand({ ping: 1 })
show dbs
```

- Lỗi thường gặp:
  - Quên add IP nên connect timeout.
  - Nhầm Atlas account với Database User.
- Checklist hoàn thành:
  - [ ] Kết nối thành công tới Atlas bằng mongosh.
  - [ ] App backend đọc/ghi được 1 document mẫu.

### 3.3 CRUD nền tảng
- Nội dung cần học:
  - `insertOne`, `insertMany`.
  - `find`, `findOne`, projection.
  - `updateOne`, `updateMany`, `replaceOne`.
  - `deleteOne`, `deleteMany`.
- Vì sao cần học:
  - CRUD là thao tác xuất hiện hằng ngày trong hầu hết backend service.
  - Hiểu CRUD cũng là bước đầu nắm tính atomic ở mức document.
- Ví dụ thực hành (mongosh):

```javascript
db.books.insertMany([
  { _id: "b2", title: "Node.js Thuc Chien", price: 180000, stock: 5 },
  { _id: "b3", title: "Clean Code", price: 220000, stock: 7 }
])

db.books.find({ price: { $lte: 200000 } }, { title: 1, price: 1, _id: 0 })

db.books.updateOne({ _id: "b2" }, { $set: { stock: 8 } })

db.books.deleteOne({ _id: "b3" })
```

- Ví dụ kết nối Node.js Driver:

```javascript
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
const books = client.db("bookstore").collection("books");

const data = await books.find({ stock: { $gt: 0 } }).toArray();
console.log(data);

await client.close();
```

- Lỗi thường gặp:
  - Quên `$set` trong update dẫn tới thay thế cả document.
  - Gọi `deleteMany({})` do filter sai.
- Checklist hoàn thành:
  - [ ] Hoàn thành bộ bài tập CRUD đầy đủ cho 1 collection.
  - [ ] Biết chỉ trả về các field cần thiết bằng projection.

### 3.4 Query operators quan trọng
- Nội dung cần học:
  - So sánh: `$eq`, `$ne`, `$gt`, `$gte`, `$lt`, `$lte`, `$in`, `$nin`.
  - Logic: `$and`, `$or`, `$not`.
  - Truy vấn mảng và embedded docs: `$elemMatch` (mức cơ bản).
  - `sort`, `limit`, `skip` (phân trang cơ bản).
- Vì sao cần học:
  - Query đúng giúp API trả dữ liệu chính xác và dễ mở rộng yêu cầu nghiệp vụ.
  - Đây là cầu nối từ CRUD đơn giản sang truy vấn thực tế.
- Ví dụ thực hành (mongosh):

```javascript
db.books.find({ price: { $gte: 120000, $lte: 220000 } })

db.books.find({ _id: { $in: ["b1", "b2"] } })

db.books.find({
  $and: [{ price: { $gte: 100000 } }, { stock: { $gt: 0 } }]
})

db.orders.find({
  items: { $elemMatch: { qty: { $gte: 2 }, unitPrice: { $lte: 120000 } } }
})

db.books.find({}).sort({ price: -1 }).skip(0).limit(5)
```

- Lỗi thường gặp:
  - Dùng `$not` sai ngữ cảnh.
  - Query mảng nhưng không dùng `$elemMatch` khi cần match cùng một phần tử.
- Checklist hoàn thành:
  - [ ] Viết được truy vấn kết hợp điều kiện range + logic.
  - [ ] Làm được API list có filter + sort + pagination cơ bản.

### 3.5 Data modeling cơ bản (embed vs reference)
- Nội dung cần học:
  - Khi nào nên embed, khi nào nên reference.
  - Thiết kế theo access pattern (đọc gì nhiều, ghi gì nhiều).
  - Nguyên tắc tránh document tăng trưởng không kiểm soát.
- Vì sao cần học:
  - Thiết kế model đúng từ đầu quyết định hiệu năng và độ dễ bảo trì.
  - Tránh refactor tốn kém khi dữ liệu đã lớn.
- Ví dụ tư duy:
  - Embed: `orders.items` vì luôn đọc cùng đơn hàng.
  - Reference: `orders.userId` và `items.bookId` vì user/book được tái sử dụng nhiều nơi.
- Lỗi thường gặp:
  - Embed mọi thứ khiến document phình lớn.
  - Reference quá mức khiến đọc dữ liệu bị phân mảnh, query phức tạp.
- Checklist hoàn thành:
  - [ ] Thiết kế được schema cho 1 bài toán nhỏ và giải thích lý do embed/reference.
  - [ ] Chỉ ra ít nhất 1 rủi ro nếu chọn sai mô hình dữ liệu.

### 3.6 Index cơ bản
- Nội dung cần học:
  - Single-field index.
  - Compound index.
  - Ý nghĩa trade-off: tăng tốc đọc nhưng ảnh hưởng tốc độ ghi và dung lượng.
- Vì sao cần học:
  - Không có index đúng thì query sẽ chậm rõ rệt khi dữ liệu tăng.
  - Hiểu index sớm giúp hình thành thói quen viết backend bền vững.
- Ví dụ thực hành (mongosh):

```javascript
db.books.createIndex({ title: 1 })
db.orders.createIndex({ userId: 1, createdAt: -1 })

db.orders.find({ userId: "u1" }).sort({ createdAt: -1 }).limit(10)
```

- Lỗi thường gặp:
  - Tạo quá nhiều index làm chậm ghi.
  - Chọn sai thứ tự field trong compound index.
- Checklist hoàn thành:
  - [ ] Tạo được index cho 2 truy vấn chính của project mini.
  - [ ] Giải thích được vì sao chọn thứ tự field trong compound index.

### 3.7 Aggregation căn bản
- Nội dung cần học:
  - Các stage cơ bản: `$match`, `$group`, `$project`, `$sort`, `$limit`.
  - Cách ghép pipeline cho bài toán thống kê đơn giản.
- Vì sao cần học:
  - Aggregation là công cụ cốt lõi để xử lý báo cáo và biến đổi dữ liệu ngay trong DB.
  - Giúp giảm logic xử lý nặng ở tầng application.
- Ví dụ thực hành (mongosh):

```javascript
db.orders.aggregate([
  { $match: { status: "PAID" } },
  {
    $group: {
      _id: "$userId",
      totalRevenue: { $sum: "$total" },
      orderCount: { $sum: 1 }
    }
  },
  {
    $project: {
      _id: 0,
      userId: "$_id",
      totalRevenue: 1,
      orderCount: 1
    }
  },
  { $sort: { totalRevenue: -1 } },
  { $limit: 5 }
])
```

- Lỗi thường gặp:
  - Đặt `$match` quá muộn làm pipeline nặng.
  - Quên `$project` khiến output dư field.
- Checklist hoàn thành:
  - [ ] Viết được 1 pipeline thống kê theo nhóm (ví dụ doanh thu theo user).
  - [ ] Giải thích được vì sao nên đặt `$match` sớm trong pipeline.

### 3.8 Security tối thiểu cho người mới
- Nội dung cần học:
  - Authentication vs Authorization.
  - User/Role cơ bản trong MongoDB.
  - Cấu hình Network Access (IP allowlist) trên Atlas.
  - Nguyên tắc least privilege và quản lý secrets bằng biến môi trường.
- Vì sao cần học:
  - Hình thành thói quen bảo mật ngay từ đầu, tránh cấu hình nguy hiểm.
  - Giảm rủi ro lộ dữ liệu trong quá trình học và deploy thử nghiệm.
- Ví dụ checklist bảo mật nhanh:
  - Tạo user riêng cho app với quyền `readWrite` đúng database.
  - Không dùng tài khoản owner/admin để chạy ứng dụng.
  - Không mở `0.0.0.0/0` trên production.
  - Không commit connection string chứa mật khẩu vào git.
- Checklist hoàn thành:
  - [ ] Tạo user với quyền tối thiểu cần dùng.
  - [ ] Cấu hình IP allowlist phù hợp môi trường học/dev.

## 4. Mốc hoàn thành Cấp độ 1
- Bài thực chiến: Xây API quản lý sách hoặc task manager với:
  - CRUD đầy đủ cho ít nhất 2 collection.
  - Filter + sort + pagination.
  - Ít nhất 2 index phục vụ truy vấn chính.
  - Ít nhất 1 endpoint dùng aggregation.
  - Cấu hình bảo mật cơ bản trên Atlas.

## 5. Tự đánh giá cuối cấp
- [ ] Tôi hiểu rõ khác biệt SQL vs MongoDB ở mức thực hành.
- [ ] Tôi tự setup được Atlas và kết nối app không cần xem lại hướng dẫn.
- [ ] Tôi viết CRUD + query operators cơ bản thành thạo.
- [ ] Tôi biết chọn embed/reference theo access pattern.
- [ ] Tôi biết tạo index cơ bản và lý do chọn index.
- [ ] Tôi viết được aggregation pipeline đơn giản.
- [ ] Tôi có thói quen cấu hình bảo mật tối thiểu ngay từ đầu.

## 6. Gợi ý nhịp học 2 tuần (60-90 phút/ngày)
- Tuần 1:
  - Ngày 1-2: 3.1 + 3.2
  - Ngày 3-4: 3.3
  - Ngày 5-6: 3.4
  - Ngày 7: mini review + sửa lỗi
- Tuần 2:
  - Ngày 8-9: 3.5
  - Ngày 10-11: 3.6
  - Ngày 12-13: 3.7
  - Ngày 14: 3.8 + tổng kết + kiểm tra theo mục 5

---
Nguồn tham chiếu định hướng nội dung:
- MongoDB Manual: Introduction, CRUD Operations, Data Modeling, Indexes, Aggregation, Security.
- MongoDB Atlas Get Started.
- MongoDB University fundamentals tracks (định hướng kỹ năng theo cấp nền tảng).