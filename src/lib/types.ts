export interface ExamSection {
    id: string;
    name: string;
    questionCount: number;
    order: number;
}

export interface ExamConfig {
    id: string;
    activeExamType: 'single' | 'multi' | 'choice';
    singleSectionQuestionCount: number;
    numberOfSets: number;
}
