'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './page.module.css';
import Link from 'next/link';

interface Message {
    role: 'user' | 'bot';
    content: string;
    grounded?: {
        course?: string;
        unit?: string;
    };
}

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
        const initialMessage = "Help me understand what to focus on.";
        await sendMessage(initialMessage);
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

            const data = await response.json();
            setMessages([...newMessages, { role: 'bot', content: data.content, grounded: data.grounding }]);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className={styles.main}>
            <div className={styles.container}>
                <nav style={{ position: 'absolute', top: '2rem', left: '2rem' }}>
                    <Link href="/academy" style={{ color: 'var(--accent)', fontWeight: 600 }}>← Back</Link>
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
                            <span className={styles.label}>What's the situation?</span>
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
                                                🛡️ Grounded in {msg.grounded.course} • {msg.grounded.unit}
                                            </div>
                                        )}
                                        <div className={styles.messageContent}>
                                            {msg.content.split('\n').map((line, j) => (
                                                <p key={j} style={{ marginBottom: line.trim() ? '0.5rem' : '1rem' }}>{line}</p>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                {loading && (
                                    <div className={`${styles.message} ${styles.botMessage}`}>
                                        <div className={styles.messageContent}>Mentor is thinking...</div>
                                    </div>
                                )}
                                <div ref={chatEndRef} />
                            </div>

                            <form className={styles.chatInputArea} onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}>
                                <input
                                    className={styles.input}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Type your question or state of mind..."
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
