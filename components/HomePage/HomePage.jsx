"use client";
import { useState, useRef } from "react";
import io from "socket.io-client";

export default function HomePage() {
  const [socket, setSocket] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const servers = {
    iceServers: [
      {
        urls: "stun:stun.l.google.com:19302",
      },
    ],
  };

  const initialize = () => {
    const newSocket = io("http://localhost:4000");
    setSocket(newSocket);

    const pc = new RTCPeerConnection(servers);
    setPeerConnection(pc);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        newSocket.emit("candidate", event.candidate);
      }
    };

    pc.ontrack = (event) => {
      remoteVideoRef.current.srcObject = event.streams[0];
    };

    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      localVideoRef.current.srcObject = stream;
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    });

    newSocket.on("offer", async (offer) => {
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      newSocket.emit("answer", answer);
    });

    newSocket.on("answer", (answer) => {
      pc.setRemoteDescription(new RTCSessionDescription(answer));
    });

    newSocket.on("candidate", (candidate) => {
      pc.addIceCandidate(new RTCIceCandidate(candidate));
    });
  };

  const createOffer = async () => {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.emit("offer", offer);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-800">
      <h1 className="text-3xl font-bold mb-8">Video Call App</h1>
      <div className="flex space-x-4 mb-6">
        <button
          onClick={initialize}
          className="px-6 py-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 transition"
        >
          Initialize
        </button>
        <button
          onClick={createOffer}
          className="px-6 py-2 bg-green-600 text-white rounded-md shadow-md hover:bg-green-700 transition"
        >
          Create Offer
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-black rounded-lg overflow-hidden shadow-md">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            className="w-full h-64 object-cover"
          />
          <p className="text-center text-white bg-gray-800 py-2">Local Video</p>
        </div>
        <div className="bg-black rounded-lg overflow-hidden shadow-md">
          <video
            ref={remoteVideoRef}
            autoPlay
            className="w-full h-64 object-cover"
          />
          <p className="text-center text-white bg-gray-800 py-2">Remote Video</p>
        </div>
      </div>
    </div>
  );
}
