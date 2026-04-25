import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const AnimatedBackground = () => {
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const orbs = container.querySelectorAll('.orb');

        orbs.forEach((orb, i) => {
            gsap.to(orb, {
                x: `random(-100, 100)`,
                y: `random(-100, 100)`,
                scale: `random(0.8, 1.3)`,
                duration: `random(8, 15)`,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
                delay: i * 2,
            });
        });

        return () => {
            orbs.forEach((orb) => gsap.killTweensOf(orb));
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 overflow-hidden pointer-events-none z-0"
            aria-hidden="true"
        >
            {/* Primary emerald orb */}
            <div
                className="orb absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full opacity-30 dark:opacity-20"
                style={{
                    background: 'radial-gradient(circle, rgba(16,185,129,0.4) 0%, transparent 70%)',
                    filter: 'blur(80px)',
                }}
            />
            {/* Secondary teal orb */}
            <div
                className="orb absolute top-[40%] -right-[10%] w-[50%] h-[50%] rounded-full opacity-25 dark:opacity-15"
                style={{
                    background: 'radial-gradient(circle, rgba(20,184,166,0.4) 0%, transparent 70%)',
                    filter: 'blur(80px)',
                }}
            />
            {/* Accent cyan orb */}
            <div
                className="orb absolute -bottom-[10%] left-[30%] w-[40%] h-[40%] rounded-full opacity-20 dark:opacity-10"
                style={{
                    background: 'radial-gradient(circle, rgba(6,182,212,0.3) 0%, transparent 70%)',
                    filter: 'blur(80px)',
                }}
            />
            {/* Subtle noise overlay */}
            <div
                className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'repeat',
                }}
            />
        </div>
    );
};

export default AnimatedBackground;
