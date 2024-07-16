export const maxDuration = 10; // This function can run for a maximum of 5 seconds
export const GET = async () => {
  try {
    const res = await fetch(`${process.env.API_SERVER_URL}/healthcheck`);
    console.log(res);
    if (!response.ok) {
      const errorMessage = `${response.statusText}`;
      throw new Error(errorMessage);
    }
    return new Response(JSON.stringify({ message: "The screenshots have been generated" }), { status: 200 });
  } catch (error) {
    const errorMessage = error.message.replace(/::/g, '');
    return new Response(JSON.stringify({ message: errorMessage }), { status: 500 });
  }
};
