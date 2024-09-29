import { useEffect, useState } from "react";

const Sender = () => {
  const [socket, setsocket] = useState<WebSocket | null>(null);
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");
    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "sender" }));
    };
  }, []);
  function startSendingVideo() {
    //create an offer
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
