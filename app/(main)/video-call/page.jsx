// import VideoCall from "./video-call-ui";

// export default async function VideoCallPage({ searchParams }) {
//   const { sessionId, token } = await searchParams;

//   return <VideoCall sessionId={sessionId} token={token} />;
// }


import VideoCall from "./video-call-ui";

export default function VideoCallPage({ searchParams }) {
  const sessionId = searchParams?.sessionId;
  const token = searchParams?.token;
  const apiKey = searchParams?.apiKey;

  console.log("PAGE PARAMS:", { sessionId, token, apiKey });

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
