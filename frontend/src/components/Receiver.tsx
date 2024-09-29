import { useEffect, useRef } from "react";

const Receiver = () => {
  const pcRef = useRef<RTCPeerConnection | null>(null); // Reference for RTCPeerConnection
  const videoRef = useRef<HTMLVideoElement | null>(null); // Reference for video element

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");

    socket.onopen = () => {
      console.log("WebSocket connection established.");
      socket.send(JSON.stringify({ type: "receiver" }));
    };

    socket.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      console.log("Received message:", message);

      if (message.type === "createOffer") {
        // Create a new RTCPeerConnection only when an offer is received
        pcRef.current = new RTCPeerConnection();

        pcRef.current.onicecandidate = (event) => {
          if (event.candidate) {
            socket.send(
              JSON.stringify({
                type: "iceCandidate",
                candidate: event.candidate,
              })
            );
          }
        };

        pcRef.current.ontrack = (event) => {
          if (videoRef.current) {
            // Attach the received stream to the existing video element
            videoRef.current.srcObject = event.streams[0];
            videoRef.current.play(); // Ensure video plays
          }
        };

        try {
          // Set the remote description from the offer received
          await pcRef.current.setRemoteDescription(
            new RTCSessionDescription(message.sdp)
          );

          // Create an answer and set it as local description
          const answer = await pcRef.current.createAnswer();
          await pcRef.current.setLocalDescription(answer);

          // Send the answer back to the sender
          socket.send(
            JSON.stringify({
              type: "createAnswer",
              sdp: pcRef.current.localDescription,
            })
          );
        } catch (error) {
          console.error("Error handling offer:", error);
        }
      } else if (message.type === "iceCandidate" && pcRef.current) {
        // Add the received ICE candidate to the existing peer connection
        try {
          await pcRef.current.addIceCandidate(
            new RTCIceCandidate(message.candidate)
          );
        } catch (error) {
          console.error("Error adding ICE candidate:", error);
        }
      }
    };

    // Cleanup function to close the WebSocket and PeerConnection when the component unmounts
    return () => {
      socket.close();
      pcRef.current?.close();
    };
  }, []);

  return (
    <div>
      <h1>Receiver</h1>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{ width: "100%", height: "auto" }}
      />
    </div>
  );
};

export default Receiver;
