import mongoose from 'mongoose';

// Define the schema for an image entry
const ImageSchema = new mongoose.Schema({
    imageName: { type: String, required: true },
    referenceUrl: { type: String, required: true },
    testUrl: { type: String, required: true },
    diffUrl: { type: String, required: true },
}, { _id: false });

// Define the schema for a platform entry
const PlatformSchema = new mongoose.Schema({
    platformName: { type: String, required: true },
    images: [ImageSchema]
}, { _id: false });

// Define the main screenshot schema
const ResultSchema = new mongoose.Schema({
    jobDate: { type: Date, default: Date.now }, // Store the date when the job was executed
    platforms: [PlatformSchema] // Array of PlatformSchema objects
});

const JobResult = mongoose.models.JobResult || mongoose.model('JobResult', ResultSchema);
export default JobResult;
