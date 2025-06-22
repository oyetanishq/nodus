import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import rollupNodePolyFill from "rollup-plugin-node-polyfills";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            "@": resolve(__dirname, "src"),
            buffer: "rollup-plugin-node-polyfills/polyfills/buffer-es6",
            process: "rollup-plugin-node-polyfills/polyfills/process-es6.js",
        },
    },
    optimizeDeps: {
        include: ["buffer", "process"],
    },
    build: {
        rollupOptions: {
            // @ts-ignore
            plugins: [rollupNodePolyFill()],
        },
    },
});
