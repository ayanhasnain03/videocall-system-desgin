import { useEffect, useState } from "react";

const Sender = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [pc, setPC] = useState<RTCPeerConnection | null>(null);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");
    setSocket(socket);
    socket.onopen = () => {
      socket.send(
        JSON.stringify({
          type: "sender",
        })
      );
    };

    // Cleanup WebSocket connection on component unmount
    return () => {
      socket.close();
    };
  }, []);

  const initiateConn = async () => {
    if (!socket) {
      alert("Socket not found");
      return;
    }

    const pc = new RTCPeerConnection();
    setPC(pc);

    socket.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "createAnswer") {
        await pc.setRemoteDescription(new RTCSessionDescription(message.sdp));
      } else if (message.type === "iceCandidate") {
        await pc.addIceCandidate(new RTCIceCandidate(message.candidate));
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket?.send(
          JSON.stringify({
            type: "iceCandidate",
            candidate: event.candidate,
          })
        );
      }
    };

    pc.onnegotiationneeded = async () => {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket?.send(
        JSON.stringify({
          type: "createOffer",
          sdp: pc.localDescription,
        })
      );
    };

    // Get camera stream and add tracks to the peer connection
    getCameraStreamAndSend(pc);
  };

  const getCameraStreamAndSend = async (pc: RTCPeerConnection) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement("video");
      video.srcObject = stream;
      video.play();
      document.body.appendChild(video); // Append video element to the body

      // Add each track of the stream to the peer connection
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });
    } catch (error) {
      console.error("Error accessing media devices.", error);
    }
  };

  return (
    <div>
      Sender
      <button onClick={initiateConn}> Send data </button>
    </div>
  );
};

export default Sender;
