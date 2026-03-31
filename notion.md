# Notes

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
Dùng Zod trong `src/validators/authValidators.js` để validate request body trước khi xử lý trong controller.
