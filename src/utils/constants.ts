export const ASSIGNMENT_TYPES = {
    ESSAY: "essay",

    MULTIPLE_CHOICE: "multiple_choice_quiz",
    SHORT_ANSWER: "short_answer_test",  
    DISCUSSION: "discussion",
    CASE_STUDY: "case_study",
  }
export const ASSIGNMENT_TYPE_INFO = {
    [ASSIGNMENT_TYPES.ESSAY]: {
      title: "Essay",
      description: "A written composition on a particular subject",
      outputs: ["questions", "instructions", "rubric",],
    },

    [ASSIGNMENT_TYPES.MULTIPLE_CHOICE]: {
      title: "Multiple Choice Quiz",
      description: "Questions with several possible answers to choose from",
      outputs: ["questions", "answer_key"],
    },
    [ASSIGNMENT_TYPES.SHORT_ANSWER]: {
      title: "Short Answer Test",
      description: "Questions requiring brief written responses",
      outputs: ["questions","answer_key"]
    },
    [ASSIGNMENT_TYPES.DISCUSSION]: {
      title: "Discussion",
      description: "Guided conversation on a specific topic",
      outputs: ["instructions", "rubric","checklist","participationCriteria"],
    },
   
  
    [ASSIGNMENT_TYPES.CASE_STUDY]: {
      title: "Case Study",
      description: "Analysis of a specific instance or scenario",
      outputs: ["participationCriteria", "checklist", "rubric"],
    },
  };