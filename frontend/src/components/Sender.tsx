import { useEffect, useState } from "react";

const Sender = () => {
  const [socket, setsocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");
    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "sender" }));
    };
  }, []);

  async function startSendingVideo() {
    if (!socket) return;
    //create an offer
    const pc = new RTCPeerConnection();
    const offer = await pc.createOffer(); //sdp
    pc.setLocalDescription(offer);
    socket?.send(JSON.stringify({ type: "createOffer", sdp: offer.sdp }));
    socket.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "createAnswer") {
        pc.setRemoteDescription(data.sdp);
      }
    };
  }
  return (
    <div>
      Sender
      <button
        onClick={() => {
          startSendingVideo;
        }}
      >
        Send Video
      </button>
    </div>
  );
};
export default Sender;
