'use strict';

const APPLICATION_STATUSES = Object.freeze({
  PENDING: 'pending',
  SELECTED: 'selected',
  REJECTED: 'rejected',
});

const APPLICATION_STATUS_VALUES = Object.freeze(Object.values(APPLICATION_STATUSES));

module.exports = {
  APPLICATION_STATUSES,
  APPLICATION_STATUS_VALUES,
};
