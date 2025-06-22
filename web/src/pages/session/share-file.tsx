import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router";
import { iceServers } from "@/config/ice-servers";

// @ts-ignore
import Peer from "simple-peer/simplepeer.min.js";
import { type Instance } from "simple-peer";
import { ClipboardCopy } from "lucide-react";
import { copyToClipboard } from "@/utils/copy";

export default function ShareFile() {
    const [connected, setConnected] = useState(false);
    const [searchParams] = useSearchParams();
    const [sender] = useState(searchParams.get("initiator") === "true");
    const fileRef = useRef<File>(null);
    const [file, setFile] = useState<File>();
    const [peer, setPeer] = useState<Instance | null>(null);
    const [fileInfo, setFileInfo] = useState<{ name: string; type: string; size: number } | null>(null);
    const [fileChunks, setFileChunks] = useState<Uint8Array[]>([]);
    const [_, setReceivedSize] = useState(0);
    const [downloadReady, setDownloadReady] = useState(false);
    const [progress, setProgress] = useState(0);
    const params = useParams<{ code: string }>();

    useEffect(() => {
        (fileRef.current as any) = file;
    }, [file]);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        const isInitiator = searchParams.get("initiator") === "true";
        const newPeer = new Peer({ initiator: isInitiator, trickle: false, config: { iceServers } }) as Instance;
        setPeer(newPeer);
        (window as any).peer = newPeer;

        if (isInitiator) {
            newPeer.on("signal", async (data) => {
                await fetch(`${import.meta.env.VITE_API_URL}/session/${params.code}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ peer1: JSON.stringify(data) }),
                }).then(async (res) => {
                    if (res.ok) {
                        interval = setInterval(() => {
                            fetch(`${import.meta.env.VITE_API_URL}/session/${params.code}`)
                                .then((res) => res.json())
                                .then((data) => {
                                    if (data.peer2?.length > 0) {
                                        clearInterval(interval);
                                        newPeer.signal(JSON.parse(data.peer2));
                                    }
                                });
                        }, 2000);
                    } else {
                        const data = await res.json();
                        alert(data.error);
                    }
                });
            });

            newPeer.on("connect", () => {
                console.log("connected");
                setConnected(true);
            });
            newPeer.on("close", () => console.log("close"));

            newPeer.on("data", async (data: Uint8Array) => {
                const msg = data.toString();
                console.log(msg);
                if (msg === "request_file_info" && fileRef.current) {
                    const metadata = {
                        name: fileRef.current.name,
                        size: fileRef.current.size,
                        type: fileRef.current.type,
                    };
                    newPeer.send(JSON.stringify({ type: "file_info", metadata }));
                }

                if (msg === "start_file_transfer" && fileRef.current) {
                    const chunkSize = 16 * 1024; // 16KB
                    const reader = new FileReader();
                    let offset = 0;

                    reader.onload = () => {
                        const buffer = new Uint8Array(reader.result as ArrayBuffer);
                        newPeer.send(buffer);
                        offset += chunkSize;
                        if (offset < (fileRef.current as File).size) {
                            readSlice();
                        } else {
                            newPeer.send("end_of_file");
                        }
                    };

                    const readSlice = () => {
                        const slice = (fileRef.current as File).slice(offset, offset + chunkSize);
                        reader.readAsArrayBuffer(slice);
                    };

                    readSlice();
                }
            });
        } else {
            interval = setInterval(() => {
                fetch(`${import.meta.env.VITE_API_URL}/session/${params.code}`)
                    .then((res) => res.json())
                    .then((data) => {
                        if (data.peer1?.length > 0) {
                            clearInterval(interval);
                            newPeer.signal(JSON.parse(data.peer1));
                        }
                    });
            }, 2000);

            newPeer.on("signal", async (data) => {
                await fetch(`${import.meta.env.VITE_API_URL}/session/${params.code}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ peer2: JSON.stringify(data) }),
                });
            });

            newPeer.on("connect", () => {
                console.log("connected");
                setConnected(true);
            });

            newPeer.on("data", (data: Uint8Array) => {
                const str = data.toString();
                console.log(str);

                try {
                    const parsed = JSON.parse(str);
                    if (parsed.type === "file_info") {
                        setFileInfo(parsed.metadata);
                    }
                } catch {
                    if (str === "end_of_file") {
                        setDownloadReady(true);
                        return;
                    }

                    // Receiving binary file chunks
                    setFileChunks((chunks) => {
                        const updated = [...chunks, data];
                        const newSize = updated.reduce((acc, chunk) => acc + chunk.length, 0);
                        setReceivedSize(newSize);
                        if (fileInfo) {
                            setProgress((newSize / fileInfo.size) * 100);
                        }
                        return updated;
                    });
                }
            });
        }

        return () => clearInterval(interval);
    }, []);

    const downloadFile = () => {
        if (!peer) return;
        setFileChunks([]);
        setReceivedSize(0);
        setDownloadReady(false);
        peer.send("start_file_transfer");
    };

    const askFileInfo = () => {
        if (!peer) return;
        peer.send("request_file_info");
    };

    const saveFile = () => {
        const blob = new Blob(fileChunks, { type: fileInfo?.type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileInfo?.name || "downloaded_file";
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-2">Peer-to-Peer File Transfer</h2>

            {sender && (
                <div className="mb-4">
                    <input
                        type="file"
                        onChange={(e) => {
                            const selected = e.target.files?.[0];
                            if (selected) setFile(selected);
                        }}
                    />
                    {file && (
                        <div className="mt-2 text-sm text-gray-600">
                            Selected: {file.name} ({(file.size / 1024 / 1000).toFixed(2)} MB)
                        </div>
                    )}
                    <div
                        onClick={() => {
                            {
                                file && copyToClipboard(`${window.location.href.split("?")[0]}`);
                            }
                        }}
                        className={`flex gap-2 justify-center items-center py-3 px-2 rounded-md border border-secondary bg-secondary/10 hover:bg-secondary/20 active:bg-secondary/10 duration-300 text-secondary mt-5 ${
                            file ? "cursor-pointer" : "cursor-not-allowed"
                        }`}
                    >
                        {file ? <span>CODE: {params.code?.toUpperCase()}</span> : <span>select file to show code</span>}
                        <ClipboardCopy className="size-4" />
                    </div>
                </div>
            )}

            {!sender && (
                <div className="space-y-4">
                    {!fileInfo && connected && (
                        <button onClick={askFileInfo} className="px-4 py-2 bg-blue-500 text-white rounded">
                            Ask for File Info
                        </button>
                    )}

                    {fileInfo && (
                        <div className="text-sm">
                            <div>
                                📄 <strong>Name:</strong> {fileInfo.name}
                            </div>
                            <div>
                                📦 <strong>Size:</strong> {(fileInfo.size / 1024).toFixed(2)} KB
                            </div>

                            <button onClick={downloadFile} className="mt-2 px-4 py-2 bg-green-600 text-white rounded">
                                Download File
                            </button>

                            {progress > 0 && !downloadReady && <div className="mt-2 text-gray-700">Receiving: {progress.toFixed(2)}%</div>}

                            {downloadReady && (
                                <button onClick={saveFile} className="mt-2 px-4 py-2 bg-purple-600 text-white rounded">
                                    Save File
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
