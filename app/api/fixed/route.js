// pages/api/updateReferenceUrl.js

import connectToDatabase from '@/app/lib/mongodb.mjs';
import JobResult from '@/app/lib/models/resultSchema.mjs';
import ScreenshotReference from '@/app/lib/models/ScreenshotReference.mjs';

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
    const result = await JobResult.findOne({
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
    // Find the ScreenshotReference document with the given channel and referenceUrl
    const screenshotRef = await ScreenshotReference.findOneAndUpdate(
      { channel, url: referenceUrl },
      { $set: { url: testUrl } },
      { new: true, useFindAndModify: false }
    );
    // // Save the updated result document
    await result.save();

    return new Response(JSON.stringify({ message: 'Reference URL updated successfully', screenshotRef }), {
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
