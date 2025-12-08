import { useEffect } from "react";

export default function useCarrotCursor() {
    useEffect(() => {
        // 1. 당근 커서 DIV 생성
        const carrotCursor = document.createElement("div");
        carrotCursor.id = "carrot-cursor";
        carrotCursor.innerText = "🥕";
        document.body.appendChild(carrotCursor);

        // 2. 당근 커서 스타일 설정
        Object.assign(carrotCursor.style, {
            position: "fixed",
            left: "0px",
            top: "0px",
            fontSize: "34px",
            pointerEvents: "none", // 클릭이 당근을 통과하여 뒤에 있는 요소를 클릭하게 함
            zIndex: "999999",
            userSelect: "none",
            transform: "translate(-70%, -40%) rotate(95deg)", // 당근 끝을 마우스 포인트에 맞춤
        });

        // 3. 기본 마우스 커서 숨기기 (모든 요소에 강제 적용)
        const cursorStyle = document.createElement("style");
        cursorStyle.innerHTML = `
            * {
                cursor: none !important;
            }
        `;
        document.head.appendChild(cursorStyle);

        // 4. 마우스 움직임 이벤트
        const moveCursor = (e) => {
            carrotCursor.style.left = `${e.clientX}px`;
            carrotCursor.style.top = `${e.clientY}px`;
        };

        window.addEventListener("mousemove", moveCursor);

        // 5. 뒷정리 (컴포넌트가 사라질 때)
        return () => {
            window.removeEventListener("mousemove", moveCursor);
            carrotCursor.remove();
            cursorStyle.remove(); // 스타일 태그를 지워서 다시 원래 커서가 나오게 함
        };
    }, []);
}