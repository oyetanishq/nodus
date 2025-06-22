import { useEffect } from "react";
import { useParams, useSearchParams } from "react-router";
import { iceServers } from "@/config/ice-servers";

// @ts-ignore
import Peer from "simple-peer/simplepeer.min.js";
import { type Instance } from "simple-peer";

export default function VideoCall() {
    const [searchParams] = useSearchParams();
    const params = useParams<{ code: string }>();

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (searchParams.get("initiator")) {
            console.log("initiator");
            console.log(window.location.href);

            const peer = new Peer({ initiator: true, trickle: false, config: { iceServers } }) as Instance;
            (window as any).peer = peer;

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
                        }
                        if (!success) alert(data.error);
                    });
            });

            peer.on("connect", () => console.log("connected"));
            peer.on("close", () => console.log("close"));
        } else {
            console.log("receiver");
            const peer = new Peer({ initiator: false, trickle: false, config: { iceServers } }) as Instance;
            (window as any).peer = peer;

            interval = setInterval(() => {
                fetch(`${import.meta.env.VITE_API_URL}/session/${params.code}`)
                    .then(async (response) => {
                        return { success: response.status === 200, data: await response.json() };
                    })
                    .then(({ success, data }) => {
                        if (success && data.peer1.length > 0) {
                            clearInterval(interval);
                            peer.signal(JSON.parse(data.peer1));
                        }
                    });
            }, 2000);

            peer.on("signal", async (data) => {
                await fetch(`${import.meta.env.VITE_API_URL}/session/${params.code}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ peer2: JSON.stringify(data) }),
                })
                    .then(async (response) => {
                        return { success: response.status === 200, data: await response.json() };
                    })
                    .then(({ success, data }) => {
                        if (!success) alert(data.error);
                    });
            });

            peer.on("connect", () => console.log("connected"));
            peer.on("close", () => console.log("close"));
        }

        return () => clearInterval(interval);
    }, []);

    return (
        <div>
            <div>video call</div>
        </div>
    );
}
