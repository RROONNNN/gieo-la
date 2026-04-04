'use strict';

const USER_ROLES = Object.freeze({
  MEMBER: 'member',
  NGO: 'ngo',
  INDIVIDUAL: 'individual',
  ADMIN: 'admin',
});

const ACCOUNT_STATUSES = Object.freeze({
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  BANNED: 'banned',
});

const VERIFICATION_STATUSES = Object.freeze({
  UNVERIFIED: 'unverified',
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
});

const USER_ROLE_VALUES = Object.freeze(Object.values(USER_ROLES));
const ACCOUNT_STATUS_VALUES = Object.freeze(Object.values(ACCOUNT_STATUSES));
const VERIFICATION_STATUS_VALUES = Object.freeze(Object.values(VERIFICATION_STATUSES));

module.exports = {
  USER_ROLES,
  ACCOUNT_STATUSES,
  VERIFICATION_STATUSES,
  USER_ROLE_VALUES,
  ACCOUNT_STATUS_VALUES,
  VERIFICATION_STATUS_VALUES,
};