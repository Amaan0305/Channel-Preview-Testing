import JobResult from "@/app/lib/models/ResultSchema.js";
import connectToDatabase from "@/app/lib/mongodb.js";
import cloudinary from "@/app/lib/cloudinary.js"; // Import Cloudinary configuration

// Function to extract Cloudinary public_id from URL
const extractPublicId = (url) => {
  const urlParts = url.split('/');
  const publicIdWithExtension = urlParts[urlParts.length - 1];
  const publicId = publicIdWithExtension.split('.')[0];
  return publicId;
};

export async function DELETE(request) {
  // Extract jobId from request URL
  const url = new URL(request.url);
  const jobId = url.searchParams.get('jobId');

  try {
    await connectToDatabase();

    // Find the job by ID
    const job = await JobResult.findById(jobId);

    if (!job) {
      return new Response(
        JSON.stringify({ success: false, message: `Job ${jobId} not found` }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Delete images from Cloudinary
    for (const platform of job.platforms) {
      for (const image of platform.images) {
        const testPublicId = extractPublicId(image.testUrl);
        const diffPublicId = extractPublicId(image.diffUrl);
        await cloudinary.uploader.destroy(testPublicId);
        if(diffPublicId!="imageSizeDoesNotMatch")await cloudinary.uploader.destroy(diffPublicId);
      }
    }

    // Delete the job from the database
    await JobResult.findByIdAndDelete(jobId);

    return new Response(
      JSON.stringify({ success: true, message: `Job ${jobId} deleted successfully` }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Failed to delete job:', error);
    return new Response(
      JSON.stringify({ success: false, message: `Failed to delete job ${jobId}`, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
