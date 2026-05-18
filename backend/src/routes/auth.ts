import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { getDemoPassword, signDemoToken } from '../lib/demoAuth';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/login', async (req, res) => {
  try {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (password !== getDemoPassword()) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const accessToken = signDemoToken(user.id, user.role);

    return res.json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (e) {
    console.error('Login error:', e);
    return res.status(500).json({ error: 'Login failed.' });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, email: true, name: true, role: true },
    });
    if (!user) {
      return res.status(401).json({ error: 'User no longer exists.' });
    }
    return res.json({ user });
  } catch (e) {
    console.error('Me error:', e);
    return res.status(500).json({ error: 'Failed to load profile.' });
  }
});

export default router;
