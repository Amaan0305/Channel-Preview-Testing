"use server";
import connectToDatabase from '../lib/mongodb.js';
import SocialMedia from '../lib/models/channels.js';

export const getChannels = async () => {
  try {
    await connectToDatabase(); // Ensure database connection

    // Fetch channels from MongoDB
    const channels = await SocialMedia.find({});
    // Extract channel names from the retrieved documents
    const channelNames = channels.map(channel => channel.channelName);

    return channelNames;
  } catch (error) {
    console.error("Error fetching channels:", error);
    return []; // Return empty array or handle error as needed
  }
};