'use client';

import { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

export default function CustomCursor() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);

    const springConfig = { damping: 25, stiffness: 200 };
    const cursorX = useSpring(0, springConfig);
    const cursorY = useSpring(0, springConfig);

    useEffect(() => {
        const moveMouse = (e: MouseEvent) => {
            cursorX.set(e.clientX - 16);
            cursorY.set(e.clientY - 16);
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        const handleHover = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.closest('button, a, .interactive')) {
                setIsHovering(true);
            } else {
                setIsHovering(false);
            }
        };

        window.addEventListener('mousemove', moveMouse);
        window.addEventListener('mouseover', handleHover);

        return () => {
            window.removeEventListener('mousemove', moveMouse);
            window.removeEventListener('mouseover', handleHover);
        };
    }, [cursorX, cursorY]);

    return (
        <>
            <motion.div
                style={{
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    width: isHovering ? 64 : 32,
                    height: isHovering ? 64 : 32,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(79, 70, 229, 0.15)',
                    border: '1px solid rgba(79, 70, 229, 0.3)',
                    backdropFilter: 'blur(4px)',
                    pointerEvents: 'none',
                    zIndex: 99999,
                    x: cursorX,
                    y: cursorY,
                }}
                animate={{
                    scale: isHovering ? 1.5 : 1,
                    backgroundColor: isHovering ? 'rgba(168, 85, 247, 0.2)' : 'rgba(79, 70, 229, 0.15)',
                }}
            />
            <motion.div
                style={{
                    position: 'fixed',
                    left: mousePosition.x - 4,
                    top: mousePosition.y - 4,
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: '#4f46e5',
                    pointerEvents: 'none',
                    zIndex: 99999,
                }}
            />
        </>
    );
}
