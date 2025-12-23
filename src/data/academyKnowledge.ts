export interface CourseBlueprint {
    id: string;
    title: string;
    overview: {
        testingFocus: string;
        successBlueprint: string;
    };
    units: {
        number: number;
        title: string;
        weight: string;
        priority: 'High' | 'Medium' | 'Low';
        whatMatters: string; // "What this unit is really testing"
        skills: string[]; // "Test-relevant skills"
        keyConcepts: string[];
        readinessChecklist: string[];
        commonMistakes: { mistake: string; fix: string }[];
    }[];
    examFormat: string;
    curriculumLink?: string;
    textbooks?: { title: string; chapters: string[] }[];
    pastTests?: { year: string; focus: string; difficulty: string }[];
    alumniWisdom: {
        situation: string;
        advice: string;
    }[];
    teacherTips: string[];
    recoveryStrategies: Record<string, string>; // "What to do after a bad score"
}

export const academyKnowledge: Record<string, CourseBlueprint> = {
    'ap-calculus-ab': {
        id: 'ap-calculus-ab',
        title: 'AP Calculus AB',
        overview: {
            testingFocus: "AP Calculus AB tests your ability to think about change. You need to move between graphical, numerical, and algebraic representations fluidly.",
            successBlueprint: "Master the 'Limit Definition' first. Most students struggle later because they view rules (like Chain Rule) as magic rather than derived logic."
        },
        examFormat: 'Section I: Multiple Choice (45 questions, 50% score). Section II: Free Response (6 questions, 50% score).',
        curriculumLink: 'https://apcentral.collegeboard.org/courses/ap-calculus-ab/course-at-a-glance',
        textbooks: [
            { title: 'Calculus: Early Transcendentals (Stewart)', chapters: ['Limits', 'Derivatives', 'Applications of Differentiation'] }
        ],
        pastTests: [
            { year: '2023', focus: 'Related Rates, Particle Motion', difficulty: 'High' },
            { year: '2022', focus: 'Area/Volume, Differential Equations', difficulty: 'Medium' }
        ],
        units: [
            {
                number: 1,
                title: 'Limits and Continuity',
                weight: '10-12%',
                priority: 'Medium',
                whatMatters: "The College Board is testing if you understand 'closeness' and 'boundary behavior' without relying on the y-value at the point.",
                skills: ['Rationalizing', 'L\'Hopital\'s Introduction', 'Squeeze Theorem', 'Limit Notation'],
                keyConcepts: ['Definition of a limit', 'Continuity at a point', 'Intermediate Value Theorem', 'Asymptotes'],
                readinessChecklist: [
                    'I can evaluate limits using factoring and conjugation.',
                    'I can explain why a function is or is not continuous at x=c.',
                    'I understand the difference between a hole and a vertical asymptote.'
                ],
                commonMistakes: [
                    { mistake: 'Forgetting to check if the limit from the left equals the limit from the right.', fix: 'Always verify LHL = RHL for a limit to exist.' },
                    { mistake: 'Misusing the IVT without stating the function is continuous.', fix: 'Always start an IVT response with "Since f(x) is continuous on [a, b]..."' }
                ]
            },
            {
                number: 2,
                title: 'Differentiation',
                weight: '10-12%',
                priority: 'High',
                whatMatters: "This is about the 'Instantaneous Rate of Change'. Every problem is essentially asking: 'How fast is it moving right now?'",
                skills: ['Power Rule', 'Product Rule', 'Quotient Rule', 'The Chain Rule'],
                keyConcepts: ['Definition of the Derivative', 'Differentiability vs Continuity'],
                readinessChecklist: [
                    'I can find the derivative of any basic function.',
                    'I know when to use the Chain Rule vs the Product Rule.',
                    'I can write the equation of a tangent line.'
                ],
                commonMistakes: [
                    { mistake: 'Forgetting the chain rule on composite functions (e.g., d/dx sin(2x)).', fix: 'Treat the inner function as "the baby" and remember to multiply by its derivative.' }
                ]
            }
        ],
        alumniWisdom: [
            { situation: 'Falling behind in Unit 3', advice: 'Don\'t panic. Units 2 and 3 are the mechanics. If you master the rules, the applications in Unit 4 will make more sense. Spend an extra hour on Chain Rule drills.' },
            { situation: 'Test tomorrow', advice: 'Focus on FRQ justification language. The College Board hates it when you don\'t show the setup, even if the answer is right.' }
        ],
        teacherTips: [
            "Always label your axes on FRQs.",
            "Units of measure often grant an entire point on their own."
        ],
        recoveryStrategies: {
            'low-test-score': "Review your 'conceptual errors' vs 'calculation errors'. If you knew WHAT to do but messed up the numbers, you are doing better than you think. If you didn't know WHERE to start, go back to the Unit Overview.",
            'feeling-lost': "Restart from the last unit you felt 100% confident in. Calculus is a ladder; you can't skip a rung."
        }
    },
    'ap-chemistry': {
        id: 'ap-chemistry',
        title: 'AP Chemistry',
        overview: {
            testingFocus: "Chemistry is the science of 'Why'. You need to explain macroscopic observations (like a change in color) using microscopic properties (like electron transitions).",
            successBlueprint: "Always ask 'What are the particles doing?' If you can visualize the ions or molecules, the math becomes secondary."
        },
        examFormat: 'Section I: Multiple Choice (60 questions, 50%). Section II: Free Response (7 questions, 50%).',
        curriculumLink: 'https://apcentral.collegeboard.org/courses/ap-chemistry/course-at-a-glance',
        textbooks: [
            { title: 'Chemistry: The Central Science (Brown)', chapters: ['Atomic Structure', 'Stoichiometry', 'Thermochemistry'] }
        ],
        pastTests: [
            { year: '2023', focus: 'Equilibrium, Kinetics', difficulty: 'High' },
            { year: '2022', focus: 'Thermodynamics, Acid-Base', difficulty: 'High' }
        ],
        units: [
            {
                number: 1,
                title: 'Atomic Structure and Properties',
                weight: '7-9%',
                priority: 'Medium',
                whatMatters: "Testing your understanding of Coulombic attraction. Every trend (radius, IE, electronegativity) is just a balance of protons vs distance.",
                skills: ['Stoichiometry', 'Coulombic Logic', 'PES Analysis'],
                keyConcepts: ['Moles', 'Electron Configuration', 'Periodic Trends', 'Mass Spectrometry'],
                readinessChecklist: [
                    'I can explain periodic trends using Effective Nuclear Charge (Zeff).',
                    'I can calculate percent composition and empirical formulas.',
                    'I understand PES spectrums.'
                ],
                commonMistakes: [
                    { mistake: 'Using atomic radius as a justification for ionization energy.', fix: 'Always justify trends using Coulombic attraction and shielding, not just saying "it\'s lower on the table".' }
                ]
            }
        ],
        alumniWisdom: [
            { situation: 'Struggling with Math', advice: 'Stoichiometry is just fancy unit conversion. If you track your units (grams -> moles -> moles -> grams), you can\'t fail.' }
        ],
        teacherTips: [
            "Significant figures matter on the AP exam—usually +/- 1 from the correct count.",
            "Write out your states of matter (s, l, g, aq) in net ionic equations."
        ],
        recoveryStrategies: {
            'low-lab-score': "Focus on identifying sources of error. Did you spill something (mass loss) or was it impure (mass gain)?",
            'confused-by-unit': "Chemistry builds. If Unit 1 or 2 is weak, Unit 3 (Intermolecular Forces) will be impossible. Do not move on until you've checked the readiness list."
        }
    },
    'ap-world-history': {
        id: 'ap-world-history',
        title: 'AP World History',
        overview: {
            testingFocus: "This is a history of processes, not just people. Focus on 'Change and Continuity Over Time' (CCOT).",
            successBlueprint: "Learn to 'S.P.I.C.E-T' your units: Social, Political, Interaction, Cultural, Economic, Technology."
        },
        examFormat: 'Multiple Choice (40%), SAQ (20%), DBQ (25%), LEQ (15%).',
        curriculumLink: 'https://apcentral.collegeboard.org/courses/ap-world-history/course-at-a-glance',
        textbooks: [
            { title: 'Ways of the World (Strayer)', chapters: ['The Global Tapestry', 'Networks of Exchange'] }
        ],
        pastTests: [
            { year: '2023', focus: 'Silk Road, Mongol Empire', difficulty: 'Medium' },
            { year: '2022', focus: 'Trade Networks, Maritime Expansion', difficulty: 'Medium' }
        ],
        units: [
            {
                number: 1,
                title: 'The Global Tapestry',
                weight: '8-10%',
                priority: 'Low',
                whatMatters: "This unit is setting the stage. How do religions, trade, and state-building allow civilizations to grow in the 1200-1450 period?",
                skills: ['Sourcing Documents', 'Historical Contextualization', 'Claim Construction'],
                keyConcepts: ['State Building', 'Confucianism', 'Dar al-Islam', 'Inca/Aztec structures'],
                readinessChecklist: [
                    'I can compare how two different regions built their states.',
                    'I understand the continuity of the Chinese Civil Service Exam.'
                ],
                commonMistakes: [
                    { mistake: 'Listing facts without explaining "how" or "why".', fix: 'Always use the "ACE" method (Answer, Cite, Explain) for written responses.' }
                ]
            }
        ],
        alumniWisdom: [
            { situation: 'DBQ Anxiety', advice: 'You don\'t need to use all documents perfectly. Focus on the core argument and sourcing 3 documents well to get the point.' }
        ],
        teacherTips: [
            "Use the 'Even Though' structure for your DBQ thesis to get the complexity point.",
            "Specific evidence must be a proper noun (e.g., 'The Silk Road' instead of 'trade routes')."
        ],
        recoveryStrategies: {
            'bad-essay-score': "Focus on your 'Analysis' vs 'Evidence'. Most students have evidence but fail to explain how it proves their thesis.",
            'overwhelmed-by-dates': "Stop memorizing specific years. Memorize 'eras' and 'sequencing'. Knowing what happened first is more important than knowing it happened in 1258."
        }
    }
};
