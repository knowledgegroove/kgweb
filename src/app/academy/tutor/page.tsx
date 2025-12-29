'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './page.module.css';
import Link from 'next/link';
import { generateInitialAdvice } from '@/utils/mentorLogic';

interface Message {
    role: 'user' | 'bot';
    content: string;
    grounded?: {
        course?: string;
        unit?: string;
    };
}

import { InlineMath, BlockMath } from 'react-katex';

const Typewriter = ({ text, speed = 8 }: { text: string; speed?: number }) => {
    // CLEANUP & REFORMAT: Force spacing between sections if AI forgets
    const formattedText = useMemo(() => {
        let clean = text.replace(/^\((OpenRouter|Gemini|Claude|AIService)\)\s*/, '');
        // Force double newlines before numbered sections (1. THE FOCUS, etc)
        const sections = ['1. THE FOCUS', '2. THE LOGIC', '3. THE GUIDE', '4. THE GOTCHA', '5. NEXT STEP'];
        sections.forEach(s => {
            const regex = new RegExp(`\\s*${s.replace('.', '\\.')}`, 'g');
            clean = clean.replace(regex, `\n\n${s}`);
        });
        return clean.trim();
    }, [text]);

    const [index, setIndex] = useState(0);
    const [prevText, setPrevText] = useState(formattedText);

    if (formattedText !== prevText) {
        setPrevText(formattedText);
        setIndex(0);
    }

    useEffect(() => {
        if (formattedText && index < formattedText.length) {
            const timeout = setTimeout(() => {
                setIndex((prev) => prev + 1);
            }, speed);
            return () => clearTimeout(timeout);
        }
    }, [index, formattedText, speed]);

    const renderContent = () => {
        // Split into paragraphs first to maintain vertical structure
        const paragraphs = formattedText.split(/\n\n+/);
        let absolutePos = 0;

        return paragraphs.map((para: string, pIdx: number) => {
            const paraStart = absolutePos;
            const paraEnd = absolutePos + para.length;

            // If we haven't reached this paragraph at all, don't render it
            if (index <= paraStart) return null;

            // Increment absolutePos for next paragraph (accounting for the \n\n we split by)
            const gapMatch = formattedText.slice(paraEnd).match(/^\n\n+/);
            const gap = gapMatch ? gapMatch[0].length : 0;
            absolutePos = paraEnd + gap;

            // Render inner segments (math vs text) for this paragraph
            const segments = para.split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g);
            let paraPos = paraStart;

            return (
                <div key={pIdx} style={{ marginBottom: '1.5rem', lineHeight: '1.8' }}>
                    {segments.map((seg: string, sIdx: number) => {
                        const segStart = paraPos;
                        const segEnd = paraPos + seg.length;
                        paraPos = segEnd;

                        if (index <= segStart) return null;

                        // If typing has reached the end of this segment, render it properly
                        if (index >= segEnd) {
                            if (seg.startsWith('$$') && seg.endsWith('$$')) {
                                return <BlockMath key={sIdx}>{seg.slice(2, -2)}</BlockMath>;
                            }
                            if (seg.startsWith('$') && seg.endsWith('$')) {
                                return <InlineMath key={sIdx}>{seg.slice(1, -1)}</InlineMath>;
                            }
                            return <span key={sIdx}>{seg}</span>;
                        }

                        // Still typing this segment - render as plain text to avoid "reflow jumps"
                        const typingVisible = seg.slice(0, index - segStart);
                        return <span key={sIdx} style={{ opacity: 0.9 }}>{typingVisible}</span>;
                    })}
                </div>
            );
        });
    };

    return (
        <div className={styles.messageContent}>
            {renderContent()}
        </div>
    );
};

export default function AITutorPage() {
    const [step, setStep] = useState(1); // 1: Course, 2: Unit, 3: Situation, 4: Chat
    const [course, setCourse] = useState('');
    const [unit, setUnit] = useState<number | null>(null);
    const [situation, setSituation] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleNext = () => setStep(step + 1);

    const startChat = async () => {
        setStep(4);

        // QUOTA BYPASS: Generate first message locally
        const userPrompt = "Help me understand what to focus on.";
        const localAdvice = generateInitialAdvice(course, unit || 1, situation);

        const initialMessages: Message[] = [
            { role: 'user', content: userPrompt },
            { role: 'bot', content: localAdvice, grounded: { course: course, unit: unit?.toString() } }
        ];

        setMessages(initialMessages);
        setLoading(false);
    };

    const sendMessage = async (text: string) => {
        if (!text.trim()) return;

        const newMessages: Message[] = [...messages, { role: 'user', content: text }];
        setMessages(newMessages);
        setInput('');
        setLoading(true);

        try {
            const response = await fetch('/api/academy-tutor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: newMessages,
                    courseId: course,
                    unitNumber: unit,
                    situation: situation
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.details || errorData.error || 'Failed to get response');
            }

            const data = await response.json();
            setMessages([...newMessages, { role: 'bot', content: data.content, grounded: data.grounding }]);
        } catch (err: unknown) {
            const error = err as Error;
            console.error('Error:', error);
            setMessages([...newMessages, { role: 'bot', content: `Error: ${error.message}. Please try again later.` }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className={styles.main}>
            <div className={styles.container}>
                <nav style={{ position: 'absolute', top: '2rem', left: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <Link href="/academy" style={{ color: 'var(--accent)', fontWeight: 600 }}>← Back</Link>
                    {step === 4 && (
                        <div className={styles.contextBadge}>
                            {course.replace(/-/g, ' ').toUpperCase()} • UNIT {unit}
                        </div>
                    )}
                </nav>

                <header className={styles.header}>
                    <motion.h1
                        className={`${styles.title} gradient-text-primary`}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        AI Course Mentor
                    </motion.h1>
                    <p className={styles.subtitle}>
                        Transforming stress into confidence through course-grounded guidance.
                    </p>
                </header>

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            className={styles.diagnosisCard}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            <span className={styles.label}>Which course are we conquering?</span>
                            <div className={styles.courseGrid}>
                                {[
                                    { id: 'ap-calculus-ab', name: 'AP Calculus AB', icon: '📐' },
                                    { id: 'ap-chemistry', name: 'AP Chemistry', icon: '🧪' },
                                    { id: 'ap-world-history', name: 'AP World History', icon: '🌍' }
                                ].map(c => (
                                    <button
                                        key={c.id}
                                        className={`${styles.choiceBtn} ${course === c.id ? styles.active : ''}`}
                                        onClick={() => { setCourse(c.id); handleNext(); }}
                                    >
                                        <span style={{ fontSize: '2rem' }}>{c.icon}</span>
                                        {c.name}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            className={styles.diagnosisCard}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <span className={styles.label}>Which unit do you want to focus on?</span>
                            <div className={styles.courseGrid}>
                                {[1, 2, 3, 4, 5, 6, 7].map(num => (
                                    <button
                                        key={num}
                                        className={`${styles.choiceBtn} ${unit === num ? styles.active : ''}`}
                                        onClick={() => { setUnit(num); handleNext(); }}
                                    >
                                        Unit {num}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            className={styles.diagnosisCard}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <span className={styles.label}>What&apos;s the situation?</span>
                            <div className={styles.courseGrid}>
                                {[
                                    { id: 'behind', label: 'Falling behind', sub: 'I need a catch-up plan.' },
                                    { id: 'test-soon', label: 'Test coming up', sub: 'I need to prioritize.' },
                                    { id: 'mastery', label: 'Aiming for 100%', sub: 'I want the hardest problems.' },
                                    { id: 'confused', label: 'Just confused', sub: 'Help me understand concepts.' }
                                ].map(s => (
                                    <button
                                        key={s.id}
                                        className={`${styles.choiceBtn} ${situation === s.id ? styles.active : ''}`}
                                        onClick={() => { setSituation(s.id); startChat(); }}
                                    >
                                        <strong>{s.label}</strong>
                                        <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>{s.sub}</span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {step === 4 && (
                        <motion.div
                            key="step4"
                            className={styles.chatContainer}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className={styles.chatMessages}>
                                {messages.map((msg, i) => (
                                    <div key={i} className={`${styles.message} ${msg.role === 'bot' ? styles.botMessage : styles.userMessage}`}>
                                        {msg.grounded && (
                                            <div className={styles.groundingBadge}>
                                                🛡️ Verified {msg.grounded.course} Data • Unit {unit}
                                            </div>
                                        )}

                                        {msg.role === 'bot' ? (
                                            <Typewriter text={msg.content} />
                                        ) : (
                                            <div className={styles.messageContent}>
                                                {msg.content.split('\n').map((line, j) => (
                                                    <p key={j} style={{ marginBottom: line.trim() ? '0.5rem' : '1rem' }}>{line}</p>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {loading && (
                                    <div className={`${styles.message} ${styles.botMessage}`}>
                                        <div className={styles.messageContent}>Mentor is analyzing course data...</div>
                                    </div>
                                )}
                                <div ref={chatEndRef} />
                            </div>

                            <form className={styles.chatInputArea} onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}>
                                <input
                                    className={styles.input}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask about textbooks, past tests, or concepts..."
                                />
                                <button className={styles.sendBtn} type="submit" disabled={loading}>
                                    Send
                                </button>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
}
