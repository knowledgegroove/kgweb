'use client';

import { use } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './page.module.css';

const courseData: Record<string, any> = {
    'ap-calculus-ab': {
        title: "AP Calculus AB",
        description: "Focuses on the concepts and applications of derivatives and integrals.",
        units: [
            "Unit 1: Limits and Continuity",
            "Unit 2: Differentiation: Definition and Basic Rules",
            "Unit 3: Differentiation: Composite, Implicit, and Inverse Functions",
            "Unit 4: Contextual Applications of Differentiation",
            "Unit 5: Analytical Applications of Differentiation",
            "Unit 6: Integration and Accumulation of Change",
            "Unit 7: Differential Equations",
            "Unit 8: Applications of Integration"
        ],
        calendar: [
            { date: "Oct 15", event: "Unit 1-3 Comprehensive Test" },
            { date: "Dec 18", event: "Semester 1 Final (Limits & Derivatives)" },
            { date: "Mar 10", event: "Integration Techniques Assessment" },
            { date: "May 5", event: "AP Calculus AB Exam" }
        ],
        wisdom: "Focus on the 'why' behind the limit. Once you understand continuity, the rest of derivatives feels like a natural progression.",
        instructors: [
            { name: "Dr. Sarah Mitchell", role: "PhD in Mathematics, 15 years AP experience" },
            { name: "Michael Chen", role: "Calculus Curriculum Designer" }
        ]
    },
    'ap-chemistry': {
        title: "AP Chemistry",
        description: "An deep dive into the properties of matter and chemical reactions.",
        units: [
            "Unit 1: Atomic Structure and Properties",
            "Unit 2: Molecular and Ionic Compound Structure and Properties",
            "Unit 3: Intermolecular Forces and Properties",
            "Unit 4: Chemical Reactions",
            "Unit 5: Kinetics",
            "Unit 6: Thermodynamics",
            "Unit 7: Equilibrium",
            "Unit 8: Acids and Bases",
            "Unit 9: Applications of Thermodynamics"
        ],
        calendar: [
            { date: "Oct 20", event: "Atomic Theory & Bonding Test" },
            { date: "Dec 15", event: "IMF & Kinetics Midterm" },
            { date: "Apr 5", event: "The Great Acid-Base Mock Exam" },
            { date: "May 10", event: "AP Chemistry Exam" }
        ],
        wisdom: "Equilibrium is the heart of the course. If you master Unit 7, Unit 8 and 9 will make so much more sense.",
        instructors: [
            { name: "Prof. Robert Boyle", role: "Lead Chemistry Researcher" },
            { name: "Elena Rodriguez", role: "AP Chemistry Board Consultant" }
        ]
    },
    'ap-world-history': {
        title: "AP World History",
        description: "Exploring the global events that shaped our modern world from 1200 CE to the present.",
        units: [
            "Unit 1: The Global Tapestry",
            "Unit 2: Networks of Exchange",
            "Unit 3: Land-Based Empires",
            "Unit 4: Transoceanic Interconnections",
            "Unit 5: Revolutions",
            "Unit 6: Consequences of Industrialization",
            "Unit 7: Global Conflict",
            "Unit 8: Cold War and Decolonization",
            "Unit 9: Globalization"
        ],
        calendar: [
            { date: "Nov 2", event: "The Silk Road & Mongol Empire Project" },
            { date: "Jan 12", event: "Age of Revolutions DBQ" },
            { date: "Mar 25", event: "World War I & II Analysis" },
            { date: "May 15", event: "AP World History Exam" }
        ],
        wisdom: "Don't just memorize dates. Focus on the 'Change and Continuity' themes. The DBQ is won by your ability to connect documents to the bigger picture.",
        instructors: [
            { name: "Dr. Marcus Aurelius", role: "Historian & DBQ Specialist" },
            { name: "Sarah Jenkins", role: "Curriculum Expert, 12 years experience" }
        ]
    }
};

export default function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const data = courseData[slug] || {
        title: slug.charAt(0).toUpperCase() + slug.slice(1),
        description: "Course details coming soon.",
        units: [],
        calendar: [],
        wisdom: "Stay curious and keep practicing!",
        instructors: []
    };

    return (
        <motion.main
            className={styles.main}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <nav className={styles.nav}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <Link href="/academy" className={styles.backLink}>
                        <motion.span whileHover={{ x: -5 }}>←</motion.span> Back to Academy
                    </Link>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="btn"
                        style={{ padding: '0.8rem 1.6rem', fontSize: '0.95rem' }}
                    >
                        Make Practice Problems
                    </motion.button>
                </div>
            </nav>

            <div className={styles.content}>
                <div className={styles.grid}>
                    {/* Left Column */}
                    <div className={styles.leftColumn}>
                        <motion.section
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className={styles.heroSection}
                        >
                            <h1 className={styles.title}>{data.title}</h1>
                            <p className={styles.courseDescMain}>{data.description}</p>

                            <motion.div
                                className={styles.unitList}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <h3 className={styles.subTitle}>Units of Study</h3>
                                <ul>
                                    {data.units.map((unit: string, i: number) => (
                                        <motion.li
                                            key={i}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.4 + (i * 0.05) }}
                                        >
                                            {unit}
                                        </motion.li>
                                    ))}
                                </ul>
                            </motion.div>
                        </motion.section>

                        <section className={styles.resourcesSection}>
                            <motion.h2
                                className={styles.sectionTitle}
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                            >
                                Resources
                            </motion.h2>
                            <div className={styles.resourceGrid}>
                                {[
                                    { icon: "📚", title: "Strategy Guides", p: "Step-by-step unit breakdowns." },
                                    { icon: "🎥", title: "Video Lectures", p: "Key concept video series." },
                                    { icon: "📝", title: "Practice FRQs", p: "Real past exam questions." },
                                    { icon: "🧠", title: "Flashcards", p: "Active recall deck." }
                                ].map((res, i) => (
                                    <motion.div
                                        key={i}
                                        className={styles.resourceCard}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1 }}
                                        whileHover={{ y: -10, borderColor: 'var(--primary)' }}
                                    >
                                        <div className={styles.resourceIcon}>{res.icon}</div>
                                        <h3>{res.title}</h3>
                                        <p>{res.p}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Right Column (Sidebar) */}
                    <aside className={styles.sidebar}>
                        <motion.div
                            className={`${styles.sidebarCard} ${styles.wisdomCard}`}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            <h2 className={styles.sidebarTitle}>Student Wisdom</h2>
                            <p className={styles.wisdomText}>"{data.wisdom}"</p>
                        </motion.div>

                        <motion.div
                            className={styles.sidebarCard}
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            <h2 className={styles.sidebarTitle}>Calendar</h2>
                            <div className={styles.calendarList}>
                                {data.calendar.map((item: any, i: number) => (
                                    <div key={i} className={styles.calendarItem}>
                                        <span className={styles.calendarDate}>{item.date}</span>
                                        <span className={styles.calendarEvent}>{item.event}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </aside>
                </div>

                {/* Bottom Section: Instructors */}
                <section className={styles.instructorsSection}>
                    <h2 className={styles.sectionTitle}>Instructors</h2>
                    <div className={styles.instructorGrid}>
                        {data.instructors.map((ins: any, i: number) => (
                            <motion.div
                                key={i}
                                className={styles.instructorCard}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.2 }}
                                whileHover={{ scale: 1.05 }}
                            >
                                <div className={styles.instructorAvatar}>
                                    {ins.name.split(' ').map((n: string) => n[0]).join('')}
                                </div>
                                <div className={styles.instructorInfo}>
                                    <h3>{ins.name}</h3>
                                    <p>{ins.role}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>
            </div>
        </motion.main>
    );
}
