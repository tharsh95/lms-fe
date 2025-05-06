import { useState, useEffect } from "react";
import {
  Loader2,
  Sparkles,
  RefreshCw,
  Download,
  Check,
  Edit2,
  Upload,
  FileText,
  X,
  Save,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

import { SyllabusPreview } from "./SyllabusPreview";
import { coursesApi } from "@/services/courses";
import { mapCourse, mapSyllabus } from "@/utils/map";
import jsPDF from "jspdf";
import { useNavigate } from "react-router-dom";
interface SyllabusCreatorProps {
  courseDetails: {
    courseName: string;
    description: string;
    subject: string;
    grade: string;
  };
  onComplete: () => void;
  isCreating: boolean;
  setIsCreating: (isCreating: boolean) => void;
}

export function SyllabusCreator({
  courseDetails,
  isCreating,
  setIsCreating,
}: SyllabusCreatorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [syllabusData, setSyllabusData] = useState<{
    courseTitle: string;
    instructor: string;
    term: string;
    courseDescription: string;
    learningObjectives: string[];
    requiredMaterials: Array<{
      title: string;
      author: string;
      publisher: string;
      year: string;
      required: boolean;
    }>;
    gradingPolicy: Record<
      string,
      {
        percentage: number;
        description: string;
      }
    >;
    weeklySchedule: Array<{
      week: number;
      topic: string;
      readings: string;
      assignments: string;
    }>;
    policies: Record<string, string>;
  } | null>(null);
  const [courseData, setCourseData] = useState<{
    courseTitle: string;
    instructor: string;
    term: string;
    courseDescription: string;
    learningObjectives: string[];
    requiredMaterials: Array<{
      title: string;
      author: string;
      publisher: string;
      year: string;
      required: boolean;
    }>;
    gradingPolicy: Record<
      string,
      {
        percentage: number;
        description: string;
      }
    >;
    weeklySchedule: Array<{
      week: number;
      topic: string;
      readings: string;
      assignments: string;
    }>;
    policies: Record<string, string>;
  } | null>(null);
  const [prompt, setPrompt] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [activeTab2, setActiveTab2] = useState("upload");
  const navigate = useNavigate();
  // Generate default prompt based on course details
  useEffect(() => {
    const defaultPrompt = `Create a comprehensive syllabus for a ${courseDetails.grade} level ${courseDetails.subject} course titled "${courseDetails.courseName}". The course is described as: ${courseDetails.description}`;
    setPrompt(defaultPrompt);
  }, [courseDetails]);
  // Mock function to simulate AI generation
  const generateSyllabus = async () => {
    setIsGenerating(true);

    const body = {
      prompt: prompt,
      additionalInfo: additionalInfo,
      courseDetails: courseDetails,
    };
    const { data } = await coursesApi.createSyllabuswithAI(body);
    setCourseData(data);
    const syllabus = mapSyllabus(data);

    setSyllabusData(syllabus);
    setIsGenerating(false);
    setActiveTab2("edit");
  };
  const handleCreateCourse = async () => {
    try {
      setIsCreating(true);
      const course = mapSyllabus(courseData);
      await coursesApi.createCourse({
        title: course.courseTitle,
        description: course.courseDescription,
        topic: courseDetails.subject,
        level: courseDetails.grade,
      });
      setIsCreating(false);
      navigate("/dashboard/courses");
    } catch (error) {
      console.error("Error creating course:", error);
      setIsCreating(false);
    } finally {
      setIsCreating(false);
    }
  };
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };
  const handleUpload = async () => {
    if (!uploadedFile) return;

    setIsGenerating(true);
    const formData = new FormData();
    formData.append("syllabus", uploadedFile);
    formData.append("details", JSON.stringify(courseDetails));

    try {
      const { data } = await coursesApi.createSyllabusWithPdf(formData);
      setCourseData(data);
      const syllabus = mapSyllabus(data);
      setSyllabusData(syllabus);

      setActiveTab2("edit");
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!syllabusData) return;

    const doc = new jsPDF();
    let y = 20;
    const lineHeight = 7;
    const margin = 20;
    const pageWidth = doc.internal.pageSize.width;

    // Title
    doc.setFontSize(20);
    doc.text(syllabusData.courseTitle || "Course Syllabus", margin, y);
    y += lineHeight * 2;

    // Basic Information
    doc.setFontSize(14);
    doc.text("Course Information", margin, y);
    y += lineHeight;
    doc.setFontSize(12);
    doc.text(`Instructor: ${syllabusData.instructor || ""}`, margin, y);
    y += lineHeight;
    doc.text(`Term: ${syllabusData.term || ""}`, margin, y);
    y += lineHeight;

    // Course Description
    const descriptionLines = doc.splitTextToSize(
      `Description: ${syllabusData.courseDescription || ""}`,
      pageWidth - margin * 2
    );
    doc.text(descriptionLines, margin, y);
    y += lineHeight * descriptionLines.length + lineHeight;

    // Learning Objectives
    doc.setFontSize(14);
    doc.text("Learning Objectives", margin, y);
    y += lineHeight;
    doc.setFontSize(12);
    syllabusData.learningObjectives.forEach((objective: string) => {
      const objLines = doc.splitTextToSize(
        `• ${objective}`,
        pageWidth - margin * 2
      );
      doc.text(objLines, margin, y);
      y += lineHeight * objLines.length;
    });
    y += lineHeight;

    // Required Materials
    doc.setFontSize(14);
    doc.text("Required Materials", margin, y);
    y += lineHeight;
    doc.setFontSize(12);
    syllabusData.requiredMaterials.forEach(
      (material: {
        title: string;
        author: string;
        publisher: string;
        year: string;
        required: boolean;
      }) => {
        const materialText = `${material.title} by ${material.author} (${
          material.publisher
        }, ${material.year}) - ${material.required ? "Required" : "Optional"}`;
        const materialLines = doc.splitTextToSize(
          materialText,
          pageWidth - margin * 2
        );
        doc.text(materialLines, margin, y);
        y += lineHeight * materialLines.length;
      }
    );
    y += lineHeight;

    // Grading Policy
    doc.setFontSize(14);
    doc.text("Grading Policy", margin, y);
    y += lineHeight;
    doc.setFontSize(12);
    Object.entries(syllabusData.gradingPolicy).forEach(
      ([key, value]: [string, { percentage: number; description: string }]) => {
        const policyText = `${key.charAt(0).toUpperCase() + key.slice(1)}: ${
          value.percentage
        }% - ${value.description}`;
        const policyLines = doc.splitTextToSize(
          policyText,
          pageWidth - margin * 2
        );
        doc.text(policyLines, margin, y);
        y += lineHeight * policyLines.length;
      }
    );
    y += lineHeight;

    // Weekly Schedule
    doc.setFontSize(14);
    doc.text("Weekly Schedule", margin, y);
    y += lineHeight;
    doc.setFontSize(12);
    syllabusData.weeklySchedule.forEach(
      (week: {
        week: number;
        topic: string;
        readings: string;
        assignments: string;
      }) => {
        if (y > doc.internal.pageSize.height - margin) {
          doc.addPage();
          y = margin;
        }
        const weekText = `Week ${week.week}: ${week.topic}`;
        doc.text(weekText, margin, y);
        y += lineHeight;
        const readingsText = `Readings: ${week.readings}`;
        doc.text(readingsText, margin, y);
        y += lineHeight;
        const assignmentsText = `Assignments: ${week.assignments}`;
        doc.text(assignmentsText, margin, y);
        y += lineHeight * 2;
      }
    );

    // Course Policies
    doc.setFontSize(14);
    doc.text("Course Policies", margin, y);
    y += lineHeight;
    doc.setFontSize(12);
    Object.entries(syllabusData.policies).forEach(
      ([key, value]: [string, string]) => {
        if (y > doc.internal.pageSize.height - margin) {
          doc.addPage();
          y = margin;
        }
        const policyTitle =
          key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1");
        doc.text(policyTitle, margin, y);
        y += lineHeight;
        const policyLines = doc.splitTextToSize(value, pageWidth - margin * 2);
        doc.text(policyLines, margin, y);
        y += lineHeight * policyLines.length + lineHeight;
      }
    );

    // Save the PDF
    doc.save(`${syllabusData.courseTitle || "syllabus"}.pdf`);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab2} onValueChange={setActiveTab2}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload">Upload Syllabus</TabsTrigger>
          <TabsTrigger value="generate">Generate with AI</TabsTrigger>
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="mr-2 h-5 w-5 text-primary" />
                Upload Your Syllabus
              </CardTitle>
              <CardDescription>
                Upload your existing syllabus file (PDF)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="syllabus">Syllabus File</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="syllabus"
                    type="file"
                    accept=".pdf,.docx,.txt"
                    className="cursor-pointer"
                    onChange={handleFileUpload}
                  />
                  <Button variant="outline" size="icon">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {uploadedFile && (
                <div className="rounded-lg border border-dashed p-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{uploadedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(uploadedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setUploadedFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setActiveTab2("generate")}
              >
                Try AI Generation Instead
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!uploadedFile || isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Syllabus
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="generate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="mr-2 h-5 w-5 text-primary" />
                AI-Assisted Syllabus Generation
              </CardTitle>
              <CardDescription>
                Let our AI help you create a comprehensive syllabus based on
                your course details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="prompt">Generation Prompt</Label>
                <Textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[120px] mt-2"
                  placeholder="Create a syllabus for..."
                />
                <p className="text-sm text-muted-foreground mt-2">
                  This prompt will guide the AI in generating your syllabus.
                  Feel free to modify it.
                </p>
              </div>

              <div>
                <Label htmlFor="additionalInfo">
                  Additional Information (Optional)
                </Label>
                <Textarea
                  id="additionalInfo"
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  className="min-h-[100px] mt-2"
                  placeholder="Specific textbooks, grading policies, or other details you'd like to include..."
                />
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">
                  Course Details (from previous step)
                </h4>
                <ul className="space-y-1 text-sm">
                  <li>
                    <span className="font-medium">Course Name:</span>{" "}
                    {courseDetails.courseName}
                  </li>
                  <li>
                    <span className="font-medium">Subject:</span>{" "}
                    {courseDetails.subject}
                  </li>
                  <li>
                    <span className="font-medium">Grade Level:</span>{" "}
                    {courseDetails.grade}
                  </li>
                  <li>
                    <span className="font-medium">Description:</span>{" "}
                    {courseDetails.description}
                  </li>
                </ul>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab2("upload")}>
                Back to Details
              </Button>
              <Button onClick={generateSyllabus} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Syllabus
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="edit" className="space-y-6">
          {syllabusData && (
            <Card>
              <CardHeader>
                <CardTitle>Edit Your Syllabus</CardTitle>
                <CardDescription>
                  Review and customize the AI-generated syllabus to fit your
                  needs.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion
                  type="multiple"
                  defaultValue={["basic-info", "objectives"]}
                >
                  <AccordionItem value="basic-info">
                    <AccordionTrigger>Basic Information</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="courseTitle">Course Title</Label>
                          <Input
                            id="courseTitle"
                            value={syllabusData.courseTitle}
                            onChange={(e) =>
                              setSyllabusData({
                                ...syllabusData,
                                courseTitle: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="instructor">Instructor Name</Label>
                          <Input
                            id="instructor"
                            value={syllabusData.instructor}
                            onChange={(e) =>
                              setSyllabusData({
                                ...syllabusData,
                                instructor: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="term">Term</Label>
                          <Input
                            id="term"
                            value={syllabusData.term}
                            onChange={(e) =>
                              setSyllabusData({
                                ...syllabusData,
                                term: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="courseDescription">
                            Course Description
                          </Label>
                          <Textarea
                            id="courseDescription"
                            value={syllabusData.courseDescription}
                            onChange={(e) =>
                              setSyllabusData({
                                ...syllabusData,
                                courseDescription: e.target.value,
                              })
                            }
                            className="min-h-[100px]"
                          />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="objectives">
                    <AccordionTrigger>Learning Objectives</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        {syllabusData.learningObjectives.map(
                          (objective: string, index: number) => (
                            <div key={index} className="flex items-start gap-2">
                              <Input
                                value={objective}
                                onChange={(e) => {
                                  const newObjectives = [
                                    ...syllabusData.learningObjectives,
                                  ];
                                  newObjectives[index] = e.target.value;
                                  setSyllabusData({
                                    ...syllabusData,
                                    learningObjectives: newObjectives,
                                  });
                                }}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  const newObjectives =
                                    syllabusData.learningObjectives.filter(
                                      (_, i: number) => i !== index
                                    );
                                  setSyllabusData({
                                    ...syllabusData,
                                    learningObjectives: newObjectives,
                                  });
                                }}
                              >
                                ✕
                              </Button>
                            </div>
                          )
                        )}
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSyllabusData({
                              ...syllabusData,
                              learningObjectives: [
                                ...syllabusData.learningObjectives,
                                "New learning objective",
                              ],
                            });
                          }}
                        >
                          Add Objective
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="materials">
                    <AccordionTrigger>Required Materials</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        {syllabusData.requiredMaterials.map(
                          (
                            material: {
                              title: string;
                              author: string;
                              publisher: string;
                              year: string;
                              required: boolean;
                            },
                            index: number
                          ) => (
                            <div key={index} className="border p-3 rounded-md">
                              <div className="flex justify-between items-center mb-2">
                                <h4 className="font-medium">
                                  Material {index + 1}
                                </h4>
                                <Badge
                                  variant={
                                    material.required ? "default" : "outline"
                                  }
                                >
                                  {material.required ? "Required" : "Optional"}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <Label htmlFor={`material-title-${index}`}>
                                    Title
                                  </Label>
                                  <Input
                                    id={`material-title-${index}`}
                                    value={material.title}
                                    onChange={(e) => {
                                      const newMaterials = [
                                        ...syllabusData.requiredMaterials,
                                      ];
                                      newMaterials[index] = {
                                        ...material,
                                        title: e.target.value,
                                      };
                                      setSyllabusData({
                                        ...syllabusData,
                                        requiredMaterials: newMaterials,
                                      });
                                    }}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`material-author-${index}`}>
                                    Author
                                  </Label>
                                  <Input
                                    id={`material-author-${index}`}
                                    value={material.author}
                                    onChange={(e) => {
                                      const newMaterials = [
                                        ...syllabusData.requiredMaterials,
                                      ];
                                      newMaterials[index] = {
                                        ...material,
                                        author: e.target.value,
                                      };
                                      setSyllabusData({
                                        ...syllabusData,
                                        requiredMaterials: newMaterials,
                                      });
                                    }}
                                  />
                                </div>
                                <div>
                                  <Label
                                    htmlFor={`material-publisher-${index}`}
                                  >
                                    Publisher
                                  </Label>
                                  <Input
                                    id={`material-publisher-${index}`}
                                    value={material.publisher}
                                    onChange={(e) => {
                                      const newMaterials = [
                                        ...syllabusData.requiredMaterials,
                                      ];
                                      newMaterials[index] = {
                                        ...material,
                                        publisher: e.target.value,
                                      };
                                      setSyllabusData({
                                        ...syllabusData,
                                        requiredMaterials: newMaterials,
                                      });
                                    }}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`material-year-${index}`}>
                                    Year
                                  </Label>
                                  <Input
                                    id={`material-year-${index}`}
                                    value={material.year}
                                    onChange={(e) => {
                                      const newMaterials = [
                                        ...syllabusData.requiredMaterials,
                                      ];
                                      newMaterials[index] = {
                                        ...material,
                                        year: e.target.value,
                                      };
                                      setSyllabusData({
                                        ...syllabusData,
                                        requiredMaterials: newMaterials,
                                      });
                                    }}
                                  />
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 mt-3">
                                <Switch
                                  id={`required-${index}`}
                                  checked={material.required}
                                  onCheckedChange={(checked) => {
                                    const newMaterials = [
                                      ...syllabusData.requiredMaterials,
                                    ];
                                    newMaterials[index] = {
                                      ...material,
                                      required: checked,
                                    };
                                    setSyllabusData({
                                      ...syllabusData,
                                      requiredMaterials: newMaterials,
                                    });
                                  }}
                                />
                                <Label htmlFor={`required-${index}`}>
                                  Required
                                </Label>
                              </div>
                            </div>
                          )
                        )}
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSyllabusData({
                              ...syllabusData,
                              requiredMaterials: [
                                ...syllabusData.requiredMaterials,
                                {
                                  title: "New Material",
                                  author: "",
                                  publisher: "",
                                  year: "",
                                  required: true,
                                },
                              ],
                            });
                          }}
                        >
                          Add Material
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="grading">
                    <AccordionTrigger>Grading Policy</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        {Object.entries(syllabusData.gradingPolicy).map(
                          ([key, value]: [
                            string,
                            { percentage: number; description: string }
                          ]) => (
                            <div
                              key={key}
                              className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end"
                            >
                              <div>
                                <Label htmlFor={`grading-${key}`}>
                                  {key.charAt(0).toUpperCase() + key.slice(1)}
                                </Label>
                                <Input
                                  id={`grading-${key}`}
                                  value={value.description}
                                  onChange={(e) => {
                                    const newGradingPolicy = {
                                      ...syllabusData.gradingPolicy,
                                    };
                                    newGradingPolicy[key] = {
                                      ...value,
                                      description: e.target.value,
                                    };
                                    setSyllabusData({
                                      ...syllabusData,
                                      gradingPolicy: newGradingPolicy,
                                    });
                                  }}
                                />
                              </div>
                              <div>
                                <Label htmlFor={`percentage-${key}`}>
                                  Percentage
                                </Label>
                                <div className="flex items-center">
                                  <Input
                                    id={`percentage-${key}`}
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={value.percentage}
                                    onChange={(e) => {
                                      const newGradingPolicy = {
                                        ...syllabusData.gradingPolicy,
                                      };
                                      newGradingPolicy[key] = {
                                        ...value,
                                        percentage: Number.parseInt(
                                          e.target.value
                                        ),
                                      };
                                      setSyllabusData({
                                        ...syllabusData,
                                        gradingPolicy: newGradingPolicy,
                                      });
                                    }}
                                  />
                                  <span className="ml-2">%</span>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  const newGradingPolicy = {
                                    ...syllabusData.gradingPolicy,
                                  };
                                  delete newGradingPolicy[key];
                                  setSyllabusData({
                                    ...syllabusData,
                                    gradingPolicy: newGradingPolicy,
                                  });
                                }}
                              >
                                ✕
                              </Button>
                            </div>
                          )
                        )}
                        <Button
                          variant="outline"
                          onClick={() => {
                            const newKey = `component${
                              Object.keys(syllabusData.gradingPolicy).length + 1
                            }`;
                            const newGradingPolicy = {
                              ...syllabusData.gradingPolicy,
                            };
                            newGradingPolicy[newKey] = {
                              percentage: 0,
                              description: "New component",
                            };
                            setSyllabusData({
                              ...syllabusData,
                              gradingPolicy: newGradingPolicy,
                            });
                          }}
                        >
                          Add Grading Component
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="schedule">
                    <AccordionTrigger>Weekly Schedule</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        {syllabusData.weeklySchedule.map(
                          (
                            week: {
                              week: number;
                              topic: string;
                              readings: string;
                              assignments: string;
                            },
                            index: number
                          ) => (
                            <div key={index} className="border p-3 rounded-md">
                              <h4 className="font-medium mb-2">
                                Week {week.week}
                              </h4>
                              <div className="grid grid-cols-1 gap-3">
                                <div>
                                  <Label htmlFor={`week-topic-${index}`}>
                                    Topic
                                  </Label>
                                  <Input
                                    id={`week-topic-${index}`}
                                    value={week.topic}
                                    onChange={(e) => {
                                      const newSchedule = [
                                        ...syllabusData.weeklySchedule,
                                      ];
                                      newSchedule[index] = {
                                        ...week,
                                        topic: e.target.value,
                                      };
                                      setSyllabusData({
                                        ...syllabusData,
                                        weeklySchedule: newSchedule,
                                      });
                                    }}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`week-readings-${index}`}>
                                    Readings
                                  </Label>
                                  <Input
                                    id={`week-readings-${index}`}
                                    value={week.readings}
                                    onChange={(e) => {
                                      const newSchedule = [
                                        ...syllabusData.weeklySchedule,
                                      ];
                                      newSchedule[index] = {
                                        ...week,
                                        readings: e.target.value,
                                      };
                                      setSyllabusData({
                                        ...syllabusData,
                                        weeklySchedule: newSchedule,
                                      });
                                    }}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`week-assignments-${index}`}>
                                    Assignments
                                  </Label>
                                  <Input
                                    id={`week-assignments-${index}`}
                                    value={week.assignments}
                                    onChange={(e) => {
                                      const newSchedule = [
                                        ...syllabusData.weeklySchedule,
                                      ];
                                      newSchedule[index] = {
                                        ...week,
                                        assignments: e.target.value,
                                      };
                                      setSyllabusData({
                                        ...syllabusData,
                                        weeklySchedule: newSchedule,
                                      });
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          )
                        )}
                        <div className="flex justify-between">
                          <Button
                            variant="outline"
                            onClick={() => {
                              const lastWeek =
                                syllabusData.weeklySchedule[
                                  syllabusData.weeklySchedule.length - 1
                                ];
                              const newWeek = {
                                week: lastWeek.week + 1,
                                topic: "New Topic",
                                readings: "TBD",
                                assignments: "TBD",
                              };
                              setSyllabusData({
                                ...syllabusData,
                                weeklySchedule: [
                                  ...syllabusData.weeklySchedule,
                                  newWeek,
                                ],
                              });
                            }}
                          >
                            Add Week
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              const newSchedule = [
                                ...syllabusData.weeklySchedule,
                              ];
                              newSchedule.pop();
                              setSyllabusData({
                                ...syllabusData,
                                weeklySchedule: newSchedule,
                              });
                            }}
                            disabled={syllabusData.weeklySchedule.length === 0}
                          >
                            Remove Last Week
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="policies">
                    <AccordionTrigger>Course Policies</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        {Object.entries(syllabusData.policies).map(
                          ([key, value]: [string, string]) => (
                            <div key={key}>
                              <Label htmlFor={`policy-${key}`}>
                                {key.charAt(0).toUpperCase() +
                                  key.slice(1).replace(/([A-Z])/g, " $1")}{" "}
                                Policy
                              </Label>
                              <Textarea
                                id={`policy-${key}`}
                                value={value}
                                onChange={(e) => {
                                  const newPolicies = {
                                    ...syllabusData.policies,
                                  };
                                  newPolicies[key] = e.target.value;
                                  setSyllabusData({
                                    ...syllabusData,
                                    policies: newPolicies,
                                  });
                                }}
                                className="min-h-[100px] mt-2"
                              />
                            </div>
                          )
                        )}
                        <Button
                          variant="outline"
                          onClick={() => {
                            const newPolicies = { ...syllabusData.policies };
                            newPolicies.newPolicy =
                              "Enter policy details here.";
                            setSyllabusData({
                              ...syllabusData,
                              policies: newPolicies,
                            });
                          }}
                        >
                          Add Policy
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab2("generate")}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Regenerate
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab2("preview")}
                  >
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const course = mapCourse(syllabusData, courseData);

                      coursesApi.updateCourse({
                        id: course.id,
                        title: courseDetails.courseName,
                        description: courseDetails.description,
                        topic: courseDetails.subject,
                        level: courseDetails.grade,
                      });
                    }}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                </div>
                <Button
                  onClick={() => {
                    setActiveTab2("preview");
                  }}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Continue
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          {syllabusData && (
            <>
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Syllabus Preview</h2>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={handleDownloadPDF}>
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab2("edit")}
                  >
                    <Edit2 className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button onClick={handleCreateCourse} disabled={isCreating}>
                    {isCreating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Course...
                      </>
                    ) : (
                      "Create Course"
                    )}
                  </Button>
                </div>
              </div>

              <Card className="border-2">
                <CardContent className="p-6">
                  <SyllabusPreview 
                    syllabusData={{
                      ...syllabusData,
                      weeklySchedule: syllabusData.weeklySchedule.map(week => ({
                        ...week,
                        week: week.week.toString() // Convert week number to string
                      }))
                    }} 
                  />
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
