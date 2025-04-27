import { AnswerKeyItem, GeneratedContent, Question } from "./type";
import { convertMarkdownToHtml } from "./markdown";

export const generateQuestions = (data: GeneratedContent) => {
    // Check if we have data with questions
    if (!data) return '';

    if (data.questions) {
        let formattedQuestions = `# ${data.title}\n`;
        formattedQuestions += `## ${data.subject || ''}\n`;
        formattedQuestions += `## ${data.topic || ''}\n`;
        formattedQuestions += `**Grade Level:** ${data.grade || 'N/A'}\n`;
        formattedQuestions += `**Difficulty:** ${data.difficultyLevel || 'N/A'}\n`;
        formattedQuestions += `**Description:** ${data.description || ''}\n`;
        formattedQuestions += `## Questions\n\n`;

        if (Array.isArray(data.questions)) {
            data.questions.forEach((q: Question, index: number) => {
                formattedQuestions += `### ${index + 1}. ${q.questionText}\n`;
                if (q.type === 'multiple_choice' && Array.isArray(q.options)) {

                    q.options.forEach((option: string) => {
                        formattedQuestions += `${option}\n`;
                    });
                }
                formattedQuestions += `\n**Points:** ${q.points || 0}\n\n`;
            });
        }

        return formattedQuestions;
    }

    // Fallback to the original format if no questions are available
    return `# Multiple Choice Questions: ${data.title}
## ${data.subject} - ${data.topic}
### Error in rendering questions`;
};

export const generateAnswerKey = (data: GeneratedContent): AnswerKeyItem[] => {
    if (data?.answerKey) {
        if (Array.isArray(data.answerKey)) {
            return data.answerKey.map(item => ({
                questionId: item.questionId,
                key: item.key === "N/A" ? "" : item.key,
                value: item.value
            }));
        }
    }
    return [];
};

export const generateInstructions = (data: GeneratedContent) => {

    if (!data) return '';
    
    let formattedInstructions = `# ${data.title || 'Instructions'}\n`;
    formattedInstructions += `## ${data.subject || ''}\n`;
    formattedInstructions += `## ${data.topic || ''}\n`;
    formattedInstructions += `**Grade Level:** ${data.grade || 'N/A'}\n`;
    formattedInstructions += `**Difficulty:** ${data.difficultyLevel || 'N/A'}\n`;
    formattedInstructions += `**Description:** ${data.description || ''}\n\n`;
    
    if (typeof data.instructions === 'object' && data.instructions?.sections) {
        data.instructions.sections.forEach((section) => {
            formattedInstructions += `### ${section.title}\n`;
            formattedInstructions += `${section.content}\n\n`;
        });
    } 
    else if (typeof data.instructions === 'string') {
        formattedInstructions += data.instructions;
    }
    
    return convertMarkdownToHtml(formattedInstructions);
}
export const generateRubric = (data: GeneratedContent) => {
    if (!data) return '';

    let formattedRubric = `# ${data.title || 'Rubric'}\n`;
    formattedRubric += `## ${data.subject || ''}\n`;
    formattedRubric += `## ${data.topic || ''}\n`;
    formattedRubric += `**Grade Level:** ${data.grade || 'N/A'}\n`;

    if(Array.isArray(data.rubric)) {
        data.rubric.map((item) => {
            formattedRubric += `### ${item.criterion}\n`;  
         
            formattedRubric += `${item.description}\n`;
            formattedRubric += `**Points:** ${item.points}\n`;
        });
    }
    
    return convertMarkdownToHtml(formattedRubric);
}
export  const answerKeyToString = (answerKey: AnswerKeyItem[] | string): string => {
    if (typeof answerKey === "string") {
      return answerKey;
    }
    return answerKey
      .map((item) => `Question ${item.questionId}: ${item.key} - ${item.value}`)
      .join("\n");
  };    