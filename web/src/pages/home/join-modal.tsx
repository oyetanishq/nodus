import Modal, { type ModalProps } from "@/components/modal";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";

interface CreateModalProps extends ModalProps {}

export default function CreateModal({ isOpen, setIsOpen }: CreateModalProps) {
    const [code, setCode] = useState("");
    const navigate = useNavigate();

    const handleRedirect = (event: FormEvent) => {
        event.preventDefault();

        if (code.length !== 6) return alert("Please enter a valid six-digit code.");
        navigate(`/session/search/${code}`);
    };

    return (
        <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
            <div className="flex flex-col items-center justify-center gap-5 rounded-md p-5">
                <div>
                    <h1 className="text-xl font-light tracking-widest text-center text-gray-800">JOIN SESSION</h1>
                </div>
                <form onSubmit={handleRedirect} className="flex flex-col gap-4 w-full mt-3">
                    <div className="flex flex-col gap-2 sm:gap-1">
                        <span className="text-xs sm:text-sm font-medium">enter six digit code.</span>
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            required
                            placeholder="??????"
                            className="border border-secondary placeholder:text-center text-center outline-none tracking-[.5rem] font-semibold uppercase text-lg py-2 px-4 rounded-md"
                            minLength={6}
                            maxLength={6}
                        />
                    </div>
                    <button
                        className="min-w-24 h-11 shadow-secondary shadow-2xl bg-primary text-gray-800 border border-secondary rounded-md px-3 py-1 duration-300 hover:bg-primary/80 active:bg-primary cursor-pointer"
                        type="submit"
                    >
                        Redirect
                    </button>
                </form>
            </div>
        </Modal>
    );
}
