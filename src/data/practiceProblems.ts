export interface Problem {
    q: string;
    a: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
}

export const practiceProblems: Record<string, Record<string, Problem[]>> = {
    'ap-calculus-ab': {
        'Unit 1: Limits and Continuity': [
            { q: "Evaluate the limit: lim(x->3) (x^2 - 9) / (x - 3)", a: "6 (Factor as (x-3)(x+3), cancel (x-3), then plug in 3)", difficulty: 'Easy' },
            { q: "What are the three conditions for a function f(x) to be continuous at x = c?", a: "1. f(c) exists. 2. lim(x->c) f(x) exists. 3. lim(x->c) f(x) = f(c).", difficulty: 'Easy' },
            { q: "Evaluate lim(x->0) sin(x) / x", a: "1", difficulty: 'Easy' },
            { q: "Find the horizontal asymptote of f(x) = (2x^2 + 5) / (3x^2 - 1)", a: "y = 2/3 (Ratio of leading coefficients as x approaches infinity)", difficulty: 'Medium' },
            { q: "Use the Intermediate Value Theorem to show that f(x) = x^3 - x - 1 has a root between x = 1 and x = 2.", a: "f(1) = 1-1-1 = -1. f(2) = 8-2-1 = 5. Since f(1) < 0 and f(2) > 0, and f is continuous, there must be a c in (1, 2) such that f(c) = 0.", difficulty: 'Medium' },
            { q: "Evaluate lim(x->infinity) (ln x) / x", a: "0 (Using L'Hopital's rule: lim 1/x / 1 = 0)", difficulty: 'Hard' },
            { q: "Given f(x) = (x^2 - 1) / (x - 1) for x != 1, what value must f(1) be to make f continuous at x = 1?", a: "2 (The limit as x approaches 1 is 2)", difficulty: 'Hard' }
        ],
        'Unit 2: Differentiation: Definition and Basic Rules': [
            { q: "Find the derivative of f(x) = x^4 - 3x^2 + 5", a: "f'(x) = 4x^3 - 6x", difficulty: 'Easy' },
            { q: "Using the product rule, find d/dx [x^2 * sin(x)]", a: "2x*sin(x) + x^2*cos(x)", difficulty: 'Medium' },
            { q: "Find the slope of the tangent line to f(x) = 1/x at x = 2", a: "f'(x) = -1/x^2. f'(2) = -1/4.", difficulty: 'Medium' },
            { q: "Find the derivative of f(x) = e^(3x^2)", a: "f'(x) = 6x * e^(3x^2) (Chain Rule)", difficulty: 'Hard' },
            { q: "Find d/dx [ln(cos(x))]", a: "-tan(x) (Using chain rule: 1/cos(x) * -sin(x))", difficulty: 'Hard' }
        ]
    },
    'ap-chemistry': {
        'Unit 1: Atomic Structure and Properties': [
            { q: "Write the full electron configuration for Iron (Fe, atomic number 26).", a: "1s² 2s² 2p⁶ 3s² 3p⁶ 4s² 3d⁶", difficulty: 'Medium' },
            { q: "Rank the following in order of increasing atomic radius: O, F, S.", a: "F < O < S (Radius increases down a group and decreases across a period)", difficulty: 'Medium' },
            { q: "Calculate the number of moles in 44.0g of CO2.", a: "Molar mass of CO2 = 12 + 2(16) = 44 g/mol. 44g / 44g/mol = 1.0 mol.", difficulty: 'Easy' },
            { q: "Which has a higher first ionization energy: Nitrogen or Oxygen? Why?", a: "Nitrogen. Even though it is to the left of Oxygen, Nitrogen has a half-filled p-shell (2p³), which is more stable than the 2p⁴ configuration of Oxygen (where the first pairing causes electron-electron repulsion).", difficulty: 'Hard' }
        ],
        'Unit 2: Molecular and Ionic Compound Structure and Properties': [
            { q: "What is the hybridisation of the central Carbon atom in CH4?", a: "sp³", difficulty: 'Easy' },
            { q: "Describe the bond order and molecular geometry of Ozone (O3).", a: "Bond order is 1.5 (resonance). Geometry is Bent (approx 117 degrees).", difficulty: 'Medium' }
        ]
    },
    'ap-world-history': {
        'Unit 1: The Global Tapestry': [
            { q: "Explain the concept of 'Filial Piety' and its role in Song Dynasty China.", a: "Filial Piety is the Confucian virtue of respect for parents and elders. It served as a social anchor, maintaining stability and hierarchy within the family and the state.", difficulty: 'Medium' },
            { q: "What was the 'Mita system' as used by the Inca and later the Spanish?", a: "Originally a labor tax system for public works in the Inca Empire, it was adapted by the Spanish into a forced labor system for silver mining (especially at Potosí).", difficulty: 'Medium' },
            { q: "Contrast the political structure of the Mayan city-states with that of the Aztec Empire.", a: "Mayans were decentralized city-states often at war with each other, while the Aztecs were a centralized empire that exacted tribute from conquered peoples through a more unified military structure.", difficulty: 'Hard' }
        ],
        'Unit 2: Networks of Exchange': [
            { q: "List three technologies that facilitated Indian Ocean trade between 1200 and 1450.", a: "Lateen sails, Astrolabe, Sternpost rudder.", difficulty: 'Easy' },
            { q: "How did the Mongol Empire affect trade along the Silk Road?", a: "They provided the 'Pax Mongolica', a period of relative peace and stability that made it safe for merchants to travel and trade across Eurasia, leading to a surge in cultural and economic exchange.", difficulty: 'Medium' }
        ]
    }
};
