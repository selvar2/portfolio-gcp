import { Storage, Bucket } from '@google-cloud/storage';
import { config } from '../config';
import { logger } from '../utils/logger';

class StorageService {
  private storage: Storage;
  private bucket: Bucket;

  constructor() {
    this.storage = new Storage({
      projectId: config.gcp.projectId,
    });

    if (config.gcp.bucketName) {
      this.bucket = this.storage.bucket(config.gcp.bucketName);
    } else {
      logger.warn('GCS bucket name not configured');
    }
  }

  /**
   * Generate a signed URL for uploading files
   */
  async generateSignedUploadUrl(
    filename: string,
    contentType: string,
    expiresIn: number = 3600
  ): Promise<string> {
    try {
      const file = this.bucket.file(filename);

      const [signedUrl] = await file.getSignedUrl({
        version: 'v4',
        action: 'write',
        expires: Date.now() + expiresIn * 1000,
        contentType,
      });

      logger.info('Generated signed upload URL', { filename });
      return signedUrl;
    } catch (error) {
      logger.error('Error generating signed upload URL:', error);
      throw error;
    }
  }

  /**
   * Generate a signed URL for downloading files
   */
  async generateSignedDownloadUrl(
    filename: string,
    expiresIn: number = 3600
  ): Promise<string> {
    try {
      const file = this.bucket.file(filename);

      const [signedUrl] = await file.getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: Date.now() + expiresIn * 1000,
      });

      logger.info('Generated signed download URL', { filename });
      return signedUrl;
    } catch (error) {
      logger.error('Error generating signed download URL:', error);
      throw error;
    }
  }

  /**
   * Get public URL for a file (if bucket is public)
   */
  getPublicUrl(filename: string): string {
    return `https://storage.googleapis.com/${config.gcp.bucketName}/${filename}`;
  }

  /**
   * Upload a file from buffer
   */
  async uploadFile(filename: string, buffer: Buffer, contentType: string): Promise<void> {
    try {
      const file = this.bucket.file(filename);

      await file.save(buffer, {
        contentType,
        metadata: {
          cacheControl: `public, max-age=${config.cache.cdnMaxAge}`,
        },
      });

      logger.info('File uploaded successfully', { filename });
    } catch (error) {
      logger.error('Error uploading file:', error);
      throw error;
    }
  }

  /**
   * Delete a file
   */
  async deleteFile(filename: string): Promise<void> {
    try {
      await this.bucket.file(filename).delete();
      logger.info('File deleted successfully', { filename });
    } catch (error) {
      logger.error('Error deleting file:', error);
      throw error;
    }
  }

  /**
   * List files in bucket
   */
  async listFiles(prefix: string = ''): Promise<Array<{ name: string; size: number; updated: string }>> {
    try {
      const [files] = await this.bucket.getFiles({ prefix });

      const fileList = files.map((file) => ({
        name: file.name,
        size: parseInt(file.metadata.size || '0'),
        updated: file.metadata.updated || new Date().toISOString(),
      }));

      logger.info('Listed files', { count: fileList.length, prefix });
      return fileList;
    } catch (error) {
      logger.error('Error listing files:', error);
      throw error;
    }
  }

  /**
   * Check if file exists
   */
  async fileExists(filename: string): Promise<boolean> {
    try {
      const [exists] = await this.bucket.file(filename).exists();
      return exists;
    } catch (error) {
      logger.error('Error checking file existence:', error);
      return false;
    }
  }
}

export const storageService = new StorageService();
