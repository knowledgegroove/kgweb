'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTutor } from '@/context/TutorContext';
import { generateInitialAdvice } from '@/utils/mentorLogic';
import styles from './TutorSidebar.module.css';

interface Message {
    role: 'user' | 'bot';
    content: string;
    grounded?: {
        course?: string;
        unit?: string;
    };
}

import { InlineMath, BlockMath } from 'react-katex';

const TypewriterText = ({ text, speed = 5 }: { text: string; speed?: number }) => {
    const [index, setIndex] = useState(0);

    const formattedText = useMemo(() => {
        let clean = text.replace(/^\((OpenRouter|Gemini|Claude|AIService)\)\s*/, '');
        const sections = ['1. THE FOCUS', '2. THE LOGIC', '3. THE GUIDE', '4. THE GOTCHA', '5. NEXT STEP'];
        sections.forEach(s => {
            const regex = new RegExp(`\\s*${s.replace('.', '\\.')}`, 'g');
            clean = clean.replace(regex, `\n\n${s}`);
        });
        return clean.trim();
    }, [text]);

    useEffect(() => {
        setIndex(0);
    }, [formattedText]);

    useEffect(() => {
        if (formattedText && index < formattedText.length) {
            const timeout = setTimeout(() => {
                setIndex(prev => prev + 1);
            }, speed);
            return () => clearTimeout(timeout);
        }
    }, [index, formattedText, speed]);

    const renderContent = () => {
        const paragraphs = formattedText.split(/\n\n+/);
        let absolutePos = 0;

        return paragraphs.map((para: string, pIdx: number) => {
            const paraStart = absolutePos;
            const paraEnd = absolutePos + para.length;

            if (index <= paraStart) return null;

            const gapMatch = formattedText.slice(paraEnd).match(/^\n\n+/);
            const gap = gapMatch ? gapMatch[0].length : 0;
            absolutePos = paraEnd + gap;

            const segments = para.split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g);
            let paraPos = paraStart;

            return (
                <div key={pIdx} style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
                    {segments.map((seg: string, sIdx: number) => {
                        const segStart = paraPos;
                        const segEnd = paraPos + seg.length;
                        paraPos = segEnd;

                        if (index <= segStart) return null;

                        if (index >= segEnd) {
                            if (seg.startsWith('$$') && seg.endsWith('$$')) {
                                return <BlockMath key={sIdx}>{seg.slice(2, -2)}</BlockMath>;
                            }
                            if (seg.startsWith('$') && seg.endsWith('$')) {
                                return <InlineMath key={sIdx}>{seg.slice(1, -1)}</InlineMath>;
                            }
                            return <span key={sIdx}>{seg}</span>;
                        }

                        return <span key={sIdx} style={{ opacity: 0.9 }}>{seg.slice(0, index - segStart)}</span>;
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

export default function TutorSidebar() {
    const { isOpen, closeTutor, initialCourseId, initialUnitNumber, initialPageContext } = useTutor();
    const [step, setStep] = useState(1);
    const [course, setCourse] = useState('');
    const [unit, setUnit] = useState<number | null>(null);
    const [situation, setSituation] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            if (initialCourseId) {
                setCourse(initialCourseId);
                setMessages([]); // Clear previous context
                setStep(2);
                if (initialUnitNumber) {
                    setUnit(initialUnitNumber);
                    setStep(3);
                }
            } else {
                setStep(0); // 0: General Greeting
                setCourse('');
                setUnit(null);
                setSituation('');
                setMessages([]);
            }
        }
    }, [isOpen, initialCourseId, initialUnitNumber]);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleNext = () => setStep(step + 1);

    const startChat = async (s: string) => {
        setSituation(s);
        setStep(4);

        // QUOTA BYPASS: Generate the first response locally
        const userPrompt = "Help me understand what to focus on.";
        const localAdvice = generateInitialAdvice(course, unit || 1, s);

        const initialMessages: Message[] = [
            { role: 'user', content: userPrompt },
            { role: 'bot', content: localAdvice, grounded: { course: course, unit: unit?.toString() } }
        ];

        setMessages(initialMessages);
    };

    const sendMessage = async (text: string, overrideSituation?: string) => {
        if (!text.trim() && !overrideSituation) return;

        const sit = overrideSituation || situation;
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
                    situation: sit,
                    pageContext: initialPageContext
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.details || errorData.error || 'Failed to get response');
            }

            const data = await response.json();
            // Sanitize: strip markdown bolding for a premium plain-text look
            const cleanContent = (data.content || 'Error: No response from AI').replace(/\*\*/g, '');
            setMessages([...newMessages, { role: 'bot', content: cleanContent, grounded: data.grounding }]);
        } catch (error: any) {
            console.error('Error:', error);
            setMessages([...newMessages, { role: 'bot', content: `Sorry, I encountered an error: ${error.message}. Please check your connection or try again.` }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Side Panel */}
                    <motion.div
                        className={styles.sidebar}
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    >
                        <div className={styles.header}>
                            <div className={styles.headerTitle}>
                                <span className={styles.aiIcon}>✨</span>
                                <div>
                                    <h3>AI Course Mentor</h3>
                                    <p>Grounded in Academy Database</p>
                                </div>
                            </div>
                            <button className={styles.closeBtn} onClick={closeTutor}>×</button>
                        </div>

                        <div className={styles.content}>
                            <AnimatePresence mode="wait">
                                {step === 0 && (
                                    <motion.div key="step0" className={styles.stepContainer} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                                        <div className={styles.generalGreeting}>
                                            <h2 className={styles.greetingTitle}>Welcome back.</h2>
                                            <p className={styles.greetingText}>
                                                How may I help you today? <br /><br />
                                                Are you lost, looking for practice, or have any questions? Just let me know.
                                            </p>
                                            <div className={styles.greetingButtons}>
                                                <button className={styles.primaryAction} onClick={() => setStep(1)}>
                                                    Select a Course
                                                </button>
                                                <button className={styles.secondaryAction} onClick={() => startChat('confused')}>
                                                    Just talk to me
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 1 && (
                                    <motion.div key="step1" className={styles.stepContainer} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                                        <h4 className={styles.label}>Which course?</h4>
                                        <div className={styles.grid}>
                                            {[
                                                { id: 'ap-calculus-ab', name: 'AP Calculus', icon: '📐' },
                                                { id: 'ap-chemistry', name: 'AP Chemistry', icon: '🧪' },
                                                { id: 'ap-world-history', name: 'AP World', icon: '🌍' }
                                            ].map(c => (
                                                <button key={c.id} className={styles.choiceBtn} onClick={() => { setCourse(c.id); handleNext(); }}>
                                                    <span>{c.icon}</span> {c.name}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {step === 2 && (
                                    <motion.div key="step2" className={styles.stepContainer} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                        <h4 className={styles.label}>Which unit?</h4>
                                        <div className={styles.grid}>
                                            {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                                                <button key={num} className={styles.choiceBtn} onClick={() => { setUnit(num); handleNext(); }}>
                                                    Unit {num}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {step === 3 && (
                                    <motion.div key="step3" className={styles.stepContainer} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                                        <h4 className={styles.label}>How can I help?</h4>
                                        <div className={styles.list}>
                                            {[
                                                { id: 'explain', label: 'Explain Concept', sub: 'Short, focused breakdowns.' },
                                                { id: 'practice', label: 'Practice Problems', sub: 'Test-style questions.' },
                                                { id: 'readiness', label: 'Test Readiness', sub: 'Diagnose your confidence.' },
                                                { id: 'recovery', label: 'Recovery Strategy', sub: 'Plan after a bad score.' }
                                            ].map(s => (
                                                <button key={s.id} className={styles.choiceBtnLong} onClick={() => startChat(s.id)}>
                                                    <strong>{s.label}</strong>
                                                    <span>{s.sub}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {step === 4 && (
                                    <motion.div key="step4" className={styles.chatContainer}>
                                        <div className={styles.messages}>
                                            {messages.length > 0 && (
                                                <div className={`${styles.msg} ${messages[messages.length - 1].role === 'bot' ? styles.bot : styles.user}`}>
                                                    {messages[messages.length - 1].grounded && (
                                                        <div className={styles.grounding}>🛡️ Fully Grounded</div>
                                                    )}
                                                    <div className={styles.msgText}>
                                                        {messages[messages.length - 1].role === 'bot' ? (
                                                            <TypewriterText text={messages[messages.length - 1].content} />
                                                        ) : (
                                                            messages[messages.length - 1].content.split('\n').map((line, j) => (
                                                                <p key={j}>{line || '\u00A0'}</p>
                                                            ))
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                            {loading && <div className={styles.loading}>Mentor is analyzing...</div>}
                                            <div ref={chatEndRef} />
                                        </div>
                                        <form className={styles.inputArea} onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}>
                                            <input
                                                value={input}
                                                onChange={(e) => setInput(e.target.value)}
                                                placeholder="Message the mentor..."
                                            />
                                            <button type="submit" disabled={loading}>Send</button>
                                        </form>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
