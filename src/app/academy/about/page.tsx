'use client';

import { motion } from 'framer-motion';
import styles from './page.module.css';
import { useExperience } from '@/context/ExperienceContext';

export default function AboutPage() {
    const { openModal } = useExperience();
    return (
        <motion.main
            className={styles.main}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
        >
            {/* Hero Section */}
            <section className={styles.hero}>
                <motion.div
                    className={styles.heroContent}
                    initial={{ x: -40, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className={styles.title}>
                        <span className="gradient-text-blue">About Us</span>
                    </h1>

                    <h2 className={styles.subtitle}>
                        What is Knowledge Groove Academy?
                    </h2>
                    <p className={styles.heroDescription}>
                        Knowledge Groove Academy is an online learning platform designed to help students master challenging academic subjects through structured, concept-driven instruction and purposeful practice.
                    </p>
                    <p className={styles.heroDescription} style={{ opacity: 0.9, fontStyle: 'italic', marginTop: '1.5rem', fontWeight: 500 }}>
                        Founded by Ishaan Garg, a high school student focused on building practical, useful tools for the community.
                    </p>
                </motion.div>
            </section>

            {/* Introduction & Core Offering */}
            <section className={styles.section}>
                <div className={styles.introContent}>
                    <p>
                        All courses are built using official curricula, teacher recommendations, and insights drawn from past students’ experiences. Lessons are organized unit by unit to reflect how topics are actually taught and assessed, while highlighting common misconceptions, effective strategies, and areas students typically struggle with.
                    </p>

                    <h3 className={styles.sectionHeader} style={{ fontSize: '1.4rem', marginTop: '3rem' }}>
                        Knowledge Groove Academy brings together:
                    </h3>

                    <div className={styles.verticalList}>
                        {[
                            { title: "Curriculum-aligned course structures", desc: "Course paths built to match official standards and pacing." },
                            { title: "Teacher-informed explanations", desc: "Emphasis on key concepts prioritized by professional instructors." },
                            { title: "Modeled practice problems", desc: "Problems designed after real assessments to ensure test day readiness." },
                            { title: "Student-driven insights", desc: "Tips and sanity checks from alumni who have already mastered the material." },
                            { title: "Comprehensive Support", desc: "A system designed to support understanding, retention, and confidence." }
                        ].map((feature, idx) => (
                            <motion.div
                                key={idx}
                                className={styles.listItem}
                                initial={{ x: -20, opacity: 0 }}
                                whileInView={{ x: 0, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <h4>{feature.title}</h4>
                                <p>{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>

                    <div className={styles.philosophyBreaker}>
                        <p>
                            At its core, the academy focuses on why concepts work, not just how to apply formulas or procedures. The goal is to help students think critically, learn efficiently, and develop mastery that lasts beyond a single exam.
                        </p>
                        <p>
                            Too often, students are overwhelmed by scattered resources, rushed explanations, and practice problems that don’t reflect how concepts are tested. This platform was designed to be different. Every course, unit, and lesson is structured around clarity, mastery, and long-term retention.
                        </p>
                    </div>
                </div>
            </section>

            {/* Who This Is For */}
            <section className={styles.section}>
                <div className={styles.whoSection}>
                    <motion.h2
                        initial={{ x: -20, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        className={styles.sectionHeader}
                    >
                        Who This Is For
                    </motion.h2>
                    <div className={styles.verticalList}>
                        {[
                            "Students taking rigorous courses (AP, honors, advanced STEM)",
                            "Learners who want structure, not chaos",
                            "Students who care about understanding deeply, not cramming",
                            "Anyone who wants to walk into class or exams feeling prepared and confident"
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                className={styles.listItem}
                                initial={{ x: -20, opacity: 0 }}
                                whileInView={{ x: 0, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <p style={{ fontSize: '1.25rem', fontWeight: 600 }}>{item}</p>
                            </motion.div>
                        ))}
                    </div>
                    <p style={{ marginTop: '3rem', opacity: 0.7, fontSize: '1.2rem', fontStyle: 'italic' }}>
                        Whether you’re learning ahead, catching up, or reinforcing what you already know, the goal is the same: mastery.
                    </p>
                </div>
            </section>

            {/* Our Philosophy */}
            <section className={styles.section}>
                <div className={styles.philosophySection}>
                    <motion.h2
                        className={styles.sectionHeader}
                        initial={{ x: -20, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        Our Philosophy
                    </motion.h2>
                    <div className={styles.verticalList}>
                        {[
                            { label: "Clarity Over Shortcuts", text: "Clear explanations beat flashy shortcuts." },
                            { label: "Productive Struggle", text: "Struggle is part of learning—but confusion shouldn’t be." },
                            { label: "Real Confidence", text: "Confidence comes from understanding, not memorization." },
                            { label: "Systematic Design", text: "A well-designed system can make hard subjects feel manageable." },
                            { label: "Student Empowerment", text: "Education should empower students, not intimidate them." }
                        ].map((phi, idx) => (
                            <motion.div
                                key={idx}
                                className={styles.listItem}
                                initial={{ x: -20, opacity: 0 }}
                                whileInView={{ x: 0, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <h4>{phi.label}</h4>
                                <p>{phi.text}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Looking Ahead */}
            <section className={styles.lookingAhead}>
                <motion.h2
                    initial={{ x: -20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    className={styles.sectionHeader}
                >
                    Looking Ahead
                </motion.h2>
                <div className={styles.verticalList}>
                    {[
                        { title: "Personalized review and memory-based learning tools", desc: "Adaptive systems to anchor long-term retention." },
                        { title: "Smarter practice recommendations", desc: "AI-driven paths based on your current readiness." },
                        { title: "Expanded course offerings", desc: "Continuously growing library of advanced subjects." },
                        { title: "Deeper progress tracking", desc: "Advanced metrics to visualize your path to mastery." }
                    ].map((item, idx) => (
                        <motion.div
                            key={idx}
                            className={styles.listItem}
                            initial={{ x: -20, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <h4>{item.title}</h4>
                            <p>{item.desc}</p>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    className={styles.visionStatement}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                >
                    Our vision: To build a platform for fostering true understanding and confidence in academics.
                </motion.div>

                <motion.div
                    className={styles.footerGrid}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.8 }}
                >
                    <div className={styles.ctaCard}>
                        <h2 className={styles.ctaTitle}>Ready to start?</h2>
                        <button
                            className="btn"
                            onClick={() => window.location.href = '/academy#courses'}
                            style={{ width: '100%', maxWidth: '280px' }}
                        >
                            Start Path
                        </button>
                    </div>

                    <div className={styles.ctaCard}>
                        <h2 className={styles.ctaTitle} style={{ fontSize: '1.8rem' }}>Already taken a course?</h2>
                        <button
                            className="btn"
                            onClick={() => openModal()}
                            style={{
                                width: '100%',
                                maxWidth: '280px',
                                opacity: 0.9
                            }}
                        >
                            Share your experience
                        </button>
                    </div>
                </motion.div>

            </section>
        </motion.main>
    );
}
