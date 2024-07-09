import SocialMedia from '../lib/models/channels.mjs';
import ScreenshotTest from '../lib/models/ScreenshotTest.mjs';
import ScreenshotReference from '../lib/models/ScreenshotReference.mjs';
import connectToDatabase from '../lib/mongodb.mjs';

const apiCall = async (channelData, channel, selector, directory)  => {
    // console.log(channelData);
    for (let urlIndex = 0; urlIndex < channelData.length; urlIndex++) {
        const response = await fetch("http://localhost:4001/screenshot", {
            method: "POST",
            headers: { "Content-Type" : "application/json"},
            body: JSON.stringify({
                link: channelData[urlIndex],
                selector,
                name: `url_${urlIndex}`,
                directory,
                channel
            })
        })
    }
}
const captureScreenshots = async (directory) => {
    // Fetch all unique channel names
    connectToDatabase();
    const channels = await SocialMedia.distinct('channelName');
    console.log(channels);
    if(directory==='reference') await ScreenshotReference.deleteMany({});
    else await ScreenshotTest.deleteMany({});

    for (let channel of channels) {
        // Fetch data for the current channel from MongoDB
        const channelData = await SocialMedia.findOne({ channelName: channel });
        if (!channelData || !channelData.data) {
            console.error(`No data found for channel: ${channel}`);
            continue;
        }
        const { divSelector, data } = channelData;

        await apiCall(data, channel, divSelector, directory);
    }
};


export default captureScreenshots;