import { academyKnowledge } from '@/data/academyKnowledge';

export function generateInitialAdvice(courseId: string, unitNumber: number, situation: string) {
    const blueprint = academyKnowledge[courseId];
    if (!blueprint) return "I'm sorry, I couldn't find data for this course. How can I help you generally?";

    const unit = blueprint.units.find(u => u.number === unitNumber);
    if (!unit) return `Welcome to ${blueprint.title}. How can I help you today?`;

    let focus = "";
    let logic = "";
    let guide = "";
    let gotcha = "";
    let nextStep = "";

    if (situation === 'explain') {
        focus = `We are looking at Unit ${unitNumber}: ${unit.title}. This unit is critical—it makes up ${unit.weight} of the AP exam. It tests whether you really understand ${unit.whatMatters}.`;
        logic = `To master this, you need to transition beyond just memorizing rules. ${blueprint.overview.successBlueprint}`;
        guide = `Start by mastering ${unit.skills.slice(0, 2).join(' and ')}. Our teacher tip: ${blueprint.teacherTips[0] || 'Show all your work.'}`;
        gotcha = `A common trap here is ${unit.commonMistakes[0]?.mistake || 'conceptual gaps'}. Fix: ${unit.commonMistakes[0]?.fix || 'review the basics'}.`;
        nextStep = `Shall we dive into ${unit.keyConcepts[0]}, or would you like to see how this appeared on the ${blueprint.pastTests?.[0]?.year || 'recent'} AP exam?`;
    } else if (situation === 'practice') {
        focus = `Time for a Unit ${unitNumber} drill. The focus is on ${unit.whatMatters}.`;
        logic = `AP success requires fluidly using these skills: ${unit.skills.join(', ')}.`;
        guide = `Based on recent trends (${blueprint.pastTests?.[0]?.focus}), expect questions that test your ability to justify your answers.`;
        gotcha = `Watch out for ${unit.commonMistakes[0]?.mistake}. Keep the 'Student Wisdom' in mind: "${blueprint.overview.successBlueprint}"`;
        nextStep = `Ready for a test-style question, or should we review a concept first?`;
    } else if (situation === 'readiness') {
        focus = `Let's gauge your confidence for ${unit.title}.`;
        logic = `To be 'Test Ready', you should be able to check off: ${unit.readinessChecklist.slice(0, 3).join(', ')}.`;
        guide = `Mastery here often correlates with a 4 or 5 on the full exam.`;

        gotcha = `Don't let ${unit.commonMistakes[1]?.mistake || 'the complexity'} trip you up. ${blueprint.teacherTips[1] || 'Watch your units!'}`;
        nextStep = `Which of those checklist items feels the shakiest right now?`;
    } else if (situation === 'recovery') {
        const strategy = blueprint.recoveryStrategies[unitNumber] || blueprint.recoveryStrategies['General'] || "Focus on the basics and build up.";
        focus = `Mistakes are just data points on the path to mastery. Let's rebuild in Unit ${unitNumber}.`;
        logic = `The Recovery Strategy for this course is: ${strategy}`;
        guide = `Review ${unit.keyConcepts[0]} specifically. Remember what alumni say: "${blueprint.alumniWisdom[0]?.advice || 'Keep going.'}"`;
        gotcha = `The biggest mistake now is rushing. Let's slow down and look at why ${unit.commonMistakes[0]?.mistake} happens.`;
        nextStep = `Would you like me to explain ${unit.keyConcepts[0]} again, or should we try a simple problem?`;
    } else {
        focus = `Welcome to your ${blueprint.title} mentor session.`;
        logic = `We are focused on Unit ${unitNumber}: ${unit.title}. Weight: ${unit.weight}.`;
        guide = `The Success Blueprint here is: ${blueprint.overview.successBlueprint}`;
        gotcha = `Teacher Tip: ${blueprint.teacherTips[0]}`;
        nextStep = `What's on your mind? We can explain a concept, practice, or check your readiness.`;
    }

    return `${focus}
\n\n${logic}
\n\n${guide}
\n\n${gotcha}
\n\n${nextStep}`;
}
