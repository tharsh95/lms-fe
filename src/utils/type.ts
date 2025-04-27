export interface GeneratedContent {

    instructions?: string | {
        sections: Array<{
            title: string;
            content: string;
        }>;
    };
    rubric?: string | Array<{
        criterion: string;
        points: number;
        description: string;
    }>;
    questions?: string | Question[];
    answerKey?: AnswerKeyItem[];
    checklist?: string | Array<{
        item: string;
        required: boolean;
    }>;
    participation_criteria?: string;
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
    questionText: string;
    type: string;
    points: number;
    options?: Record<string, string>;
}

export interface AnswerKeyItem {
    questionId: string;
    key: string;
    value: string;
}

export interface ShortAnswer {
    key: string;
}
