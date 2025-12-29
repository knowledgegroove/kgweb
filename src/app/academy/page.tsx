'use client';

import Link from 'next/link';
import React from 'react';
import { motion } from 'framer-motion';

import { useTutor } from '@/context/TutorContext';
import { useTheme } from '@/context/ThemeContext';
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
            { title: "AP Chemistry", desc: "Dive into the properties, composition, and structure of matter.", tag: "SCIENCE" },
            { title: "AP Physics 1", desc: "Master the laws of motion, force, and energy.", tag: "SCIENCE" },
            { title: "Honors Physics", desc: "A deep dive into classical mechanics and physical phenomena.", tag: "SCIENCE" },
            { title: "Honors Chemistry", desc: "Explore the building blocks of the universe and chemical reactions.", tag: "SCIENCE" }
        ]
    },
    {
        category: "History",
        id: "03",
        items: [
            { title: "AP World History", desc: "A journey through global historical developments and cultural changes.", tag: "HISTORY" },
            { title: "AP US History", desc: "Explore the American narrative from pre-colonial times to the present.", tag: "HISTORY" }
        ]
    },
    {
        category: "Tech",
        id: "04",
        items: [
            { title: "AP Computer Science A", desc: "Master the principles of object-oriented programming with Java.", tag: "TECH" }
        ]
    }
];

import { useExperience } from '@/context/ExperienceContext';

export default function AcademyLanding() {
    const { openModal } = useExperience();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { theme, toggleTheme } = useTheme();
    const { openTutor } = useTutor();

    return (
        <motion.main
            className={styles.main}
            data-theme="light"
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
                        Welcome to <br />
                        <span className="gradient-text-blue">Knowledge Groove Academy</span>
                    </h1>


                    <p className={styles.subtitle}>
                        A premium learning platform for high school mastery. <br />
                        Curriculum-aligned learning. Targeted practice. Clear understanding.
                    </p>

                    <div className={styles.heroActionRow}>
                        <Link href="#courses" className="btn">
                            Explore Courses
                        </Link>
                        <button className={styles.secondaryBtn} onClick={() => openTutor()}>
                            Talk to AI Mentor
                        </button>
                    </div>
                </motion.div>
            </section>



            {/* Course Catalog */}
            <section id="courses" className={styles.section}>
                {courses.map((category, idx) => (
                    <motion.div
                        key={category.category}
                        className={styles.categoryGroup}
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, delay: idx * 0.1 }}
                    >
                        <div className={styles.categoryHeader}>
                            <span className={styles.categoryNumber}>{category.id}</span>
                            <h2 className={styles.categoryTitle}>{category.category}</h2>
                            <div className={styles.categoryLine} />
                        </div>

                        <div className={styles.grid}>
                            {category.items.map((course) => (

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
                                            borderColor: '#3b82f6'
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
                    className={styles.footerGrid}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <div className={styles.ctaCard}>
                        <h2 className={styles.ctaTitle}>Ready to start?</h2>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="btn"
                            style={{ width: '100%', maxWidth: '280px' }}
                            onClick={() => {
                                const coursesSection = document.getElementById('courses');
                                if (coursesSection) {
                                    coursesSection.scrollIntoView({ behavior: 'smooth' });
                                }
                            }}
                        >
                            Start Path
                        </motion.button>

                    </div>

                    <div className={styles.ctaCard}>
                        <h2 className={styles.ctaTitle} style={{ fontSize: '2rem' }}>Already completed a course?</h2>
                        <motion.button

                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="btn"
                            onClick={() => openModal()}
                            style={{

                                background: 'white',
                                color: 'black',
                                border: '1px solid rgba(0,0,0,0.1)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                width: '100%',
                                maxWidth: '280px'
                            }}
                        >
                            Share Your Experience
                        </motion.button>
                    </div>
                </motion.div>
            </section>

            <footer style={{
                textAlign: 'center',
                padding: '2rem',
                fontSize: '0.75rem',
                opacity: 0.5,
                maxWidth: '800px',
                margin: '0 auto'
            }}>
                <p>AP® is a registered trademark of the College Board, which was not involved in the production of, and does not endorse, this product.</p>
            </footer>

        </motion.main>
    );
}
