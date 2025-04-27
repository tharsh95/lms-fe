import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { Label } from "@radix-ui/react-label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { Badge } from "../../ui/badge";
import { Checkbox } from "../../ui/checkbox";
import { Button } from "../../ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import { ASSIGNMENT_TYPE_INFO, ASSIGNMENT_TYPES } from "@/utils/constants";
import { useAssignment } from "@/context/AssignmentContext";
import { useLocation, useNavigate } from "react-router-dom";

const CreateAssignment = () => {
  const {
    selectedType,
    setSelectedType,
    assignmentTitle,
    setAssignmentTitle,
    grade,
    setGrade,
    subject,
    setSubject,
    difficulty,
    setDifficulty,
    selectedCourse,
    setSelectedCourse,
    description,
    setDescription,
    numberOfQuestions,
    setNumberOfQuestions,
    publishToLMS,
    setPublishToLMS,
    handleDetailsSubmission,
    isGenerating
  } = useAssignment();

  const navigate = useNavigate();
  const location = useLocation();
  console.log(location.pathname, "a");

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
                placeholder={`${typeInfo?.title|| "Assignment"} Title`}
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
                  <SelectItem value="Tourism">Tourism</SelectItem>
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
                      checked={publishToLMS.includes("Canvas")}
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
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full hover:cursor-pointer"
              onClick={async () => {
                await handleDetailsSubmission();
                navigate("/dashboard/generate");
              }}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  Continue to Generation <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  };

  return (
    <div>
      {renderDetailsForm()}
    </div>
  );
};

export default CreateAssignment;
