import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SyllabusCreator } from "./SyllabusCreator";
import { assignmentApi } from "@/services/api";

const formSchema = z.object({
  courseName: z.string().min(2, {
    message: "Course name must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Course description must be at least 10 characters.",
  }),
  subject: z.string({
    required_error: "Please select a subject.",
  }),
  grade: z.string({
    required_error: "Please select a grade level.",
  }),
});

export default function CreateCoursePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("details");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [grades, setGrades] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [courseDetails, setCourseDetails] = useState<z.infer<typeof formSchema> | null>(null);
  const [allData, setAllData] = useState<Array<{ subject: string; grade: string }>>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      courseName: "",
      description: "",
      subject: "",
      grade: "",
    },
  });

  useEffect(() => {
    const fetchSubjects = async () => {
      const { data } = await assignmentApi.getAllClasses();
      setAllData(data);
      const subjects = new Set(data.map((item: { subject: string }) => item.subject));
      setSubjects(Array.from(subjects) as string[]);
    };
    
    fetchSubjects();
  }, []);

  // Add effect to update grades when subject changes
  useEffect(() => {
    const selectedSubject = form.getValues("subject");
    if (selectedSubject) {
      const filteredGrades = new Set(
        allData
          .filter((item) => item.subject === selectedSubject)
          .map((item) => item.grade)
      );
      setGrades(Array.from(filteredGrades) as string[]);
    } else {
      setGrades([]);
    }
  }, [form.watch("subject"), allData]);

  function onSubmitDetails(values: z.infer<typeof formSchema>) {
    setCourseDetails(values);
    setActiveTab("syllabus");
  }

  function onCreateCourse() {
    setIsCreating(true);

    // Simulate API call
    setTimeout(() => {
      setIsCreating(false);
      navigate("/dashboard/courses");
    }, 1500);
  }

  return (
    <div className="container mx-auto p-6">
      <PageHeader
        heading="Create New Course"
        subheading="Set up your course details and create a syllabus with AI assistance"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="details">Course Details</TabsTrigger>
          <TabsTrigger value="syllabus" disabled={!courseDetails}>
            Syllabus
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Information</CardTitle>
              <CardDescription>
                Enter the basic details about your course. You'll create your
                syllabus in the next step.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmitDetails)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="courseName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Introduction to Literature"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          The name of your course as it will appear to students.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a subject" ></SelectValue>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="all" disabled>Select a subject</SelectItem>
                              {subjects.map((subject) => (
                                <SelectItem key={subject} value={subject}>
                                  {subject}
                                </SelectItem>
                              ))}
                              {/* <SelectItem value="english">English</SelectItem>
                              <SelectItem value="math">Mathematics</SelectItem>
                              <SelectItem value="science">Science</SelectItem>
                              <SelectItem value="history">History</SelectItem>
                              <SelectItem value="art">Art</SelectItem>
                              <SelectItem value="music">Music</SelectItem>
                              <SelectItem value="computerScience">Computer Science</SelectItem>
                              <SelectItem value="foreignLanguage">Foreign Language</SelectItem>
                              <SelectItem value="physicalEducation">Physical Education</SelectItem>
                              <SelectItem value="other">Other</SelectItem> */}
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
                          <FormLabel>Grade Level</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a grade level" />
                              </SelectTrigger>
                            </FormControl>
                            {/* <SelectContent>
                              <SelectItem value="elementary">
                                Elementary School
                              </SelectItem>
                              <SelectItem value="middleSchool">
                                Middle School
                              </SelectItem>
                              <SelectItem value="highSchool">
                                High School
                              </SelectItem>
                              <SelectItem value="undergraduate">
                                Undergraduate
                              </SelectItem>
                              <SelectItem value="graduate">Graduate</SelectItem>
                              <SelectItem value="professional">
                                Professional
                              </SelectItem>
                            </SelectContent> */}
                            <SelectContent>
                              {!form.getValues("subject")&& (
                            <SelectItem  value="all" disabled>First Select Subject</SelectItem>)}
                              {grades.map((grade) => (
                                <SelectItem key={grade} value={grade}>
                                  {grade}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="A brief description of what students will learn in this course..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          This will help our AI generate a more relevant
                          syllabus.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full md:w-auto">
                    Continue to Syllabus
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="syllabus" className="mt-6">
          {courseDetails && (
            <SyllabusCreator
              courseDetails={courseDetails}
              onComplete={onCreateCourse}
              isCreating={isCreating}
              setIsCreating={setIsCreating}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
