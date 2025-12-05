// src/components/main/hooks/useStaticLeaves.js
import { useEffect, useState } from "react";

export default function useStaticLeaves(currentSection) {
    const [staticLeaves, setStaticLeaves] = useState([]);

    useEffect(() => {
        if (currentSection !== 0) return;

        const leafColors = ["#F1F7AD", "#B6BE5C", "#99A237"];

        const createStaticLeaves = () => {
            const leafCount = Math.floor(Math.random() * 4) + 4;
            const newLeaves = Array.from({ length: leafCount }, (_, i) => ({
                id: Date.now() + i,
                left: Math.random() * 25,
                top: 10 + Math.random() * 40,
                duration: 5 + Math.random() * 3,
                size: 6 + Math.random() * 4,
                rotation: -15 + Math.random() * 30,
                delay: i * 0.25,
                color: leafColors[Math.floor(Math.random() * leafColors.length)],
            }));
            setStaticLeaves(newLeaves);
        };

        createStaticLeaves();
        const interval = setInterval(createStaticLeaves, 8000);

        return () => clearInterval(interval);
    }, [currentSection]);

    return staticLeaves;
}
