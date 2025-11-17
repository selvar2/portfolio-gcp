import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { contactRateLimiter } from '../middleware/rateLimiter';
import { contactService } from '../services/contactService';

const router = Router();

// Contact form submission
router.post(
  '/',
  contactRateLimiter,
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Invalid email address')
      .normalizeEmail(),
    body('subject')
      .trim()
      .notEmpty()
      .withMessage('Subject is required')
      .isLength({ min: 5, max: 200 })
      .withMessage('Subject must be between 5 and 200 characters'),
    body('message')
      .trim()
      .notEmpty()
      .withMessage('Message is required')
      .isLength({ min: 10, max: 5000 })
      .withMessage('Message must be between 10 and 5000 characters'),
    body('recaptchaToken')
      .optional()
      .isString()
      .withMessage('Invalid reCAPTCHA token'),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(
        `Validation failed: ${errors.array().map((e) => e.msg).join(', ')}`,
        400
      );
    }

    const { name, email, subject, message, recaptchaToken } = req.body;

    await contactService.processContactForm({
      name,
      email,
      subject,
      message,
      recaptchaToken,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      success: true,
      message: 'Your message has been sent successfully. We will get back to you soon.',
      timestamp: new Date().toISOString(),
    });
  })
);

export default router;
