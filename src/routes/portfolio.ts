import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { portfolioService } from '../services/portfolioService';
import { config } from '../config';

const router = Router();

// Get portfolio data
router.get(
  '/',
  asyncHandler(async (_req: Request, res: Response) => {
    const portfolioData = await portfolioService.getPortfolioData();

    // Set cache headers
    res.setHeader('Cache-Control', `public, max-age=${config.cache.maxAge}`);
    res.setHeader('CDN-Cache-Control', `public, max-age=${config.cache.cdnMaxAge}`);

    return res.json({
      success: true,
      data: portfolioData,
      timestamp: new Date().toISOString(),
    });
  })
);

// Get specific section
router.get(
  '/:section',
  asyncHandler(async (req: Request, res: Response) => {
    const { section } = req.params;
    const validSections = [
      'about',
      'experience',
      'education',
      'skills',
      'projects',
      'certifications',
    ];

    if (!validSections.includes(section)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid section',
        validSections,
      });
    }

    const sectionData = await portfolioService.getSection(section);

    res.setHeader('Cache-Control', `public, max-age=${config.cache.maxAge}`);
    res.setHeader('CDN-Cache-Control', `public, max-age=${config.cache.cdnMaxAge}`);

    return res.json({
      success: true,
      section,
      data: sectionData,
      timestamp: new Date().toISOString(),
    });
  })
);

export default router;
