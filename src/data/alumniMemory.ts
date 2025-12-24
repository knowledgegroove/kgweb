export interface AlumniTip {
    courseId: string;
    studentName: string;
    tip: string;
    date: string;
}

export const alumniMemory: AlumniTip[] = [
    {
        courseId: 'ap-calculus-ab',
        studentName: 'Alex M.',
        tip: 'For Unit 3, don\'t just memorize the derivative rules. Understanding how the chain rule actually works with composition will save you in the FRQs.',
        date: '2023-05-15'
    },
    {
        courseId: 'ap-calculus-ab',
        studentName: 'Sarah J.',
        tip: 'The related rates problems are always about setting up the equation first. If you struggle with the geometry, you\'ll struggle with the calc.',
        date: '2023-06-10'
    },
    {
        courseId: 'ap-chemistry',
        studentName: 'Kevin P.',
        tip: 'Equilibrium is the heart of the course. If you don\'t get Le Chatelier\'s principle, Unit 7 and 8 will be impossible.',
        date: '2023-04-20'
    }
];
