import { Router } from 'express';
import prisma from './prisma';
import { hashPassword, verifyPassword, createSession, requireAuth } from './auth';
import { loginLimiter } from './middleware/rateLimiter';

const authRouter = Router();

// Single auth handler that matches Vercel API structure
authRouter.post('/', async (req, res) => {
  try {
    const { action } = req.query;

    // Handle login
    if (action === 'login') {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      console.log('Login attempt for:', email);

      // Find user
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (!user || !user.password) {
        console.log('❌ User not found:', email);
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Check if user is active
      if (!user.isActive) {
        console.log('❌ User account inactive:', email);
        return res.status(401).json({ error: 'Account is deactivated' });
      }

      // Verify password
      const isValidPassword = await verifyPassword(password, user.password);
      if (!isValidPassword) {
        console.log('❌ Invalid password for:', email);
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Create session
      const session = await createSession(Number(user.id));

      // Set secure cookie
      res.cookie('session', session.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        path: '/'
      });

      console.log('✅ Login successful for:', user.name, user.role);

      // Return user data (without password)
      const { password: _, ...userWithoutPassword } = user;
      res.json({
        user: userWithoutPassword,
        message: 'Login successful',
      });
    }

    // Handle logout
    else if (action === 'logout') {
      console.log('Logout attempt');
      
      // Get session token from cookie
      const sessionToken = req.cookies?.session;
      
      if (sessionToken) {
        try {
          // Delete the session from database
          await prisma.session.deleteMany({
            where: { token: sessionToken }
          });
        } catch (error) {
          console.error('Error deleting session:', error);
        }
      }

      // Clear cookie
      res.clearCookie('session');
      res.json({ message: 'Logout successful' });
    }

    else {
      res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user
authRouter.get('/me', requireAuth, async (req, res) => {
  try {
    const { password: _, ...userWithoutPassword } = req.user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Register route (admin only for now)
authRouter.post('/register', requireAuth, async (req, res) => {
  try {
    // Only admins can create new users for now
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { email, password, name, role = 'OWNER' } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name.trim(),
        role: role.toUpperCase(),
        isActive: true,
      },
    });

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json({
      user: userWithoutPassword,
      message: 'User created successfully',
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default authRouter; 