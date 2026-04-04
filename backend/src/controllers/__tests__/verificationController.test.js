'use strict';

jest.mock('../../models/VerificationRequest', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
}));

jest.mock('../../models/User', () => ({
  findByIdAndUpdate: jest.fn(),
}));

jest.mock('../../validators/verificationValidators', () => ({
  submitVerificationSchema: {
    safeParse: jest.fn(),
  },
  rejectVerificationSchema: {
    safeParse: jest.fn(),
  },
  updateNgoStatusSchema: {
    safeParse: jest.fn(),
  },
  updateAccountStatusSchema: {
    safeParse: jest.fn(),
  },
}));

const VerificationRequest = require('../../models/VerificationRequest');
const User = require('../../models/User');
const { VERIFICATION_STATUSES } = require('../../constants/userEnums');
const {
  submitVerificationSchema,
} = require('../../validators/verificationValidators');
const { submitVerification } = require('../verificationController');

const createMockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('verificationController.submitVerification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns 400 when request body validation fails', async () => {
    const req = {
      body: {},
      user: { _id: 'user-1' },
    };
    const res = createMockRes();

    submitVerificationSchema.safeParse.mockReturnValue({
      success: false,
      error: {
        errors: [{ path: ['requestType'], message: 'requestType is required' }],
      },
    });

    await submitVerification(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
    expect(VerificationRequest.findOne).not.toHaveBeenCalled();
  });

  test('returns 409 when user already has a pending request of same type', async () => {
    const req = {
      body: {
        requestType: 'ngo',
        documents: [{ url: 'https://example.com/doc-1.pdf' }],
      },
      user: { _id: 'user-1' },
    };
    const res = createMockRes();

    submitVerificationSchema.safeParse.mockReturnValue({
      success: true,
      data: req.body,
    });

    VerificationRequest.findOne.mockResolvedValue({ _id: 'request-existing' });

    await submitVerification(req, res);

    expect(VerificationRequest.findOne).toHaveBeenCalledWith({
      userId: 'user-1',
      requestType: 'ngo',
      status: 'pending',
    });
    expect(res.status).toHaveBeenCalledWith(409);
    expect(VerificationRequest.create).not.toHaveBeenCalled();
    expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  test('returns 201 and creates verification request on valid input', async () => {
    const req = {
      body: {
        requestType: 'individual',
        documents: [{ url: 'https://example.com/doc-2.pdf', label: 'ID' }],
        notes: 'Please review soon',
      },
      user: { _id: 'user-2' },
    };
    const res = createMockRes();

    const createdRequest = { _id: 'request-1' };

    submitVerificationSchema.safeParse.mockReturnValue({
      success: true,
      data: req.body,
    });
    VerificationRequest.findOne.mockResolvedValue(null);
    VerificationRequest.create.mockResolvedValue(createdRequest);
    User.findByIdAndUpdate.mockResolvedValue({});

    await submitVerification(req, res);

    expect(VerificationRequest.create).toHaveBeenCalledWith({
      userId: 'user-2',
      requestType: 'individual',
      documents: [{ url: 'https://example.com/doc-2.pdf', label: 'ID' }],
      notes: 'Please review soon',
    });
    expect(User.findByIdAndUpdate).toHaveBeenCalledWith('user-2', {
      verificationStatus: VERIFICATION_STATUSES.PENDING,
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: { request: createdRequest },
      })
    );
  });
});