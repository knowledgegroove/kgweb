'use client';

import { useState, useEffect } from 'react';

interface TypewriterTextProps {
    text: string;
    start?: boolean;
    delay?: number;
    speed?: number;
    className?: string;
    cursor?: boolean;
    onComplete?: () => void;
}

export default function TypewriterText({
    text,
    start = true,
    delay = 0,
    speed = 30,
    className = '',
    cursor = true,
    onComplete,
}: TypewriterTextProps) {
    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        if (!start) return;

        const startTimeout = setTimeout(() => {
            setIsTyping(true);
        }, delay);

        return () => clearTimeout(startTimeout);
    }, [start, delay]);

    useEffect(() => {
        if (!isTyping) return;

        let currentIndex = 0;
        setDisplayedText('');

        const interval = setInterval(() => {
            if (currentIndex < text.length) {
                setDisplayedText(() => text.slice(0, currentIndex + 1));
                currentIndex++;
            } else {
                clearInterval(interval);
                setIsComplete(true);
                if (onComplete) onComplete();
            }
        }, speed);

        return () => clearInterval(interval);
    }, [isTyping, text, speed, onComplete]);

    return (
        <span className={className}>
            {displayedText}
            {cursor && !isComplete && (
                <span style={{
                    display: 'inline-block',
                    width: '2px',
                    height: '1em',
                    backgroundColor: 'currentColor',
                    marginLeft: '2px',
                    verticalAlign: 'middle',
                    animation: 'blink 1s step-end infinite'
                }} />
            )}
            <style jsx>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
        </span>
    );
}
