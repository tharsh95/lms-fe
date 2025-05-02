import { Loader2 } from "lucide-react";
import { Button } from "../../ui/button";
import { ChevronRight } from "lucide-react";
import { TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Tabs } from "../../ui/tabs";
import { Textarea } from "../../ui/textarea";
import { AnswerKeyItem, GeneratedContent, Question } from "@/utils/type";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ASSIGNMENT_TYPE_INFO } from "@/utils/constants";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog";
import { Plus } from "lucide-react";
import { assignmentApi } from "@/services/api";
import { useNavigate } from "react-router-dom";

interface Section {
  title: string;
  content: string;
}

interface Instructions {
  sections: Section[];
}

interface RubricItem {
  criterion: string;
  points: number;
  description: string;
}

interface InstructionSection {
  title: string;
  content: string;
}

interface FormData {
  type: string;
  title: string;
  topic: string;
  _id?: string;
}

interface GenerateState {
  data: GeneratedContent;
  formData: FormData;
}

interface LocalQuestion extends Omit<Question, 'options'> {
  _id: string;
  options: Record<string, string>;
}

interface ExtendedGeneratedContent extends GeneratedContent {
  _id?: string;
}

interface ExtendedInstructionSection extends InstructionSection {
  _id: string;
}

interface ExtendedRubricItem extends RubricItem {
  _id: string;
}

interface ExtendedAnswerKeyItem extends AnswerKeyItem {
  _id: string;
}

const Generate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: initialData, formData: initialFormData } = (location.state as { data: GeneratedContent; formData: FormData; } | undefined) || {};

  // Load data from localStorage if available, otherwise use location state
  const loadInitialState = (): { data: GeneratedContent | null; formData: FormData | null; } => {
    try {
      const savedState = localStorage.getItem('generateState');
      if (savedState) {
        return JSON.parse(savedState) as GenerateState;
      }
    } catch (error) {
      console.error('Error loading state from localStorage:', error);
    }
    return {
      data: initialData || null,
      formData: initialFormData || null,
    };
  };

  const { data: loadedData, formData: loadedFormData } = loadInitialState();

  const [data, setData] = useState<ExtendedGeneratedContent | null>(loadedData as ExtendedGeneratedContent | null);
  const [formData, setFormData] = useState<FormData | null>(loadedFormData);
  const [questions, setQuestions] = useState<LocalQuestion[]>(
    (loadedData?.questions as unknown as LocalQuestion[]) || []
  );
  const [answerKey, setAnswerKey] = useState<ExtendedAnswerKeyItem[]>(
    (loadedData?.answerKey as unknown as ExtendedAnswerKeyItem[]) || []
  );
  const [rubric, setRubric] = useState<ExtendedRubricItem[]>(
    (loadedData?.rubric as unknown as ExtendedRubricItem[]) || []
  );
  const [instructions, setInstructions] = useState<ExtendedInstructionSection[]>(
    (loadedData?.instructions as Instructions)?.sections.map(section => ({
      ...section,
      _id: `temp_${Date.now()}_${Math.random()}`
    })) || []
  );
  const [newQuestion, setNewQuestion] = useState({
    questionText: "Which sentence is in the present perfect tense?",
    type: formData?.type || "",
    points: 5,
    options: [
      "a. She will have finished the project by tomorrow.",
      "b. I have eaten the pizza.",
      "c. He will be eating the pizza tomorrow.",
      "d. She has finished the project.",
    ],
    answer: "",
  });
  const [newRubricItem, setNewRubricItem] = useState({
    criterion: "",
    points: 5,
    description: "",
  });
  const [newInstruction, setNewInstruction] = useState({
    title: "",
    content: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRubricModalOpen, setIsRubricModalOpen] = useState(false);
  const [isInstructionModalOpen, setIsInstructionModalOpen] = useState(false);
  const { outputs } =
    ASSIGNMENT_TYPE_INFO[formData?.type as keyof typeof ASSIGNMENT_TYPE_INFO];
  const [activeTab, setActiveTab] = useState(outputs[0] || "");

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (data && formData) {
      const stateToSave = {
        data: {
          ...data,
          questions: questions as unknown as Question[],
          rubric: rubric as unknown as Array<{ criterion: string; points: number; description: string; }>,
          instructions: { sections: instructions },
        },
        formData,
      };
      localStorage.setItem('generateState', JSON.stringify(stateToSave));
    }
  }, [data, formData, questions, rubric, instructions]);

  // Clear localStorage when navigating away
  useEffect(() => {
    return () => {
      localStorage.removeItem('generateState');
    };
  }, []);

  const handleAddQuestion = async () => {
    if (!newQuestion.questionText.trim() || !data) return;

    const options: Record<string, string> = {};
    if (formData?.type === "multiple_choice") {
      (newQuestion.options as string[]).forEach((option, i) => {
        const charCode = (97 + i) as number;
        const key = String.fromCharCode(charCode);
        options[key] = option;
      });
    }

    const questionToAdd: LocalQuestion = {
      _id: `temp_${Date.now()}_${questions.length}`,
      questionText: newQuestion.questionText,
      type: formData?.type || "",
      points: newQuestion.points,
      options,
    };

    setQuestions((prev) => [...prev, questionToAdd]);
    
    if (data) {
      setData({
        ...data,
        questions: [...questions, questionToAdd] as unknown as Question[],
      });

      // Add to answer key if it's short answer
      if (formData?.type === "short_answer_test" && newQuestion.answer) {
        const answerKeyItem: ExtendedAnswerKeyItem = {
          questionId: questionToAdd._id,
          key: newQuestion.answer,
          value: "",
          _id: `temp_${Date.now()}_${Math.random()}`,
        };
        setAnswerKey((prev) => [...prev, answerKeyItem]);
        setData({
          ...data,
          answerKey: [...(answerKey || []), answerKeyItem],
        });
      }

      if (data._id) {
        await assignmentApi.createResource(newQuestion, data._id);
      }
    }

    // Reset form and close modal
    setNewQuestion({
      questionText: "",
      type: formData?.type || "",
      points: 5,
      options: ["", "", "", ""],
      answer: "",
    });
    setIsModalOpen(false);
  };

  const handleOptionChange = (index: number, value: string) => {
    setNewQuestion((prev) => ({
      ...prev,
      options: prev.options.map((opt, i) => (i === index ? value : opt)),
    }));
  };

  const handleSave = async () => {
    try {
      navigate("/dashboard/assignments");
    } catch (error) {
      console.error("Error saving assignment:", error);
    }
  };

  const handleAddRubricItem = () => {
    if (!newRubricItem.criterion.trim() || !newRubricItem.description.trim() || !data) return;

    const rubricItemToAdd = {
      ...newRubricItem,
      _id: `temp_${Date.now()}_${Math.random()}`,
    };

    setRubric((prev) => [...prev, rubricItemToAdd]);
    setData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        rubric: [...(prev.rubric as ExtendedRubricItem[] || []), rubricItemToAdd] as unknown as Array<{ criterion: string; points: number; description: string; }>,
      };
    });

    setNewRubricItem({
      criterion: "",
      points: 5,
      description: "",
    });
    setIsRubricModalOpen(false);
  };

  const handleAddInstruction = async () => {
    if (!newInstruction.title.trim() || !newInstruction.content.trim() || !data) return;

    const instructionToAdd = {
      ...newInstruction,
      _id: `temp_${Date.now()}_${Math.random()}`,
    };

    setInstructions((prev) => [...prev, instructionToAdd]);
    setData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        instructions: {
          sections: [...(prev.instructions as Instructions)?.sections || [], instructionToAdd],
        },
      };
    });

    const payload = {
      newInstruction,
      type: "instructions",
    };

    if (data._id) {
      await assignmentApi.createResource(payload, data._id);
    }
  };

  const renderQuestionForm = () => {
    return (
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogTrigger asChild>
          <Button className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add {formData?.type === "discussion" ? "Topic" : "Question"}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              Add{" "}
              {formData?.type === "discussion"
                ? "Discussion Topic"
                : formData?.type === "multiple_choice"
                ? "Multiple Choice Question"
                : "Short Answer Question"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder={`Enter ${
                formData?.type === "discussion" ? "topic" : "question"
              } text`}
              value={newQuestion.questionText}
              onChange={(e) =>
                setNewQuestion((prev) => ({
                  ...prev,
                  questionText: e.target.value,
                }))
              }
              className="min-h-[100px]"
            />

            {formData?.type === "multiple_choice" && (
              <div className="space-y-2">
                {newQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="font-medium">
                      {String.fromCharCode(97 + index)}.
                    </span>
                    <input
                      type="text"
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) =>
                        handleOptionChange(index, e.target.value)
                      }
                      className="flex-1 p-2 border rounded"
                    />
                  </div>
                ))}
              </div>
            )}

            {formData?.type === "short_answer_test" && (
              <Textarea
                placeholder="Enter answer"
                value={newQuestion.answer}
                onChange={(e) =>
                  setNewQuestion((prev) => ({
                    ...prev,
                    answer: e.target.value,
                  }))
                }
                className="min-h-[100px]"
              />
            )}

            <div className="flex items-center space-x-2">
              <span className="font-medium">Points:</span>
              <input
                type="number"
                min="1"
                value={newQuestion.points}
                onChange={(e) =>
                  setNewQuestion((prev) => ({
                    ...prev,
                    points: parseInt(e.target.value),
                  }))
                }
                className="w-20 p-2 border rounded"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleAddQuestion}>Add</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const renderRubricForm = () => {
    return (
      <Dialog open={isRubricModalOpen} onOpenChange={setIsRubricModalOpen}>
        <DialogTrigger asChild>
          <Button className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Rubric Item
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Rubric Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <input
              type="text"
              placeholder="Criterion"
              value={newRubricItem.criterion}
              onChange={(e) =>
                setNewRubricItem((prev) => ({
                  ...prev,
                  criterion: e.target.value,
                }))
              }
              className="w-full p-2 border rounded"
            />
            <Textarea
              placeholder="Description"
              value={newRubricItem.description}
              onChange={(e) =>
                setNewRubricItem((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="min-h-[100px]"
            />
            <div className="flex items-center space-x-2">
              <span className="font-medium">Points:</span>
              <input
                type="number"
                min="1"
                value={newRubricItem.points}
                onChange={(e) =>
                  setNewRubricItem((prev) => ({
                    ...prev,
                    points: parseInt(e.target.value),
                  }))
                }
                className="w-20 p-2 border rounded"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleAddRubricItem}>Add</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const renderInstructionForm = () => {
    return (
      <Dialog
        open={isInstructionModalOpen}
        onOpenChange={setIsInstructionModalOpen}
      >
        <DialogTrigger asChild>
          <Button className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Instruction Section
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Instruction Section</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <input
              type="text"
              placeholder="Section Title"
              value={newInstruction.title}
              onChange={(e) =>
                setNewInstruction((prev) => ({
                  ...prev,
                  title: e.target.value,
                }))
              }
              className="w-full p-2 border rounded"
            />
            <Textarea
              placeholder="Section Content"
              value={newInstruction.content}
              onChange={(e) =>
                setNewInstruction((prev) => ({
                  ...prev,
                  content: e.target.value,
                }))
              }
              className="min-h-[100px]"
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleAddInstruction}>Add</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // // Helper function to convert complex objects to strings
  const getContentAsString = (
    content: string | object | null | undefined
  ): string => {
    if (!content) return "";
    if (typeof content === "string") return content;

    // Special handling for questions array
    if (Array.isArray(content) && content[0]?.questionText) {
      return content
        .map((question, index) => {
          const { questionText, options, points } = question;
          const optionsSection =
            options && options.length > 0
              ? `\n## Options\n\n${options.join("\n")}\n\n`
              : "\n\n";
          return `# Question ${index + 1} (${points} point${
            points > 1 ? "s" : ""
          })\n\n${questionText}${optionsSection}`;
        })
        .join("---\n\n");
    }

    // Special handling for instructions object
    if (content && typeof content === "object" && "sections" in content) {
      const instructions = content as Instructions;
      return instructions.sections
        .map((section) => {
          const { title, content: sectionContent } = section;
          return `# ${title}\n\n## Content\n\n${sectionContent}\n\n`;
        })
        .join("---\n\n");
    }

    // Special handling for rubric array
    if (Array.isArray(content) && content[0]?.criterion) {
      const totalPoints = content.reduce(
        (sum, item) => sum + (item as ExtendedRubricItem).points,
        0
      );
      return `# Rubric (Total: ${totalPoints} points)\n\n${content
        .map(
          (item: ExtendedRubricItem) =>
            `## ${item.criterion} (${item.points} points)\n\n${item.description}\n`
        )
        .join("\n")}`;
    }

    return JSON.stringify(content, null, 2);
  };
  const handleDeleteQuestion = async (questionId: string) => {
    console.log(questionId, data._id, "questionId");
  };

  // // Render content based on whether it contains HTML
  const renderContent = (content: string | object | null | undefined) => {
    const contentStr = getContentAsString(content);
    return (
      <Textarea
        disabled={true}
        value={contentStr}
        className="min-h-[500px] font-mono font-black"
        style={{
          resize: "vertical",
          overflowY: "auto",
        }}
      />
    );
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          className="p-0 h-auto"
          // onClick={() => navigate("/dashboard/create-assignment")}
        >
          <ChevronRight className="h-4 w-4 rotate-180" />
          Back
        </Button>
        <div className="h-1 w-1 rounded-full bg-muted-foreground" />
        <span className="text-muted-foreground">Generate Content</span>
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">{formData?.title}</h1>
        <p className="text-muted-foreground">{formData?.topic}</p>
      </div>

      {/* {isGenerating ? (
        <Card className="flex items-center justify-center py-12">
          <CardContent className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <h3 className="text-xl font-medium">Generating Content</h3>
            <p className="text-muted-foreground mt-2">
              Our AI is creating your{" "}
              {payload?.title.toLowerCase() || "assignment"} content...
            </p>
          </CardContent>
        </Card>
      ) : ( */}
      <div className="space-y-6">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList>
            {outputs.includes("questions") && (
              <TabsTrigger value="questions">Questions</TabsTrigger>
            )}
            {outputs.includes("instructions") && (
              <TabsTrigger value="instructions">Instructions</TabsTrigger>
            )}
            {outputs.includes("rubric") && (
              <TabsTrigger value="rubric">Rubric</TabsTrigger>
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
              <TabsTrigger value="peer_evaluation">Peer Evaluation</TabsTrigger>
            )}
            {outputs.includes("answer_key") && (
              <TabsTrigger value="answer_key">Answer Key</TabsTrigger>
            )}
          </TabsList>

          {outputs.includes("questions") && (
            <TabsContent value="questions" className="space-y-4">
              {renderQuestionForm()}
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <div key={question._id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">
                          Question {index + 1} ({question.points} points)
                        </h4>
                        <p className="mt-2">{question.questionText}</p>
                        {question.options && question.options.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {question.options.map((option, i) => (
                              <div
                                key={i}
                                className="flex items-center space-x-2"
                              >
                                <span className="font-medium">
                                  {String.fromCharCode(97 + i)}.
                                </span>
                                <span>{option}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500"
                        onClick={() => handleDeleteQuestion(question._id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          )}
          {outputs.includes("instructions") && (
            <TabsContent value="instructions" className="space-y-4">
              {renderInstructionForm()}
              <div className="space-y-4">
                {instructions.map((section) => (
                  <div key={section._id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{section.title}</h4>
                        <p className="mt-2">{section.content}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          )}

          {outputs.includes("rubric") && (
            <TabsContent value="rubric" className="space-y-4">
              {renderRubricForm()}
              <div className="space-y-4">
                {rubric.map((item) => (
                  <div key={item._id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">
                          {item.criterion} ({item.points} points)
                        </h4>
                        <p className="mt-2">{item.description}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          )}

          {outputs.includes("answer_key") && (
            <TabsContent value="answer_key" className="space-y-4">
              <div className="space-y-4">
                {answerKey.map((item) => (
                  <div key={item._id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">
                          Answer for Question {index + 1}
                        </h4>
                        <p className="mt-2">{item.key}</p>
                        {item.value && (
                          <div className="mt-2">
                            <p className="font-medium">Value:</p>
                            <p>{item.value}</p>
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          )}

          {outputs.includes("checklist") && (
            <TabsContent value="checklist" className="space-y-4">
              {renderContent(data?.checklist)}
            </TabsContent>
          )}

          {outputs.includes("participation_criteria") && (
            <TabsContent value="participation_criteria" className="space-y-4">
              {renderContent(data?.participation_criteria)}
            </TabsContent>
          )}

          {outputs.includes("peer_evaluation") && (
            <TabsContent value="peer_evaluation" className="space-y-4">
              {renderContent(data?.peer_evaluation)}
            </TabsContent>
          )}
        </Tabs>

        <div className="flex justify-end">
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </div>
    </div>
  );
};

export default Generate;
