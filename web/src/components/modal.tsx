import { type ReactNode } from "react";
import { X } from "lucide-react";

export interface ModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    children?: ReactNode;
}

export default function Modal({ isOpen, setIsOpen, children }: ModalProps) {
    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-[2px] ${
                isOpen ? "visible opacity-100" : "invisible opacity-0"
            } transition-all duration-200`}
        >
            <div className="bg-white border border-primary p-3 rounded-md shadow-lg max-w-md w-full mx-6 sm:mx-8">
                <div className="w-full flex justify-end items-center">
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-1 rounded-full group hover:shadow active:shadow-none duration-300 bg-primary/30 cursor-pointer"
                        type="button"
                    >
                        <X className="size-4 duration-300 text-green-700 group-hover:text-green-900 group-active:text-green-700" />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}
