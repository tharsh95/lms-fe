"use client";

import { PlusCircle, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authApi } from "@/services/auth";
import { assignmentApi } from "@/services/api";
import { useEffect, useState } from "react";
import { StudentsList, Student } from "./StudentsList";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CoTeachersList } from "./co-teachers-list";
import Classes from "./classes";
import { Textarea } from "@/components/ui/textarea";



export interface Teacher {
  _id: string;
  name: string;
  email: string;
  role: string;
  classes: {
    classId: string;
    name: string;
    description: string;
    grade: string;
    section: string;
    academicYear: string;
  }[];
}

export interface Class {
  _id: string;
  name: string;
  description: string;
  subject: string;
  students: string[];
  grade: string;
  section: string;
  academicYear: string;
  teachers: string[];
  createdAt: string;
  updatedAt: string;
}

export default function ClassroomPage() {
  // State for students
  const [students, setStudents] = useState<Student[]>([]);
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);

  // State for teachers
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [teacherName, setTeacherName] = useState("");
  const [teacherEmail, setTeacherEmail] = useState("");
  const [teacherClass, setTeacherClass] = useState("");
  const [isAddTeacherOpen, setIsAddTeacherOpen] = useState(false);

  // State for classes
  const [classes, setClasses] = useState<Class[]>([]);
  const [className, setClassName] = useState("");
  const [subjectname, setSubjectname] = useState("");
  const [description, setDescription] = useState("");
  const [grade, setGrade] = useState("");
  const [section, setSection] = useState("");
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);

  // Fetch data
  const fetchStudents = async () => {
    try {
      const {data} = await authApi.getStudents();
      // Transform the data to match Student interface
      const transformedData = Array.isArray(data) ? data : [data].map(student => ({
        ...student,
        classes: Array.isArray(student.classes) ? student.classes : [student.classes]
      }));
      setStudents(transformedData);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await assignmentApi.getAllTeachers();
      setTeachers(response.data);
    } catch (error) {
      console.error("Error fetching teachers:", error);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await assignmentApi.getAllClasses();
      setClasses(response.data);
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchTeachers();
    fetchClasses();
  }, []);

  // Handlers
  const handleAddStudent = async () => {
    try {
      if (!studentName || !studentEmail || !studentClass) {
        console.error("Please fill all fields");
        return;
      }

      await authApi.addStudent({
        name: studentName,
        email: studentEmail,
        classId: studentClass
      });
      
      // Reset form
      setStudentName("");
      setStudentEmail("");
      setStudentClass("");
      
      // Close dialog
      setIsAddStudentOpen(false);
      
      // Refresh data
      await fetchStudents();
    } catch (error) {
      console.error("Error adding student:", error);
    }
  };

  const handleAddTeacher = async () => {
    try {
      if (!teacherName || !teacherEmail || !teacherClass) {
        console.error("Please fill all fields");
        return;
      }

      await authApi.addTeacher({
        name: teacherName,
        email: teacherEmail,
        classId: teacherClass
      });
      
      // Reset form
      setTeacherName("");
      setTeacherEmail("");
      setTeacherClass("");
      
      // Close dialog
      setIsAddTeacherOpen(false);
      
      // Refresh data
      await fetchTeachers();
    } catch (error) {
      console.error("Error adding teacher:", error);
    }
  };

  const handleAddClass = async () => {
    try {
      if (!className || !grade || !section || !subjectname) {
        console.error("Please fill all fields");
        return;
      }

      await authApi.addClass({
        name: className,
        subject: subjectname,
        description,
        grade,
        section,
        academicYear: "2025-2026"
      });
      
      // Reset form
      setClassName("");
      setDescription("");
      setGrade("");
      setSection("");
      
      // Close dialog
      setIsAddClassOpen(false);
      
      // Refresh data
      await fetchClasses();
    } catch (error) {
      console.error("Error adding class:", error);
    }
  };

  return (
    <div className="container p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Classroom Management</h1>
          <p className="text-muted-foreground">
            Manage your students, teachers, and classes
          </p>
        </div>
      </div>

      <Tabs defaultValue="classes" className="mt-6">
        <TabsList>
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="teachers">Teachers</TabsTrigger>
        </TabsList>

        <TabsContent value="classes" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Classes</CardTitle>
              <CardDescription>
                Manage your classes and their details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Class List</h2>
                <div className="flex gap-2">
                  <Dialog open={isAddClassOpen} onOpenChange={setIsAddClassOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Class
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Add Class</DialogTitle>
                        <DialogDescription>
                          Enter the details of the class you want to add
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="class-name" className="text-right">
                            Name
                          </Label>
                          <Input
                            id="class-name"
                            placeholder="Name of the class"
                            className="col-span-3"
                            value={className}
                            onChange={(e) => setClassName(e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="subject-name" className="text-right">
                            Subject
                          </Label>
                          <Input
                            id="subject-name"
                            placeholder="Name of the subject"
                            className="col-span-3"
                            value={subjectname}
                            onChange={(e) => setSubjectname(e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="class-description" className="text-right">
                            Description
                          </Label>
                          <Textarea
                            id="class-description"
                            placeholder="Enter the description of the class"
                            className="col-span-3"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="grade" className="text-right">
                            Grade
                          </Label>
                          <Input
                            id="grade"
                            placeholder="Grade"
                            className="col-span-3"
                            value={grade}
                            onChange={(e) => setGrade(e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="section" className="text-right">
                            Section
                          </Label>
                          <Input
                            id="section"
                            placeholder="Section"
                            className="col-span-3"
                            value={section}
                            onChange={(e) => setSection(e.target.value)}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit" onClick={handleAddClass}>
                          Add Class 
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              <Classes classes={classes} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Students</CardTitle>
              <CardDescription>
                Manage your students and their class assignments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Student List</h2>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Import Students
                  </Button>
                  <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Student
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Add Student</DialogTitle>
                        <DialogDescription>
                          Enter the details of the student you want to add
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="student-name" className="text-right">
                            Name
                          </Label>
                          <Input
                            id="student-name"
                            placeholder="John Doe"
                            className="col-span-3"
                            value={studentName}
                            onChange={(e) => setStudentName(e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="student-email" className="text-right">
                            Email
                          </Label>
                          <Input
                            id="student-email"
                            type="email"
                            placeholder="student@school.edu"
                            className="col-span-3"
                            value={studentEmail}
                            onChange={(e) => setStudentEmail(e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="student-class" className="text-right">
                            Class
                          </Label>
                          <div className="col-span-3">
                            <Select onValueChange={setStudentClass}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a class" />
                              </SelectTrigger>
                              <SelectContent>
                                {classes.map((classInfo) => (
                                  <SelectItem
                                    key={classInfo._id}
                                    value={classInfo._id}
                                  >
                                    {classInfo.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit" onClick={handleAddStudent}>
                          Add Student
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              <StudentsList students={students} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teachers" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Teachers</CardTitle>
              <CardDescription>
                Manage your teachers and their class assignments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Teacher List</h2>
                <div className="flex gap-2">
                  <Dialog open={isAddTeacherOpen} onOpenChange={setIsAddTeacherOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Teacher
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Add Teacher</DialogTitle>
                        <DialogDescription>
                          Enter the details of the teacher you want to add
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="teacher-name" className="text-right">
                            Name
                          </Label>
                          <Input
                            id="teacher-name"
                            placeholder="John Doe"
                            className="col-span-3"
                            value={teacherName}
                            onChange={(e) => setTeacherName(e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="teacher-email" className="text-right">
                            Email
                          </Label>
                          <Input
                            id="teacher-email"
                            type="email"
                            placeholder="teacher@school.edu"
                            className="col-span-3"
                            value={teacherEmail}
                            onChange={(e) => setTeacherEmail(e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="teacher-class" className="text-right">
                            Class
                          </Label>
                          <div className="col-span-3">
                            <Select onValueChange={setTeacherClass}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a class" />
                              </SelectTrigger>
                              <SelectContent>
                                {classes.map((classInfo) => (
                                  <SelectItem
                                    key={classInfo._id}
                                    value={classInfo._id}
                                  >
                                    {classInfo.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit" onClick={handleAddTeacher}>
                          Add Teacher
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              <CoTeachersList teachers={teachers} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
