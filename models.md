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
