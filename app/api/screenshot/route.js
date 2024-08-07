import connectToDatabase from '@/app/lib/mongodb.js';
import SocialMedia from '@/app/lib/models/Channels.js';
import ScreenshotReference from '@/app/lib/models/ScreenshotReference.js';
import ScreenshotTest from '@/app/lib/models/ScreenshotTest.js';

// Define the viewports to capture screenshots
const viewports = [
  { width: 1920, height: 1080 }  // Large Desktop
];

export const POST = async (req) => {
  try {
    // Extract data from request body
    const { link, selector, directory, channel } = await req.json();

    // Check required fields
    if (!link || !selector) {
      return new Response(JSON.stringify({ message: 'URL and selector are required' }), { status: 400 });
    }

    // Connect to MongoDB
    await connectToDatabase();
    const url = link.url;
    const scenario = link.scenario;

    // Retrieve loginByPass code from SocialMedia model if available
    const socialMediaChannel = await SocialMedia.findOne({ channelName: channel });
    const loginByPassCode = socialMediaChannel ? socialMediaChannel.loginByPass : null;

    const apiPayload = {
      url,
      divSelector: selector,
      loginByPass: loginByPassCode
    };
    console.log(JSON.stringify(apiPayload));
    const response = await fetch(`${process.env.API_SERVER_URL}/screenshot`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(apiPayload),
    });

    if (!response.ok) {
      const errorMessage = `${response.statusText}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    const data = await response.json();

    // Prepare screenshot data
    const screenshotData = {
      viewport: `${viewports[0].width}x${viewports[0].height}`,
      scenario,
      url: data.referenceUrl,
      channel
    };

    // Save screenshot data to appropriate collection based on directory
    if (directory === 'reference') {
      // Add the new object to the channel array
      socialMediaChannel.data.push(link);
      // Save the updated channel document
      await socialMediaChannel.save();
      
      const newScreenshot = new ScreenshotReference(screenshotData);
      await newScreenshot.save();

      // Update SocialMedia document with reference to ScreenshotReference
      await SocialMedia.findOneAndUpdate(
        { channelName: channel, 'data.url': url },
        { $set: { 'data.$.screenshotReference': newScreenshot._id } },
        { new: true, useFindAndModify: false }
      );
    } else {
      const newScreenshot = new ScreenshotTest(screenshotData);
      await newScreenshot.save();

      // Update SocialMedia document with reference to ScreenshotTest
      await SocialMedia.findOneAndUpdate(
        { channelName: channel, 'data.url': url },
        { $set: { 'data.$.screenshotTest': newScreenshot._id } },
        { new: true, useFindAndModify: false }
      );
    }

    return new Response(JSON.stringify({ message: "The screenshots have been generated" }), { status: 200 });
  } catch (error) {
    // Handle errors during screenshot capture
    const errorMessage = error.message.replace(/::/g, '');
    console.error('Error capturing screenshot:', errorMessage);
    return new Response(JSON.stringify({ message: errorMessage }), { status: 500 });
  }
};
