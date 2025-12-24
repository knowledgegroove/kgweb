'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './ShareExperienceModal.module.css';

interface ShareExperienceModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ShareExperienceModal({ isOpen, onClose }: ShareExperienceModalProps) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        course: '',
        confidence: '',
        shaky: '',
        mistakes: '',
        timeline: '',
        isPublic: true
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, this would be an API call
        console.log('Submitted Experience:', formData);
        alert('Thank you for sharing your experience! Your insights will help future students.');
        onClose();
        setStep(1);
    };

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className={styles.overlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />
                    <motion.div
                        className={styles.modal}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    >
                        <button className={styles.closeBtn} onClick={onClose}>×</button>

                        <div className={styles.progress}>
                            <div className={styles.progressBar} style={{ width: `${(step / 5) * 100}%` }} />
                        </div>

                        <form onSubmit={handleSubmit} className={styles.form}>
                            {step === 1 && (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                    <h2 className={styles.question}>What course did you complete?</h2>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        placeholder="e.g. AP Calculus AB"
                                        value={formData.course}
                                        onChange={e => setFormData({ ...formData, course: e.target.value })}
                                        required
                                    />
                                    <button type="button" className={styles.nextBtn} onClick={nextStep} disabled={!formData.course}>Next</button>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                    <h2 className={styles.question}>What concepts do you feel confident about?</h2>
                                    <textarea
                                        className={styles.textarea}
                                        placeholder="Share the topics you mastered..."
                                        value={formData.confidence}
                                        onChange={e => setFormData({ ...formData, confidence: e.target.value })}
                                        required
                                    />
                                    <div className={styles.actions}>
                                        <button type="button" className={styles.backBtn} onClick={prevStep}>Back</button>
                                        <button type="button" className={styles.nextBtn} onClick={nextStep} disabled={!formData.confidence}>Next</button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                    <h2 className={styles.question}>What topics still feel shaky?</h2>
                                    <textarea
                                        className={styles.textarea}
                                        placeholder="Where did you struggle the most?"
                                        value={formData.shaky}
                                        onChange={e => setFormData({ ...formData, shaky: e.target.value })}
                                        required
                                    />
                                    <div className={styles.actions}>
                                        <button type="button" className={styles.backBtn} onClick={prevStep}>Back</button>
                                        <button type="button" className={styles.nextBtn} onClick={nextStep} disabled={!formData.shaky}>Next</button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 4 && (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                    <h2 className={styles.question}>What mistake do you make most often?</h2>
                                    <textarea
                                        className={styles.textarea}
                                        placeholder="Share a common pitfall to avoid..."
                                        value={formData.mistakes}
                                        onChange={e => setFormData({ ...formData, mistakes: e.target.value })}
                                        required
                                    />
                                    <div className={styles.actions}>
                                        <button type="button" className={styles.backBtn} onClick={prevStep}>Back</button>
                                        <button type="button" className={styles.nextBtn} onClick={nextStep} disabled={!formData.mistakes}>Next</button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 5 && (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                    <h2 className={styles.question}>How long ago did you complete this?</h2>
                                    <select
                                        className={styles.select}
                                        value={formData.timeline}
                                        onChange={e => setFormData({ ...formData, timeline: e.target.value })}
                                        required
                                    >
                                        <option value="">Select an option</option>
                                        <option value="Just now">Just now</option>
                                        <option value="Last semester">Last semester</option>
                                        <option value="Last year">Last year</option>
                                        <option value="More than a year ago">More than a year ago</option>
                                    </select>

                                    <div className={styles.privacyToggle}>
                                        <label className={styles.checkboxLabel}>
                                            <input
                                                type="checkbox"
                                                checked={formData.isPublic}
                                                onChange={e => setFormData({ ...formData, isPublic: e.target.checked })}
                                            />
                                            <span>Make my advice public in the Alumni section</span>
                                        </label>
                                    </div>

                                    <div className={styles.actions}>
                                        <button type="button" className={styles.backBtn} onClick={prevStep}>Back</button>
                                        <button type="submit" className={styles.submitBtn}>Submit Experience</button>
                                    </div>
                                </motion.div>
                            )}
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
