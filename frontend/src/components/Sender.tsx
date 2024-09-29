import { useEffect, useState } from "react";

const Sender = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");
    //sender im sender
    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "sender" }));
    };

    setSocket(socket);
  }, []);

  const startSendingVideo = async () => {
    if (!socket) return;
    //create a peer connection
    const pc = new RTCPeerConnection();
    //create an offer
    const offer = await pc.createOffer(); //sdp
    await pc.setLocalDescription(offer);
    socket?.send(
      JSON.stringify({ type: "createOffer", sdp: pc.localDescription })
    );
    socket.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "createAnswer") {
        pc.setRemoteDescription(data.sdp);
      }
    };
  };

  return (
    <div>
      <button onClick={startSendingVideo}>Send</button>
    </div>
  );
};
export default Sender;
