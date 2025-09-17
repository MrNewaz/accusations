import { signup } from '#controllers/auth.controller.js';
import express from 'express';

const router = express.Router();

router.post('/sign-up', signup);

router.post('/sign-in', (req, res) => {
  // Handle sign-in
  res.send('Sign-in route');
});

router.post('/sign-out', (req, res) => {
  // Handle sign-out
  res.send('Sign-out route');
});

export default router;
