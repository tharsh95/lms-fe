export interface GeneratedContent {

    instructions?: string | {
        _id: string;
        title: string;
        content: string;

    }[];
    rubric?: string | Array<{
        _id: string;
        Criterion: string;
        Points: number;
        Description: string;
    }>;
    questions?: string | Question[];
    answerKey?: AnswerKeyItem[];
    checklist?: string | Array<{
        item: string;
        required: boolean;
    }>;
    participationCriteria?: string;
    peer_evaluation?: string;
    // Additional properties from API response
    title?: string;
    description?: string;
    grade?: string | number;
    topic?: string;
    subject?: string;
    difficultyLevel?: string;
}
export interface Question {
    _id: string;
    question: string;
    type: string;
    points: number;
    options?: Record<string, string>;
    correctAnswer?: string;
    marks?: number;
}

export interface AnswerKeyItem {

    questionId: string;
    key: string;
    value: string;
    options?: string[];
}

export interface ShortAnswer {
    key: string;
}
export interface Assignment {
    id: string;
    title: string;
    description: string;
    type: string;
    dueDate: string;
    totalMarks: number;
    questions: Question[];
    createdAt: string;
    updatedAt: string;
}
