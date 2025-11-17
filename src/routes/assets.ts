import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { storageService } from '../services/storageService';
import { config } from '../config';

const router = Router();

// Get signed URL for uploading assets (admin only - add auth middleware in production)
router.post(
  '/upload',
  asyncHandler(async (req: Request, res: Response) => {
    const { filename, contentType } = req.body;

    if (!filename || !contentType) {
      return res.status(400).json({
        success: false,
        error: 'Filename and contentType are required',
      });
    }

    const signedUrl = await storageService.generateSignedUploadUrl(filename, contentType);

    return res.json({
      success: true,
      signedUrl,
      expiresIn: 3600,
    });
  })
);

// Get public URL for an asset
router.get(
  '/:filename',
  asyncHandler(async (req: Request, res: Response) => {
    const { filename } = req.params;

    const publicUrl = storageService.getPublicUrl(filename);

    res.setHeader('Cache-Control', `public, max-age=${config.cache.cdnMaxAge}`);

    return res.json({
      success: true,
      url: publicUrl,
    });
  })
);

// List all assets (admin only - add auth middleware in production)
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const prefix = (req.query.prefix as string) || '';
    const files = await storageService.listFiles(prefix);

    return res.json({
      success: true,
      files,
      count: files.length,
    });
  })
);

export default router;
