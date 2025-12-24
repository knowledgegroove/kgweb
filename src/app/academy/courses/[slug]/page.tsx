'use client';

import { use, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useTutor } from '@/context/TutorContext';
import { academyKnowledge } from '@/data/academyKnowledge';
import { alumniMemory } from '@/data/alumniMemory';
import alumniStyles from './alumni.module.css';
import { InlineMath, BlockMath } from 'react-katex';
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
    const { openTutor, isOpen } = useTutor();
    const textbookRef = useRef<HTMLDivElement>(null);
    const resourcesRef = useRef<HTMLDivElement>(null);
    const guidesRef = useRef<HTMLDivElement>(null);

    const [showTextbook, setShowTextbook] = useState(false);
    const [showResources, setShowResources] = useState(false);
    const [showGuides, setShowGuides] = useState(false);
    const [activeResourceUnit, setActiveResourceUnit] = useState<number | null>(null);
    const [activeGuideUnit, setActiveGuideUnit] = useState<number | null>(null);
    const [expandedUnit, setExpandedUnit] = useState<number | null>(null);

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
        if (showTextbook && textbookRef.current) {
            const timer = setTimeout(() => {
                textbookRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [showTextbook]);

    useEffect(() => {
        if (showResources && resourcesRef.current) {
            const timer = setTimeout(() => {
                resourcesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [showResources, activeResourceUnit]);

    useEffect(() => {
        if (showGuides && guidesRef.current) {
            const timer = setTimeout(() => {
                guidesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [showGuides, activeGuideUnit]);

    const MathRenderer = ({ text }: { text: string }) => {
        const lines = text.split('\n');
        return (
            <div className={styles.mathContent}>
                {lines.map((line, lIdx) => {
                    const segments = line.split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g);
                    return (
                        <div key={lIdx} style={{ marginBottom: line.trim() === '' ? '1.5rem' : '0.5rem', minHeight: '1em' }}>
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

    const toggleResourceSection = (section: 'textbook' | 'resources' | 'guides') => {
        if (section === 'textbook') {
            setShowTextbook(!showTextbook);
            setShowResources(false);
            setShowGuides(false);
        } else if (section === 'resources') {
            setShowResources(!showResources);
            setShowTextbook(false);
            setShowGuides(false);
        } else if (section === 'guides') {
            setShowGuides(!showGuides);
            setShowTextbook(false);
            setShowResources(false);
        }
    };

    return (
        <main className={styles.main}>
            <div className={styles.content}>
                <div className={`${styles.grid} ${isOpen ? styles.tutorActiveGrid : ''}`}>
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
                                    onClick={() => openTutor(slug, undefined, undefined, 'practice')}
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
                                <h2 className={styles.sectionTitle} style={{ color: 'white' }}>Units of Study</h2>
                                <div className={styles.unitsGrid}>
                                    {data.units.map((unit: any, i: number) => (
                                        <div key={i} className={styles.unitCard}>
                                            <div className={styles.unitHeader}>
                                                <span className={styles.unitNum}>Unit {unit.number}</span>
                                                <h4 className={styles.unitName}>{unit.title}</h4>
                                                <button
                                                    className={styles.learnMoreBtn}
                                                    onClick={() => setExpandedUnit(expandedUnit === unit.number ? null : unit.number)}
                                                >
                                                    {expandedUnit === unit.number ? 'Show Less' : 'Learn More'}
                                                </button>
                                                <span className={`${styles.priorityTag} ${styles[unit.priority.toLowerCase()]}`}>
                                                    {unit.priority}
                                                </span>
                                            </div>

                                            <div className={styles.unitContent}>
                                                <p className={styles.unitPurpose}>
                                                    <strong>The Focus:</strong> {unit.whatMatters}
                                                </p>

                                                <AnimatePresence>
                                                    {expandedUnit === unit.number && (
                                                        <motion.div
                                                            className={styles.unitDetails}
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.3 }}
                                                        >
                                                            <motion.div
                                                                className={styles.detailCol}
                                                                initial="hidden"
                                                                animate="visible"
                                                                variants={{
                                                                    hidden: { opacity: 0 },
                                                                    visible: {
                                                                        opacity: 1,
                                                                        transition: { staggerChildren: 0.1 }
                                                                    }
                                                                }}
                                                            >
                                                                <h5>Test Traps</h5>
                                                                <ul>
                                                                    {unit.commonMistakes.slice(0, 2).map((m: any, idx: number) => (
                                                                        <motion.li
                                                                            key={idx}
                                                                            variants={{
                                                                                hidden: { opacity: 0, x: -10 },
                                                                                visible: { opacity: 0.6, x: 0 }
                                                                            }}
                                                                        >
                                                                            {m.mistake}
                                                                        </motion.li>
                                                                    ))}
                                                                </ul>
                                                            </motion.div>
                                                            <motion.div
                                                                className={styles.detailCol}
                                                                initial="hidden"
                                                                animate="visible"
                                                                variants={{
                                                                    hidden: { opacity: 0 },
                                                                    visible: {
                                                                        opacity: 1,
                                                                        transition: { staggerChildren: 0.1, delayChildren: 0.2 }
                                                                    }
                                                                }}
                                                            >
                                                                <h5>Readiness</h5>
                                                                <ul>
                                                                    {unit.readinessChecklist.slice(0, 2).map((r: any, idx: number) => (
                                                                        <motion.li
                                                                            key={idx}
                                                                            variants={{
                                                                                hidden: { opacity: 0, x: -10 },
                                                                                visible: { opacity: 0.6, x: 0 }
                                                                            }}
                                                                        >
                                                                            {r}
                                                                        </motion.li>
                                                                    ))}
                                                                </ul>
                                                            </motion.div>

                                                            <button
                                                                className={styles.unitAiBtn}
                                                                style={{ marginTop: '2rem' }}
                                                                onClick={() => openTutor(slug, unit.number, `Unit ${unit.number}: ${unit.title}. Focus: ${unit.whatMatters}`)}
                                                            >
                                                                ✨ Strategize with AI
                                                            </button>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.section>

                        <section className={styles.resourcesSection}>
                            <h2 className={styles.sectionTitle}>Course Resources</h2>
                            <div className={styles.resourceGrid}>
                                <div className={styles.resourceCard} onClick={() => toggleResourceSection('guides')} style={{ cursor: 'pointer' }}>
                                    <div className={styles.resourceIcon}>📚</div>
                                    <h3>Strategy Guides</h3>
                                    <p>Step-by-step breakdowns for every unit.</p>
                                </div>
                                {data.resourceLinks && (
                                    <div className={styles.resourceCard} onClick={() => toggleResourceSection('resources')} style={{ cursor: 'pointer' }}>
                                        <div className={styles.resourceIcon}>🔗</div>
                                        <h3>General Resources</h3>
                                        <p>Curated list of external labs and tools.</p>
                                    </div>
                                )}
                                {data.textbook && (
                                    <div className={styles.resourceCard} onClick={() => toggleResourceSection('textbook')} style={{ cursor: 'pointer' }}>
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
                    {!isOpen && (
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

                            {/* Alumni Advice in Sidebar */}
                            <div className={styles.sidebarCard} style={{ background: 'rgba(79, 70, 229, 0.03)', borderColor: 'rgba(79, 70, 229, 0.1)' }}>
                                <h2 className={styles.sidebarTitle}>Alumni Advice</h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    {alumniMemory.filter(tip => tip.courseId === data.id).map((tip, idx) => (
                                        <div key={idx} style={{ padding: '1.5rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '1rem', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', fontSize: '0.85rem', opacity: 0.6 }}>
                                                <span style={{ fontWeight: 800, color: 'white' }}>{tip.studentName}</span>
                                                <span>{tip.date}</span>
                                            </div>
                                            <p style={{ fontSize: '0.95rem', fontStyle: 'italic', lineHeight: '1.5', opacity: 0.9 }}>"{tip.tip}"</p>
                                        </div>
                                    ))}
                                    {alumniMemory.filter(tip => tip.courseId === data.id).length === 0 && (
                                        <p style={{ opacity: 0.5, fontStyle: 'italic', fontSize: '0.9rem' }}>Be the first to share advice for this course!</p>
                                    )}
                                </div>
                            </div>
                        </aside>
                    )}
                </div>

                {/* Textbook Section */}
                <AnimatePresence>
                    {showTextbook && data.textbook && (
                        <motion.section
                            ref={textbookRef}
                            className={styles.resourcesContentSection}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            <div className={styles.textbookHeader}>
                                <h2 className={styles.sectionTitle}>Online Textbook: {data.title}</h2>
                                <button className={styles.closeTextbookBtn} onClick={() => setShowTextbook(false)}>Close ×</button>
                            </div>
                            <iframe
                                src={data.textbook}
                                className={styles.textbookFrame}
                                title="Course Textbook"
                            />
                        </motion.section>
                    )}
                </AnimatePresence>

                {/* General Resources Section */}
                <AnimatePresence>
                    {showResources && data.resourceLinks && (
                        <motion.section
                            ref={resourcesRef}
                            className={styles.resourcesContentSection}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            <div className={styles.textbookHeader}>
                                <h2 className={styles.sectionTitle}>General Resources: {data.title}</h2>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    {activeResourceUnit !== null && (
                                        <button className={styles.closeTextbookBtn} onClick={() => setActiveResourceUnit(null)}>← All Units</button>
                                    )}
                                    <button className={styles.closeTextbookBtn} onClick={() => { setShowResources(false); setActiveResourceUnit(null); }}>Close ×</button>
                                </div>
                            </div>

                            <div className={styles.resourceLinksContent}>
                                {activeResourceUnit === null ? (
                                    <div className={styles.unitResourceGrid}>
                                        {data.resourceLinks.map((cat: any, idx: number) => (
                                            <button
                                                key={idx}
                                                className={styles.unitResourceCard}
                                                onClick={() => setActiveResourceUnit(idx)}
                                            >
                                                <span className={styles.unitResourceNum}>Module {idx + 1}</span>
                                                <h4 className={styles.unitResourceTitle}>{cat.category.split(': ')[1] || cat.category}</h4>
                                                <p className={styles.unitResourceLinksCount}>{cat.links.length} Resources</p>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className={styles.linksGridWrapper}>
                                        <h3 className={styles.unitPathTitle}>
                                            {data.resourceLinks[activeResourceUnit].category}
                                        </h3>
                                        <div className={styles.linksGrid}>
                                            {data.resourceLinks[activeResourceUnit].links.map((link: any, lIdx: number) => (
                                                <a
                                                    key={lIdx}
                                                    href={link.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={styles.resourceLinkCard}
                                                >
                                                    <span className={styles.linkTitle}>{link.title}</span>
                                                    <span className={styles.linkUrl}>{link.url}</span>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.section>
                    )}
                </AnimatePresence>

                {/* Strategy Guides Section */}
                <AnimatePresence>
                    {showGuides && (
                        <motion.section
                            ref={guidesRef}
                            className={styles.resourcesContentSection}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            <div className={styles.textbookHeader}>
                                <h2 className={styles.sectionTitle}>Strategy Guides: {data.title}</h2>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    {activeGuideUnit !== null && (
                                        <button className={styles.closeTextbookBtn} onClick={() => setActiveGuideUnit(null)}>← All Units</button>
                                    )}
                                    <button className={styles.closeTextbookBtn} onClick={() => { setShowGuides(false); setActiveGuideUnit(null); }}>Close ×</button>
                                </div>
                            </div>

                            <div className={styles.resourceLinksContent}>
                                {activeGuideUnit === null ? (
                                    <div className={styles.unitResourceGrid}>
                                        {data.units.map((unit: any, idx: number) => {
                                            const hasGuide = data.strategyGuides?.some((g: any) => g.unitNumber === unit.number);
                                            return (
                                                <button
                                                    key={idx}
                                                    className={`${styles.unitResourceCard} ${!hasGuide ? styles.disabledCard : ''}`}
                                                    onClick={() => hasGuide && setActiveGuideUnit(unit.number)}
                                                    disabled={!hasGuide}
                                                >
                                                    <span className={styles.unitResourceNum}>Unit {unit.number}</span>
                                                    <h4 className={styles.unitResourceTitle}>{unit.title}</h4>
                                                    <p className={styles.unitResourceLinksCount}>{hasGuide ? 'View Guide' : 'Coming Soon'}</p>
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className={styles.guideWrapper}>
                                        {data.strategyGuides?.filter((g: any) => g.unitNumber === activeGuideUnit).map((guide: any, gIdx: number) => (
                                            <div key={gIdx} className={styles.guideContentBody}>
                                                <MathRenderer text={guide.content} />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
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
