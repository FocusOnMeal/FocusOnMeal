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
        let snapTimeout = null;

        const updateScroll = () => {
            const scrollTop = container.scrollTop;
            lastScrollTopRef.current = scrollTop;

            const heights = sectionHeightsRef.current;
            const offsets = sectionOffsetsRef.current;

            let newSection = 0;

            // 🔥 현재 섹션 정확하게 판단 (중간 지점 기준)
            for (let i = 0; i < sections.length - 1; i++) {
                const sectionEnd = offsets[i] + heights[i];
                
                // 현재 섹션의 80% 이상 지나면 다음 섹션으로 간주
                if (scrollTop >= offsets[i] && scrollTop < offsets[i] + heights[i] * 0.8) {
                    newSection = i;
                    break;
                } else if (scrollTop >= offsets[i] + heights[i] * 0.8 && scrollTop < sectionEnd) {
                    // 80~100% 구간이면 다음 섹션으로 간주
                    newSection = Math.min(i + 1, sections.length - 1);
                    break;
                }
            }

            // 마지막 섹션 처리
            if (scrollTop >= offsets[sections.length - 1]) {
                newSection = sections.length - 1;
            }

            // 변경된 경우에만 업데이트
            if (newSection !== currentSection) {
                setCurrentSection(newSection);
            }

            // 🔥 첫 페이지에서 90% 이상 스크롤하면 자동으로 2페이지로 스냅
            if (currentSection === 0 && !isSnapingRef.current) {
                const firstSectionHeight = heights[0];
                const scrollProgress = scrollTop / firstSectionHeight;
                
                if (scrollProgress > 0.92) { // 92% 이상 스크롤 시
                    clearTimeout(snapTimeout);
                    snapTimeout = setTimeout(() => {
                        if (!isSnapingRef.current) {
                            snapToSection(1);
                        }
                    }, 100);
                }
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
         * 🖱️ wheel 이벤트 - 부드러운 섹션 전환
         * ------------------------------------------------------------------ */
        const handleWheel = (e) => {
            const sec = currentSection;
            const scrollTop = container.scrollTop;
            const heights = sectionHeightsRef.current;
            const offsets = sectionOffsetsRef.current;

            // ⭐ 첫 페이지에서는 일정 지점 이후에만 스냅 적용
            if (sec === 0) {
                const firstSectionHeight = heights[0];
                const scrollProgress = scrollTop / firstSectionHeight;

                // 85% 이상 스크롤했고 아래로 스크롤 중이면 다음 섹션으로
                if (scrollProgress > 0.85 && e.deltaY > 0 && !isSnapingRef.current) {
                    e.preventDefault();
                    snapToSection(1);
                    return;
                }
                
                // 일반 스크롤 허용
                return;
            }

            // ⭐ 두 번째 페이지 - 정확한 위치 판단
            if (sec === 1) {
                const secondSectionStart = offsets[1];
                const secondSectionHeight = heights[1];
                const relativeScroll = scrollTop - secondSectionStart;
                const sectionProgress = relativeScroll / secondSectionHeight;

                // 현재 섹션의 20% 이하면 이전 섹션으로
                if (sectionProgress < 0.2 && e.deltaY < 0 && !isSnapingRef.current) {
                    e.preventDefault();
                    snapToSection(0);
                    return;
                }

                // 현재 섹션의 80% 이상이면 다음 섹션으로
                if (sectionProgress > 0.8 && e.deltaY > 0 && !isSnapingRef.current) {
                    e.preventDefault();
                    snapToSection(2);
                    return;
                }

                // 중간 구역에서는 스냅 적용
                e.preventDefault();
                if (isSnapingRef.current || isTransitioning) return;

                const delta = e.deltaY;
                wheelAccumRef.current += delta;

                clearTimeout(wheelTimeoutRef.current);
                wheelTimeoutRef.current = setTimeout(() => {
                    wheelAccumRef.current = 0;
                }, 120);

                const THRESHOLD = 100;

                if (Math.abs(wheelAccumRef.current) >= THRESHOLD) {
                    if (wheelAccumRef.current > 0) {
                        snapToSection(2);
                    } else {
                        snapToSection(0);
                    }
                    wheelAccumRef.current = 0;
                }
                return;
            }

            // ⭐ 세 번째 페이지
            if (sec === 2) {
                const thirdSectionStart = offsets[2];
                const thirdSectionHeight = heights[2];
                const relativeScroll = scrollTop - thirdSectionStart;
                const sectionProgress = relativeScroll / thirdSectionHeight;

                // 현재 섹션의 20% 이하면 이전 섹션으로
                if (sectionProgress < 0.2 && e.deltaY < 0 && !isSnapingRef.current) {
                    e.preventDefault();
                    snapToSection(1);
                    return;
                }

                // 현재 섹션의 80% 이상이면 다음 섹션으로
                if (sectionProgress > 0.8 && e.deltaY > 0 && !isSnapingRef.current) {
                    e.preventDefault();
                    snapToSection(3);
                    return;
                }

                // 중간 구역에서는 스냅 적용
                e.preventDefault();
                if (isSnapingRef.current || isTransitioning) return;

                const delta = e.deltaY;
                wheelAccumRef.current += delta;

                clearTimeout(wheelTimeoutRef.current);
                wheelTimeoutRef.current = setTimeout(() => {
                    wheelAccumRef.current = 0;
                }, 120);

                const THRESHOLD = 100;

                if (Math.abs(wheelAccumRef.current) >= THRESHOLD) {
                    if (wheelAccumRef.current > 0) {
                        snapToSection(3);
                    } else {
                        snapToSection(1);
                    }
                    wheelAccumRef.current = 0;
                }
                return;
            }

            // ⭐ 마지막 페이지는 자유 스크롤
            if (sec >= 3) return;
        };

        container.addEventListener("scroll", handleScroll, { passive: true });
        container.addEventListener("wheel", handleWheel, { passive: false });

        return () => {
            container.removeEventListener("scroll", handleScroll);
            container.removeEventListener("wheel", handleWheel);
            if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
            clearTimeout(wheelTimeoutRef.current);
            clearTimeout(snapTimeout);
        };
    }, [sections, currentSection, isTransitioning, snapToSection, containerRef]);

    /* ------------------------------------------------------------------
     * 🖼️ 패럴랙스 계산 최적화
     * ------------------------------------------------------------------ */
    const getParallaxTransform = useCallback(
        (speed, initialOffset = 0, shouldScale = false) => {
            const container = containerRef.current;
            if (!container) return {};

            const scroll = container.scrollTop;
            const height = sectionHeightsRef.current[0] || window.innerHeight;

            // 🔥 첫 페이지가 아니면 패럴랙스 완전히 숨김
            if (currentSection !== 0) {
                return {
                    transform: shouldScale
                        ? `translate3d(0, ${initialOffset}px, 0) scale(1)`
                        : `translate3d(0, ${initialOffset}px, 0)`,
                    opacity: 0,
                    pointerEvents: "none",
                    transition: "opacity 0.3s ease-out",
                };
            }

            // 🔥 섹션 0일 때 패럴랙스 활성화
            const progress = Math.min(scroll / height, 1);
            const translateY = -scroll * speed + initialOffset;

            // 90% 이상 스크롤 시 빠르게 페이드아웃
            let opacity = 1;
            if (progress > 0.9) {
                opacity = Math.max(0, 1 - ((progress - 0.9) / 0.1) * 3);
            } else {
                opacity = Math.max(0.3, 1 - progress * 0.5);
            }

            if (shouldScale) {
                const scale = 1 + (progress * 0.5);
                return {
                    transform: `translate3d(0, ${translateY}px, 0) scale(${scale})`,
                    opacity: opacity,
                };
            }

            return {
                transform: `translate3d(0, ${translateY}px, 0)`,
                opacity: opacity,
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