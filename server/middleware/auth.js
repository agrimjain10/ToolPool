// Shared authentication and authorization helpers used across all routes

const crypto = require('crypto');
const Session = require('../models/sessionModel');
const User = require('../models/userModel');

// Check which required fields are missing from the request body
function missingFields(body, fields) {
  return fields.filter((field) => !String(body[field] ?? '').trim());
}

// Extract Bearer token from the Authorization header
function getBearerToken(req) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return '';
  return header.slice(7).trim();
}

// SHA256 hash a token string
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Generate a random 32-byte hex token
function createToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Create a new session in the DB with a 30-day expiry
async function createSession(user) {
  const token = createToken();
  await Session.create({
    userId: user._id,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
  });
  return token;
}

// Look up the authenticated user from the request token
async function getAuthenticatedUser(req) {
  const token = getBearerToken(req) || String(req.query?.token || '');
  if (!token) return null;

  const session = await Session.findOne({ tokenHash: hashToken(token) });
  if (!session) return null;

  const user = await User.findById(session.userId);
  if (!user) return null;

  return { user, token, session };
}

// Check if the authenticated user has admin role
function isAdmin(auth) {
  return auth?.user?.role === 'admin';
}

// Check if the authenticated user owns a tool (or is admin)
function ownsTool(auth, tool) {
  return Boolean(
    auth && tool &&
    (isAdmin(auth) ||
      (tool.ownerId && tool.ownerId.toString() === auth.user._id.toString()) ||
      tool.owner === auth.user.name)
  );
}

// Check if the authenticated user is a participant in a borrow request
function isRequestParticipant(auth, request) {
  const tool = request?.toolId;
  return Boolean(
    auth && request &&
    (isAdmin(auth) ||
      (request.borrowerId && request.borrowerId.toString() === auth.user._id.toString()) ||
      request.borrower === auth.user.name ||
      ownsTool(auth, tool))
  );
}

// Format a user document for API responses (hide password)
function userResponse(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt
  };
}

// Build a MongoDB filter object from query params for tools
function toolFilter(query) {
  const filter = {};

  if (query.category) filter.category = new RegExp(query.category, 'i');
  if (query.location) filter.location = new RegExp(query.location, 'i');
  if (query.available === 'true') filter.available = true;
  if (query.available === 'false') filter.available = false;
  if (query.q) {
    const text = new RegExp(query.q, 'i');
    filter.$or = [{ name: text }, { category: text }, { location: text }, { owner: text }];
  }

  return filter;
}

module.exports = {
  missingFields,
  getBearerToken,
  hashToken,
  createToken,
  createSession,
  getAuthenticatedUser,
  isAdmin,
  ownsTool,
  isRequestParticipant,
  userResponse,
  toolFilter
};
