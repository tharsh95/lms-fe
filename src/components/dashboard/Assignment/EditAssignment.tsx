import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { Loader2, Save, ArrowLeft, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { assignmentApi } from "@/services/api";
import { ASSIGNMENT_TYPES } from "@/utils/constants";
import { Question } from "@/utils/type";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DialogContent } from "@/components/ui/dialog";
import {  LocalQuestion } from "./types";

export default function EditAssignment() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRubricModalOpen, setIsRubricModalOpen] = useState(false);
  const [isInstructionModalOpen, setIsInstructionModalOpen] = useState(false);
  const [newInstruction, setNewInstruction] = useState({
    title: "",
    content: "",
  });
  const [newRubricItem, setNewRubricItem] = useState({
    Criterion: "",
    Points: 5,
    Description: "",
  });
  const [newChecklistItem, setNewChecklistItem] = useState("");
  useEffect(() => {
    getEditAssignment();
  }, [id]);
  const [isSaving, setIsSaving] = useState(false);

  const getEditAssignment = async () => {
    const { data } = await assignmentApi.getEditAssignment(id);

    setAssignment(data);
  };
  const [assignment, setAssignment] = useState({
    _id: "",
    title: "",
    description: "",
    dueDate: "",
    totalPoints: "",
    course: "",
    type: "",
    rubric: [] as {
      _id: string;
      Criterion: string;
      Points: number;
      Description: string;
    }[],
    instructions: [] as {
      _id: string;
      title: string;
      content: string;
    }[],
    publishToLMS: [] as string[],
    questions: [] as Question[],
    answerKey: [] as { _id: string; key: string; value: string }[],
    participationCriteria: [] as {
      _id: string;
      Criterion: string;
      Points: number;
      Description: string;
    }[],
    checklist: [] as { _id: string; item: string; required: boolean }[],
  });

  const [isChecklistModalOpen, setIsChecklistModalOpen] = useState(false);
  const [
    isParticipationCriteriaModalOpen,
    setIsParticipationCriteriaModalOpen,
  ] = useState(false);
  const [newParticipationCriteria, setNewParticipationCriteria] = useState({
    Criterion: "",
    Points: 5,
    Description: "",
  });
  const [questions, setQuestions] = useState<LocalQuestion[]>(
    (assignment?.questions as unknown as LocalQuestion[]) || []
  );
  const [newQuestion, setNewQuestion] = useState({
    _id: "",
    question: "Which sentence is in the present perfect tense?",
    type: assignment?.type,
    points: 5,
    options: [
      "a. She will have finished the project by tomorrow.",
      "b. I have eaten the pizza.",
      "c. He will be eating the pizza tomorrow.",
      "d. She has finished the project.",
    ],
    answer: "",
  });
  const handleAddQuestion = async () => {
    const options: Record<string, string> = {};
    newQuestion.options.forEach((option, i) => {
      const key = String.fromCharCode(97 + i);
      options[key] = option;
    });
    setQuestions([
      ...questions,
      {
        ...newQuestion,
        options,
      },
    ]);
    const questionWithId = {
      ...newQuestion,
      options,
      answer: newQuestion.answer,
      _id: `temp_${Date.now()}_${Math.random()}`,
    };
    setAssignment((prev) => ({
      ...prev,
      questions: [...prev.questions, questionWithId],

    }));

    newQuestion.type = assignment?.type;
    await assignmentApi.createResource(newQuestion, assignment?._id);
    setNewQuestion({
      _id: "",
      question: "",
      type: assignment.type,
      points: 5,
      options: [],
      answer: "",
    });
    setIsModalOpen(false);
    // getEditAssignment();
  };
  const handleAddInstruction = async () => {
    await assignmentApi.addInstruction(newInstruction, assignment?._id);
    setNewInstruction({
      title: "",
      content: "",
    });
    setIsInstructionModalOpen(false);
    getEditAssignment();
  };
  const handleAddRubricItem = async () => {
    if (!newRubricItem.Criterion.trim() || !newRubricItem.Description.trim())
      return;

    const rubricItemToAdd = {
      ...newRubricItem,
      _id: `temp_${Date.now()}_${Math.random()}`,
    };


    setAssignment((prev) => ({
      ...prev,
      rubric: [...prev.rubric, rubricItemToAdd],
    }));
    await assignmentApi.addRubric(rubricItemToAdd, assignment._id);
    setNewRubricItem({
      Criterion: "",
      Points: 5,
      Description: "",
    });
    setIsRubricModalOpen(false);
  };
  const handleAddChecklistItem = async () => {
    if (!newChecklistItem.trim()) return;

    const checklistItemToAdd = {
      _id: `temp_${Date.now()}_${Math.random()}`,
      item: newChecklistItem,
      required: false,
    };

    setAssignment((prev) => ({
      ...prev,
      checklist: [...prev.checklist, checklistItemToAdd],
    }));

    await assignmentApi.addChecklist(checklistItemToAdd, assignment._id);
    getEditAssignment();
    setNewChecklistItem("");
    setIsChecklistModalOpen(false);
  };
  const handleAddParticipationCriteria = async () => {
    if (
      !newParticipationCriteria.Criterion.trim() ||
      !newParticipationCriteria.Description.trim()
    )
      return;

    const criteriaToAdd = {
      ...newParticipationCriteria,
      _id: `temp_${Date.now()}_${Math.random()}`,
    };

    setAssignment((prev) => ({
      ...prev,
      participationCriteria: [...prev.participationCriteria, criteriaToAdd],
    }));

    await assignmentApi.addParticipationCriteria(criteriaToAdd, assignment._id);
    setNewParticipationCriteria({ Criterion: "", Points: 5, Description: "" });
    setIsParticipationCriteriaModalOpen(false);
  };
  const handleSaveDetails = async () => {
    setIsSaving(true);
    try {
      const payload = {
        title: assignment.title,
        description: assignment.description,
        dueDate: assignment.dueDate,
        type: assignment.type,
      };

      await assignmentApi.updateAssignment(assignment._id, payload);

      // Navigate back to the assignment details page
      // navigate(`/dashboard/assignments/${id}`);
    } catch (error) {
      console.error("Error updating assignment:", error);
      // You might want to show an error message to the user here
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/dashboard/assignments/${id}`);
  };

  const handleDeleteQuestion = async (
    id: string,
    assignmentId: string,
    type: string
  ) => {
    await assignmentApi.deleteResource(id, assignmentId, type);
    getEditAssignment();
  };
  const renderChecklistForm = () => {
    return (
      <Dialog
        open={isChecklistModalOpen}
        onOpenChange={setIsChecklistModalOpen}
      >
        <DialogTrigger asChild>
          <Button className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Checklist Item
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Checklist Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder="Enter checklist item"
              value={newChecklistItem}
              onChange={(e) => setNewChecklistItem(e.target.value)}
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleAddChecklistItem}>Add</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  if (!assignment) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 pt-6">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading assignment details...</p>
        </div>
      </div>
    );
  }
  const renderQuestionForm = () => {
    return (
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogTrigger asChild>
          <Button className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add {assignment?.type === "discussion" ? "Topic" : "Question"}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              Add{" "}
              {assignment?.type === "discussion"
                ? "Discussion Topic"
                : assignment?.type === "multiple_choice_quiz"
                ? "Multiple Choice Question"
                : assignment?.type === "short_answer_test"
                ? "Short Answer Question"
                : assignment?.type === "essay"
                ? "Essay Question"
                : assignment?.type === "case_study"
                ? "Case Study Question"
                : "Question"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder={`Enter ${
                assignment?.type === "discussion" ? "topic" : "question"
              } text`}
              value={newQuestion.question}
              onChange={(e) =>
                setNewQuestion((prev) => ({
                  ...prev,
                  question: e.target.value,
                }))
              }
              className="min-h-[100px]"
            />

            {assignment?.type === "multiple_choice_quiz" && (
              <div className="space-y-2">
                {newQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="font-medium"></span>
                    <input
                      type="text"
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) =>
                      setAssignment((prev) => ({
                        ...prev,
                        questions: prev.questions.map((question) =>
                          question._id === newQuestion._id
                            ? { ...question, options: { ...question.options, [String.fromCharCode(97 + index)]: e.target.value } }
                            : question
                        )
                      }))
                      }
                      className="flex-1 p-2 border rounded"
                    />
                  </div>
                ))}
                <div className="mt-4 p-2">
                  <Select
                    value={newQuestion.answer}
                    onValueChange={(value) =>
                      setNewQuestion((prev) => ({ ...prev, answer: value }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Answer" />
                    </SelectTrigger>
                    <SelectContent>
                      {newQuestion.options.map((option, index) => (
                        <SelectItem key={index} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {assignment?.type === "short_answer_test" && (
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
              value={newRubricItem.Criterion}
              onChange={(e) =>
                setNewRubricItem((prev) => ({
                  ...prev,
                  Criterion: e.target.value,
                }))
              }
              className="w-full p-2 border rounded"
            />
            <Textarea
              placeholder="Description"
              value={newRubricItem.Description}
              onChange={(e) =>
                setNewRubricItem((prev) => ({
                  ...prev,
                  Description: e.target.value,
                }))
              }
              className="min-h-[100px]"
            />
            <div className="flex items-center space-x-2">
              <span className="font-medium">Points:</span>
              <input
                type="number"
                min="1"
                value={newRubricItem.Points}
                onChange={(e) =>
                  setNewRubricItem((prev) => ({
                    ...prev,
                    Points: parseInt(e.target.value),
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
  const renderParticipationCriteriaForm = () => {
    return (
      <Dialog
        open={isParticipationCriteriaModalOpen}
        onOpenChange={setIsParticipationCriteriaModalOpen}
      >
        <DialogTrigger asChild>
          <Button className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Participation Criteria
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Participation Criteria</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder="Criterion"
              value={newParticipationCriteria.Criterion}
              onChange={(e) =>
                setNewParticipationCriteria((prev) => ({
                  ...prev,
                  Criterion: e.target.value,
                }))
              }
            />
            <Textarea
              placeholder="Description"
              value={newParticipationCriteria.Description}
              onChange={(e) =>
                setNewParticipationCriteria((prev) => ({
                  ...prev,
                  Description: e.target.value,
                }))
              }
            />
            <div className="flex items-center space-x-2">
              <span className="font-medium">Points:</span>
              <Input
                type="number"
                min="1"
                value={newParticipationCriteria.Points}
                onChange={(e) =>
                  setNewParticipationCriteria((prev) => ({
                    ...prev,
                    Points: parseInt(e.target.value),
                  }))
                }
                className="w-20"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleAddParticipationCriteria}>Add</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center">
          <Button variant="ghost" onClick={handleCancel} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Edit Assignment</h2>
        </div>
        <Badge>
          {(assignment?.type[0]?.toUpperCase() + assignment?.type?.slice(1))
            .split("_")
            .join(" ")}
        </Badge>
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          {assignment?.questions && assignment?.questions.length > 0 && (
            <TabsTrigger value="questions">Questions</TabsTrigger>
          )}
          {assignment?.instructions && assignment?.instructions?.length > 0 && (
            <TabsTrigger value="instructions">Instructions</TabsTrigger>
          )}
          {assignment.rubric && assignment.rubric.length > 0 && (
            <TabsTrigger value="rubric">Rubric</TabsTrigger>
          )}
          {assignment.checklist && assignment.checklist.length > 0 && (
            <TabsTrigger value="checklist">Checklist</TabsTrigger>
          )}
          {assignment.participationCriteria &&
            assignment.participationCriteria.length > 0 && (
              <TabsTrigger value="participationCriteria">
                Participation Criteria
              </TabsTrigger>
            )}
          {assignment.answerKey && assignment.answerKey.length > 0 && (
            <TabsTrigger value="answer_key">Answer Key</TabsTrigger>
          )}
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Edit the basic details of your assignment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="assignment-title">Assignment Title</Label>
                <Input
                  id="assignment-title"
                  value={assignment.title}
                  onChange={(e) =>
                    setAssignment({ ...assignment, title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={assignment.description}
                  onChange={(e) =>
                    setAssignment({
                      ...assignment,
                      description: e.target.value,
                    })
                  }
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="due-date">Due Date</Label>
                  <div className="flex">
                    <Input
                      id="due-date"
                      type="date"
                      value={assignment.dueDate}
                      onChange={(e) =>
                        setAssignment({
                          ...assignment,
                          dueDate: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="points">Total Points</Label>
                  <Input
                    id="points"
                    type="number"
                    disabled={true}
                    defaultValue={assignment?.questions?.reduce(
                      (acc: number, question: Question) =>
                        acc + (question.points || 0),
                      0
                    )}
                    // onChange={(e) =>
                    //   setAssignment({
                    //     ...assignment,
                    //     totalPoints: Number.parseInt(e.target.value),
                    //   })
                    // }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignment-type">Assignment Type</Label>
                <Select
                  value={assignment.type}
                  onValueChange={(value) =>
                    setAssignment({ ...assignment, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignment type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ASSIGNMENT_TYPES).map(([key, value]) => (
                      <SelectItem key={value} value={value} disabled={true}>
                        {key
                          .replace(/_/g, " ")
                          .toLowerCase()
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex justify-end space-x-2">
                <Button onClick={handleSaveDetails} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        {assignment?.questions && assignment?.questions.length > 0 && (
          <TabsContent value="questions" className="space-y-4">
            {renderQuestionForm()}
            <div className="space-y-4">
              {assignment?.questions?.map((question, index) => (
                <div key={question._id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">
                        Question {index + 1} ({question.points} points)
                      </h4>
                      <p className="mt-2">{question.question}</p>
                      {Array.isArray(question.options) &&
                        question.options.length > 0 && (
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
                      onClick={() =>
                        handleDeleteQuestion(
                          question._id,
                          assignment._id,
                          "questions"
                        )
                      }
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        )}
        {assignment?.answerKey && assignment?.answerKey.length > 0 && (
          <TabsContent value="answer_key" className="space-y-4">
            <div className="space-y-4">
              {assignment?.answerKey?.map((item, index) => (
                <div key={item._id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">
                        Answer for Question {index + 1}
                      </h4>
                      {/* <p className="mt-2">{item.key}</p> */}
                      {item.value && (
                        <div className="mt-2">
                          <p>{`${item.value}`}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        )}
        {assignment?.instructions && assignment?.instructions.length > 0 && (
          <TabsContent value="instructions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Instructions</CardTitle>
                <CardDescription>
                  Review and edit your assignment instructions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderInstructionForm()}
                <div className="space-y-4">
                  {assignment?.instructions?.map((section) => (
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
                          onClick={() =>
                            handleDeleteQuestion(
                              section._id,
                              assignment._id,
                              "instructions"
                            )
                          }
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
        {assignment?.rubric && assignment?.rubric.length > 0 && (
          <TabsContent value="rubric" className="space-y-4">
            {renderRubricForm()}
            <div className="space-y-4">
              {assignment?.rubric?.map((item) => (
                <div key={item._id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">
                        {item.Criterion} ({item.Points} points)
                      </h4>
                      <p className="mt-2">{item.Description}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500"
                      onClick={() =>
                        handleDeleteQuestion(
                          item._id,
                          assignment._id,
                          "rubric"
                        )
                      }
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        )}
        {assignment.participationCriteria &&
          assignment.participationCriteria.length > 0 && (
            <TabsContent value="participationCriteria" className="space-y-4">
              <div className="space-y-4">
                {renderParticipationCriteriaForm()}
                {assignment?.participationCriteria?.map((item) => (
                  <div key={item._id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">
                          {item.Criterion} ({item.Points} points)
                        </h4>
                        <p className="mt-2">{item.Description}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500"
                        onClick={() => handleDeleteQuestion(item._id,assignment._id,"participationCriteria")}

                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>{" "}
            </TabsContent>
          )}
        {assignment.checklist && assignment.checklist.length > 0 && (
          <TabsContent value="checklist" className="space-y-4">
            {renderChecklistForm()}
            <div className="space-y-4">
              {assignment?.checklist?.map((item) => (
                <div key={item._id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{item.item}</h4>
                    </div>
                    <Button variant="ghost" size="sm" className="text-red-500"
                      onClick={() =>
                        handleDeleteQuestion(
                          item._id,
                          assignment._id,
                          "checklist"
                        )
                      }
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        )}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Assignment Settings</CardTitle>
              <CardDescription>
                Configure additional settings for this assignment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>LMS Integration</Label>
                <div className="space-y-3 rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="canvas"
                        // checked={assignment.publishToLMS.includes("Canvas")}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setAssignment({
                              ...assignment,
                              publishToLMS: [
                                ...assignment.publishToLMS,
                                "Canvas",
                              ],
                            });
                          } else {
                            setAssignment({
                              ...assignment,
                              publishToLMS: assignment.publishToLMS.filter(
                                (lms) => lms !== "Canvas"
                              ),
                            });
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

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="google-classroom"
                        // checked={assignment.publishToLMS.includes("Google Classroom")}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setAssignment({
                              ...assignment,
                              publishToLMS: [
                                ...assignment.publishToLMS,
                                "Google Classroom",
                              ],
                            });
                          } else {
                            setAssignment({
                              ...assignment,
                              publishToLMS: assignment.publishToLMS.filter(
                                (lms) => lms !== "Google Classroom"
                              ),
                            });
                          }
                        }}
                      />
                      <Label
                        htmlFor="google-classroom"
                        className="text-sm font-normal"
                      >
                        Publish to Google Classroom
                      </Label>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => navigate("/dashboard/integrations")}
                    >
                      Connect
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Advanced Settings</Label>
                <div className="space-y-3 rounded-md border p-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="plagiarism-check" defaultChecked />
                    <Label
                      htmlFor="plagiarism-check"
                      className="text-sm font-normal"
                    >
                      Enable plagiarism detection
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="ai-grading" defaultChecked />
                    <Label htmlFor="ai-grading" className="text-sm font-normal">
                      Enable AI-assisted grading
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="late-submissions" />
                    <Label
                      htmlFor="late-submissions"
                      className="text-sm font-normal"
                    >
                      Allow late submissions
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
