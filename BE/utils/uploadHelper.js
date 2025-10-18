import cloudinary from '../config/cloudinary.js';
import { Readable } from 'stream';

export const uploadImageToCloudinary = async (buffer, folder = 'products') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'auto',
        transformation: [
          { width: 800, height: 600, crop: 'limit' },
          { quality: 'auto' }
        ]
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    );

    const bufferStream = new Readable();
    bufferStream.push(buffer);
    bufferStream.push(null);
    bufferStream.pipe(stream);
  });
};

export const uploadMultipleImages = async (files, folder = 'products') => {
  const uploadPromises = files.map(file => 
    uploadImageToCloudinary(file.buffer, folder)
  );
  
  try {
    const urls = await Promise.all(uploadPromises);
    return urls;
  } catch (error) {
    throw new Error(`Failed to upload images: ${error.message}`);
  }
};
