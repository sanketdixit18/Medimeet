// import VideoCall from "./video-call-ui";

// export default async function VideoCallPage({ searchParams }) {
//   const { sessionId, token } = await searchParams;

//   return <VideoCall sessionId={sessionId} token={token} />;
// }


import VideoCall from "./video-call-ui";

export default async function VideoCallPage({ searchParams }) {
  const { sessionId, token, apiKey } = searchParams;

  // Debug (optional)
  console.log({ sessionId, token, apiKey });

  if (!sessionId || !token || !apiKey) {
    return <div>Invalid Video Call</div>;
  }

  return (
    <VideoCall 
      sessionId={sessionId} 
      token={token} 
      apiKey={apiKey} 
    />
  );
}
