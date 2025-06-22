import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./global.css";

import { BrowserRouter, Route, Routes } from "react-router";

import Header from "@/components/header";

import Home from "@/pages/home/index";
import VideoCall from "@/pages/session/video-call";
import ShareFile from "@/pages/session/share-file";

const App = () => {
    return (
        <StrictMode>
            <BrowserRouter>
                <Header />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/session/">
                        <Route path="video-call/:code" element={<VideoCall />} />
                        <Route path="share-file/:code" element={<ShareFile />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </StrictMode>
    );
};

createRoot(document.getElementById("root")!).render(<App />);
