import connectToDatabase from '@/app/lib/mongodb.mjs';
import SocialMedia from '@/app/lib/models/channels.mjs';

export const POST = async (req, res) => {
  if (req.method === 'POST') {
    await connectToDatabase();
    
    try {
      const formData = await req.json();
      console.log(formData);
      
      // Check if the channel already exists
      let existingChannel = await SocialMedia.findOne({ channelName: formData.channelName });

      if (existingChannel) {
        // If channel exists, update its data
        existingChannel.divSelector = formData.divSelector;
        existingChannel.loginByPass = formData.loginByPass;
        existingChannel.data = formData.data;

        await existingChannel.save();
        return new Response(JSON.stringify({ message: "Channel data updated successfully" }), { status: 200 });
      } else {
        console.log('Channel does not exist');
        return new Response(JSON.stringify({ success: false, message: 'Channel does not exist' }), { status: 404 });
      }
    } catch (error) {
      return new Response(JSON.stringify({ message: 'Error saving or updating channel data', error }), { status: 500 });
    }
  } else {
    return new Response(JSON.stringify({ success: false, error: `Method ${req.method} Not Allowed` }), { status: 405 });
  }
};
