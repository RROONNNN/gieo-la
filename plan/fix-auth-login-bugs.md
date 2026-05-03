# Fix Plan: Authentication Login Bugs

> **Triệu chứng:** Đăng nhập thất bại, hiển thị lỗi `"Đã xảy ra lỗi, thử lại sau."` hoặc trang tự reload về `/login` mà không có thông báo lỗi rõ ràng.
>
> **Lịch sử:** Ban đầu chỉ đăng nhập bằng email. Sau đó thêm tính năng đăng nhập bằng số điện thoại.

---

## Tổng quan các bugs

| # | Mức độ | File | Mô tả ngắn |
|---|--------|------|------------|
| 1 | 🔴 CRITICAL | `frontend/lib/api/client.ts` | Login endpoint bị kéo vào 401-retry-redirect flow không đúng |
| 2 | 🟠 HIGH | `frontend/lib/api/client.ts` | Network error / non-JSON response bị bắt như generic error |
| 3 | 🟡 MEDIUM | `backend/src/controllers/authController.js` | `isPhoneNumber` normalize để detect nhưng query với raw value |
| 4 | 🟡 MEDIUM | `backend/src/validators/authValidators.js` | Regex số điện thoại không nhất quán giữa register và updateProfile |
| 5 | 🔵 MINOR | `frontend/lib/api/client.ts` | 403 redirect dùng URL param chưa encode |

---

## Bug 1 — 🔴 CRITICAL: Login endpoint bị kéo vào 401-retry-redirect flow

### Root Cause

Trong `client.ts`, hàm `request()` có logic xử lý 401 như sau:

```
Nhận 401 từ bất kỳ endpoint nào
  → Nếu endpoint là REFRESH_TOKEN → throw ngay (không redirect)
  → Nếu không → gọi silentRefresh() → nếu thất bại → window.location.href = "/login" → throw
```

Logic này được thiết kế cho các **authenticated API call** (token hết hạn). Tuy nhiên, endpoint `/auth/login` hoàn toàn hợp lệ trả về 401 khi **sai mật khẩu**. Kết quả:

1. User nhập sai mật khẩu → backend trả 401 `"Email/số điện thoại hoặc mật khẩu không đúng"`
2. `client.ts` gọi `silentRefresh()` (không cần thiết)
3. `silentRefresh()` thất bại (không có refresh cookie hợp lệ)
4. `window.location.href = "/login"` được set → **trang reload về `/login`**
5. `throw new ApiError(401, ...)` được gọi sau đó
6. `LoginForm.catch` chạy nhưng React re-render không xảy ra vì trang đã reload

**Hệ quả:** User thấy trang reload, không thấy thông báo lỗi. Hoặc, nếu trình duyệt xử lý redirect trước khi catch, message có thể là `"Phiên đăng nhập đã hết hạn"` thay vì `"Email/số điện thoại hoặc mật khẩu không đúng"`.

### Fix

Thêm `ENDPOINTS.AUTH.LOGIN` vào condition bỏ qua retry+redirect flow, tương tự `ENDPOINTS.AUTH.REFRESH_TOKEN`:

```ts
// Trước
if (response.status === 401 && endpoint === ENDPOINTS.AUTH.REFRESH_TOKEN) {
  throw new ApiError(401, data.message || "Phiên đăng nhập đã hết hạn");
}

// Sau
const AUTH_ONLY_ENDPOINTS = [ENDPOINTS.AUTH.REFRESH_TOKEN, ENDPOINTS.AUTH.LOGIN];

if (response.status === 401 && AUTH_ONLY_ENDPOINTS.includes(endpoint)) {
  throw new ApiError(response.status, data.message || "Phiên đăng nhập đã hết hạn");
}
```

---

## Bug 2 — 🟠 HIGH: Network error / non-JSON response bị bắt là generic error

### Root Cause

Trong `request()`:

```ts
const response = await fetch(`${BASE_URL}${endpoint}`, { ... });
const data: ApiResponse<T> = await response.json(); // ← KHÔNG có try-catch
```

Nếu:
- Backend **không chạy** (ECONNREFUSED, ETIMEDOUT) → `fetch()` throw `TypeError`
- Backend trả HTML (nginx 502/503) → `response.json()` throw `SyntaxError`

Cả hai loại lỗi này **không phải** `ApiError`. Trong `LoginForm.tsx`:

```ts
} catch (err) {
  setServerError(
    err instanceof ApiError ? err.message : "Đã xảy ra lỗi, thử lại sau.",
    //                                       ↑ Đây là fallback khi err KHÔNG phải ApiError
  );
}
```

**Đây chính là nguyên nhân trực tiếp của message `"Đã xảy ra lỗi, thử lại sau."`** — khi backend down hoặc không phản hồi JSON.

### Fix

Wrap toàn bộ fetch + json parse trong `request()` bằng try-catch, convert sang `ApiError`:

```ts
async function request<T>(endpoint, options = {}, retry = true): Promise<ApiResponse<T>> {
  // ... headers setup ...
  
  let response: Response;
  let data: ApiResponse<T>;
  
  try {
    response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers, credentials: "include" });
    data = await response.json();
  } catch (err) {
    // Network error hoặc non-JSON response
    const message = err instanceof SyntaxError
      ? "Máy chủ phản hồi không hợp lệ"
      : "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.";
    throw new ApiError(0, message);
  }

  // ... rest of error handling ...
}
```

---

## Bug 3 — 🟡 MEDIUM: Backend `isPhoneNumber` normalize để detect nhưng query raw value

### Root Cause

Trong `authController.js`:

```js
const isPhoneNumber = (value) => /^\+?[0-9]{9,15}$/.test(value.replace(/[\s\-()]/g, ''));

const query = isPhoneNumber(identifier)
  ? { 'contact.phone': identifier }   // ← dùng raw identifier, không normalize!
  : { email: identifier };
```

`isPhoneNumber` strip `[\s\-()]` trước khi test, nên `"091-234-5678"` được nhận diện là phone. Nhưng DB query dùng `"091-234-5678"` nguyên gốc. Nếu user đã đăng ký với `"0912345678"`, query này **không tìm thấy**.

**Scenario gây lỗi:**
1. User đăng ký với phone `"0912345678"` (lưu vào DB như vậy)
2. User update profile, nhập `"091 234 5678"` (có khoảng trắng — pass `updateProfileSchema` hiện tại)
3. DB giờ lưu `contact.phone = "091 234 5678"`
4. User login với `"0912345678"` → `isPhoneNumber` detect là phone → query `{ 'contact.phone': '0912345678' }` → **không tìm thấy** → 401

### Fix

Normalize số điện thoại trước khi query:

```js
const normalizePhone = (value) => value.replace(/[\s\-()]/g, '');

const login = async (req, res) => {
  // ...
  const identifier = (rawIdentifier || emailAlias || '').trim();
  
  let query;
  if (isPhoneNumber(identifier)) {
    const normalizedPhone = normalizePhone(identifier);
    // Query cả hai: raw và normalized để tương thích với data cũ
    query = { 'contact.phone': { $in: [identifier, normalizedPhone] } };
  } else {
    query = { email: identifier };
  }
  // ...
};
```

Hoặc đơn giản hơn: chỉ query bằng normalized value (và migration normalize data cũ).

---

## Bug 4 — 🟡 MEDIUM: Regex số điện thoại không nhất quán

### Root Cause

| Validator | Regex | Cho phép |
|-----------|-------|----------|
| `registerMemberSchema` / `registerIndividualSchema` / `loginSchema (frontend)` | `/^\+?[0-9]{9,15}$/` | Chỉ số, không space/dash |
| `updateProfileSchema` | `/^\+?[0-9\s\-()]{7,20}$/` | Số + space + dash + () |

**Kịch bản gây lỗi:**
1. User đăng ký với `"0912345678"` — pass schema, lưu DB
2. User update profile với `"0912 345 678"` — pass `updateProfileSchema` (regex lỏng hơn), lưu DB
3. Login với `"0912 345 678"` → frontend regex `/^\+?[0-9]{9,15}$/` **FAIL** → lỗi validation ngay tại frontend, không gọi API
4. Login với `"0912345678"` → backend query với raw `"0912345678"` → **không tìm thấy** (DB đã là `"0912 345 678"`)

### Fix

Thống nhất một regex và một format lưu trữ. Khuyến nghị:
- Luôn normalize (bỏ space/dash/bracket) trước khi lưu vào DB — cả trong `updateProfile` lẫn `register`
- `updateProfileSchema`: siết lại regex về `/^\+?[0-9]{9,15}$/` (đồng nhất với register)
- Backend `updateMe` controller: normalize phone trước `$set`

```js
// Trong updateMe controller, trước khi set:
if (contact?.phone !== undefined) {
  updates['contact.phone'] = contact.phone
    ? contact.phone.replace(/[\s\-()]/g, '')
    : null;
}
```

---

## Bug 5 — 🔵 MINOR: 403 redirect URL param chưa encode

### Root Cause

Trong `client.ts`:

```ts
window.location.href = "/login?reason=" + message;
// message có thể là: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên."
// → URL bị malformed do dấu chấm, khoảng trắng, tiếng Việt
```

### Fix

```ts
window.location.href = "/login?reason=" + encodeURIComponent(message);
```

Và trong `LoginForm.tsx`, `searchParams.get("reason")` tự decode, nên không cần thay đổi.

---

## Thứ tự fix đề xuất

```
1. Bug 1 — CRITICAL  (client.ts: add LOGIN to bypass-redirect list)
2. Bug 2 — HIGH      (client.ts: wrap fetch + json.parse)
3. Bug 3 — MEDIUM    (authController.js: normalize phone before query)
4. Bug 4 — MEDIUM    (authValidators.js + updateMe: unify phone regex + normalize on save)
5. Bug 5 — MINOR     (client.ts: encodeURIComponent)
```

---

## Files cần chỉnh sửa

| File | Bugs |
|------|------|
| `frontend/lib/api/client.ts` | Bug 1, Bug 2, Bug 5 |
| `backend/src/controllers/authController.js` | Bug 3 |
| `backend/src/validators/authValidators.js` | Bug 4 |
| `backend/src/controllers/authController.js` (updateMe) | Bug 4 |
