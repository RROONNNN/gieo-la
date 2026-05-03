# Plan: Refactor Leaderboard — Monthly → Weekly

> **Mục tiêu:** Thay đổi bảng xếp hạng từ chu kỳ tháng sang chu kỳ tuần (ISO week, bắt đầu thứ Hai). Không thay đổi logic badge, Top 10, hay gamification.

---

## Tổng quan thay đổi

| Layer | File | Thay đổi chính |
|---|---|---|
| BE Validator | `leaderboardValidators.js` | Bỏ `month`, thêm `week` (ISO 1–53) |
| BE Controller | `leaderboardController.js` | Tính `startOfWeek`/`endOfWeek` từ `year`+`week`; đổi field `completedThisMonth` → `completedThisWeek` |
| FE Types | `types/leaderboard.ts` | Đổi `month` → `week`, `completedThisMonth` → `completedThisWeek` |
| FE API lib | `lib/api/leaderboard.ts` | Đổi tham số `month` → `week`, đổi tên endpoint key |
| FE Endpoints | `lib/api/endpoints.ts` | Đổi `MONTHLY` → `WEEKLY` (URL không đổi) |
| FE Page | `app/(public)/leaderboard/page.tsx` | Điều hướng tuần (prev/next week), hiển thị "Tuần X — YYYY" |
| FE Component | `components/leaderboard/LeaderboardRow.tsx` | Đổi `completedThisMonth` → `completedThisWeek` |
| FE Component | `components/leaderboard/LeaderboardPodium.tsx` | Đổi `completedThisMonth` → `completedThisWeek` |

---

## Backend

### 1. `backend/src/validators/leaderboardValidators.js`

**Hiện tại:**
```js
const leaderboardQuerySchema = z.object({
  year: z.coerce.number().int().min(1900).max(2100).optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
});
```

**Sau khi sửa:**
```js
const leaderboardQuerySchema = z.object({
  year: z.coerce.number().int().min(1900).max(2100).optional(),
  week: z.coerce.number().int().min(1).max(53).optional(),
});
```

---

### 2. `backend/src/controllers/leaderboardController.js`

#### 2a. Thêm helper tính date range từ ISO year+week

```js
/**
 * Trả về { startOfWeek, endOfWeek } (UTC) cho ISO week.
 * ISO week 1 là tuần chứa ngày 4/1 (thứ Năm đầu tiên của năm).
 * Tuần bắt đầu từ thứ Hai, kết thúc Chủ Nhật 23:59:59.999.
 */
function getISOWeekRange(year, week) {
  // Ngày 4/1 luôn nằm trong week 1
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const dayOfWeek = jan4.getUTCDay() || 7; // 1=Mon ... 7=Sun
  // Thứ Hai của week 1
  const startOfWeek1 = new Date(Date.UTC(year, 0, 4 - dayOfWeek + 1));
  // Thứ Hai của week N
  const startOfWeek = new Date(startOfWeek1);
  startOfWeek.setUTCDate(startOfWeek1.getUTCDate() + (week - 1) * 7);
  // Chủ Nhật cuối week N
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setUTCDate(startOfWeek.getUTCDate() + 6);
  endOfWeek.setUTCHours(23, 59, 59, 999);
  return { startOfWeek, endOfWeek };
}
```

#### 2b. Thêm helper lấy ISO week từ Date

```js
function getISOWeek(date) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return {
    isoYear: d.getUTCFullYear(),
    isoWeek: Math.ceil((((d - yearStart) / 86400000) + 1) / 7),
  };
}
```

> **Lưu ý:** ISO week year có thể khác calendar year (VD: 31/12/2023 thuộc tuần 1/2024). Helper `getISOWeek` trả về `isoYear` đúng.

#### 2c. Cập nhật `getLeaderboard`

```js
const getLeaderboard = async (req, res) => {
  const parsed = leaderboardQuerySchema.safeParse(req.query);
  if (!parsed.success) { ... }

  const now = new Date();
  const { isoYear: currentYear, isoWeek: currentWeek } = getISOWeek(now);

  const year = parsed.data.year ?? currentYear;
  const week = parsed.data.week ?? currentWeek;

  const { startOfWeek, endOfWeek } = getISOWeekRange(year, week);

  const entries = await Post.aggregate([
    {
      $match: {
        status: POST_STATUSES.COMPLETED,
        completedAt: { $gte: startOfWeek, $lte: endOfWeek },
      },
    },
    {
      $group: {
        _id: '$author',
        completedThisWeek: { $sum: 1 },   // ← đổi tên field
      },
    },
    { $sort: { completedThisWeek: -1 } },  // ← đổi tên field
    { $limit: 10 },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'userDocs',
      },
    },
    { $unwind: { path: '$userDocs', preserveNullAndEmpty: false } },
    {
      $project: {
        _id: 0,
        completedThisWeek: 1,              // ← đổi tên field
        user: {
          _id: '$userDocs._id',
          name: '$userDocs.name',
          avatar: '$userDocs.avatar',
          role: '$userDocs.role',
          badge: '$userDocs.badge',
        },
      },
    },
  ]);

  const result = entries.map((entry, i) => {
    const rank = i + 1;
    const { badge, label: badgeLabel } = getBadgeForRank(rank);
    return { rank, ...entry, badge, badgeLabel };
  });

  return res.json({
    success: true,
    data: { year, week, entries: result },  // ← đổi month → week
  });
};
```

---

## Frontend

### 3. `frontend/types/leaderboard.ts`

**Hiện tại:**
```ts
export interface LeaderboardEntry {
  rank: number;
  user: LeaderboardUser;
  completedThisMonth: number;
  badge: BadgeType;
  badgeLabel: string;
}

export interface LeaderboardResponse {
  year: number;
  month: number;
  entries: LeaderboardEntry[];
}
```

**Sau khi sửa:**
```ts
export interface LeaderboardEntry {
  rank: number;
  user: LeaderboardUser;
  completedThisWeek: number;       // ← đổi tên
  badge: BadgeType;
  badgeLabel: string;
}

export interface LeaderboardResponse {
  year: number;
  week: number;                    // ← đổi month → week
  entries: LeaderboardEntry[];
}
```

---

### 4. `frontend/lib/api/endpoints.ts`

**Hiện tại:**
```ts
LEADERBOARD: {
  MONTHLY: `${API_BASE}/leaderboard`,
},
```

**Sau khi sửa:**
```ts
LEADERBOARD: {
  WEEKLY: `${API_BASE}/leaderboard`,   // ← đổi tên key, URL giữ nguyên
},
```

---

### 5. `frontend/lib/api/leaderboard.ts`

**Hiện tại:**
```ts
export async function fetchLeaderboard(year?: number, month?: number): Promise<LeaderboardResponse> {
  const query = new URLSearchParams();
  if (year) query.set("year", String(year));
  if (month) query.set("month", String(month));
  const url = `${BASE_URL}${ENDPOINTS.LEADERBOARD.MONTHLY}${query.size > 0 ? `?${query}` : ""}`;
  ...
}
```

**Sau khi sửa:**
```ts
export async function fetchLeaderboard(year?: number, week?: number): Promise<LeaderboardResponse> {
  const query = new URLSearchParams();
  if (year) query.set("year", String(year));
  if (week) query.set("week", String(week));
  const url = `${BASE_URL}${ENDPOINTS.LEADERBOARD.WEEKLY}${query.size > 0 ? `?${query}` : ""}`;
  ...
}
```

---

### 6. `frontend/app/(public)/leaderboard/page.tsx`

#### 6a. Đổi `searchParams` type

```ts
interface PageProps {
  searchParams: Promise<{ year?: string; week?: string }>;  // ← month → week
}
```

#### 6b. Helper điều hướng tuần

Bỏ `MONTH_NAMES` và `buildNavHref` cũ. Thêm:

```ts
// ISO week helpers (client-side, thuần JS — không cần thư viện)
function getISOWeekYear(date: Date): { isoYear: number; isoWeek: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return {
    isoYear: d.getUTCFullYear(),
    isoWeek: Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7),
  };
}

function prevWeek(year: number, week: number): { year: number; week: number } {
  if (week === 1) {
    // Tuần cuối của năm trước: tuần chứa ngày 28/12
    const { isoWeek } = getISOWeekYear(new Date(year - 1, 11, 28));
    return { year: year - 1, week: isoWeek };
  }
  return { year, week: week - 1 };
}

function nextWeek(year: number, week: number): { year: number; week: number } {
  // Kiểm tra xem tuần+1 có tồn tại không (có năm có 53 tuần)
  const { isoWeek: lastWeek } = getISOWeekYear(new Date(year, 11, 28));
  if (week >= lastWeek) return { year: year + 1, week: 1 };
  return { year, week: week + 1 };
}

function buildNavHref(year: number, week: number): string {
  return `/leaderboard?year=${year}&week=${week}`;
}

// Label hiển thị: "Tuần 18 — 2026"
function weekLabel(year: number, week: number): string {
  return `Tuần ${week} — ${year}`;
}
```

#### 6c. Cập nhật component

```tsx
export default async function LeaderboardPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const now = new Date();
  const { isoYear: currentYear, isoWeek: currentWeek } = getISOWeekYear(now);

  const year = sp.year ? parseInt(sp.year, 10) : currentYear;
  const week = sp.week ? parseInt(sp.week, 10) : currentWeek;

  let data;
  try {
    data = await fetchLeaderboard(year, week);
  } catch {
    data = { year, week, entries: [] };
  }

  const prev = prevWeek(year, week);
  const next = nextWeek(year, week);
  const isCurrentWeek = year === currentYear && week === currentWeek;

  // ... render với weekLabel(year, week), prev/next href
  // Đổi text "tháng này" → "tuần này"
  // Đổi empty state: "Chưa có dữ liệu cho tuần này"
}
```

---

### 7. `frontend/components/leaderboard/LeaderboardRow.tsx`

```tsx
// Đổi:
{entry.completedThisMonth} bài
// Thành:
{entry.completedThisWeek} bài
```

---

### 8. `frontend/components/leaderboard/LeaderboardPodium.tsx`

```tsx
// Đổi:
{entry.completedThisMonth} bài
// Thành:
{entry.completedThisWeek} bài
```

---

## Thứ tự thực hiện

1. **BE Validator** → đổi schema (`month` → `week`)
2. **BE Controller** → thêm helpers ISO week, cập nhật aggregation + response shape
3. **FE Types** → cập nhật interfaces
4. **FE Endpoints** → đổi key `MONTHLY` → `WEEKLY`
5. **FE API lib** → cập nhật function signature + URL key
6. **FE Components** → `LeaderboardRow` và `LeaderboardPodium` đổi field name
7. **FE Page** → thêm helpers tuần, cập nhật navigation + labels

---

## Không thay đổi

- URL route `/leaderboard` (giữ nguyên)
- API endpoint `/api/v1/leaderboard` (giữ nguyên)
- Logic badge (Top 1 / Top 2-5 / Top 6-10)
- `completedAt` field trên Post model
- Giới hạn hiển thị Top 10
- Phần gamification, Wishlist, Chat, và các tính năng khác
