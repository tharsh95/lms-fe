import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { GeneratedContent, AnswerKeyItem } from '@/utils/type';
import { generateAnswerKey, generateInstructions, generateQuestions, generateRubric } from '@/utils/generate';
import { ASSIGNMENT_TYPE_INFO } from '@/utils/constants';
import { assignmentApi } from '@/services/api';

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

export interface Question {
  id: string;
  text: string;
  type: string;
  options?: string[];
  correctAnswer: string;
  marks: number;
  questionText?: string;
  points?: number;
}

interface AssignmentContextType {
  assignments: Assignment[];
  currentAssignment: Assignment | null;
  setAssignments: (assignments: Assignment[]) => void;
  setCurrentAssignment: (assignment: Assignment | null) => void;
  addAssignment: (assignment: Assignment) => void;
  updateAssignment: (assignment: Assignment) => void;
  deleteAssignment: (id: string) => void;
  selectedType: string;
  assignmentTitle: string;
  grade: string;
  subject: string;
  difficulty: string;
  selectedCourse: string;
  description: string;
  numberOfQuestions: number | undefined;
  publishToLMS: string[];
  data: GeneratedContent | null;
  isGenerating: boolean;
  generatedContent: GeneratedContent;
  setSelectedType: (type: string) => void;
  setAssignmentTitle: (title: string) => void;
  setGrade: (grade: string) => void;
  setSubject: (subject: string) => void;
  setDifficulty: (difficulty: string) => void;
  setSelectedCourse: (course: string) => void;
  setDescription: (description: string) => void;
  setNumberOfQuestions: (count: number | undefined) => void;
  setPublishToLMS: (lms: string[]) => void;
  setGeneratedContent: (content: GeneratedContent) => void;
  handleDetailsSubmission: () => Promise<void>;
  handleGenerateContent: (responseData?: GeneratedContent) => GeneratedContent;
  questionsToString: (questions: string | Question[]) => string;
  answerKeyToString: (answerKey: AnswerKeyItem[] | string) => string;
  payload: {
    title: string;
    topic: string;
    questionType: {
      title: string;
      description: string;
      outputs: string[];
    };
  };
}

const AssignmentContext = createContext<AssignmentContextType | undefined>(undefined);

export const useAssignment = () => {
  const context = useContext(AssignmentContext);
  if (context === undefined) {
    throw new Error('useAssignment must be used within an AssignmentProvider');
  }
  return context;
};

interface AssignmentProviderProps {
  children: ReactNode;
}

export const AssignmentProvider: React.FC<AssignmentProviderProps> = ({ children }) => {
  // Load initial state from localStorage if available
  const loadInitialState = () => {
    try {
      const savedState = localStorage.getItem('assignmentState');
      if (savedState) {
        return JSON.parse(savedState);
      }
    } catch (error) {
      console.error('Error loading state from localStorage:', error);
    }
    return {
      assignments: [],
      currentAssignment: null,
      selectedType: "",
      assignmentTitle: "",
      grade: "",
      subject: "",
      difficulty: "",
      selectedCourse: "",
      description: "",
      numberOfQuestions: undefined,
      publishToLMS: [],
      data: null,
      isGenerating: false,
      generatedContent: {},
    };
  };

  const initialState = loadInitialState();
  
  const [assignments, setAssignments] = useState<Assignment[]>(initialState.assignments);
  const [currentAssignment, setCurrentAssignment] = useState<Assignment | null>(initialState.currentAssignment);
  const [selectedType, setSelectedType] = useState<string>(initialState.selectedType);
  const [assignmentTitle, setAssignmentTitle] = useState(initialState.assignmentTitle);
  const [grade, setGrade] = useState<string>(initialState.grade);
  const [subject, setSubject] = useState<string>(initialState.subject);
  const [difficulty, setDifficulty] = useState<string>(initialState.difficulty);
  const [selectedCourse, setSelectedCourse] = useState(initialState.selectedCourse);
  const [description, setDescription] = useState(initialState.description);
  const [numberOfQuestions, setNumberOfQuestions] = useState<number | undefined>(initialState.numberOfQuestions);
  const [publishToLMS, setPublishToLMS] = useState<string[]>(initialState.publishToLMS);
  const [data, setData] = useState<GeneratedContent | null>(initialState.data);
  const [isGenerating, setIsGenerating] = useState(initialState.isGenerating);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent>(initialState.generatedContent);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    const stateToSave = {
      assignments,
      currentAssignment,
      selectedType,
      assignmentTitle,
      grade,
      subject,
      difficulty,
      selectedCourse,
      description,
      numberOfQuestions,
      publishToLMS,
      data,
      isGenerating,
      generatedContent,
    };
    localStorage.setItem('assignmentState', JSON.stringify(stateToSave));
  }, [
    assignments,
    currentAssignment,
    selectedType,
    assignmentTitle,
    grade,
    subject,
    difficulty,
    selectedCourse,
    description,
    numberOfQuestions,
    publishToLMS,
    data,
    isGenerating,
    generatedContent,
  ]);

  const payload = {
    title: assignmentTitle,
    topic: selectedCourse,
    questionType: ASSIGNMENT_TYPE_INFO[selectedType],
  };
  const addAssignment = (assignment: Assignment) => {
    setAssignments((prev) => [...prev, assignment]);
  };

  const updateAssignment = (assignment: Assignment) => {
    setAssignments((prev) =>
      prev.map((a) => (a.id === assignment.id ? assignment : a))
    );
  };

  const deleteAssignment = (id: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleDetailsSubmission = async () => {
    if (isGenerating) {
      return; // Prevent multiple submissions while generating
    }
    
    const payload = {
      title: assignmentTitle,
      topic: selectedCourse,
      description,
      questionType: ASSIGNMENT_TYPE_INFO[selectedType],
      numberOfQuestions,
      publishToLMS: publishToLMS,
      difficultyLevel: difficulty,
      grade,
      subject,
    };
    
    try {
      setIsGenerating(true);
      const {data} = await assignmentApi.generateAssignment(payload);
      setData(data);
      // Pass the API response directly to handleGenerateContent
      const newContent = handleGenerateContent(data);
      setGeneratedContent(newContent);
    } catch (error) {
      console.error("Error generating assignment:", error);
      setIsGenerating(false); // Make sure to reset this on error
    }
  };
  
  // Modify handleGenerateContent to accept the data parameter
  const handleGenerateContent = (responseData?: GeneratedContent) => {
    const outputs = ASSIGNMENT_TYPE_INFO[selectedType]?.outputs || [];
    
    const newContent: GeneratedContent = {};
    
    if (responseData) {
      if (outputs.includes("instructions")) {
        newContent.instructions = generateInstructions(responseData);
      }
      if (outputs.includes("rubric")) {
        newContent.rubric = generateRubric(responseData);
      }
      if (outputs.includes("questions")) {
        newContent.questions = generateQuestions(responseData);
      }
      if (outputs.includes("answer_key")) {
        newContent.answerKey = generateAnswerKey(responseData);
      }
    }

    
    // setGeneratedContent(newContent);
setIsGenerating(false);
return newContent;
  };

  const questionsToString = (questions: string | Question[]): string => {
    if (typeof questions === 'string') {
      return questions;
    }
    return questions.map((q, index) => 
      `${index + 1}. ${q.questionText}\nPoints: ${q.points || 0}`
    ).join('\n\n');
  };

  const answerKeyToString = (answerKey: AnswerKeyItem[] | string): string => {
    if (typeof answerKey === 'string') {
      return answerKey;
    }
    return answerKey.map(item => `Question ${item.questionId}: ${item.key} - ${item.value}`).join('\n');
  };

  const value = {
    assignments,
    currentAssignment,
    setAssignments,
    setCurrentAssignment,
    addAssignment,
    updateAssignment,
    deleteAssignment,
    selectedType,
    assignmentTitle,
    grade,
    subject,
    difficulty,
    selectedCourse,
    description,
    numberOfQuestions,
    publishToLMS,
    data,
    isGenerating,
    generatedContent,
    setSelectedType,
    setAssignmentTitle,
    setGrade,
    setSubject,
    setDifficulty,
    setSelectedCourse,
    setDescription,
    setNumberOfQuestions,
    setPublishToLMS,
    setGeneratedContent,
    handleDetailsSubmission,
    handleGenerateContent,
    questionsToString,
    answerKeyToString,
    payload
  };

  return (
    <AssignmentContext.Provider value={value}>
      {children}
    </AssignmentContext.Provider>
  );
}; 