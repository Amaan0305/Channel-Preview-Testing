import mongoose from 'mongoose';

const ScreenshotSchema = new mongoose.Schema({
    viewport: {
        type: String,
        required: true
    },
    scenario: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    channel:{
        type: String,
        required: true
    }
});

const ScreenshotTest = mongoose.models.ScreenshotTest || mongoose.model('ScreenshotTest', ScreenshotSchema);
export default ScreenshotTest;