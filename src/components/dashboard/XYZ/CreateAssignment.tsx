import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../ui/form";
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
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";
import { assignmentApi } from "@/services/api";

const formSchema = z.object({
  type: z.string().min(1, {
    message: "Please select a type.",
  }),
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  subject: z.string().min(1, {
    message: "Please select a subject.",
  }),
  course: z.string().min(0, {
    message: "Please select a course.",
  }),
  grade: z.string().min(0, {
    message: "Please select a grade level.",
  }),
  difficulty: z.string().min(1, {
    message: "Please select a difficulty level.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  numberOfQuestions: z.number().optional(),
  publishToLMS: z.array(z.string()),
});

type FormData = z.infer<typeof formSchema>;

interface Option {
  id: string;
  name: string;
  subjectId?: string;
  gradeId?: string;
  subjects?: string[];
}

interface CourseData {
  subject: string;
  grade: string;
  name: string;
}

const CreateAssignment = () => {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [subjects, setSubjects] = useState<Option[]>([]);
  const [grades, setGrades] = useState<Option[]>([]);
  const [courses, setCourses] = useState<Option[]>([]);
  const [filteredGrades, setFilteredGrades] = useState<Option[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Option[]>([]);

  const fetchOptions = async () => {
    try {
      const response = await assignmentApi.getOptions();
      // console.log('Raw API Response:', response);
      
      if (response && response.success && Array.isArray(response.data)) {
        // Transform the data into our required format
        const uniqueSubjects = Array.from(new Set(response.data.map((item: CourseData) => item.subject)))
          .map(subject => ({ id: subject, name: subject } as Option));
        
        // Create grades with their corresponding subjects
        const uniqueGrades = Array.from(new Set(response.data.map((item: CourseData) => item.grade)))
          .map(grade => {
            // Find all subjects that have this grade
            const subjectsWithGrade = response.data
              .filter((item: CourseData) => item.grade === grade)
              .map(item => item.subject);
            return {
              id: grade,
              name: grade,
              subjects: subjectsWithGrade
            } as Option;
          });
        
        const courses = response.data.map((course: CourseData) => ({
          id: course.name,
          name: course.name,
          subjectId: course.subject,
          gradeId: course.grade
        } as Option));

        // console.log('Transformed data:', { uniqueSubjects, uniqueGrades, courses });
        
        setSubjects(uniqueSubjects);
        setGrades(uniqueGrades);
        setCourses(courses);
      } else {
        console.error('Invalid API response structure:', response);
        setSubjects([]);
        setGrades([]);
        setCourses([]);
      }
    } catch (error) {
      console.error("Error fetching options:", error);
      setSubjects([]);
      setGrades([]);
      setCourses([]);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "multiple_choice",
      title: "mcq",
      subject: "Physics",
      course: "Refraction Through a Lens",
      grade: "7",
      difficulty: "Hard",
      description: "Refraction Through a Lens",
      numberOfQuestions: 10,
      publishToLMS: [],
    },
  });

  const selectedSubject = form.watch("subject");
  const selectedGrade = form.watch("grade");

  // Update filtered grades when subject changes
  useEffect(() => {
    if (selectedSubject) {
      const filtered = grades.filter(grade => 
        grade.subjects?.includes(selectedSubject)
      );
      setFilteredGrades(filtered);
      // Reset grade and course when subject changes
      form.setValue("grade", "");
      form.setValue("course", "");
    } else {
      setFilteredGrades([]);
    }
  }, [selectedSubject, grades, form]);

  // Update filtered courses when grade changes
  useEffect(() => {
    if (selectedGrade) {
      const filtered = courses.filter(course => course.gradeId === selectedGrade);
      setFilteredCourses(filtered);
      // Reset course when grade changes
      form.setValue("course", "");
    } else {
      setFilteredCourses([]);
    }
  }, [selectedGrade, courses, form]);

  const selectedType = form.watch("type");

  const onSubmit = async () => {
    setIsGenerating(true);
    try {
      console.log(form.getValues(), 'form');
      const {data}=await assignmentApi.generateAssignment(form.getValues());
      console.log(data,'data')
      // Since handleDetailsSubmission is not available, we'll just simulate it
      // await new Promise(resolve => setTimeout(resolve, 1000));
      navigate("/dashboard/generate",{state:{data,formData:form.getValues()}});
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      // setIsGenerating(false);
    }
  };

  const renderDetailsForm = () => {
    const typeInfo = ASSIGNMENT_TYPE_INFO[selectedType as keyof typeof ASSIGNMENT_TYPE_INFO];
    
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">
            Create {typeInfo?.title || "Assignment"}
          </h1>
          <p className="text-muted-foreground">
            Enter the details for your{" "}
            {typeInfo?.title?.toLowerCase() || "assignment"}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Enter the essential details about your{" "}
              {typeInfo?.title?.toLowerCase() || "assignment"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Type" />
                          </SelectTrigger>
                        </FormControl>
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder={`${typeInfo?.title || "Assignment"} Title`} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select subject" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {subjects.map((subject) => (
                            <SelectItem key={subject.id} value={subject.id}>
                              {subject.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="grade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grade</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                        disabled={!selectedSubject}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select grade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filteredGrades.map((grade) => (
                            <SelectItem key={grade.id} value={grade.id}>
                              {grade.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="course"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                        disabled={!selectedGrade}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select course" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filteredCourses.map((course) => (
                            <SelectItem key={course.id} value={course.id}>
                              {course.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Difficulty</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Difficulty" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {["Easy", "Medium", "Hard"].map((level) => (
                            <SelectItem key={level} value={level}>
                              {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={`Brief description of what students will do in this ${
                            typeInfo?.title?.toLowerCase() || "assignment"
                          }...`}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {(selectedType === ASSIGNMENT_TYPES.MULTIPLE_CHOICE ||
                  selectedType === ASSIGNMENT_TYPES.SHORT_ANSWER) && (
                  <FormField
                    control={form.control}
                    name="numberOfQuestions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Questions</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(e.target.valueAsNumber)}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="publishToLMS"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LMS Integration</FormLabel>
                      <div className="space-y-3 rounded-md border p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              checked={field.value.includes("Canvas")}
                              onCheckedChange={(checked) => {
                                const current = field.value;
                                if (checked) {
                                  field.onChange([...current, "Canvas"]);
                                } else {
                                  field.onChange(current.filter((lms) => lms !== "Canvas"));
                                }
                              }}
                            />
                            <span className="text-sm font-normal">
                              Publish to Canvas
                            </span>
                          </div>
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-200"
                          >
                            Connected
                          </Badge>
                        </div>
                      </div>
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full hover:cursor-pointer"
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
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    );
  };

  return <div className="container p-6">{renderDetailsForm()}</div>;
};

export default CreateAssignment;
