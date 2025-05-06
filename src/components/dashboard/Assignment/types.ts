import { AnswerKeyItem, GeneratedContent, Question } from "@/utils/type";

interface Section {
    title: string;
    content: string;
  }
  
  export interface Instructions {
    sections: Section[];
  }
  
  export interface RubricItem {
    Criterion: string;
    Points: number;
    Description: string;
  }
  
 export interface InstructionSection {
    title: string;
    content: string;
  }
  
 export interface AssignmentFormData {
    type: string;
    title: string;
    topic: string;
    _id?: string;
  }
  
 export interface GenerateState {
    data: GeneratedContent;
    formData: AssignmentFormData;

  }
  
 export interface LocalQuestion extends Omit<Question, "options" | "_id"    > {
    _id?: string;
    options: Record<string, string>;
  }
  
 export interface ExtendedGeneratedContent extends GeneratedContent {
    _id?: string;
  }
  
  export interface ExtendedInstructionSection extends InstructionSection {
    _id: string;
    required?: boolean;
  }
  
  export interface ExtendedRubricItem extends RubricItem {
    _id: string;
    required?: boolean;
  }
  
  export interface ExtendedAnswerKeyItem extends AnswerKeyItem {
    _id: string;
    required?: boolean;
  }