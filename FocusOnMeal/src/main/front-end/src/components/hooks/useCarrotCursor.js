// src/components/main/hooks/useCarrotCursor.js
import { useEffect } from "react";

export default function useCarrotCursor() {
    useEffect(() => {
        const carrotCursor = document.createElement("div");
        carrotCursor.id = "carrot-cursor";
        carrotCursor.innerText = "🥕";
        document.body.appendChild(carrotCursor);

        Object.assign(carrotCursor.style, {
            position: "fixed",
            left: "0px",
            top: "0px",
            fontSize: "34px",
            pointerEvents: "none",
            zIndex: "999999",
            userSelect: "none",
            transform: "translate(-70%, -40%) rotate(95deg)",
        });

        const moveCursor = (e) => {
            carrotCursor.style.left = `${e.clientX}px`;
            carrotCursor.style.top = `${e.clientY}px`;
        };

        window.addEventListener("mousemove", moveCursor);

        return () => {
            window.removeEventListener("mousemove", moveCursor);
            carrotCursor.remove();
        };
    }, []);
}
