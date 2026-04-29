# Mongoose Models

## User (`users`)

| Field | Type | Constraints |
|---|---|---|
| _id | ObjectId | auto |
| name | String | required, trim |
| email | String | required, unique, lowercase, trim |
| passwordHash | String | required |
| role | String | enum: member / ngo / individual / admin, default: member |
| accountStatus | String | enum: active / suspended / banned, default: active |
| verificationStatus | String | enum: unverified / pending / verified / rejected, default: unverified |
| lastLoginAt | Date | default: null |
| avatar | String | default: null |
| contact.phone | String | default: null |
| location.city | String | default: null |
| location.district | String | default: null |
| ngoProfile.organizationName | String | default: null |
| ngoProfile.website | String | default: null |
| ngoProfile.description | String | default: null |
| badge | String | enum: none / bronze / silver / gold, default: none |
| completedDonations | Number | default: 0 |
| receivedItemsThisMonth | Number | default: 0 |
| receivedItemsResetAt | Date | default: null |
| createdAt | Date | auto (timestamps) |
| updatedAt | Date | auto (timestamps) |

**Indexes:**
- `email` (unique)
- `role + accountStatus`
- `verificationStatus + role`

---

## VerificationRequest (`verificationrequests`)

| Field | Type | Constraints |
|---|---|---|
| _id | ObjectId | auto |
| userId | ObjectId | required, ref: User |
| requestType | String | required, enum: ngo / individual |
| documents | Array | array of { url: String (required), label: String (default null) } |
| notes | String | default: null |
| status | String | enum: pending / approved / rejected, default: pending |
| reviewedBy | ObjectId | ref: User, default: null |
| reviewedAt | Date | default: null |
| rejectionReason | String | default: null |
| createdAt | Date | auto (timestamps) |
| updatedAt | Date | auto (timestamps) |

**Indexes:**
- `userId + status`
- `status + requestType`

**Relations:** userId → User, reviewedBy → User

---

## AuditLog (`auditlogs`)

| Field | Type | Constraints |
|---|---|---|
| _id | ObjectId | auto |
| actorId | ObjectId | ref: User, default: null (null = system) |
| targetType | String | required, enum: User / Post / VerificationRequest / AuditLog / System |
| targetId | ObjectId | default: null |
| action | String | required (e.g. 'user.ban', 'verification.approve') |
| metadata | Mixed | default: {} |
| ip | String | default: null |
| userAgent | String | default: null |
| createdAt | Date | auto (timestamps) |
| updatedAt | Date | auto (timestamps) |

**Indexes:**
- `actorId + createdAt` (desc)
- `targetType + targetId`
- `action + createdAt` (desc)

**Relations:** actorId → User

---

## Post (`posts`)

| Field | Type | Constraints |
|---|---|---|
| _id | ObjectId | auto |
| author | ObjectId | required, ref: User |
| title | String | required, trim, 5-120 chars |
| category | String | required, enum: do_nam / do_nu / do_tre_em / phu_kien |
| quantity | Number | required, min: 1 |
| condition | String | required, enum: new_100 / new_90 / new_80 / custom |
| conditionNote | String | trim, max 500 chars |
| images | [String] | required, 1-5 URLs |
| description | String | trim, max 2000 chars |
| status | String | enum: available / in_transaction / traded / completed, default: available |
| isPinned | Boolean | default: false |
| completedAt | Date | default: null (set by admin when completing post) |
| likes | [ObjectId] | ref: User, default: [] |
| likesCount | Number | default: 0 (denormalized) |
| selectedApplicant | ObjectId | ref: User, default: null |
| location.city | String | default: null |
| location.district | String | default: null |
| createdAt | Date | auto (timestamps) |
| updatedAt | Date | auto (timestamps) |

**Indexes:**
- Text index on `title + description`
- `status + category + createdAt` (compound)
- `status + completedAt` (desc)
- `author + createdAt`
- `isPinned + createdAt`

**Relations:** author → User, selectedApplicant → User

---

## Wishlist (`wishlists`)

| Field | Type | Constraints |
|---|---|---|
| _id | ObjectId | auto |
| author | ObjectId | required, ref: User |
| title | String | required, trim, max 200 |
| images | [String] | 1–5 URLs |
| description | String | trim, max 2000, default: null |
| category | String | required, enum: do_nam / do_nu / do_tre_em / phu_kien |
| quantity | Number | required, min: 1 |
| status | String | enum: open / fulfilled, default: open |
| isPinned | Boolean | default: false |
| likes | [ObjectId] | ref: User, default: [] |
| likesCount | Number | default: 0 (denormalized) |
| createdAt | Date | auto (timestamps) |
| updatedAt | Date | auto (timestamps) |

**Indexes:**
- `author + createdAt` (desc)
- `isPinned + createdAt` (desc)
- `category + status`

**Relations:** author → User

---

## Application (`applications`)

| Field | Type | Constraints |
|---|---|---|
| _id | ObjectId | auto |
| post | ObjectId | required, ref: Post |
| applicant | ObjectId | required, ref: User |
| message | String | trim, max 500 chars |
| status | String | enum: pending / selected / rejected, default: pending |
| createdAt | Date | auto (timestamps) |
| updatedAt | Date | auto (timestamps) |

**Indexes:**
- `post + applicant` (unique compound)
- `applicant + createdAt`
- `post + status`

**Relations:** post → Post, applicant → User

## PostComment (`postcomments`)

| Field | Type | Constraints |
|---|---|---|
| _id | ObjectId | auto |
| post | ObjectId | required, ref: 'Post' |
| author | ObjectId | required, ref: 'User' |
| content | String | required, trim, maxlength: 500 |
| createdAt | Date | auto (timestamps) |
| updatedAt | Date | auto (timestamps) |

**Indexes:** `{ post: 1, createdAt: 1 }`
**Relations:** post → Post, author → User

---

## Conversation (`conversations`)

| Field | Type | Constraints |
|---|---|---|
| _id | ObjectId | auto |
| participants | [ObjectId] | required, ref: User, exactly 2 participants |
| lastMessage.content | String | default: null |
| lastMessage.type | String | enum: text/image/video/file, default: null |
| lastMessage.senderId | ObjectId | ref: User, default: null |
| lastMessage.createdAt | Date | default: null |
| unreadCounts | Map<String, Number> | key = userId.toString(), default: {} |
| createdAt | Date | auto (timestamps) |
| updatedAt | Date | auto (timestamps) |

**Indexes:**
- `{ participants: 1 }`
- `{ participants: 1, updatedAt: -1 }`

**Relations:** participants → User

---

## Message (`messages`)

| Field | Type | Constraints |
|---|---|---|
| _id | ObjectId | auto |
| conversationId | ObjectId | required, ref: Conversation |
| sender | ObjectId | ref: User, default: null (null when isSystem=true) |
| type | String | required, enum: text / image / video / file |
| content | String | trim, maxlength: 2000, default: null |
| fileUrl | String | Cloudinary URL, default: null |
| fileName | String | original filename, default: null |
| fileSize | Number | bytes, default: null |
| fileMimeType | String | MIME type, default: null |
| isSystem | Boolean | default: false |
| createdAt | Date | auto (timestamps) |
| updatedAt | Date | auto (timestamps) |

**Indexes:** `{ conversationId: 1, createdAt: -1 }`
**Relations:** conversationId → Conversation, sender → User
