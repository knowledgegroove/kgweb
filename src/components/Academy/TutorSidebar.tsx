'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTutor } from '@/context/TutorContext';
import { generateInitialAdvice } from '@/utils/mentorLogic';
import { academyKnowledge } from '@/data/academyKnowledge';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { useRouter, usePathname } from 'next/navigation';
import styles from './TutorSidebar.module.css';

interface Message {
    role: 'user' | 'bot';
    content: string;
    grounded?: {
        course?: string;
        unit?: string;
    };
}

const MathRenderer = ({ text }: { text: string }) => {
    if (!text) return null;
    const lines = text.split('\n');
    return (
        <div className={styles.mathWrapper}>
            {lines.map((line, lIdx) => {
                const segments = line.split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g);
                return (
                    <div key={lIdx} style={{ marginBottom: line.trim() === '' ? '1.5rem' : '0.5rem', minHeight: '1.2em' }}>
                        {segments.map((seg, sIdx) => {
                            if (seg.startsWith('$$') && seg.endsWith('$$')) {
                                return <BlockMath key={sIdx}>{seg.slice(2, -2)}</BlockMath>;
                            }
                            if (seg.startsWith('$') && seg.endsWith('$')) {
                                return <InlineMath key={sIdx}>{seg.slice(1, -1)}</InlineMath>;
                            }
                            return <span key={sIdx}>{seg}</span>;
                        })}
                    </div>
                );
            })}
        </div>
    );
};

const TypewriterText = ({ text, speed = 5 }: { text: string; speed?: number }) => {
    const [index, setIndex] = useState(0);

    const formattedText = useMemo(() => {
        return text.replace(/^\((OpenRouter|Gemini|Claude|Local Logic|AIService|Fallback \(Gemini\))\)\s*/, '').trim();
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
        // Find provider if present at start: (Provider) text
        const providerMatch = text.match(/^\((OpenRouter|Gemini|Claude|Local Logic|AIService|Fallback \(Gemini\))\)/);
        const provider = providerMatch ? providerMatch[1] : null;

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
                <div key={pIdx} style={{ marginBottom: '1rem', lineHeight: '1.6', position: 'relative' }}>
                    {pIdx === 0 && provider && (
                        <div style={{
                            fontSize: '0.6rem',
                            opacity: 0.4,
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            marginBottom: '0.4rem',
                            letterSpacing: '0.05em'
                        }}>
                            Response via {provider === 'Fallback (Gemini)' ? 'Gemini' : provider}
                        </div>
                    )}
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
    const { isOpen, isFullScreen, closeTutor, toggleFullScreen, initialCourseId, initialUnitNumber, initialPageContext, initialMode } = useTutor();
    const router = useRouter();
    const pathname = usePathname();
    const [step, setStep] = useState(1);
    const [course, setCourse] = useState('');
    const [unit, setUnit] = useState<number | null>(null);
    const [activeMode, setActiveMode] = useState<'chat' | 'practice' | null>(null);
    const [situation, setSituation] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Practice specific state
    const [practiceQuestions, setPracticeQuestions] = useState<any[]>([]);
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [practiceScore, setPracticeScore] = useState(0);

    // Sync context to local state once upon opening
    useEffect(() => {
        if (isOpen) {
            const mode = initialMode || 'chat';
            setActiveMode(mode);

            if (initialCourseId) {
                setCourse(initialCourseId);
                setMessages([]);
                if (initialUnitNumber) {
                    setUnit(initialUnitNumber);
                    if (mode === 'practice') {
                        startPractice(initialCourseId, initialUnitNumber);
                    } else {
                        setStep(3); // Options step
                    }
                } else {
                    setStep(0); // General Greeting
                }
            } else {
                setStep(0); // General Greeting
                setCourse('');
                setUnit(null);
                setSituation('');
                setMessages([]);
            }
        }
    }, [isOpen]); // Only run when sidebar opens

    const startPractice = async (courseId: string, unitNum: number) => {
        setStep(5); // 5: Loading Practice
        setLoading(true);
        setPracticeScore(0);
        setCurrentQuestionIdx(0);
        setSelectedOption(null);
        setShowExplanation(false);
        try {
            const response = await fetch('/api/academy-practice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ courseId, unitNumber: unitNum })
            });
            const data = await response.json();
            if (data.questions && data.questions.length > 0) {
                setPracticeQuestions(data.questions);
                setStep(6); // 6: Active Practice
            } else {
                setMessages(prev => [...prev, {
                    role: 'bot',
                    content: `(System) I had trouble generating practice questions: ${data.error || 'Unknown API error'}. Please try again or pick a different unit.`
                }]);
                setStep(3); // Options step
            }
        } catch (e: any) {
            console.error('Practice Fetch Error:', e);
            setMessages(prev => [...prev, { role: 'bot', content: `(System) I had trouble connecting to the practice engine: ${e.message}.` }]);
            setStep(3); // Options step
        } finally {
            setLoading(false);
        }
    };

    const handleOptionSelect = (idx: number) => {
        if (showExplanation) return;
        setSelectedOption(idx);
        setShowExplanation(true);
        if (idx === practiceQuestions[currentQuestionIdx].answer) {
            setPracticeScore(prev => prev + 1);
        }
    };

    const nextQuestion = () => {
        if (currentQuestionIdx < practiceQuestions.length - 1) {
            setCurrentQuestionIdx(prev => prev + 1);
            setSelectedOption(null);
            setShowExplanation(false);
        } else {
            setStep(7); // 7: Practice Summary
        }
    };

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleNext = () => {
        if (step === 2 && activeMode === 'practice') {
            startPractice(course, unit || 1);
            return;
        }
        setStep(step + 1);
    };

    const startChat = async (s: string) => {
        if (s === 'practice') {
            startPractice(course, unit || 1);
            return;
        }
        setSituation(s);
        setStep(4);

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
                throw new Error('Failed to fetch AI response');
            }

            const data = await response.json();
            setMessages(prev => [...prev, {
                role: 'bot',
                content: data.content // Use 'content' as returned by the API
            }]);
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages(prev => [...prev, { role: 'bot', content: "I'm sorry, I'm having trouble connecting to my brain. Please try again in a moment." }]);
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
                        className={`${styles.sidebar} ${isFullScreen ? styles.fullScreen : ''}`}
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
                            <div className={styles.headerActions}>
                                <button
                                    className={`${styles.iconBtn} ${isFullScreen ? styles.activeIcon : ''}`}
                                    onClick={toggleFullScreen}
                                    title={isFullScreen ? "Exit Full Screen" : "Full Screen Mode"}
                                >
                                    {isFullScreen ? '🗗' : '🗖'}
                                </button>
                                <button className={styles.closeBtn} onClick={closeTutor}>×</button>
                            </div>
                        </div>

                        <div className={styles.content}>
                            <AnimatePresence mode="wait">
                                {step === 0 && (
                                    <motion.div key="step0" className={styles.stepContainer} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                                        <div className={styles.generalGreeting}>
                                            <h2 className={styles.greetingTitle}>Welcome back.</h2>
                                            <p className={styles.greetingText}>Ready to master your AP course? I have the full course blueprint loaded.</p>
                                            <div className={styles.greetingButtons}>
                                                <button className={styles.primaryAction} onClick={() => course ? setStep(2) : setStep(1)}>Let's start</button>
                                                <button className={styles.secondaryAction} onClick={closeTutor}>Just browsing</button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 1 && (
                                    <motion.div key="step1" className={styles.stepContainer} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                        <h4 className={styles.label}>Which course are you studying?</h4>
                                        <div className={styles.grid}>
                                            {['ap-calculus-ab', 'ap-physics-1', 'ap-chem', 'ap-world'].map(id => (
                                                <button key={id} className={styles.choiceBtn} onClick={() => {
                                                    setCourse(id);
                                                    const targetPath = `/academy/courses/${id}`;
                                                    if (!pathname.includes(id)) {
                                                        router.push(targetPath);
                                                    }
                                                    handleNext();
                                                }}>
                                                    {id.replace('ap-', 'AP ').toUpperCase()}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {step === 2 && (
                                    <motion.div key="step2" className={styles.stepContainer} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                        <h4 className={styles.label}>Which unit?</h4>
                                        <div className={styles.grid}>
                                            {(academyKnowledge[course]?.units || [1, 2, 3, 4, 5, 6, 7, 8]).map((u: any) => {
                                                const num = typeof u === 'number' ? u : u.number;
                                                return (
                                                    <button
                                                        key={num}
                                                        className={styles.choiceBtn}
                                                        onClick={() => {
                                                            setUnit(num);
                                                            if (activeMode === 'practice') {
                                                                startPractice(course, num);
                                                            } else {
                                                                setStep(3);
                                                            }
                                                        }}
                                                    >
                                                        Unit {num}
                                                    </button>
                                                );
                                            })}
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

                                {step === 5 && (
                                    <motion.div key="step5" className={styles.stepContainer} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                        <div className={styles.loadingStep}>
                                            <div className={styles.spinner}></div>
                                            <p>Generating targeted practice problems...</p>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 6 && practiceQuestions.length > 0 && (
                                    <motion.div key="step6" className={styles.practiceContainer} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                        <div className={styles.progressBar}>
                                            <div className={styles.progressFill} style={{ width: `${((currentQuestionIdx + 1) / practiceQuestions.length) * 100}%` }} />
                                        </div>

                                        <div className={styles.questionBox}>
                                            <span className={styles.unitNum}>Question {currentQuestionIdx + 1} of {practiceQuestions.length}</span>
                                            <div className={styles.questionText}>
                                                <MathRenderer text={practiceQuestions[currentQuestionIdx].question} />
                                            </div>
                                        </div>

                                        <div className={styles.optionsList}>
                                            {practiceQuestions[currentQuestionIdx].options.map((opt: string, i: number) => {
                                                let stateClass = '';
                                                if (showExplanation) {
                                                    if (i === practiceQuestions[currentQuestionIdx].answer) stateClass = styles.correct;
                                                    else if (i === selectedOption) stateClass = styles.incorrect;
                                                } else if (i === selectedOption) {
                                                    stateClass = styles.selected;
                                                }

                                                return (
                                                    <button
                                                        key={i}
                                                        disabled={showExplanation}
                                                        className={`${styles.optionBtn} ${stateClass}`}
                                                        onClick={() => handleOptionSelect(i)}
                                                    >
                                                        {opt}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {showExplanation && (
                                            <div className={styles.feedbackBox}>
                                                <span className={`${styles.feedbackStatus} ${selectedOption === practiceQuestions[currentQuestionIdx].answer ? styles.correct : styles.incorrect}`}>
                                                    {selectedOption === practiceQuestions[currentQuestionIdx].answer ? '✓ Correct' : '✗ Incorrect'}
                                                </span>
                                                <div className={styles.explanationText}>
                                                    <MathRenderer text={practiceQuestions[currentQuestionIdx].explanation} />
                                                </div>
                                                <button className={styles.primaryAction} onClick={nextQuestion} style={{ marginTop: '1.5rem', width: '100%' }}>
                                                    {currentQuestionIdx < practiceQuestions.length - 1 ? 'Next Question' : 'See Results'}
                                                </button>
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {step === 7 && (
                                    <motion.div key="step7" className={styles.stepContainer} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                                        <div className={styles.summaryCard}>
                                            <h3>Practice Complete!</h3>
                                            <div className={styles.scoreCircle}>
                                                {practiceScore} / {practiceQuestions.length}
                                            </div>
                                            <p>Great work focusing on your weak spots. Consistent practice is the key to a 5.</p>
                                            <div className={styles.greetingButtons}>
                                                <button className={styles.primaryAction} onClick={() => startPractice(course, unit || 1)}>Try Another Set</button>
                                                <button className={styles.secondaryAction} onClick={() => setStep(3)}>Back to Help Options</button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 4 && (
                                    <motion.div key="step4" className={styles.chatContainer} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                        <div className={styles.messages}>
                                            {messages.map((msg, i) => (
                                                <div key={i} className={`${styles.msg} ${msg.role === 'bot' ? styles.bot : styles.user}`}>
                                                    {msg.role === 'bot' && msg.grounded && (
                                                        <div className={styles.grounding}>
                                                            Grounded in {msg.grounded.course} {msg.grounded.unit ? `Unit ${msg.grounded.unit}` : ''}
                                                        </div>
                                                    )}
                                                    <div className={styles.msgText}>
                                                        {msg.role === 'bot' ? (
                                                            <TypewriterText text={msg.content} />
                                                        ) : (
                                                            <p>{msg.content}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                            {loading && (
                                                <div className={`${styles.msg} ${styles.bot}`}>
                                                    <div className={styles.loading}>Thinking...</div>
                                                </div>
                                            )}
                                            <div ref={chatEndRef} />
                                        </div>

                                        <div className={styles.inputArea}>
                                            <input
                                                value={input}
                                                onChange={(e) => setInput(e.target.value)}
                                                placeholder="Ask follow-up..."
                                                onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
                                            />
                                            <button onClick={() => sendMessage(input)}>Send</button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div >
                </>
            )
            }
        </AnimatePresence >
    );
}
