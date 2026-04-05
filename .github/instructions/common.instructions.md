---
applyTo: "**"
---

# Common Copilot Instructions

## 1. Cập nhật Models (`models.md`)

Sau mỗi lần tạo mới hoặc chỉnh sửa một Mongoose model trong `backend/src/models/`, hãy **cập nhật file [models.md](../../models.md)** với đầy đủ thông tin:

- **Tên collection** và tên model
- **Tất cả các field**: tên field, kiểu dữ liệu, ràng buộc (required, unique, default, enum, ref, ...)
- **Indexes** (nếu có)
- **Timestamps** (`createdAt`, `updatedAt`)
- **Quan hệ** với các model khác (ref đến collection nào)

Format mẫu trong `models.md`:

```md
## ModelName (`collection_name`)

| Field | Type | Constraints |
|---|---|---|
| _id | ObjectId | auto |
| fieldName | String | required, unique |
| refField | ObjectId | ref: 'OtherModel' |
| createdAt | Date | auto (timestamps) |
| updatedAt | Date | auto (timestamps) |

**Indexes:** fieldName (unique), ...
**Relations:** refField → OtherModel
```

---

## 2. Cập nhật API List (`list_apis.md`)

Sau mỗi lần thêm hoặc sửa route trong `backend/src/routes/`, hãy **cập nhật file [list_apis.md](../../list_apis.md)**:

- Thêm endpoint mới vào đúng nhóm hiện có hoặc tạo nhóm mới nếu cần
- Ghi rõ: Method, Endpoint, Access level (Public / Authenticated / Admin), mô tả ngắn
- Nếu xoá endpoint, xoá luôn khỏi file
- Giữ nguyên format bảng Markdown hiện có

---

## 3. Ghi chú kiến thức vào `notion.md`

Khi generate code sử dụng bất kỳ package hoặc kỹ thuật mới nào, hãy **cập nhật file [notion.md](../../notion.md)** với một section giải thích dành cho người mới học:

- **Tên package / kỹ thuật** làm heading (`##`)
- Nó dùng để làm gì (1–2 câu)
- Ví dụ code ngắn gọn, thực tế (lấy từ code vừa tạo là tốt nhất)
- Điểm mạnh hoặc lưu ý quan trọng (dạng bullet list)
- Mẹo hoặc cạm bẫy phổ biến khi mới học (nếu có)

> Chỉ thêm section mới nếu package / kỹ thuật đó **chưa có** trong `notion.md`. Không ghi trùng lặp.

Format mẫu:

```md
## PackageName

**Dùng để làm gì?**
Mô tả ngắn gọn mục đích của package.

### Ví dụ cơ bản
\`\`\`js
// code ví dụ từ project
\`\`\`

### Lưu ý & Mẹo
- Điểm quan trọng 1
- Điểm quan trọng 2
- Cạm bẫy phổ biến cần tránh
```
