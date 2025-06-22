import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router";
import { iceServers } from "@/config/ice-servers";

import { Loader, Mic, MicOff, Video, VideoOff } from "lucide-react";

// @ts-ignore
import Peer from "simple-peer/simplepeer.min.js";
import { type Instance } from "simple-peer";

export default function VideoCall() {
    const [searchParams] = useSearchParams();
    const params = useParams<{ code: string }>();

    const [track, setTrack] = useState<{ audio: MediaStreamTrack; video: MediaStreamTrack } | null>(null);
    const [mute, setMute] = useState(false);
    const [videoOff, setVideoOff] = useState(false);

    const [connected, setConnected] = useState(false);
    const [isInitiator] = useState(searchParams.get("initiator") === "true");

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        let localStream: MediaStream;

        const setupMedia = async () => {
            try {
                localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setTrack({
                    audio: localStream.getAudioTracks()[0],
                    video: localStream.getVideoTracks()[0],
                });

                if (localVideoRef.current) localVideoRef.current.srcObject = localStream;

                const peer = new Peer({ initiator: isInitiator, trickle: false, config: { iceServers }, stream: localStream }) as Instance;
                (window as any).peer = peer;

                if (isInitiator) {
                    console.log("initiator");

                    peer.on("signal", async (data) => {
                        await fetch(`${import.meta.env.VITE_API_URL}/session/${params.code}`, {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ peer1: JSON.stringify(data) }),
                        })
                            .then(async (response) => {
                                return { success: response.status === 200, data: await response.json() };
                            })
                            .then(({ success, data }) => {
                                if (success) {
                                    interval = setInterval(() => {
                                        fetch(`${import.meta.env.VITE_API_URL}/session/${params.code}`)
                                            .then(async (response) => {
                                                return { success: response.status === 200, data: await response.json() };
                                            })
                                            .then(({ success, data }) => {
                                                if (success && data.peer2.length > 0) {
                                                    clearInterval(interval);
                                                    peer.signal(JSON.parse(data.peer2));
                                                }
                                            });
                                    }, 2000);
                                } else alert(data.error);
                            });
                    });
                } else {
                    console.log("receiver");

                    interval = setInterval(() => {
                        fetch(`${import.meta.env.VITE_API_URL}/session/${params.code}`)
                            .then((res) => res.json())
                            .then((data) => {
                                if (data.peer1?.length > 0) {
                                    clearInterval(interval);
                                    peer.signal(JSON.parse(data.peer1));
                                }
                            });
                    }, 2000);

                    peer.on("signal", async (data) => {
                        await fetch(`${import.meta.env.VITE_API_URL}/session/${params.code}`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ peer2: JSON.stringify(data) }),
                        });
                    });
                }

                peer.on("connect", () => setConnected(true));
                peer.on("close", () => setConnected(false));

                peer.on("stream", (remoteStream) => {
                    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
                });
            } catch (error) {
                console.error((error as Error).message);
            }
        };

        setupMedia();

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!track) return;

        track.audio.enabled = !mute;
        track.video.enabled = !videoOff;
    }, [mute, videoOff, track]);

    return (
        <main className="flex flex-col flex-1 w-full items-center justify-start px-3 sm:px-5 md:px-8 pb-3 sm:pb-5 md:pb-8">
            <div className="relative w-full flex-1 mb-4 px-4">
                {/* Fullscreen remove video */}
                {connected ? (
                    <video ref={remoteVideoRef} autoPlay muted playsInline className="absolute inset-0 w-full h-full object-cover border rounded-md scale-x-[-1]" />
                ) : (
                    <div className="flex justify-center items-center absolute inset-0 w-full h-full object-cover border border-gray-100 rounded-md shadow-2xl gap-2">
                        <span className="text-black tracking-wide">waiting for peer</span>
                        <Loader className="size-4 animate-spin" />
                    </div>
                )}
                {/* Small local video at bottom right */}
                <video ref={localVideoRef} autoPlay playsInline className="absolute bottom-4 right-4 w-1/4 aspect-video object-cover rounded-md shadow-lg scale-x-[-1]" />
            </div>

            {/* audio and video controls */}
            <div className="w-full flex justify-center items-center gap-4">
                <button type="button" className="p-2 rounded-md border cursor-pointer" onClick={() => setMute((s) => !s)}>
                    {mute ? <MicOff className="size-6" /> : <Mic className="size-6" />}
                </button>
                <button type="button" className="p-2 rounded-md border cursor-pointer" onClick={() => setVideoOff((s) => !s)}>
                    {videoOff ? <VideoOff className="size-6" /> : <Video className="size-6" />}
                </button>
            </div>
        </main>
    );
}
