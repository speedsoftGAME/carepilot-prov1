const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token manquant ou invalide' });
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.userId, companyId: payload.companyId, role: payload.role };
    next();
  } catch {
    return res.status(401).json({ error: 'Token expiré ou invalide' });
  }
}

module.exports = authMiddleware;
