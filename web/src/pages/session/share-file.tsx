import { useEffect, useRef, useState, type MouseEvent, type DragEvent, type ChangeEvent } from "react";
import { useParams, useSearchParams } from "react-router";
import { iceServers } from "@/config/ice-servers";

// @ts-ignore
import Peer from "simple-peer/simplepeer.min.js";
import { type Instance } from "simple-peer";
import { ClipboardCopy, Loader } from "lucide-react";
import { copyToClipboard } from "@/utils/copy";
import { saveFile } from "@/utils/download-file";

export default function ShareFile() {
    const [connected, setConnected] = useState(false);
    const [searchParams] = useSearchParams();
    const [isInitiator] = useState(searchParams.get("initiator") === "true");
    const inputRef = useRef<HTMLInputElement>(null);
    const fileRef = useRef<File>(null);
    const [file, setFile] = useState<File>();
    const [peer, setPeer] = useState<Instance | null>(null);
    const [fileInfo, setFileInfo] = useState<{ name: string; type: string; size: number } | null>(null);
    const [fileChunks, setFileChunks] = useState<Uint8Array[]>([]);
    const [downloadReady, setDownloadReady] = useState(false);
    const [newSize, setNewSize] = useState(0);
    const params = useParams<{ code: string }>();

    useEffect(() => {
        (fileRef.current as any) = file;
    }, [file]);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        const newPeer = new Peer({ initiator: isInitiator, trickle: false, config: { iceServers } }) as Instance;
        setPeer(newPeer);
        (window as any).peer = newPeer;

        if (isInitiator) {
            newPeer.on("signal", async (data) => {
                await fetch(`${import.meta.env.VITE_API_URL}/session/${params.code}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ peer1: JSON.stringify(data) }),
                })
                    .then(async (res) => {
                        return { success: res.status === 200, data: await res.json() };
                    })
                    .then(({ success, data }) => {
                        if (success) {
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
                        } else alert(data.error);
                    });
            });

            newPeer.on("data", async (data: Uint8Array) => {
                const msg = data.toString();
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

                    const sendChunk = (buffer: Uint8Array) => {
                        // Wait until bufferedAmount drops below threshold
                        const waitForDrain = () => {
                            return new Promise<void>((resolve) => {
                                const check = () => {
                                    if ((newPeer as any)._channel.bufferedAmount < 8 * 1024 * 1024) resolve();
                                    else setTimeout(check, 50); // check every 50ms
                                };
                                check();
                            });
                        };

                        waitForDrain().then(() => {
                            newPeer.send(buffer);
                            offset += chunkSize;

                            if (offset < (fileRef.current as File).size) readSlice();
                            else newPeer.send("end_of_file");
                        });
                    };

                    reader.onload = () => sendChunk(new Uint8Array(reader.result as ArrayBuffer));

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

            newPeer.on("data", (data: Uint8Array) => {
                const str = data.toString();

                try {
                    const parsed = JSON.parse(str);
                    if (parsed.type === "file_info") setFileInfo(parsed.metadata);
                } catch {
                    if (str === "end_of_file") {
                        setDownloadReady(true);
                        return;
                    }

                    // Receiving binary file chunks
                    setFileChunks((chunks) => {
                        const updated = [...chunks, data];
                        const newSize = updated.reduce((acc, chunk) => acc + chunk.length, 0);
                        setNewSize(newSize);

                        return updated;
                    });
                }
            });
        }

        newPeer.on("connect", () => setConnected(true));
        newPeer.on("close", () => setConnected(false));

        return () => clearInterval(interval);
    }, []);

    const downloadFile = () => {
        if (!peer) return;
        setFileChunks([]);
        setDownloadReady(false);
        peer.send("start_file_transfer");
    };

    const askFileInfo = () => peer && peer.send("request_file_info");

    /**
     * Handle new files update, triggered from either drag and drop or click
     */
    const handleFileChangeDragOrClick = (event: MouseEvent<HTMLDivElement> | DragEvent<HTMLDivElement>) => {
        event.preventDefault();

        if ("dataTransfer" in event && event.dataTransfer?.files?.length) setFile(event.dataTransfer.files[0]);
        else inputRef.current?.click();
    };

    /**
     * Handle new files update, triggered from click on input box, after image loaded
     */
    const handleFileChangeInput = (event: ChangeEvent<HTMLInputElement>) => {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];

        if (file) setFile(file);
    };

    return (
        <main className="flex flex-col flex-1 w-full items-center justify-center px-3 sm:px-5 md:px-8 pb-3 sm:pb-5 md:pb-8">
            <h2 className="text-xl font-bold">Peer-to-Peer File Transfer</h2>
            {connected ? (
                <span className="text-sm text-green-800 my-4">connected to peer</span>
            ) : (
                <div className="flex gap-2 justify-center items-center my-4">
                    <span className="text-sm text-red-800 tracking-wide">waiting for peer</span>
                    <Loader className="size-4 animate-spin text-red-800" />{" "}
                </div>
            )}

            {isInitiator ? (
                <div className="mb-4">
                    <input ref={inputRef} type="file" className="hidden" onChange={handleFileChangeInput} />
                    <div
                        className="w-full h-12 flex justify-start items-center border border-gray-300 border-dashed rounded-lg overflow-hidden cursor-pointer duration-300"
                        onClick={handleFileChangeDragOrClick}
                    >
                        <div className="h-full w-full bg-gray-200 flex justify-center items-center text-xs">Choose File or Drop</div>
                    </div>
                    {file && (
                        <div className="mt-4 text-sm text-gray-600">
                            Selected: {file.name} ({(file.size / 1024 / 1000).toFixed(2)} MB)
                        </div>
                    )}
                    <div
                        onClick={() => file && copyToClipboard(`${window.location.href.split("?")[0]}`)}
                        className={`flex gap-2 justify-center items-center py-3 px-2 rounded-md border border-secondary bg-secondary/10 hover:bg-secondary/20 active:bg-secondary/10 duration-300 text-secondary mt-5 ${
                            file ? "cursor-pointer" : "cursor-not-allowed"
                        }`}
                    >
                        {file ? <span>CODE: {params.code?.toUpperCase()}</span> : <span>select file to show code</span>}
                        <ClipboardCopy className="size-4" />
                    </div>
                </div>
            ) : (
                <div className="w-full max-w-xs">
                    {!fileInfo && (
                        <button
                            onClick={askFileInfo}
                            className={`w-full flex gap-2 justify-center items-center py-3 px-2 rounded-md bg-secondary/10 hover:bg-secondary/20 active:bg-secondary/10 duration-300 text-secondary mt-5 ${
                                connected ? "cursor-pointer" : "opacity-50 cursor-not-allowed"
                            }`}
                        >
                            Ask for File Info
                        </button>
                    )}

                    {fileInfo && (
                        <div className="text-sm flex flex-col items-center justify-center gap-4">
                            <div>
                                📄 <strong className="truncate">Name:</strong> {fileInfo.name}
                            </div>
                            <div>
                                📦 <strong>Size:</strong> {(fileInfo.size / 1024 / 1024).toFixed(2)} MB
                            </div>

                            <div className="w-full mt-2 bg-green-300/50 rounded-md h-4 overflow-hidden relative">
                                <div className="h-full bg-secondary transition-all duration-300 ease-in-out" style={{ width: `${(newSize / fileInfo.size) * 100}%` }} />
                                <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-green-950">
                                    {newSize > 0 ? `${((newSize / fileInfo.size) * 100).toFixed(2)}% (${(newSize / 1024 / 1024).toFixed(2)} MB)` : "0 MB"}
                                </span>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={downloadFile}
                                    className="mt-2 px-4 py-2 bg-secondary/10 hover:bg-secondary/20 active:bg-secondary/10 duration-300 text-secondary rounded-md cursor-pointer"
                                >
                                    Download File
                                </button>

                                {downloadReady && (
                                    <button
                                        onClick={() => saveFile(fileChunks, fileInfo.name, { type: fileInfo.type })}
                                        className="mt-2 px-4 py-2 bg-indigo-800/10 hover:bg-indigo-800/20 active:bg-indigo-800/10 duration-300 text-indigo-800 rounded-md cursor-pointer"
                                    >
                                        Save File
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </main>
    );
}
