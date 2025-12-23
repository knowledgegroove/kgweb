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
    resourceLinks?: {
        category: string;
        links: { title: string; url: string; focus?: string }[];
    }[];
    strategyGuides?: {
        unitNumber: number;
        content: string;
    }[];
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
        strategyGuides: [
            {
                unitNumber: 1,
                content: `UNIT 1: LIMITS AND CONTINUITY
                
Big Picture (Read this first!)
Limits are the language of calculus. If limits feel shaky, everything later feels impossible.
AP is not testing whether you can do algebra — they’re testing whether you understand behavior.
“What happens to the function near a point?”
Not: “What is the function at the point?”

Section 1.1 — Understanding Limits Conceptually
What a Limit Really Means
$$ \\lim_{x \\to a} f(x) = L $$
This says: As x gets close to a, f(x) gets close to L.
It does NOT say:
1. f(a) exists
2. f(a) equals L
That distinction is EVERYTHING.

How AP Tests This
- Graph interpretation
- Table interpretation
- Verbal reasoning (no algebra)
They want to know: Can you ignore distractions? Can you reason without calculating?

How to Think Step-by-Step
1. Look near the x-value, not at it.
2. Approach from: Left and Right.
3. Ask: “Do both sides approach the same y-value?”
If yes → limit exists. If no → limit does not exist.

Practice (Do These Without Algebra)
Problem 1: A graph approaches y = 3 as x → 2, but f(2) = 7. What is the limit?
➡️ Answer: 3 (The value at the point is irrelevant.)

Problem 2: From the left, f(x) → 4. From the right, f(x) → 1. Does the limit exist?
➡️ Answer: No (two-sided limit fails)

Section 1.2 — Estimating Limits from Tables & Graphs
How AP Wants You to Read Tables
Tables are traps. They will never give x = a, and they try to distract you with asymmetry.

Correct Process
1. Look at the x-values approaching the target.
2. Ignore large jumps.
3. Check if y-values settle toward a number.

Practice
Problem 3: x: 1.9, 1.99, 2.01, 2.1 | f(x): 3.98, 3.998, 4.002, 4.02. Estimate the limit as x → 2.
➡️ Answer: 4

Problem 4: The table approaches different values from left and right.
➡️ Conclusion: Limit does not exist

Section 1.3 — Algebraic Limits (This Is Where Students Panic)
Rule #1: Always try direct substitution first. If it works — you’re done.

When Substitution Fails
That means: You got 0/0. The function needs simplification.

Common Fixes
- Factoring
- Rationalizing
- Cancelling common factors

Example (Step-by-Step)
$$ \\lim_{x \\to 2} \\frac{x^2 - 4}{x - 2} $$
1. Substitute → 0/0 ❌
2. Factor → $$ \\frac{(x - 2)(x + 2)}{x - 2} $$
3. Cancel common factors.
4. Substitute → 4 ✅

Practice
Problem 5: $$ \\lim_{x \\to 3} \\frac{x^2 - 9}{x - 3} $$
➡️ Answer: 6

Problem 6: $$ \\lim_{x \\to 0} \\frac{\\sqrt{x+4}-2}{x} $$
➡️ Hint: Rationalize
➡️ Answer: 1/4

Section 1.4 — One-Sided Limits & Infinite Limits
One-Sided Limits
$$ \\lim_{x \\to a^-} f(x) \\quad \\lim_{x \\to a^+} f(x) $$
If they differ → no two-sided limit.

Infinite Limits (Vertical Asymptotes)
If values grow without bound: $$ \\infty $$ or $$ -\\infty $$. Limit does NOT exist (but still describe behavior!)

Practice
Problem 7: As x → 1⁻, f(x) → ∞. As x → 1⁺, f(x) → -∞.
➡️ Two-sided limit? ❌
➡️ Behavior description? ✅

Section 1.5 — Continuity (AP LOVES This)
A Function Is Continuous at x = c If:
1. f(c) exists
2. lim f(x) exists
3. $$ \\lim_{x \\to c} f(x) = f(c) $$
Miss ONE → not continuous.

Types of Discontinuities
- Removable (hole)
- Jump
- Infinite
You MUST name them correctly.

Practice
Problem 8: Function has a hole at x = 2 but limit exists.
➡️ Type: Removable
➡️ Fix: Define f(2) = limit

Unit 1 Test-Readiness Check
You are ready if you can:
- Identify the limit existence from graphs without computing
- Explain continuity in words
- Fix removable discontinuities
- Ignore irrelevant function values`
            },
            {
                unitNumber: 2,
                content: `UNIT 2: DIFFERENTIATION - DEFINITION AND BASIC DERIVATIVE RULES

Big Picture
Derivatives answer one question: “How fast is something changing right now?”

Section 2.1 — Average vs Instantaneous Rate of Change
Average Rate of Change
Slope between two points:
$$ \\frac{f(b)-f(a)}{b-a} $$

Instantaneous Rate of Change
Slope at one point. That’s a derivative.

Practice
Problem 1: Position changes from 10 to 18 meters in 4 seconds.
➡️ Average velocity = 2 m/s

Section 2.2 — Derivative as a Limit
$$ f'(x) = \\lim_{h \\to 0} \\frac{f(x+h)-f(x)}{h} $$
This is: A slope formula, Shrinking interval.

Why AP Cares
They want to see if you understand where derivatives come from.

Practice
Problem 2: Use definition to find derivative of $f(x)=x^2$
➡️ Answer: $2x$

Section 2.3 — Basic Derivative Rules
Power Rule
$$ \\frac{d}{dx} x^n = nx^{n-1} $$
That’s it. That’s the rule.

Practice
Problem 3: $$ \\frac{d}{dx}(5x^4) $$
➡️ Answer: $20x^3$

Section 2.4 — Interpreting Derivatives
Units Matter
If the position is in meters: Derivative → meters per second. AP WILL test this.

Practice
Problem 4: Water volume is increasing at 3 L/min.
➡️ Interpretation: Rate of change of volume

Unit 2 Test-Readiness Check
You’re ready if you can:
- Explain the derivative in words
- Use the definition conceptually
- Interpret units
- Avoid mechanical-only thinking`
            },
            {
                unitNumber: 3,
                content: `UNIT 3: DIFFERENTIATION - COMPOSITE, IMPLICIT, AND INVERSE FUNCTIONS

Big Picture
Unit 3 answers: “How do we take derivatives when functions are layered, tangled, or reversed?”
This is where most mistakes happen — and where mastery matters most.

Section 3.1 — The Chain Rule
When functions are inside other functions, differentiation happens in layers.
If $y = f(g(x))$, Then
$$ \\frac{dy}{dx} = f'(g(x)) \\cdot g'(x) $$
Outer derivative × inner derivative.

How to Think (AP loves this)
- Identify the outer function
- Identify the inner function
- Differentiate outside → multiply by inside

Practice
Problem 1: $y = (3x^2 + 1)^5$
Outer: power | Inner: $(3x^2 + 1)$
➡️ Answer: $$ 5(3x^2+1)^4 \\cdot 6x $$

Section 3.2 — Implicit Differentiation
When to Use: $y$ is not isolated, $x$ and $y$ are mixed, Circles, weird equations.
Key Rule: When differentiating $y$ with respect to $x$:
$$ \\frac{d}{dx}(y) = \\frac{dy}{dx} $$

Steps (Never Skip)
1. Differentiate both sides
2. Add $dy/dx$ where needed
3. Collect $dy/dx$
4. Solve

Practice
Problem 2: $x^2 + y^2 = 25$
➡️ Answer: $$ \\frac{dy}{dx} = -\\frac{x}{y} $$

Section 3.3 — Higher-Order Derivatives
Meaning
- First derivative → velocity
- Second derivative → acceleration

Practice
Problem 3: $f(x) = x^4$
➡️ $f'(x) = 4x^3$
➡️ $f''(x) = 12x^2$

Section 3.4 — Derivatives of Inverse Functions
Key Formula
$$ (f^{-1})'(a) = \\frac{1}{f'(f^{-1}(a))} $$
⚠️ This is NOT the reciprocal of $f(x)$.

Practice
Problem 4: If $f(2)=5$ and $f'(2)=4$, find $(f^{-1})'(5)$
➡️ Answer: $1/4$

Unit 3 Test-Readiness Check
You’re ready if you can:
- Identify chain rule instantly
- Use implicit differentiation cleanly
- Explain inverse derivatives conceptually`
            },
            {
                unitNumber: 4,
                content: `UNIT 4: CONTEXTUAL APPLICATIONS OF DIFFERENTIATION

Big Picture
Unit 4 answers: “What does the derivative mean in real life?”
AP graders LOVE explanations here.

Section 4.1 — Motion Along a Line
Definitions
- Position → $s(t)$
- Velocity → $s'(t)$
- Acceleration → $s''(t)$

Practice
Problem 1: $s(t) = t^3 - 6t$
➡️ Velocity: $v(t) = 3t^2 - 6$
➡️ Acceleration: $a(t) = 6t$

Section 4.2 — Interpreting Rates of Change
AP Focus: They care about Units, Direction, and Context.

Practice
Problem 2: If temperature is decreasing at 2 °C/min
➡️ The derivative is negative

Section 4.3 — Related Rates
Strategy (Always This Order)
1. Draw diagram
2. Write equation
3. Differentiate
4. Substitute values
5. Solve

Practice
Problem 3: Radius of a balloon increases at 2 cm/s. Find volume rate when $r = 5$.
➡️ Use: $$ V = \\frac{4}{3}\\pi r^3 $$

Unit 4 Test-Readiness Check
You’re ready if you can:
- Explain derivatives in words
- Use units correctly
- Avoid plugging in too early`
            },
            {
                unitNumber: 5,
                content: `UNIT 5: ANALYTICAL APPLICATIONS OF DIFFERENTIATION

Big Picture
Unit 5 answers: “What does the function do overall?”
This is function behavior analysis.

Section 5.1 — Critical Points
Critical points occur where:
- $f'(x) = 0$
- $f'(x)$ is undefined

Section 5.2 — Increasing & Decreasing
- $f'(x) > 0$ → increasing
- $f'(x) < 0$ → decreasing

Practice
Problem 1: If $f'(x) = (x-2)(x+1)$, analyze sign chart.

Section 5.3 — Concavity & Inflection Points
- $f''(x) > 0$ → concave up
- $f''(x) < 0$ → concave down
Inflection point: Concavity changes.

Section 5.4 — Optimization
1. Define variable
2. Write equation
3. Differentiate
4. Test
5. Interpret

Practice
Problem 2: Maximize area with fixed perimeter.

Unit 5 Test-Readiness Check
You’re ready if you can:
- Justify extrema
- Analyze concavity
- Explain optimization answers`
            },
            {
                unitNumber: 6,
                content: `UNIT 6: INTEGRATION & ACCUMULATION OF CHANGE

Big Picture
Integration answers: “How much has accumulated?”

Section 6.1 — Antiderivatives
Rule: Undo differentiation.
$$ \\int x^n dx = \\frac{x^{n+1}}{n+1} + C $$

Section 6.2 — Definite Integrals
Meaning: Net change, Signed area.

Section 6.3 — Fundamental Theorem of Calculus
Part 1: Accumulation functions
Part 2: Evaluation

Practice
Problem 1: $$ \\int_0^3 2x dx $$
➡️ Answer: 9

Unit 6 Test-Readiness Check
You’re ready if you can:
- Explain integrals conceptually
- Apply FTC correctly`
            },
            {
                unitNumber: 7,
                content: `UNIT 7: DIFFERENTIAL EQUATIONS

Big Picture
Differential equations describe how change itself changes.

Section 7.1 — Slope Fields
- Each slope = derivative value
- Visual solution paths

Section 7.2 — Separable Equations
1. Separate
2. Integrate
3. Solve
4. Apply initial condition

Practice
Problem 1: $$ \\frac{dy}{dx} = xy $$

Unit 7 Test-Readiness Check
You’re ready if you can:
- Match equations to scenarios
- Solve with initial conditions`
            },
            {
                unitNumber: 8,
                content: `UNIT 8: APPLICATIONS OF INTEGRATION

Big Picture
Integration measures real quantities.

Section 8.1 — Area Between Curves
Formula: $$ \\int (Top - Bottom) dx $$ or $$ \\int (Right - Left) dy $$

Section 8.2 — Average Value of a Function
$$ f_{avg} = \\frac{1}{b-a}\\int_a^b f(x) dx $$

Practice
Problem 1: Find average value of $f(x)=x^2$ on [0,2].

Unit 8 Test-Readiness Check
You’re ready if you can:
- Set up integrals correctly
- Interpret results`
            }
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
                title: 'Differentiation - Definition and Basic Derivative Rules',
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
            },
            {
                number: 3,
                title: 'Differentiation - Composite, Implicit, and Inverse Functions',
                weight: '9-13%',
                priority: 'High',
                whatMatters: "Layered functions. If you can't see the 'layers', you'll miss the Chain Rule every time.",
                skills: ['Chain Rule', 'Implicit Differentiation', 'Inverse Function Derivatives'],
                keyConcepts: ['Chain Rule', 'Implicit Differentiation', 'Inverse Functions'],
                readinessChecklist: ['I can identify the inner and outer functions.', 'I can differentiate implicitly.'],
                commonMistakes: [{ mistake: 'Forgetting dy/dx in implicit.', fix: 'Every time you differentiate a term with y, tack on dy/dx.' }]
            },
            {
                number: 4,
                title: 'Contextual Applications of Differentiation',
                weight: '10-15%',
                priority: 'Medium',
                whatMatters: "Real-world meaning. Units of measure are your best friend here.",
                skills: ['Related Rates', 'Motion Along a Line', 'Interpreting Rates'],
                keyConcepts: ['Velocity and Acceleration', 'Related Rates'],
                readinessChecklist: ['I can set up related rates problems.', 'I understand motion definitions.'],
                commonMistakes: [{ mistake: 'Plugging numbers in too early.', fix: 'Differentiate first, substitute second.' }]
            },
            {
                number: 5,
                title: 'Analytical Applications of Differentiation',
                weight: '15-18%',
                priority: 'High',
                whatMatters: "Function behavior. Why does the curve look like that?",
                skills: ['Mean Value Theorem', 'Extreme Value Theorem', 'Optimization', 'Concavity'],
                keyConcepts: ['Critical Points', 'Inflection Points', 'Sign Charts'],
                readinessChecklist: ['I can justify extrema using the first derivative test.', 'I can find inflection points.'],
                commonMistakes: [{ mistake: 'Confusing f\' sign with f\'\' sign.', fix: 'f\' is for direction; f\'\' is for bending.' }]
            },
            {
                number: 6,
                title: 'Integration and Accumulation of Change',
                weight: '17-20%',
                priority: 'High',
                whatMatters: "Accumulation. This is the biggest unit on the exam.",
                skills: ['Riemann Sums', 'Fundamental Theorem of Calculus', 'U-Substitution'],
                keyConcepts: ['Antiderivatives', 'Definite Integrals', 'Accumulation Functions'],
                readinessChecklist: ['I can use U-substitution correctly.', 'I understand the FTC.'],
                commonMistakes: [{ mistake: 'Forgetting the +C.', fix: 'Always add +C for indefinite integrals.' }]
            },
            {
                number: 7,
                title: 'Differential Equations',
                weight: '6-12%',
                priority: 'Medium',
                whatMatters: "Solving for the original function given its rate of change.",
                skills: ['Separable Equations', 'Slope Fields', 'Exponential Models'],
                keyConcepts: ['Slope Fields', 'Separation of Variables'],
                readinessChecklist: ['I can sketch a slope field.', 'I can solve separable differential equations.'],
                commonMistakes: [{ mistake: 'Incorrect algebra during separation.', fix: 'Move all y terms to one side and x terms to the other before integrating.' }]
            },
            {
                number: 8,
                title: 'Applications of Integration',
                weight: '10-15%',
                priority: 'Medium',
                whatMatters: "Turning integrals into physical quantities like area and volume.",
                skills: ['Area Between Curves', 'Volume (Discs/Washers)', 'Average Value'],
                keyConcepts: ['Area', 'Volume', 'Average Value'],
                readinessChecklist: ['I can set up volume integrals.', 'I know the average value formula.'],
                commonMistakes: [{ mistake: 'Using the wrong radius for volume.', fix: 'Always draw the cross-section to verify your radius.' }]
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
        },
        resourceLinks: [
            {
                category: 'Unit 1: Limits and Continuity',
                links: [
                    { title: 'Khan Academy – Unit 1 (Limits & Continuity)', url: 'https://www.khanacademy.org/math/ap-calculus-ab/ab-limits-new' },
                    { title: 'Paul’s Online Math Notes – Limits & Continuity (Calc I)', url: 'https://tutorial.math.lamar.edu/classes/calci/limitsintro.aspx' },
                    { title: 'College Board – Past FRQs (Limits & Continuity)', url: 'https://apcentral.collegeboard.org/courses/ap-calculus-ab/exam/past-exam-questions' },
                    { title: '3Blue1Brown – Essence of Calculus (Limits Intuition)', url: 'https://www.youtube.com/watch?v=riXcZT2ICjA' },
                    { title: 'PatrickJMT – Limit Practice Problems', url: 'https://www.youtube.com/playlist?list=PLDAA5D23D46B21257' },
                    { title: 'MIT OpenCourseWare – Limits (Single Variable Calc)', url: 'https://ocw.mit.edu/courses/18-01-single-variable-calculus-fall-2006/' },
                    { title: 'OpenStax Calculus Vol. 1 – Limits Chapter', url: 'https://openstax.org/books/calculus-volume-1/pages/2-introduction' },
                    { title: 'Desmos Graphing Calculator (Visual Exploration)', url: 'https://www.desmos.com/calculator' }
                ]
            },
            {
                category: 'Unit 2: Differentiation - Definition and Basic Derivative Rules',
                links: [
                    { title: 'Khan Academy – Unit 2 (Derivative Definition)', url: 'https://www.khanacademy.org/math/ap-calculus-ab/ab-differentiation-1-new' },
                    { title: 'Paul’s Notes – Definition of the Derivative', url: 'https://tutorial.math.lamar.edu/Classes/CalcI/DerivativeIntro.aspx' },
                    { title: 'College Board – Derivative FRQs', url: 'https://apcentral.collegeboard.org/courses/ap-calculus-ab/exam/past-exam-questions' },
                    { title: 'PatrickJMT – Derivative from Definition', url: 'https://www.youtube.com/playlist?list=PLDE077A2EC488104D' },
                    { title: 'Professor Leonard – Intro to Derivatives', url: 'https://www.youtube.com/watch?v=962lLfW-8Jo' },
                    { title: 'MIT OCW – Derivatives', url: 'https://ocw.mit.edu/courses/18-01-single-variable-calculus-fall-2006/' },
                    { title: 'OpenStax – Derivatives Chapter', url: 'https://openstax.org/books/calculus-volume-1/pages/3-introduction' },
                    { title: 'Desmos – Tangent Line Visualization', url: 'https://www.desmos.com/calculator' }
                ]
            },
            {
                category: 'Unit 3: Differentiation - Composite, Implicit, and Inverse Functions',
                links: [
                    { title: 'Khan Academy – Unit 3', url: 'https://www.khanacademy.org/math/ap-calculus-ab/ab-differentiation-2-new' },
                    { title: 'Paul’s Notes – Chain Rule & Implicit Diff', url: 'https://tutorial.math.lamar.edu/classes/calci/chainrule.aspx' },
                    { title: 'PatrickJMT – Chain Rule Practice', url: 'https://www.youtube.com/watch?v=6kScLENCXLg' },
                    { title: 'Professor Leonard – Chain Rule', url: 'https://www.youtube.com/watch?v=8dr1dZjfhmc' },
                    { title: 'College Board – Differentiation FRQs', url: 'https://apcentral.collegeboard.org/courses/ap-calculus-ab/exam/past-exam-questions' },
                    { title: 'MIT OCW – Advanced Differentiation', url: 'https://ocw.mit.edu/courses/18-01-single-variable-calculus-fall-2006/' },
                    { title: 'OpenStax – Chain Rule, Implicit Diff, Inverse trig', url: 'https://openstax.org/details/books/calculus-volume-1' },
                    { title: 'Symbolab (Step-by-Step Checking)', url: 'https://www.symbolab.com' }
                ]
            },
            {
                category: 'Unit 4: Contextual Applications of Differentiation',
                links: [
                    { title: 'Khan Academy – Unit 4', url: 'https://www.khanacademy.org/math/ap-calculus-ab/ab-diff-contextual-applications-new' },
                    { title: 'Paul’s Notes – Related Rates, Motion, L’Hôpital’s rule', url: 'https://tutorial.math.lamar.edu/classes/calci/relatedrates.aspx' },
                    { title: 'PatrickJMT – Related Rates Practice', url: 'https://www.youtube.com/playlist?list=PLDC0E2E78840869A5' },
                    { title: 'Professor Leonard – Applied Derivatives', url: 'https://www.youtube.com/watch?v=qr1WXiq3S3k' },
                    { title: 'College Board – Motion FRQs', url: 'https://apcentral.collegeboard.org/courses/ap-calculus-ab/exam/past-exam-questions' },
                    { title: 'MIT OCW – Applications of Derivatives', url: 'https://ocw.mit.edu/courses/18-01-single-variable-calculus-fall-2006/' },
                    { title: 'OpenStax – Applications Chapter', url: 'https://openstax.org/books/calculus-volume-1/pages/4-introduction' },
                    { title: 'Desmos – Motion Graphs', url: 'https://www.desmos.com/calculator' }
                ]
            },
            {
                category: 'Unit 5: Analytical Applications of Differentiation',
                links: [
                    { title: 'Khan Academy – Unit 5', url: 'https://www.khanacademy.org/math/ap-calculus-ab/ab-diff-analytical-applications-new' },
                    { title: 'Paul’s Notes – Optimization, MVT, Extrema', url: 'https://tutorial.math.lamar.edu/classes/calci/optimization.aspx' },
                    { title: 'PatrickJMT – Optimization Problems', url: 'https://www.youtube.com/playlist?list=PLF1E94C1948483103' },
                    { title: 'Professor Leonard – Curve Sketching', url: 'https://www.youtube.com/watch?v=8u6woY05aL0' },
                    { title: 'College Board – Optimization FRQs', url: 'https://apcentral.collegeboard.org/courses/ap-calculus-ab/exam/past-exam-questions' },
                    { title: 'MIT OCW – Mean Value Theorem', url: 'https://ocw.mit.edu/courses/18-01-single-variable-calculus-fall-2006/' },
                    { title: 'OpenStax – Optimization Chapter', url: 'https://openstax.org/books/calculus-volume-1/pages/4-7-applied-optimization-problems' },
                    { title: 'Desmos – First & Second Derivative Graphs', url: 'https://www.desmos.com/calculator' }
                ]
            },
            {
                category: 'Unit 6: Integration & Accumulation of Change',
                links: [
                    { title: 'Khan Academy – Unit 6', url: 'https://www.khanacademy.org/math/ap-calculus-ab/ab-integration-new' },
                    { title: 'Paul’s Notes – Integrals, Riemann Sums, FTC', url: 'https://tutorial.math.lamar.edu/classes/calci/integralsintro.aspx' },
                    { title: '3Blue1Brown – Visualizing Integrals/FTC', url: 'https://www.youtube.com/watch?v=rfG8ce4nNh0' },
                    { title: 'PatrickJMT – Riemann Sums Practice', url: 'https://www.youtube.com/watch?v=gFpHHTxsDkI' },
                    { title: 'Professor Leonard – FTC & Definite Integrals', url: 'https://www.youtube.com/watch?v=xjtEfS0vY2o' },
                    { title: 'College Board – Integration FRQs', url: 'https://apcentral.collegeboard.org/courses/ap-calculus-ab/exam/past-exam-questions' },
                    { title: 'MIT OCW – Integrals', url: 'https://ocw.mit.edu/courses/18-01-single-variable-calculus-fall-2006/' },
                    { title: 'OpenStax – Integration Chapter', url: 'https://openstax.org/books/calculus-volume-1/pages/5-introduction' },
                    { title: 'Desmos – Area Under Curve', url: 'https://www.desmos.com/calculator' }
                ]
            },
            {
                category: 'Unit 7: Differential Equations',
                links: [
                    { title: 'Khan Academy – Unit 7', url: 'https://www.khanacademy.org/math/ap-calculus-ab/ab-differential-equations-new' },
                    { title: 'PatrickJMT - Solving Differential Equations', url: 'https://www.youtube.com/playlist?list=PL8gnhgRJl1x62eH2TuglLxNmHWxZ0JZ3z' },
                    { title: 'Professor Leonard – Exact Differential Equations', url: 'https://www.youtube.com/watch?v=7zOMnC-BAFY' },
                    { title: 'College Board – DE FRQs', url: 'https://apcentral.collegeboard.org/courses/ap-calculus-ab/exam/past-exam-questions' },
                    { title: 'MIT OCW – Differential Equations Intro', url: 'https://ocw.mit.edu/courses/18-01-single-variable-calculus-fall-2006/' },
                    { title: 'Slope Field Generator', url: 'https://www.desmos.com/calculator' }
                ]
            },
            {
                category: 'Unit 8: Applications of Integration',
                links: [
                    { title: 'Khan Academy – Unit 8', url: 'https://www.khanacademy.org/math/ap-calculus-ab/ab-applications-integration-new' },
                    { title: 'Paul’s Notes – Applications of Integrals', url: 'https://tutorial.math.lamar.edu/Classes/CalcI/IntAppsIntro.aspx' },
                    { title: 'College Board – Area/Volume FRQs', url: 'https://apcentral.collegeboard.org/courses/ap-calculus-ab/exam/past-exam-questions' },
                    { title: 'MIT OCW – Applications of Integration', url: 'https://ocw.mit.edu/courses/18-01-single-variable-calculus-fall-2006/' },
                    { title: 'OpenStax – Applications Chapter', url: 'https://openstax.org/books/calculus-volume-1/pages/6-introduction' },
                    { title: 'Desmos – Volume Visualization', url: 'https://www.desmos.com/calculator' }
                ]
            }
        ]
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
