'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTutor } from '@/context/TutorContext';
import styles from './page.module.css';

const courses = [
    {
        category: "Math",
        id: "01",
        items: [
            { title: "AP Calculus AB", desc: "Master the fundamentals of limits, derivatives, and integrals.", tag: "MATH" }
        ]
    },
    {
        category: "Science",
        id: "02",
        items: [
            { title: "AP Chemistry", desc: "Dive into the properties, composition, and structure of matter.", tag: "SCIENCE" }
        ]
    },
    {
        category: "History",
        id: "03",
        items: [
            { title: "AP World History", desc: "A journey through global historical developments and cultural changes.", tag: "HISTORY" }
        ]
    }
];

export default function AcademyPage() {
    const { openTutor } = useTutor();

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
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                    <h1 className={styles.title}>
                        Knowledge Groove <br />
                        <span className="gradient-text-primary">Academy</span>
                    </h1>
                    <p className={styles.subtitle}>
                        The premium platform for high school success. <br />
                        Real advice. AI Strategy. Proven Results.
                    </p>
                    <div className={styles.heroButtons}>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Link href="#courses" className="btn">
                                Explore Courses
                            </Link>
                        </motion.div>
                    </div>
                </motion.div>
            </section>

            {/* Courses Section */}
            <section id="courses" className={styles.section}>
                {courses.map((cat, catIdx) => (
                    <motion.div
                        key={cat.category}
                        className={styles.categoryGroup}
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, delay: catIdx * 0.1 }}
                    >
                        <div className={styles.categoryHeader}>
                            <span className={styles.categoryNumber}>{cat.id}</span>
                            <h2 className={styles.categoryTitle}>{cat.category}</h2>
                            <div className={styles.categoryLine} />
                        </div>

                        <div className={styles.grid}>
                            {cat.items.map((course, idx) => (
                                <Link
                                    key={course.title}
                                    href={`/academy/courses/${course.title.toLowerCase().replace(/ /g, '-')}`}
                                    className={styles.courseCardLink}
                                >
                                    <motion.div
                                        className={styles.courseCard}
                                        whileHover={{
                                            y: -15,
                                            boxShadow: '0 40px 80px -20px rgba(0,0,0,0.1)',
                                            borderColor: 'var(--accent)'
                                        }}
                                        whileTap={{ scale: 0.98 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    >
                                        <span className={styles.courseTag}>{course.tag}</span>
                                        <h3 className={styles.courseTitle}>{course.title}</h3>
                                        <p className={styles.courseDesc}>{course.desc}</p>
                                        <div className={styles.courseLink}>
                                            View Strategy Guide <span>→</span>
                                        </div>
                                    </motion.div>
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </section>

            {/* Footer CTA */}
            <section className={styles.footerCta}>
                <motion.div
                    className={styles.ctaContent}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className={styles.ctaTitle}>Ready to start?</h2>
                    <div className={styles.heroButtons}>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn">Enroll Now</motion.button>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn" style={{ background: 'white', color: 'black', border: '1px solid rgba(0,0,0,0.1)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>Contact Us</motion.button>
                    </div>
                </motion.div>
            </section>
        </motion.main>
    );
}
