// pages/api/updateReferenceUrl.js

import connectToDatabase from '@/app/lib/mongodb.mjs';
import Result from '@/app/lib/models/resultSchema.mjs';
import cloudinary from '@/app/lib/cloudinary.mjs';
import axios from 'axios';
import { Readable } from 'stream';

function extractPublicId(cloudinaryUrl) {
  const regex = /\/upload\/(?:v\d+\/)?([^\.]+)/;
  const match = cloudinaryUrl.match(regex);
  return match ? match[1] : null;
}

export const POST = async (req, res) => {
  try {
    const { channel, referenceUrl } = await req.json();
    console.log('Received channel:', channel);
    console.log('Received referenceUrl:', referenceUrl);

    if (!channel || !referenceUrl) {
      return new Response(JSON.stringify({ error: 'channel and referenceUrl are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    await connectToDatabase();

    // Find the platform with the given channel and referenceUrl
    const result = await Result.findOne({
      'platforms.platformName': channel,
      'platforms.images.referenceUrl': referenceUrl
    });

    if (!result) {
      return new Response(JSON.stringify({ error: 'Reference URL not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Find the platform matching the channel
    const platform = result.platforms.find(p => p.platformName === channel);
    if (!platform) {
      return new Response(JSON.stringify({ error: 'Platform not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Filter images in the found platform
    let testUrl;
    platform.images = platform.images.filter(image => {
      if (image.referenceUrl === referenceUrl) {
        testUrl = image.testUrl;
        return false; // Remove the matched image from the array
      }
      return true; // Keep other images
    });

    if (!testUrl) {
      return new Response(JSON.stringify({ error: 'Test URL not found for the given Reference URL' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    console.log(testUrl);
    // Download the image from testUrl
    const response = await axios.get(testUrl, { responseType: 'stream' });
    const publicId = extractPublicId(referenceUrl);

    // Upload the image buffer to Cloudinary, overwriting the image at referenceUrl
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { public_id: publicId, overwrite: true, invalidate: true },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      response.data.pipe(uploadStream);
    });


    // Save the updated result document
    await result.save();

    return new Response(JSON.stringify({ message: 'Image updated and entry deleted successfully', uploadResult }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error updating reference URL:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
