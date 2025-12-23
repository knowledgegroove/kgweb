import { academyKnowledge, CourseBlueprint } from '@/data/academyKnowledge';

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
        focus = `We are looking at Unit ${unitNumber}: ${unit.title}. This unit is really about ${unit.whatMatters}.`;
        logic = `The core idea here is to master ${unit.keyConcepts.slice(0, 2).join(' and ')}.`;
        guide = `I recommend starting with ${unit.skills[0]}. You can find related concepts in your ${blueprint.textbooks?.[0]?.title || 'textbook'}.`;
        gotcha = `Watch out for: ${unit.commonMistakes[0]?.mistake || 'complex calculations'}. Remember to ${unit.commonMistakes[0]?.fix || 'check your steps'}.`;
        nextStep = `Shall we dive deeper into ${unit.keyConcepts[0]}, or would you like a practice problem?`;
    } else if (situation === 'practice') {
        focus = `Time to drill Unit ${unitNumber}. The exam focuses heavily on ${blueprint.overview.testingFocus}.`;
        logic = `Success here requires ${unit.skills.join(', ')}.`;
        guide = `Based on past exams (like ${blueprint.pastTests?.[0]?.year || 'recent years'}), keep an eye on ${blueprint.pastTests?.[0]?.focus || 'core concepts'}.`;
        gotcha = `A common trap in this unit is ${unit.commonMistakes[0]?.mistake || 'missing details'}.`;
        nextStep = `Ready for a test-style question, or should we review a concept first?`;
    } else if (situation === 'readiness') {
        focus = `Let's gauge your confidence for ${unit.title}.`;
        logic = `To be 'Test Ready', you should be able to check off: ${unit.readinessChecklist.slice(0, 3).join(', ')}.`;
        guide = `${blueprint.title} exams often test ${blueprint.overview.testingFocus}.`;
        gotcha = `Don't let ${unit.commonMistakes[1]?.mistake || 'timing'} trip you up.`;
        nextStep = `Which of those checklist items feels the shakiest right now?`;
    } else if (situation === 'recovery') {
        const strategy = blueprint.recoveryStrategies[unitNumber] || blueprint.recoveryStrategies['General'] || "Focus on the basics and build up.";
        focus = `Mistakes happen—they are just data. Let's rebuild your confidence in Unit ${unitNumber}.`;
        logic = `The 'Recovery Path' for this unit is: ${strategy}`;
        guide = `Review ${unit.keyConcepts[0]} and ${unit.keyConcepts[1]} specifically.`;
        gotcha = `The biggest mistake now is rushing. Take it slow.`;
        nextStep = `Would you like me to explain the most difficult concept in this unit again?`;
    } else {
        focus = `Welcome to your ${blueprint.title} mentor session.`;
        logic = `We are focused on Unit ${unitNumber}: ${unit.title}.`;
        guide = `This unit makes up ${unit.weight} of the exam weight. It's ${unit.priority} priority.`;
        gotcha = `The 'Success Blueprint' for this course is: ${blueprint.overview.successBlueprint}`;
        nextStep = `What's on your mind? We can explain a concept, practice, or check your readiness.`;
    }

    return `1. THE FOCUS: ${focus}
2. THE LOGIC: ${logic}
3. THE GUIDE: ${guide}
4. THE GOTCHA: ${gotcha}
5. NEXT STEP: ${nextStep}`;
}
