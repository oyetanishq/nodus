import { useEffect } from "react";
import FeatureSelection from "./feature-selection";

export default function Home() {
    useEffect(() => {
        /*
         * dude server do cold start, if it didn't tackle request for long
         * so it's better to hit before user name any request
         */
        (async () => await fetch(`${import.meta.env.VITE_API_URL}`))();
    }, []);

    return (
        <main className="flex flex-1 w-full items-center justify-center px-3 sm:px-5 md:px-8">
            <FeatureSelection />
        </main>
    );
}
