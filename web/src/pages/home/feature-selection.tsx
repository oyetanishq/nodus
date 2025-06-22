import { useState } from "react";
import CreateModal from "./create-modal";
import JoinModal from "./join-modal";

export default function FeatureSelection() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

    return (
        <div className="flex flex-col items-center justify-center gap-5 border border-secondary rounded-md p-5">
            <div>
                <h1 className="text-xl font-light text-center text-gray-800">video call or share a file?</h1>
            </div>
            <div className="flex gap-4">
                <button
                    className="min-w-24 shadow-secondary shadow-2xl bg-primary text-gray-800 border border-secondary rounded-md px-3 py-1 duration-300 hover:bg-primary/80 active:bg-primary cursor-pointer"
                    type="button"
                    onClick={() => setIsCreateModalOpen(true)}
                >
                    create
                </button>
                <button
                    className="min-w-24 shadow-secondary shadow-2xl bg-primary text-gray-800 border border-secondary rounded-md px-3 py-1 duration-300 hover:bg-primary/80 active:bg-primary cursor-pointer"
                    type="button"
                    onClick={() => setIsJoinModalOpen(true)}
                >
                    join
                </button>
            </div>

            <CreateModal isOpen={isCreateModalOpen} setIsOpen={(state) => setIsCreateModalOpen(state)} />
            <JoinModal isOpen={isJoinModalOpen} setIsOpen={(state) => setIsJoinModalOpen(state)} />
        </div>
    );
}
