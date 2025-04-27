import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Loader2,
  Save,
  Edit,
  Copy,
  Check,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
// import { PDFPreviewDialog } from "@/components/pdf-preview-dialog";
// import { EmailPreviewDialog } from "@/components/email-preview-dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { assignmentApi } from "@/services/api";

// Assignment type definitions
const ASSIGNMENT_TYPES = {
  ESSAY: "essay",
  RESEARCH_PAPER: "research_paper",
  MULTIPLE_CHOICE: "multiple_choice",
  SHORT_ANSWER: "short_answer",
  PRESENTATION: "presentation",

  DISCUSSION: "discussion",
  LAB_REPORT: "lab_report",
  PORTFOLIO: "portfolio",
  CASE_STUDY: "case_study",
};

// Assignment type metadata
const ASSIGNMENT_TYPE_INFO = {
  [ASSIGNMENT_TYPES.ESSAY]: {
    title: "Essay",
    description: "A written composition on a particular subject",
    outputs: ["instructions", "rubric"],
  },
  [ASSIGNMENT_TYPES.RESEARCH_PAPER]: {
    title: "Research Paper",
    description: "An in-depth analysis requiring research and citations",
    outputs: ["instructions", "rubric"],
  },
  [ASSIGNMENT_TYPES.MULTIPLE_CHOICE]: {
    title: "Multiple Choice Quiz",
    description: "Questions with several possible answers to choose from",
    outputs: ["questions", "answer_key"],
  },
  [ASSIGNMENT_TYPES.SHORT_ANSWER]: {
    title: "Short Answer Test",
    description: "Questions requiring brief written responses",
    outputs: ["questions", "answer_key", "rubric"],
  },
  [ASSIGNMENT_TYPES.PRESENTATION]: {
    title: "Presentation",
    description: "Oral delivery of information or a project",
    outputs: ["instructions", "rubric"],
  },

  //   title: "Group Project",
  //   description: "Collaborative work among multiple students",
  //   icon: Users,
  //   outputs: ["instructions", "rubric", "peer_evaluation"],
  // },
  [ASSIGNMENT_TYPES.DISCUSSION]: {
    title: "Discussion",
    description: "Guided conversation on a specific topic",
    outputs: ["instructions", "participation_criteria"],
  },
  [ASSIGNMENT_TYPES.LAB_REPORT]: {
    title: "Lab Report",
    description: "Documentation of an experiment or investigation",
    outputs: ["instructions", "rubric", "checklist"],
  },
  [ASSIGNMENT_TYPES.PORTFOLIO]: {
    title: "Portfolio",
    description: "Collection of work demonstrating skills and growth",
    outputs: ["instructions", "rubric"],
  },
  [ASSIGNMENT_TYPES.CASE_STUDY]: {
    title: "Case Study",
    description: "Analysis of a specific instance or scenario",
    outputs: ["instructions", "rubric"],
  },
};

// Define a type for the generated content
interface GeneratedContent {
  instructions?: string;
  rubric?: string;
  questions?: string | Question[];
  answerKey?: AnswerKeyItem[];
  checklist?: string;
  participation_criteria?: string;
  peer_evaluation?: string;
  // Additional properties from API response
  title?: string;
  description?: string;
  grade?: number;
  topic?: string;
  subject?: string;
  difficultyLevel?: string;
}

interface Question {
  questionText: string;
  type: string;
  points: number;
  options?: Record<string, string>;
}

interface AnswerKeyItem {
  questionId: string;
  key: string;
  value: string;
}

interface ShortAnswer {
  key: string;
}

interface AssignmentData {
  title?: string;
  subject?: string;
  topic?: string;
  grade?: string;
  difficultyLevel?: string;
  description?: string;
  questions?: Question[] | string;
  answerKey?: AnswerKeyItem[];
}

export default function CreateAssignmentPage() {
  const navigate = useNavigate();

  // Step tracking
  const [currentStep, setCurrentStep] = useState<"details" | "generate">(
    "details"
  );
  const [numberOfQuestions, setNumberOfQuestions] = useState<number>();
const [data, setData] = useState<GeneratedContent>();
  // Assignment type selection
  const [selectedType, setSelectedType] = useState<string>("");
  // Basic assignment info
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [grade, setGrade] = useState<string>("");
  const [subject, setSubject] = useState<string>("");
  const [selectedCourse, setSelectedCourse] = useState("");

  const [description, setDescription] = useState("");
  const [learningObjectives, setLearningObjectives] = useState("");
  const [difficulty, setDifficulty] = useState("");

  // Generation states
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [publishToLMS, setPublishToLMS] = useState<string[]>([]);
  const [connectedLMS, setConnectedLMS] = useState<string[]>(["Canvas"]);

  // Generated content
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent>(
    {}
  );

  // Preview dialogs
  // const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);
  // const [emailPreviewOpen, setEmailPreviewOpen] = useState(false);

  // Copy state
  const [copied, setCopied] = useState<string | null>(null);
  const handleDetailsSubmission = async () => {
    // if (!assignmentTitle) {
    //   return;
    // }

    // if (!selectedCourse) {
    //   return;
    // }
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
    const {data} =  await assignmentApi.generateAssignment(payload);

    setData(data);
    setCurrentStep("generate");
    handleGenerateContent();
  };

  const handleGenerateContent = () => {
    setIsGenerating(true);
    const outputs = ASSIGNMENT_TYPE_INFO[selectedType]?.outputs || [];

    setTimeout(() => {
      const newContent: GeneratedContent = {};
      if (outputs.includes("instructions")) {
        newContent.instructions = generateInstructions();
      }
      if (outputs.includes("rubric")) {
        newContent.rubric = generateRubric();
      }
      if (outputs.includes("questions")) {
        newContent.questions = generateQuestions();
      }
      if (outputs.includes("answer_key")) {
        newContent.answerKey = generateAnswerKey();
      }
      if (outputs.includes("checklist")) {
        newContent.checklist = generateChecklist();
      }
      if (outputs.includes("participation_criteria")) {
        newContent.participation_criteria = generateParticipationCriteria();
      }
      if (outputs.includes("peer_evaluation")) {
        newContent.peer_evaluation = generatePeerEvaluation();
      }
      setGeneratedContent(newContent);
      setIsGenerating(false);
    }, 2000);
  };
  const generateInstructions = () => {
    const typeTitle = ASSIGNMENT_TYPE_INFO[selectedType]?.title || "Assignment";
    return `# ${typeTitle}: ${assignmentTitle}
## ${selectedCourse}

### Overview
This ${typeTitle.toLowerCase()} will assess your understanding of the subject matter and demonstrate your ability to ${
      selectedType === ASSIGNMENT_TYPES.ESSAY
        ? "analyze and articulate complex ideas"
        : selectedType === ASSIGNMENT_TYPES.RESEARCH_PAPER
        ? "conduct research and synthesize information"
        : selectedType === ASSIGNMENT_TYPES.PRESENTATION
        ? "organize and present information clearly"
        : "apply concepts to real-world scenarios"
    }.

### Learning Objectives
${
  learningObjectives ||
  "- Demonstrate understanding of key concepts\n- Apply theoretical knowledge to practical situations\n- Develop critical thinking and analytical skills"
}

### Requirements
- ${
      selectedType === ASSIGNMENT_TYPES.ESSAY
        ? "Length: 1000-1500 words"
        : selectedType === ASSIGNMENT_TYPES.RESEARCH_PAPER
        ? "Length: 2000-2500 words with at least 8 scholarly sources"
        : selectedType === ASSIGNMENT_TYPES.PRESENTATION
        ? "Duration: 10-15 minutes with visual aids"
        : "Follow all instructions carefully"
    }
- Format: ${
      selectedType === ASSIGNMENT_TYPES.RESEARCH_PAPER
        ? "APA style with proper citations"
        : "Clear, organized structure with proper grammar and spelling"
    }
-}

### Components
Your ${typeTitle.toLowerCase()} should include the following:

1. **Introduction**
   - Clear thesis or main argument
   - Overview of the topic's significance
   - Brief outline of your approach

2. **Main Body**
   - Well-structured arguments with supporting evidence
   - Critical analysis of key concepts
   - Application of relevant theories

3. **Conclusion**
   - Summary of key points
   - Implications of your analysis
   - Suggestions for further consideration

### Submission Guidelines
Submit your ${typeTitle.toLowerCase()} through the course website by the due date. Late submissions will be penalized according to the course policy.`;
  };

  const generateRubric = () => {
    const typeTitle = ASSIGNMENT_TYPE_INFO[selectedType]?.title || "Assignment";

    return `# ${typeTitle} Rubric: ${assignmentTitle}
## ${selectedCourse}

| Criteria | Excellent (A) | Good (B) | Satisfactory (C) | Needs Improvement (D) |
|----------|---------------|----------|------------------|------------------------|
| **Content & Understanding** (30%) | Demonstrates comprehensive understanding of the subject. Ideas are original and insightful. | Shows solid understanding of most concepts. Ideas are generally well-developed. | Demonstrates basic understanding. Some ideas need further development. | Limited understanding of key concepts. Ideas are underdeveloped. |
| **Organization & Structure** (25%) | Exceptionally well-organized with logical flow. Clear transitions between sections. | Well-organized with good flow. Generally clear transitions. | Adequately organized but with some structural issues. Transitions sometimes unclear. | Poor organization. Lacks logical flow. Unclear transitions. |
| **Evidence & Support** (25%) | Excellent use of relevant, high-quality evidence. All arguments well-supported. | Good use of relevant evidence. Most arguments adequately supported. | Adequate use of evidence, though some may be less relevant. Some arguments lack support. | Insufficient or inappropriate evidence. Arguments poorly supported. |
| **Communication & Style** (20%) | Excellent clarity and precision in writing. Sophisticated style. Virtually error-free. | Clear writing with good style. Few grammatical or spelling errors. | Generally clear writing but with some stylistic issues. Several errors present. | Unclear writing with significant stylistic problems. Numerous errors. |

**Grading Scale:**
- A: 90-100%
- B: 80-89%
- C: 70-79%
- D: 60-69%
- F: Below 60%

**Additional Notes:**
This rubric evaluates both the content and presentation of your ${typeTitle.toLowerCase()}. Pay particular attention to developing well-supported arguments and maintaining a clear organizational structure.`;
  };

    const generateQuestions = () => {
        // Check if we have data with questions
        if (!data) return '';

        if (data.questions) {
        try {
            // Format the questions for display
            let formattedQuestions = `# ${data.title || 'Multiple Choice Questions'}\n`;
            formattedQuestions += `## ${data.subject || ''} - ${data.topic || ''}\n\n`;
            formattedQuestions += `**Grade Level:** ${data.grade || 'N/A'}\n`;
            formattedQuestions += `**Difficulty:** ${data.difficultyLevel || 'N/A'}\n\n`;
            formattedQuestions += `**Description:** ${data.description || ''}\n\n`;
            
            // Add each question
            formattedQuestions += `## Questions\n\n`;
            
            // Check if questions is an array
            if (Array.isArray(data.questions)) {
            data.questions.forEach((q: Question, index: number) => {
                formattedQuestions += `### ${index + 1}. ${q.questionText}\n`;
                if (q.type === 'multiple_choice' && q.options) {
                // formattedQuestions += `\nOptions:\n`;
                Object.entries(q.options).forEach(([key, value]) => {
                    formattedQuestions += `${key}) ${value}\n`;
                });
                }
                formattedQuestions += `\n**Points:** ${q.points || 0}\n\n`;
            });
            } else if (typeof data.questions === 'string') {
            // If it's a string, just return it
            return data.questions;
            }
            
            return formattedQuestions;
        } catch (error) {
            console.error('Error formatting questions:', error);
            return 'Error formatting questions';
        }
        }
        
        // Fallback to the original format if no questions are available
        return `# Multiple Choice Questions: ${assignmentTitle}
    ## ${selectedCourse}`;
    };
  

  

    

  

  const generateAnswerKey = (): AnswerKeyItem[] => {
    if (data?.answerKey) {
      if (typeof data.answerKey === 'object' && !Array.isArray(data.answerKey)) {
        const shortAnswers = data.answerKey as Record<string, ShortAnswer>;
        return Object.entries(shortAnswers).map(([questionId, answer]) => ({
          questionId,
          key: 'answer',
          value: answer.key
        }));
      }
      return data.answerKey;
    }
    return [];
  };

  const generateChecklist = () => {
    return `# Lab Report Checklist: ${assignmentTitle}
## ${selectedCourse}

### Format and Structure
- [ ] Title page with experiment title, your name, course, date
- [ ] Abstract (150-250 words summarizing the experiment)
- [ ] Introduction with clear purpose and hypothesis
- [ ] Materials and methods section with detailed procedure
- [ ] Results section with data tables and graphs
- [ ] Discussion section analyzing results
- [ ] Conclusion summarizing findings and addressing hypothesis
- [ ] References in proper citation format

### Content Quality
- [ ] Hypothesis is clear, testable, and based on scientific principles
- [ ] Procedure is detailed enough to be replicated
- [ ] Data is accurately recorded and properly labeled
- [ ] Graphs and tables are properly formatted with titles and labels
- [ ] Statistical analysis is appropriate for the data collected
- [ ] Discussion addresses experimental errors and limitations
- [ ] Conclusion is supported by the data
- [ ] Scientific terminology is used correctly throughout

### Technical Requirements
- [ ] Report follows required formatting (12pt font, double-spaced)
- [ ] Graphs created using appropriate software
- [ ] Raw data included in appendix
- [ ] All calculations shown and explained
- [ ] Units of measurement included with all values
- [ ] Error analysis included where appropriate

### Safety and Ethics
- [ ] Safety procedures followed and documented
- [ ] Ethical considerations addressed if applicable
- [ ] Proper disposal of materials documented
- [ ] Acknowledgment of assistance or collaboration

**Grading Notes:**
- Each item on this checklist contributes to your overall grade
- Major deficiencies in critical areas (hypothesis, data analysis, conclusion) will significantly impact your grade
- Exceptional work in any area will be noted and may positively influence your grade`;
  };

  const generateParticipationCriteria = () => {
    return `# Discussion Participation Criteria: ${assignmentTitle}
## ${selectedCourse}

### Quantity of Participation
| Level | Description | Points |
|-------|-------------|--------|
| Excellent | Consistently participates throughout the discussion period with multiple substantive contributions | 25-30 |
| Good | Regularly participates with at least 2-3 substantive contributions | 20-24 |
| Satisfactory | Occasionally participates with at least 1-2 contributions | 15-19 |
| Needs Improvement | Rarely participates or contributions are minimal | 0-14 |

### Quality of Contributions
| Level | Description | Points |
|-------|-------------|--------|
| Excellent | Contributions demonstrate thorough preparation, critical thinking, and advance the discussion | 25-30 |
| Good | Contributions show good preparation and understanding of the material | 20-24 |
| Satisfactory | Contributions show basic preparation but limited depth | 15-19 |
| Needs Improvement | Contributions show minimal preparation or understanding | 0-14 |

### Engagement with Peers
| Level | Description | Points |
|-------|-------------|--------|
| Excellent | Actively engages with peers' ideas, asks thoughtful questions, and builds on others' contributions | 15-20 |
| Good | Responds thoughtfully to peers and shows active listening | 10-14 |
| Satisfactory | Some engagement with peers but limited follow-up | 5-9 |
| Needs Improvement | Minimal engagement with peers' contributions | 0-4 |

### Discussion Etiquette
| Level | Description | Points |
|-------|-------------|--------|
| Excellent | Consistently demonstrates respect, active listening, and inclusive behavior | 15-20 |
| Good | Generally respectful and attentive to others | 10-14 |
| Satisfactory | Mostly respectful but may occasionally interrupt or dominate | 5-9 |
| Needs Improvement | Frequently interrupts, dominates, or shows disrespect | 0-4 |

**Total Possible Points: 100**

**Additional Notes:**
- Participation will be assessed throughout the entire discussion period
- Quality is valued over quantity—a few thoughtful contributions are better than many superficial ones
- Both verbal and non-verbal participation (active listening, note-taking) will be considered
- Students with documented accommodations for participation will be assessed according to their individual plans`;
  };

  const generatePeerEvaluation = () => {
    return `# Peer Evaluation Form: ${assignmentTitle}
## ${selectedCourse}

### Instructions
Rate each team member (including yourself) on the criteria below using the following scale:
1 = Poor, 2 = Below Average, 3 = Average, 4 = Good, 5 = Excellent

### Team Member: [Name]

#### Contribution to Project
- [ ] 1: Made minimal or no contributions to the project
- [ ] 2: Made some contributions but below expectations
- [ ] 3: Met basic expectations for contributions
- [ ] 4: Made significant and valuable contributions
- [ ] 5: Went above and beyond in contributions to the project

#### Reliability & Responsibility
- [ ] 1: Frequently missed deadlines and meetings
- [ ] 2: Occasionally missed deadlines or meetings
- [ ] 3: Generally reliable but needed reminders
- [ ] 4: Consistently reliable and responsible
- [ ] 5: Exceptionally dependable, often took initiative

#### Quality of Work
- [ ] 1: Work required significant revision or redoing
- [ ] 2: Work needed substantial improvement
- [ ] 3: Work met basic requirements
- [ ] 4: Work was high quality with few issues
- [ ] 5: Work was exceptional and elevated the project

#### Collaboration & Teamwork
- [ ] 1: Difficult to work with, created conflicts
- [ ] 2: Sometimes difficult to work with
- [ ] 3: Worked adequately with the team
- [ ] 4: Good team player, easy to work with
- [ ] 5: Outstanding team player, enhanced group dynamics

#### Communication
- [ ] 1: Poor communication, unresponsive
- [ ] 2: Communication was inconsistent
- [ ] 3: Communicated adequately when needed
- [ ] 4: Communicated clearly and consistently
- [ ] 5: Excellent communication that enhanced the project

### Comments
Please provide specific examples to support your ratings:

[Text area for comments]

### Overall Contribution Percentage
What percentage of the total group effort do you feel this person contributed?
[   ]%

**Note: The percentages for all team members should total 100%**

This peer evaluation will be used as part of the individual grade calculation for the group project. Your honest and fair assessment is important for equitable grading.`;
  };

  // Handle saving the assignment
  const handleSaveAssignment = () => {
    setIsSaving(true);

    // Simulate saving assignment
    setTimeout(() => {
      setIsSaving(false);
      navigate("/dashboard/assignments");
    }, 2000);
  };

  // Handle copying content to clipboard
  const handleCopyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);

    setTimeout(() => {
      setCopied(null);
    }, 2000);

    // toast({
    //   title: "Copied to clipboard",
    //   description: `${type} has been copied to your clipboard.`,
    // });
  };

  // Helper function to convert questions to string
  const questionsToString = (questions: string | Question[]): string => {
    if (typeof questions === 'string') {
      return questions;
    }
    return questions.map((q, index) => 
      `${index + 1}. ${q.questionText}\nPoints: ${q.points || 0}`
    ).join('\n\n');
  };

  // Helper function to convert answer key to string
    const answerKeyToString = (answerKey: AnswerKeyItem[] | string): string => {
        if (typeof answerKey === 'string') {
        return answerKey;
        }
        return answerKey.map(item => `Question ${item.questionId}: ${item.key} - ${item.value}`).join('\n');
    };

  // Helper function to parse string to answer key items
  const parseAnswerKeyString = (answerKeyStr: string): AnswerKeyItem[] => {
    if (!answerKeyStr) return [];
    
    // If it's a simple string, treat it as a single answer
    if (!answerKeyStr.includes('Question')) {
      return [{
        questionId: '1',
        key: 'answer',
        value: answerKeyStr
      }];
    }

    // Parse formatted string back to AnswerKeyItem[]
    return answerKeyStr.split('\n').map(line => {
      const match = line.match(/Question (\d+): (.+) - (.+)/);
      if (!match) return { questionId: '1', key: 'answer', value: line };
      return {
        questionId: match[1],
        key: match[2],
        value: match[3]
      };
    });
  };

  // Render the assignment details step
  const renderDetailsForm = () => {
    const typeInfo = ASSIGNMENT_TYPE_INFO[selectedType];
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">
            Create {typeInfo?.title || "Assignment"}
          </h1>
          <p className="text-muted-foreground">
            Enter the details for your{" "}
            {typeInfo?.title.toLowerCase() || "assignment"}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Enter the essential details about your{" "}
              {typeInfo?.title.toLowerCase() || "assignment"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="course">Types</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ASSIGNMENT_TYPES).map(([key, value]) => (
                    <SelectItem key={value} value={value}>
                      {key
                        .replace(/_/g, " ")
                        .toLowerCase()
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="assignment-title">Title</Label>
              <Input
                id="assignment-title"
                placeholder={`${typeInfo?.title || "Assignment"} Title`}
                value={assignmentTitle}
                onChange={(e) => setAssignmentTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="grade">Grade</Label>
              <Input
                id="grade"
                placeholder={"Grade"}
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder={"Subject"}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {["Easy", "Medium", "Hard"].map((key) => (
                    <SelectItem key={key} value={key}>
                      {key}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="course">Course</Label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Physics Law of Motion">
                    Physics Law of Motion
                  </SelectItem>
                  <SelectItem value="Compound Interest (MATH 101)">
                    Compound Interest (MATH 101)
                  </SelectItem>
                  <SelectItem value="Tourism">
                    Tourism
                  </SelectItem>
                  <SelectItem value="Creative Writing (ENG 215)">
                    Creative Writing (ENG 215)
                  </SelectItem>
                  <SelectItem value="English 101">English 101</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder={`Brief description of what students will do in this ${
                  typeInfo?.title.toLowerCase() || "assignment"
                }...`}
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Type-specific fields */}
            {(selectedType === ASSIGNMENT_TYPES.MULTIPLE_CHOICE ||
              selectedType === ASSIGNMENT_TYPES.SHORT_ANSWER) && (
                <div className="space-y-2">
                  <Label>Quiz Settings</Label>
                  <div className="rounded-md border p-4 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="num-questions">Number of Questions</Label>
                      <Input
                        id="num-questions"
                        type="number"
                        value={numberOfQuestions}
                        onChange={(e) => setNumberOfQuestions(+e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
            {/* LMS Integration */}
            <div className="space-y-2">
              <Label>LMS Integration</Label>
              <div className="space-y-3 rounded-md border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="canvas"
                      // checked={publishToLMS.includes("Canvas")}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setPublishToLMS([...publishToLMS, "Canvas"]);
                        } else {
                          setPublishToLMS(
                            publishToLMS.filter((lms) => lms !== "Canvas")
                          );
                        }
                      }}
                    />
                    <Label htmlFor="canvas" className="text-sm font-normal">
                      Publish to Canvas
                    </Label>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200"
                  >
                    Connected
                  </Badge>
                </div>

                {/* <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="google-classroom"
                      checked={publishToLMS.includes("Google Classroom")}
                      onCheckedChange={(checked) => {
                        if (connectedLMS.includes("Google Classroom")) {
                          if (checked) {
                            setPublishToLMS([
                              ...publishToLMS,
                              "Google Classroom",
                            ]);
                          } else {
                            setPublishToLMS(
                              publishToLMS.filter(
                                (lms) => lms !== "Google Classroom"
                              )
                            );
                          }
                        } else {
                          // toast({
                          //   title: "Google Classroom Not Connected",
                          //   description:
                          //     "Please connect to Google Classroom first",
                          // });
                        }
                      }}
                      disabled={!connectedLMS.includes("Google Classroom")}
                    />
                    <Label
                      htmlFor="google-classroom"
                      className={`text-sm font-normal ${
                        !connectedLMS.includes("Google Classroom")
                          ? "text-muted-foreground"
                          : ""
                      }`}
                    >
                      Publish to Google Classroom
                    </Label>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() =>
                      (window.location.href = "/dashboard/integrations")
                    }
                  >
                    Connect
                  </Button>
                </div> */}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full hover:cursor-pointer"
              onClick={handleDetailsSubmission}
              // disabled={
              //   !assignmentTitle ||
              //   !selectedCourse ||
              //   !description ||
              //   !grade ||
              //   !subject ||
              //   !difficulty
              // }
            >
              Continue to Generation <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  };

  // Render the content generation and review step
  const renderGenerationStep = () => {
    const typeInfo = ASSIGNMENT_TYPE_INFO[selectedType];
    const outputs = typeInfo?.outputs || [];

    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            onClick={() => setCurrentStep("details")}
            className="p-0 h-auto"
          >
            <ChevronRight className="h-4 w-4 rotate-180" />
            Back
          </Button>
          <div className="h-1 w-1 rounded-full bg-muted-foreground" />
          <span className="text-muted-foreground">Generate Content</span>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">{assignmentTitle}</h1>
          <p className="text-muted-foreground">{selectedCourse}</p>
        </div>

        {isGenerating ? (
          <Card className="flex items-center justify-center py-12">
            <CardContent className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <h3 className="text-xl font-medium">Generating Content</h3>
              <p className="text-muted-foreground mt-2">
                Our AI is creating your{" "}
                {typeInfo?.title.toLowerCase() || "assignment"} content...
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Tabs defaultValue={outputs[0]} className="space-y-4">
              <TabsList>
                {outputs.includes("instructions") && (
                  <TabsTrigger value="instructions">Instructions</TabsTrigger>
                )}
                {outputs.includes("rubric") && (
                  <TabsTrigger value="rubric">Rubric</TabsTrigger>
                )}
                {outputs.includes("questions") && (
                  <TabsTrigger value="questions">Questions</TabsTrigger>
                )}
                {outputs.includes("answer_key") && (
                  <TabsTrigger value="answer_key">Answer Key</TabsTrigger>
                )}
                {outputs.includes("checklist") && (
                  <TabsTrigger value="checklist">Checklist</TabsTrigger>
                )}
                {outputs.includes("participation_criteria") && (
                  <TabsTrigger value="participation_criteria">
                    Participation Criteria
                  </TabsTrigger>
                )}
                {outputs.includes("peer_evaluation") && (
                  <TabsTrigger value="peer_evaluation">
                    Peer Evaluation
                  </TabsTrigger>
                )}
              </TabsList>

              {outputs.includes("instructions") && (
                <TabsContent value="instructions" className="space-y-4">
                  <div className="flex justify-end space-x-2 mb-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleCopyToClipboard(
                          generatedContent.instructions || "",
                          "Instructions"
                        )
                      }
                      className="h-8"
                    >
                      {copied === "Instructions" ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="sm" className="h-8">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  </div>
                  <Textarea
                    value={generatedContent.instructions || ""}
                    onChange={(e) =>
                      setGeneratedContent({
                        ...generatedContent,
                        instructions: e.target.value,
                      })
                    }
                    className="min-h-[500px] font-mono"
                  />
                </TabsContent>
              )}

              {outputs.includes("rubric") && (
                <TabsContent value="rubric" className="space-y-4">
                  <div className="flex justify-end space-x-2 mb-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleCopyToClipboard(
                          generatedContent.rubric || "",
                          "Rubric"
                        )
                      }
                      className="h-8"
                    >
                      {copied === "Rubric" ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="sm" className="h-8">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  </div>
                  <Textarea
                    value={generatedContent.rubric || ""}
                    onChange={(e) =>
                      setGeneratedContent({
                        ...generatedContent,
                        rubric: e.target.value,
                      })
                    }
                    className="min-h-[500px] font-mono"
                  />
                </TabsContent>
              )}

              {outputs.includes("questions") && (
                <TabsContent value="questions" className="space-y-4">
                  <div className="flex justify-end space-x-2 mb-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleCopyToClipboard(
                          questionsToString(generatedContent.questions || ""),
                          "Questions"
                        )
                      }
                      className="h-8"
                    >
                      {copied === "Questions" ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="sm" className="h-8">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  </div>
                  <Textarea
                    value={questionsToString(generatedContent.questions || "")}
                    onChange={(e) =>
                      setGeneratedContent({
                        ...generatedContent,
                        questions: e.target.value,
                      })
                    }
                    className="min-h-[500px] font-mono"
                  />
                </TabsContent>
              )}

              {outputs.includes("answer_key") && (
                <TabsContent value="answer_key" className="space-y-4">
                  <div className="flex justify-end space-x-2 mb-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleCopyToClipboard(
                          answerKeyToString(generatedContent.answerKey || []),
                          "Answer Key"
                        )
                      }
                      className="h-8"
                    >
                      {copied === "Answer Key" ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="sm" className="h-8">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  </div>
                  <Textarea
                    value={answerKeyToString(generatedContent.answerKey || [])}
                    onChange={(e) =>
                      setGeneratedContent({
                        ...generatedContent,
                        answerKey: parseAnswerKeyString(e.target.value),
                      })
                    }
                    className="min-h-[500px] font-mono"
                  />
                </TabsContent>
              )}

              {outputs.includes("checklist") && (
                <TabsContent value="checklist" className="space-y-4">
                  <div className="flex justify-end space-x-2 mb-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleCopyToClipboard(
                          generatedContent.checklist || "",
                          "Checklist"
                        )
                      }
                      className="h-8"
                    >
                      {copied === "Checklist" ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="sm" className="h-8">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  </div>
                  <Textarea
                    value={generatedContent.checklist || ""}
                    onChange={(e) =>
                      setGeneratedContent({
                        ...generatedContent,
                        checklist: e.target.value,
                      })
                    }
                    className="min-h-[500px] font-mono"
                  />
                </TabsContent>
              )}

              {outputs.includes("participation_criteria") && (
                <TabsContent
                  value="participation_criteria"
                  className="space-y-4"
                >
                  <div className="flex justify-end space-x-2 mb-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleCopyToClipboard(
                          generatedContent.participation_criteria || "",
                          "Participation Criteria"
                        )
                      }
                      className="h-8"
                    >
                      {copied === "Participation Criteria" ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="sm" className="h-8">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  </div>
                  <Textarea
                    value={generatedContent.participation_criteria || ""}
                    onChange={(e) =>
                      setGeneratedContent({
                        ...generatedContent,
                        participation_criteria: e.target.value,
                      })
                    }
                    className="min-h-[500px] font-mono"
                  />
                </TabsContent>
              )}

              {outputs.includes("peer_evaluation") && (
                <TabsContent value="peer_evaluation" className="space-y-4">
                  <div className="flex justify-end space-x-2 mb-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleCopyToClipboard(
                          generatedContent.peer_evaluation || "",
                          "Peer Evaluation"
                        )
                      }
                      className="h-8"
                    >
                      {copied === "Peer Evaluation" ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="sm" className="h-8">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  </div>
                  <Textarea
                    value={generatedContent.peer_evaluation || ""}
                    onChange={(e) =>
                      setGeneratedContent({
                        ...generatedContent,
                        peer_evaluation: e.target.value,
                      })
                    }
                    className="min-h-[500px] font-mono"
                  />
                </TabsContent>
              )}
            </Tabs>

            <div className="flex justify-between">
              <div className="flex space-x-2">
                {/* <Button
                  variant="outline"
                  onClick={() => setPdfPreviewOpen(true)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEmailPreviewOpen(true)}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Email to Students
                </Button> */}
              </div>
              <Button onClick={handleSaveAssignment} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save {typeInfo?.title || "Assignment"}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {currentStep === "details" && renderDetailsForm()}
      {currentStep === "generate" && renderGenerationStep()}

      {/* PDF Preview Dialog */}
      {/* <PDFPreviewDialog
        open={pdfPreviewOpen}
        onOpenChange={setPdfPreviewOpen}
        assignment={generatedContent.instructions || ""}
        rubric={generatedContent.rubric || ""}
        title={assignmentTitle}
        course={selectedCourse}
      /> */}

      {/* Email Preview Dialog */}
      {/* <EmailPreviewDialog
        open={emailPreviewOpen}
        onOpenChange={setEmailPreviewOpen}
        assignment={generatedContent.instructions || ""}
        rubric={generatedContent.rubric || ""}
        title={assignmentTitle}
        course={selectedCourse}
      /> */}
    </div>
  );
}
