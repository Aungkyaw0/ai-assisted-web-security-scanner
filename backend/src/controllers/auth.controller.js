/**
 * auth.controller.js
 * Handles admin authentication.
 */

import jwt from 'jsonwebtoken';

export const login = (req, res) => {
  const { username, password } = req.body;

  if (username === 'admin' && password === 'admin1332') {
    const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET || 'supersecret_admin_key_1332', { expiresIn: '1d' });
    return res.json({ token, message: 'Login successful' });
  }

  return res.status(401).json({ error: 'Invalid credentials' });
};
