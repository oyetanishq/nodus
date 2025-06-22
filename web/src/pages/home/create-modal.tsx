import Modal, { type ModalProps } from "@/components/modal";
import { useState } from "react";
import { Loader } from "lucide-react";
import { useNavigate } from "react-router";

interface CreateModalProps extends ModalProps {}

export default function CreateModal({ isOpen, setIsOpen }: CreateModalProps) {
    const [creating, setCreating] = useState<"video-call" | "share-file" | "none">("none");
    const navigate = useNavigate();

    const handleCreatingRoom = async (type: "video-call" | "share-file") => {
        try {
            setCreating(type);

            await fetch(`${import.meta.env.VITE_API_URL}/session/unique`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ feature_type: type }),
            })
                .then(async (response) => {
                    return { success: response.status === 201, data: await response.json() };
                })
                .then(({ success, data }) => {
                    if (success) navigate(`/session/${type}/${data.id}?initiator=true`);
                    else alert(data.error);
                });
        } catch (error) {
            console.log((error as Error).message);
        } finally {
            setCreating("none");
        }
    };

    return (
        <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
            <div className="flex flex-col items-center justify-center gap-5 rounded-md p-5">
                <div>
                    <h1 className="text-xl font-light tracking-widest text-center text-gray-800">CREATE SESSION</h1>
                </div>
                <div className="flex flex-col gap-4 w-full mt-3">
                    <div
                        onClick={async () => await handleCreatingRoom("video-call")}
                        className="min-w-24 h-11 flex justify-center items-center shadow-secondary shadow-2xl bg-primary border border-secondary rounded-md px-3 py-1 duration-300 hover:bg-primary/80 active:bg-primary cursor-pointer"
                    >
                        {!creating.includes("video-call") && <span className="text-gray-800">Video Call</span>}
                        {creating === "video-call" && <Loader className="animate-spin size-5" />}
                    </div>
                    <div
                        onClick={async () => await handleCreatingRoom("share-file")}
                        className="min-w-24 h-11 flex justify-center items-center shadow-secondary shadow-2xl bg-primary border border-secondary rounded-md px-3 py-1 duration-300 hover:bg-primary/80 active:bg-primary cursor-pointer"
                    >
                        {!creating.includes("share-file") && <span className="text-gray-800">Share File</span>}
                        {creating === "share-file" && <Loader className="animate-spin size-5" />}
                    </div>
                </div>
            </div>
        </Modal>
    );
}
