"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Download, Eye, Edit } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { FileUpload } from "../../FileUpload";
import { useEffect, useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { assignmentApi } from "@/services/api";
import { jsPDF } from "jspdf";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { ASSIGNMENT_TYPES } from "@/utils/constants";
import { Assignment } from "@/context/AssignmentContext";

interface Answer {
  questionId: string;
  key: string;
  value: string;
}

export default function AssignmentDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [data, setData] = useState<Assignment | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [showAnswersDialog, setShowAnswersDialog] = useState(false);

  const fetchAssignment = useCallback(async () => {
    const { data } = await assignmentApi.getAssignmentById(id);
    setData(data);
  }, [id]);

  useEffect(() => {
    fetchAssignment();
  }, [fetchAssignment]);

  const totalPoints = data?.questions?.reduce(
    (acc: number, question: { points: number }) => acc + question.points,
    0
  );
  // Mock data for the assignment
  const assignment = {
    id: id,
    title: data?.title,
    description: data?.description,
    dueDate: data?.createdAt,
    totalPoints,
    submissions: [],
  };
  const fetchAnswers = useCallback(async () => {
    const { data } = await assignmentApi.getAssignmentAnswers(id);
    setAnswers(data?.answerKey || []);
    setShowAnswersDialog(true);
  }, [id]);

  const handleUploadComplete = (files: File[], images: string[]) => {
    console.log("Files uploaded:", files);
    console.log("Images captured:", images);
    // Here you would typically process the files/images and send them to your backend
  };

  const handleEditAssignment = () => {
    // Navigate to the edit assignment page with the current assignment data
    navigate(`/dashboard/assignments/${id}/edit`);
  };

  const handleDownload = () => {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(20);
    doc.text(data?.title || "Assignment", 20, 20);

    // Add description
    doc.setFontSize(12);
    doc.text("Description:", 20, 35);
    const descriptionLines = doc.splitTextToSize(data?.description || "", 170);
    doc.text(descriptionLines, 20, 45);

    let yPosition = 60;

    // Add questions
    data?.questions?.forEach((question: any, index: number) => {
      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      // Question number and text
      doc.setFontSize(14);
      doc.text(`Question ${index + 1}`, 20, yPosition);
      yPosition += 10;

      doc.setFontSize(12);
      const questionLines = doc.splitTextToSize(question.questionText, 170);
      doc.text(questionLines, 20, yPosition);
      yPosition += questionLines.length * 7 + 5;

      // Options
      doc.text("Options:", 20, yPosition);
      yPosition += 10;

      Object.entries(question.options).forEach(([key, value]) => {
        const optionText = `${String.fromCharCode(
          65 + parseInt(key)
        )}) ${value}`;
        doc.text(optionText, 30, yPosition);
        yPosition += 7;
      });

      // Points
      doc.text(`Points: ${question.points}`, 20, yPosition);
      yPosition += 15;
    });

    // Save the PDF
    doc.save(`${data?.title || "assignment"}.pdf`);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {assignment.title}
          </h1>
          <p className="text-muted-foreground">
            Due: {new Date(assignment.dueDate).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <FileUpload
            trigger={<Button>Submit Assignment</Button>}
            title="Submit Assignment"
            description="Upload your completed assignment. You can upload files or take photos."
            onUploadComplete={handleUploadComplete}
          />
          <Button variant="outline" onClick={handleEditAssignment}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Assignment
          </Button>
          <Button
            variant="outline"
            onClick={handleDownload}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download Assignment
          </Button>
          <Button
            variant="outline"
            onClick={fetchAnswers}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            View Answers
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assignment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{assignment.description}</p>
          <p className="mt-2">
            <strong>Total Points:</strong> {assignment.totalPoints}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Questions</CardTitle>
          <CardDescription>
            {data?.questions?.length} Questions{" "}
          </CardDescription>
        </CardHeader>
        <CardHeader>
          <CardTitle>Points</CardTitle>
          <CardDescription>
            {data?.questions?.reduce(
              (acc: number, question: { points: number }) =>
                acc + question.points,
              0
            )}{" "}
            Points{" "}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {data?.questions?.map(
              (
                question: {
                  questionText: string;
                  type: string;
                  points: number;
                  options: any[];
                  _id: string;
                },
                index: number
              ) => (
                <div key={question._id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-medium">
                      Question {index + 1}
                    </h3>
                    <Badge variant="outline">{question.points} points</Badge>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    {question.questionText}
                  </p>

                  {/* Multiple Choice Questions */}
                  {question.type === ASSIGNMENT_TYPES.MULTIPLE_CHOICE &&
                    question.options && (
                      <div className="space-y-2">
                        {Object.entries(question.options).map(
                          ([key, value]) => (
                            <div
                              key={key}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={`question-${index}-option-${key}`}
                              />
                              <label
                                htmlFor={`question-${index}-option-${key}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {String.fromCharCode(65 + parseInt(key))}){" "}
                                {value}
                              </label>
                            </div>
                          )
                        )}
                      </div>
                    )}

                  {question.type === ASSIGNMENT_TYPES.SHORT_ANSWER && (
                    <Textarea
                      placeholder="Enter your answer here..."
                      className="min-h-[100px]"
                    />
                  )}
                  {(() => {
                    console.log(question.type, ASSIGNMENT_TYPES.SHORT_ANSWER);
                    return null;
                  })()}

                  {/* Essay Questions */}
                  {question.type === ASSIGNMENT_TYPES.ESSAY && (
                    <Textarea
                      placeholder="Enter your essay here..."
                      className="min-h-[200px]"
                    />
                  )}

                  <Badge className="mt-4">
                    {question.type
                      .split("_")
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1)
                      )
                      .join(" ")}
                  </Badge>
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>
      <Dialog open={showAnswersDialog} onOpenChange={setShowAnswersDialog}>
        <DialogContent className="max-w-2xl overflow-y-auto max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Correct Answers</DialogTitle>
            <DialogDescription>
              Here are all the correct answers for this assignment
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {data?.questions?.map((question, index) => {
              const answer = answers?.find(
                (ans) =>
                  ans.questionId === (index + 1).toString() ||
                  ans.questionId === question._id
              );
              return (
                <div key={question._id} className="p-4 border rounded-lg">
                  <h3 className="text-lg font-medium mb-2">
                    Question {index + 1}
                  </h3>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Correct Option:</span>
                      <span className="text-green-600">
                        {answer
                          ? `${answer.key.toUpperCase()}) ${answer.value}`
                          : "No answer found"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
