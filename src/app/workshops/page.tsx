'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import styles from './page.module.css';

const workshops = [
    {
        title: "Mastering AP Calculus",
        date: "December 2025",
        desc: "An intensive weekend workshop focusing on derivative applications and integral techniques for high-performing students.",
        image: "/images/workshops/workshop1.png"
    },
    {
        title: "Future of Tech: AI & Robotics",
        date: "November 2025",
        desc: "A hands-on exploration of artificial intelligence fundamentals and their practical applications in modern robotics.",
        image: "/images/workshops/workshop2.png"
    },
    {
        title: "Financial Literacy for Teens",
        date: "October 2025",
        desc: "Empowering the next generation with essential knowledge about investing, budgeting, and the stock market.",
        image: "/images/workshops/workshop3.png"
    }
];

export default function WorkshopsPage() {
    return (
        <main className={styles.main}>
            {/* Hero Section */}
            <section className={styles.hero}>
                <motion.div
                    className={styles.heroContent}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                >
                    <h1 className={styles.title}>
                        Workshop <span className="gradient-text-pink">Center</span>
                    </h1>
                    <p className={styles.subtitle}>
                        Bridging the gap between theory and innovation through hands-on, high-impact learning experiences.
                    </p>
                </motion.div>
            </section>

            {/* Past Workshops Section */}
            <section className={styles.section}>
                <motion.h2
                    className={styles.sectionTitle}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                >
                    Recent Workshops
                </motion.h2>
                <div className={styles.workshopGrid}>
                    {workshops.map((workshop, index) => (
                        <motion.div
                            key={index}
                            className={styles.workshopCard}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7, delay: index * 0.15 }}
                        >
                            <div className={styles.imagePlaceholder}>
                                <Image
                                    src={workshop.image}
                                    alt={workshop.title}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 33vw"
                                    priority={index === 0}
                                />
                            </div>
                            <div className={styles.cardContent}>
                                <div className={styles.workshopDate}>{workshop.date}</div>
                                <h3 className={styles.workshopTitle}>{workshop.title}</h3>
                                <p className={styles.workshopDesc}>{workshop.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Photo Gallery Section */}
            <section className={styles.gallerySection}>
                <motion.h2
                    className={styles.sectionTitle}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                >
                    Moments from the Groove
                </motion.h2>
                <div className={styles.galleryGrid}>
                    {[1, 2, 3, 1, 2, 3].map((item, index) => (
                        <motion.div
                            key={index}
                            className={styles.galleryItem}
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.05 }}
                        >
                            <Image
                                src={`/images/workshops/workshop${item}.png`}
                                alt={`Gallery image ${index + 1}`}
                                fill
                                sizes="(max-width: 600px) 50vw, 25vw"
                            />
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className={styles.footer}>
                <p className={styles.footerText}>© 2026 Knowledge Groove. All rights reserved.</p>
            </footer>
        </main>
    );
}
