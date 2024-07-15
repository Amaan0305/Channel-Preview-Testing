import connectToDatabase from '@/app/lib/mongodb.js';
import SocialMedia from '@/app/lib/models/Channels.js';

/**
 * Calls an external API to capture a screenshot.
 * @param {string} channelUrls - The URLs of the channels.
 * @param {string} channel - The name of the channel.
 * @param {string} divSelector - The div selector for the channel.
 * @param {string} directory - The directory to save the screenshot.
 * @returns {Promise<object>} - The response from the API.
 */
const apiCall = async (channelUrls, channel, divSelector, directory) => {
  try {
    // Fetch the channel data from the database
    const channelData = await SocialMedia.findOne({ channelName: channel });

    const apiPayload = {
      link: channelUrls,
      selector: divSelector,
      directory,
      channel,
    };
    const response = await fetch(`${process.env.API_BASE_URL}/api/screenshot`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(apiPayload),
    });

    const data = await response.json();
    if (!response.ok) {
      const error = 'Failed to call screenshot API : '+ data.message;
      throw new Error(error);
    }

    return data;
  } catch (error) {
    console.error('Error in apiCall:', error);
    throw error;
  }
};

/**
 * Converts the URL based on the channel name.
 * @param {string} url - The URL to be converted.
 * @param {string} channelName - The name of the channel.
 * @returns {string} - The converted URL.
 */
const convertUrlByChannel = (url, channelName) => {
  const lowerCaseChannelName = channelName.toLowerCase();

  switch (lowerCaseChannelName) {
    case 'facebook':
      return validateFacebookUrl(url);
    case 'instagram':
      return validateInstagramUrl(url);
    case 'twitter':
      return validateTwitterUrl(url);
    case 'reddit':
      return validateRedditUrl(url);
    case 'linkedin':
      return validateLinkedinUrl(url);
    default:
      return url;
  }
};

/**
 * Converts Facebook URLs to the correct format.
 * @param {string} url - The URL to be converted.
 * @returns {string} - The converted URL.
 */
const validateFacebookUrl = (url) => {
  const facebookPermalinkRegex = /https?:\/\/(?:www\.)?facebook\.com\/permalink\.php\?story_fbid=([^&]+)&id=([^&]+)/i;
  const facebookPostsRegex = /https?:\/\/(?:www\.)?facebook\.com\/([^/]+)\/posts\/([^/]+)/i;

  // Convert permalink.php URL to posts URL
  if (facebookPermalinkRegex.test(url)) {
    return url.replace(facebookPermalinkRegex, 'https://www.facebook.com/$2/posts/$1');
  }

  // If URL is already in the correct posts format, return it as is
  if (facebookPostsRegex.test(url)) {
    return url;
  }

  // Throw error for invalid URL format
  throw new Error('Invalid Facebook URL format');
};

/**
 * Validates the Instagram URL format.
 * @param {string} url - The URL to be validated.
 * @returns {string} - The validated URL.
 */
const validateInstagramUrl = (url) => {
  const instagramRegex = /https?:\/\/(?:www\.)?instagram\.com\/p\/([^/]+)/i;

  if (instagramRegex.test(url)) {
    return url;
  }

  throw new Error('Invalid Instagram URL format');
};

/**
 * Validates the Twitter URL format.
 * @param {string} url - The URL to be validated.
 * @returns {string} - The validated URL.
 */
const validateTwitterUrl = (url) => {
  const twitterRegex = /https?:\/\/x\.com\/(?:\w+)\/status(?:es)?\/(\d+)/i;

  if (twitterRegex.test(url)) {
    return url;
  }

  throw new Error('Invalid Twitter URL format');
};

/**
 * Validates the LinkedIn URL format.
 * @param {string} url - The URL to be validated.
 * @returns {string} - The validated URL.
 * @throws {Error} - If the URL format is invalid.
 */
const validateLinkedinUrl = (url) => {
  const linkedinRegex = /https?:\/\/(?:www\.)?linkedin\.com\/(?:feed\/update\/|in\/|pub\/|profile\/view\?id=|pulse\/|learning\/|events\/urn:li:activity:|groups\/)/i;

  if (linkedinRegex.test(url)) {
    return url;
  }

  throw new Error('Invalid LinkedIn URL format');
};

/**
 * Validates the Reddit URL format.
 * @param {string} url - The URL to be validated.
 * @returns {string} - The validated URL.
 * @throws {Error} - If the URL format is invalid.
 */
const validateRedditUrl = (url) => {
  const redditRegex = /https?:\/\/(?:www\.)?reddit\.com\/(?:r|user)\/[^/]+\/comments\/[^/]+\/[^/]+/i;

  if (redditRegex.test(url)) {
    return url;
  }

  throw new Error('Invalid Reddit URL format');
};

export const POST = async (req) => {
  try {
    // Extract the request payload
    const { url, channel, scenario } = await req.json();
    if (!url || !channel || !scenario) {
      throw new Error('URL, channel, and scenario are required');
    }

    // Connect to the database
    await connectToDatabase();

    // Convert the URL based on the channel name
    const convertedUrl = convertUrlByChannel(url, channel);

    // Find the social media channel in the database
    const socialMediaChannel = await SocialMedia.findOne({ channelName: channel });
    if (!socialMediaChannel) {
      throw new Error(`Channel ${channel} not found`);
    }

    // Check if the URL already exists
    if (socialMediaChannel.data.some(entry => entry.url === convertedUrl)) {
      return new Response(JSON.stringify({ message: 'URL already exists' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Ensure divSelector is present
    const { divSelector } = socialMediaChannel;
    if (!divSelector) {
      throw new Error('divSelector not found for the selected channel');
    }
    const newObject = { url: convertedUrl, scenario};
    const startTime = Date.now();
    // Calls the external API to take screenshot
    await apiCall(newObject, channel, divSelector, "reference");
    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(duration);


    return new Response(JSON.stringify({ message: 'URL added successfully', newObject }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error processing URL:', error);
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};
