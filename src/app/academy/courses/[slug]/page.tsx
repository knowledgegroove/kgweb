'use client';

import { use, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useTutor } from '@/context/TutorContext';
import { academyKnowledge } from '@/data/academyKnowledge';
import styles from './page.module.css';

// Add secondary UI-only data here
const courseExtras: Record<string, any> = {
    'ap-calculus-ab': {
        textbook: "https://obryant.us/ourpages/auto/2021/1/4/63136320/calculus%20of%20a%20single%20variable%208th%20edition%20larson%20hostetler-1.pdf?rnd=1609819461101",
        calendar: [
            { date: "Oct 15", event: "Unit 1-3 Comprehensive Test" },
            { date: "Dec 18", event: "Semester 1 Final (Limits & Derivatives)" },
            { date: "Mar 10", event: "Integration Techniques Assessment" },
            { date: "May 5", event: "AP Calculus AB Exam" }
        ],
        instructors: [
            { name: "Dr. Sarah Mitchell", role: "PhD in Mathematics, 15 years AP experience" },
            { name: "Michael Chen", role: "Calculus Curriculum Designer" }
        ]
    }
};

export default function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const { openTutor } = useTutor();
    const textbookRef = useRef<HTMLDivElement>(null);
    const [showPractice, setShowPractice] = useState(false);
    const [showTextbook, setShowTextbook] = useState(false);
    const [step, setStep] = useState(1); // 1: settings, 2: generating, 3: results
    const [selectedUnit, setSelectedUnit] = useState('');
    const [numProblems, setNumProblems] = useState(5);
    const [difficulty, setDifficulty] = useState('Medium');
    const [generatedProblems, setGeneratedProblems] = useState<any[]>([]);

    const blueprint = academyKnowledge[slug];
    const extras = courseExtras[slug] || { calendar: [], instructors: [] };

    if (!blueprint) {
        return <div className={styles.error}>Course not found</div>;
    }

    const data = {
        ...blueprint,
        ...extras,
        description: blueprint.overview.testingFocus,
        wisdom: blueprint.overview.successBlueprint,
    };

    useEffect(() => {
        if (data.units.length > 0 && !selectedUnit) {
            setSelectedUnit(data.units[0].title);
        }
    }, [data.units]);

    useEffect(() => {
        if (showTextbook && textbookRef.current) {
            textbookRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [showTextbook]);

    const handleGenerate = async () => {
        setStep(2);
        try {
            const response = await fetch('/api/practice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseId: slug,
                    unit: selectedUnit,
                    numProblems,
                    difficulty
                })
            });
            const result = await response.json();
            setGeneratedProblems(result.problems || [
                { q: "Evaluate the limit as x approaches 2 for (x^2-4)/(x-2)", a: "4" },
                { q: "Is the function f(x)=1/x continuous at x=0?", a: "No, vertical asymptote." }
            ]);
            setStep(3);
        } catch (e) {
            setGeneratedProblems([
                { q: "Sample Question 1: What is the derivative of x^2?", a: "2x" },
                { q: "Sample Question 2: Why is the limit important?", a: "It defines continuity and derivatives." }
            ]);
            setStep(3);
        }
    };

    return (
        <main className={`${styles.main} academy-course-page`}>
            <AnimatePresence>
                {showPractice && (
                    <motion.div
                        className={styles.modalOverlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowPractice(false)}
                    >
                        <motion.div
                            className={styles.modalContent}
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button className={styles.closeBtn} onClick={() => setShowPractice(false)}>×</button>

                            {step === 1 && (
                                <div className={styles.practiceSettings}>
                                    <h2 className={styles.modalTitle}>Targeted Practice</h2>
                                    <div className={styles.settingGroup}>
                                        <label>Select Unit</label>
                                        <select value={selectedUnit} onChange={(e) => setSelectedUnit(e.target.value)}>
                                            {data.units.map((u: any) => (
                                                <option key={u.title} value={u.title}>{u.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className={styles.settingGroup}>
                                        <label>Difficulty</label>
                                        <div className={styles.btnGroup}>
                                            {['Easy', 'Medium', 'Hard'].map(d => (
                                                <button
                                                    key={d}
                                                    className={difficulty === d ? styles.activeBtn : ''}
                                                    onClick={() => setDifficulty(d)}
                                                >
                                                    {d}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <button className={styles.generateBtn} onClick={handleGenerate}>
                                        Generate Problems
                                    </button>
                                </div>
                            )}

                            {step === 2 && (
                                <div className={styles.generatingState}>
                                    <div className={styles.loader}></div>
                                    <h2>Crafting your practice set...</h2>
                                    <p>Our AI is selecting problems that match the AP exam style.</p>
                                </div>
                            )}

                            {step === 3 && (
                                <div className={styles.practiceResults}>
                                    <h2 className={styles.modalTitle}>Your Practice Set</h2>
                                    <div className={styles.problemList}>
                                        {generatedProblems.map((p, i) => (
                                            <div key={i} className={styles.problemItem}>
                                                <p className={styles.question}><strong>Q:</strong> {p.q}</p>
                                                <p className={styles.answer}><strong>A:</strong> {p.a}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <button className={styles.generateBtn} onClick={() => setStep(1)}>New Session</button>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className={styles.content}>
                <div className={styles.grid}>
                    {/* Left Column (Main Content) */}
                    <div className={styles.mainContentArea}>
                        <motion.section
                            className={styles.heroSection}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <h1 className={styles.title}>{data.title}</h1>
                            <p className={styles.courseDescMain}>{data.description}</p>

                            <div className={styles.heroActionRow}>
                                <button
                                    className="btn"
                                    onClick={() => { setShowPractice(true); setStep(1); }}
                                >
                                    Make Targeted Practice
                                </button>
                                <button
                                    className={styles.secondaryHeroBtn}
                                    onClick={() => openTutor(slug, undefined, `Course: ${data.title}. Description: ${data.description}. Wisdom: ${data.wisdom}`)}
                                >
                                    💬 Practice with AI
                                </button>
                            </div>

                            <div className={styles.unitList}>
                                <h3 className={styles.subTitle}>Units of Study</h3>
                                <div className={styles.unitsGrid}>
                                    {data.units.map((unit: any, i: number) => (
                                        <div key={i} className={styles.unitCard}>
                                            <div className={styles.unitHeader}>
                                                <span className={styles.unitNum}>Unit {unit.number}</span>
                                                <h4 className={styles.unitName}>{unit.title}</h4>
                                                <span className={`${styles.priorityTag} ${styles[unit.priority.toLowerCase()]}`}>
                                                    {unit.priority}
                                                </span>
                                            </div>

                                            <div className={styles.unitContent}>
                                                <p className={styles.unitPurpose}>
                                                    <strong>The Focus:</strong> {unit.whatMatters}
                                                </p>

                                                <div className={styles.unitDetails}>
                                                    <div className={styles.detailCol}>
                                                        <h5>Test Traps</h5>
                                                        <ul>
                                                            {unit.commonMistakes.slice(0, 2).map((m: any, idx: number) => (
                                                                <li key={idx}>{m.mistake}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                    <div className={styles.detailCol}>
                                                        <h5>Readiness</h5>
                                                        <ul>
                                                            {unit.readinessChecklist.slice(0, 2).map((r: any, idx: number) => (
                                                                <li key={idx}>{r}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>

                                                <button
                                                    className={styles.unitAiBtn}
                                                    onClick={() => openTutor(slug, unit.number, `Unit ${unit.number}: ${unit.title}. Focus: ${unit.whatMatters}`)}
                                                >
                                                    ✨ Strategize with AI
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.section>

                        <section className={styles.resourcesSection}>
                            <h2 className={styles.sectionTitle}>Course Resources</h2>
                            <div className={styles.resourceGrid}>
                                <div className={styles.resourceCard} onClick={() => openTutor(slug)} style={{ cursor: 'pointer' }}>
                                    <div className={styles.resourceIcon}>📚</div>
                                    <h3>Strategy Guides</h3>
                                    <p>Step-by-step breakdowns for every unit.</p>
                                </div>
                                {data.textbook && (
                                    <div className={styles.resourceCard} onClick={() => setShowTextbook(true)} style={{ cursor: 'pointer' }}>
                                        <div className={styles.resourceIcon}>📖</div>
                                        <h3>Online Textbook</h3>
                                        <p>Full digital access to your course materials.</p>
                                    </div>
                                )}
                                <div className={styles.resourceCard}>
                                    <div className={styles.resourceIcon}>✍️</div>
                                    <h3>Past Exams</h3>
                                    <p>Real past exam questions with scoring rubrics.</p>
                                </div>
                                <div className={styles.resourceCard}>
                                    <div className={styles.resourceIcon}>🧠</div>
                                    <h3>Flashcards</h3>
                                    <p>Interactive deck for active recall.</p>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Column (Sidebar) */}
                    <aside className={styles.sidebar}>
                        <div className={`${styles.sidebarCard} ${styles.wisdomCard}`}>
                            <h2 className={styles.sidebarTitle}>Student Wisdom</h2>
                            <p className={styles.wisdomText}>"{data.wisdom}"</p>
                        </div>

                        <div className={styles.sidebarCard}>
                            <h2 className={styles.sidebarTitle}>Course Calendar</h2>
                            <div className={styles.calendarList}>
                                {data.calendar.map((item: any, i: number) => (
                                    <div key={i} className={styles.calendarItem}>
                                        <span className={styles.calendarDate}>{item.date}</span>
                                        <span className={styles.calendarEvent}>{item.event}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>
                </div>

                {/* Textbook Section */}
                <AnimatePresence>
                    {showTextbook && data.textbook && (
                        <motion.section
                            ref={textbookRef}
                            className={styles.textbookSection}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            <div className={styles.textbookHeader}>
                                <h2 className={styles.sectionTitle}>Full Textbook: {data.title}</h2>
                                <button className={styles.closeTextbookBtn} onClick={() => setShowTextbook(false)}>Close Textbook ×</button>
                            </div>
                            <iframe
                                src={`${data.textbook}#toolbar=0`}
                                className={styles.inlinePdfViewer}
                                title="Textbook Viewer"
                            />
                        </motion.section>
                    )}
                </AnimatePresence>

                {/* Bottom Section: Instructors */}
                <section className={styles.instructorsSection}>
                    <h2 className={styles.sectionTitle}>Your Instructors</h2>
                    <div className={styles.instructorGrid}>
                        {data.instructors.map((ins: any, i: number) => (
                            <div key={i} className={styles.instructorCard}>
                                <div className={styles.instructorAvatar}>
                                    {ins.name ? ins.name.split(' ').map((n: string) => n.charAt(0)).join('') : 'AI'}
                                </div>
                                <div>
                                    <h4 className={styles.instructorName}>{ins.name}</h4>
                                    <p className={styles.instructorRole}>{ins.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}
