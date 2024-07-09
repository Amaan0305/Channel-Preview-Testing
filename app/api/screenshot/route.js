import connectToDatabase from '@/app/lib/mongodb.mjs';
import SocialMedia from '@/app/lib/models/channels.mjs';
import ScreenshotReference from '@/app/lib/models/ScreenshotReference.mjs';
import ScreenshotTest from '@/app/lib/models/ScreenshotTest.mjs';

// Define the viewports to capture screenshots
const viewports = [
  { width: 1920, height: 1080 }  // Large Desktop
];

// Function to execute loginByPass code on the page
async function runLoginByPassCode(page, loginByPassCode) {
  try {
    const runCode = new Function(`
      return (async () => {
        ${loginByPassCode}
      })();
    `);
    await page.evaluate(runCode);
  } catch (error) {
    console.error('Error executing loginByPass code:', error);
    throw new Error('Error executing loginByPass code');
  }
}

export const POST = async (req) => {
  try {
    // Extract data from request body
    const { link, selector, name, directory, channel } = await req.json();

    // Check required fields
    if (!link || !selector) {
      return new Response('URL and selector are required', { status: 400 });
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
      throw new Error(`Failed to fetch screenshot: ${response.statusText}`);
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
    console.error('Error capturing screenshot:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
