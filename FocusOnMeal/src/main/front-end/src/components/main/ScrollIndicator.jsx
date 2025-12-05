import { useState, useEffect, useRef, useCallback } from "react";

const useParallaxScroll = ({ containerRef, sections }) => {
    const [currentSection, setCurrentSection] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    // ⭐ 캐싱 / Ref 관리
    const rafIdRef = useRef(null);
    const isSnapingRef = useRef(false);

    const lastScrollTopRef = useRef(0);
    const wheelAccumRef = useRef(0);
    const wheelTimeoutRef = useRef(null);

    // ⭐ 섹션 높이를 캐싱해서 DOM 조회 최소화
    const sectionHeightsRef = useRef([]);
    const sectionOffsetsRef = useRef([]);

    /* ------------------------------------------------------------------
     * ❗ mount 시 섹션 height / offset 계산 (DOM 1회만 조회)
     * ------------------------------------------------------------------ */
    const calculateSectionHeights = useCallback(() => {
        const container = containerRef.current;
        if (!container) return;

        const sectionElements = container.querySelectorAll("[data-section-index]");
        const heights = [];
        const offsets = [];

        let accumulated = 0;

        sections.forEach((sec, i) => {
            let h = 0;

            if (sectionElements[i]) {
                h = sectionElements[i].offsetHeight;
            } else if (sec.height === "auto") {
                h = 0;
            } else {
                h = window.innerHeight * sec.height;
            }

            heights.push(h);
            offsets.push(accumulated);
            accumulated += h;
        });

        sectionHeightsRef.current = heights;
        sectionOffsetsRef.current = offsets;
    }, [sections, containerRef]);

    useEffect(() => {
        calculateSectionHeights();
        window.addEventListener("resize", calculateSectionHeights);

        return () => {
            window.removeEventListener("resize", calculateSectionHeights);
        };
    }, [calculateSectionHeights]);

    /* ------------------------------------------------------------------
     * 🎯 페이지 스냅 함수 (DOM 재계산 없이 빠르게)
     * ------------------------------------------------------------------ */
    const snapToSection = useCallback(
        (targetSection) => {
            if (isSnapingRef.current) return;
            const container = containerRef.current;
            if (!container) return;

            const offsets = sectionOffsetsRef.current;
            if (!offsets[targetSection] && offsets[targetSection] !== 0) return;

            isSnapingRef.current = true;
            setIsTransitioning(true);

            const targetScroll = offsets[targetSection];

            container.scrollTo({
                top: targetScroll,
                behavior: "smooth",
            });

            setTimeout(() => {
                isSnapingRef.current = false;
                setIsTransitioning(false);
            }, 1000);
        },
        [containerRef]
    );

    /* ------------------------------------------------------------------
     * 📌 스크롤 이벤트 최적화
     * ------------------------------------------------------------------ */
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        let ticking = false;

        const updateScroll = () => {
            const scrollTop = container.scrollTop;
            lastScrollTopRef.current = scrollTop;

            const heights = sectionHeightsRef.current;
            const offsets = sectionOffsetsRef.current;

            let newSection = currentSection;

            // ⭐ 가장 많이 보이는 섹션 계산
            for (let i = 0; i < heights.length; i++) {
                const middle = offsets[i] + heights[i] / 2;
                if (scrollTop < middle) {
                    newSection = i;
                    break;
                }
                if (i === heights.length - 1) newSection = i;
            }

            // 변경된 경우에만 업데이트
            if (newSection !== currentSection) {
                setCurrentSection(newSection);
            }

            ticking = false;
        };

        const handleScroll = () => {
            if (!ticking) {
                ticking = true;
                rafIdRef.current = requestAnimationFrame(updateScroll);
            }
        };

        /* ------------------------------------------------------------------
         * 🖱️ wheel 이벤트 - 1,4페이지 자유 스크롤 / 2,3 페이지만 스냅
         * ------------------------------------------------------------------ */
        const handleWheel = (e) => {
            const sec = currentSection;

            // ⭐ 1페이지 or 마지막 페이지 → 스냅 없이 자유 스크롤
            if (sec === 0 || sec >= 3) return;

            // ⭐ 2~3페이지만 스냅 적용
            e.preventDefault();
            if (isSnapingRef.current || isTransitioning) return;

            const delta = e.deltaY;
            wheelAccumRef.current += delta;

            clearTimeout(wheelTimeoutRef.current);
            wheelTimeoutRef.current = setTimeout(() => {
                wheelAccumRef.current = 0;
            }, 120);

            const THRESHOLD = 90;

            if (Math.abs(wheelAccumRef.current) >= THRESHOLD) {
                if (wheelAccumRef.current > 0 && sec < sections.length - 1) {
                    snapToSection(sec + 1);
                } else if (wheelAccumRef.current < 0 && sec > 0) {
                    snapToSection(sec - 1);
                }
                wheelAccumRef.current = 0;
            }
        };

        container.addEventListener("scroll", handleScroll, { passive: true });
        container.addEventListener("wheel", handleWheel, { passive: false });

        return () => {
            container.removeEventListener("scroll", handleScroll);
            container.removeEventListener("wheel", handleWheel);
            if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
            clearTimeout(wheelTimeoutRef.current);
        };
    }, [sections, currentSection, isTransitioning, snapToSection, containerRef]);

    /* ------------------------------------------------------------------
     * 🖼️ 패럴랙스 계산 최적화
     * ------------------------------------------------------------------ */
    const getParallaxTransform = useCallback(
        (speed, initialOffset = 0, shouldScale = false) => {
            // ⭐ 첫 페이지 아니면 패럴랙스 완전 정지
            if (currentSection !== 0) {
                return {
                    transform: shouldScale
                        ? `translate3d(0, ${initialOffset}px, 0) scale(1)`
                        : `translate3d(0, ${initialOffset}px, 0)`,
                    opacity: 0,
                    pointerEvents: "none",
                };
            }

            const container = containerRef.current;
            if (!container) return {};

            const scroll = container.scrollTop;
            const height = sectionHeightsRef.current[0] || window.innerHeight;

            const translateY = -scroll * speed + initialOffset;

            if (shouldScale) {
                const scale = 1 + (scroll / height) * 1.0;
                return {
                    transform: `translate3d(0, ${translateY}px, 0) scale(${scale})`,
                    opacity: 1,
                };
            }

            return {
                transform: `translate3d(0, ${translateY}px, 0)`,
                opacity: 1,
            };
        },
        [currentSection, containerRef]
    );

    return {
        currentSection,
        isTransitioning,
        snapToSection,
        getParallaxTransform,
    };
};

export default useParallaxScroll;
