'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './ShareExperienceModal.module.css';
import { useAlumni } from '@/context/AlumniContext';
import { useExperience } from '@/context/ExperienceContext';
import { academyKnowledge } from '@/data/academyKnowledge';

interface ShareExperienceModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ShareExperienceModal({ isOpen, onClose }: ShareExperienceModalProps) {
    const { addTip } = useAlumni();
    const { prefilledCourseId } = useExperience();

    // If prefilledCourseId exists, start at step 2, otherwise step 1
    const [step, setStep] = useState(prefilledCourseId ? 2 : 1);

    // Initialize formData with prefilledCourseId if available
    const [formData, setFormData] = useState({
        courseId: prefilledCourseId || '',
        confidence: '',
        shaky: '',
        mistakes: '',
        timeline: '',
        isPublic: true,
        name: '' // Added name field
    });

    // Reset/update state when modal opens or prefilledCourseId changes
    // But since this is mounted in layout, better to use useEffect or key=isOpen
    // Actually, simpler is: if prefilledCourseId changes, update the state.

    // Better: Effect to reset when opened
    // We already have `isOpen`. Let's assume on mount/open we sync.
    // However, react hooks rules.
    // Let's just use key in the parent Layout to remount, OR useEffect here.

    // To keep it simple in this single file edit:
    // Let's rely on the initial state being set correctly IF the modal is re-mounted.
    // If not re-mounted, we need an effect.

    // Let's use an effect to sync prefilledCourseId when it changes OR when isOpen changes to true.
    const [initialized, setInitialized] = useState(false);
    if (isOpen && !initialized) {
        if (prefilledCourseId) {
            setFormData(prev => ({ ...prev, courseId: prefilledCourseId }));
            setStep(2);
        } else {
            setStep(1);
        }
        setInitialized(true);
    }

    if (!isOpen && initialized) {
        setInitialized(false);
    }

    const courses = Object.values(academyKnowledge).map(c => ({
        id: c.id,
        title: c.title
    }));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Synthesize the tip from user input
        // Prioritize "mistakes" or "shaky" areas as they are most helpful advice
        const tipContent = `${formData.mistakes} Also, ${formData.shaky}`;

        // formatted date YYYY-MM-DD
        const date = new Date().toISOString().split('T')[0];

        addTip({
            courseId: formData.courseId,
            studentName: formData.name || 'Anonymous Alumnus',
            tip: `Watch out for this: ${formData.mistakes}. Strength: ${formData.confidence}.`,
            date: date
        });

        // console.log('Submitted Experience:', formData);
        // alert('Thank you for sharing your experience! Your insights will help future students.');

        // Reset and close
        setFormData({
            courseId: '',
            confidence: '',
            shaky: '',
            mistakes: '',
            timeline: '',
            isPublic: true,
            name: ''
        });
        setStep(1);
        onClose();

    };

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => {
        // If we started with a prefilled course (step 2), and try to go back from step 2,
        // we might want to close or go to step 1 (letting them change course).
        // Let's allow going back to step 1 even if prefilled, so they can change course if they want.
        // Or simpler:
        setStep(s => s - 1);
    };

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
                    >
                        <motion.div
                            className={styles.modal}
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className={styles.modalHeader}>
                                <button className={styles.closeBtn} onClick={onClose}>×</button>
                                <div className={styles.progress}>
                                    <div className={styles.progressBar} style={{ width: `${(step / 5) * 100}%` }} />
                                </div>
                            </div>

                            {/* Scrollable Body */}
                            <div className={styles.modalBody}>
                                <form id="experienceForm" onSubmit={handleSubmit}>
                                    {step === 1 && (
                                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                            <h2 className={styles.question}>What course did you complete?</h2>
                                            <select
                                                className={styles.select}
                                                value={formData.courseId}
                                                onChange={e => setFormData({ ...formData, courseId: e.target.value })}
                                                required
                                            >
                                                <option value="">Select a course</option>
                                                {courses.map(c => (
                                                    <option key={c.id} value={c.id}>{c.title}</option>
                                                ))}
                                            </select>
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
                                        </motion.div>
                                    )}

                                    {step === 5 && (
                                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                            <h2 className={styles.question}>Final Details</h2>

                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Your Name (Optional)</label>
                                            <input
                                                type="text"
                                                className={styles.input}
                                                placeholder="e.g. John Doe"
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            />

                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>When did you take this?</label>
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
                                        </motion.div>
                                    )}
                                </form>
                            </div>

                            {/* Fixed Footer */}
                            <div className={styles.modalFooter}>
                                {step > 1 && (
                                    <button type="button" className={styles.backBtn} onClick={prevStep}>Back</button>
                                )}

                                {step < 5 ? (
                                    <button
                                        type="button"
                                        className={styles.nextBtn}
                                        onClick={nextStep}
                                        disabled={
                                            (step === 1 && !formData.courseId) ||
                                            (step === 2 && !formData.confidence) ||
                                            (step === 3 && !formData.shaky) ||
                                            (step === 4 && !formData.mistakes)
                                        }
                                    >
                                        Next
                                    </button>
                                ) : (
                                    <button type="submit" form="experienceForm" className={styles.submitBtn}>Submit Experience</button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
