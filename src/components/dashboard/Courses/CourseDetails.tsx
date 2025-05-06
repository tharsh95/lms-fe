import { useEffect, useState } from "react";
import { Link, useParams,useNavigate} from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Download,
  FileText,
  GraduationCap,

  Plus,
  Save,
  Users,
  Link2,
} from "lucide-react";
import jsPDF from "jspdf";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { coursesApi } from "@/services/courses";
import { SyllabusPreview } from "./SyllabusPreview";
import { includeSuffix, mapSyllabus } from "@/utils/map";

interface Course {
  courseName: string;
  subject: string;
  grade: number;
  assignments: Array<{
    id: string;
    title: string;
    description: string;
    dueDate: string;
    status: string;
    questions: Array<{
      id: string;
      question: string;
      options: Array<{
        id: string;
        option: string;
      }>;
    }>;
  }>;
  enrollment: {
    totalStudents: number;
    classes: Array<{
      students: Array<{
        name: string;
        email: string;
      }>;
    }>;
  };
  parsedSyllabus?: {
    term: string;
    gradingReferences: Array<{
      id: string;
      title: string;
      type: string;
      added: string;
      usedIn: string;
      url?: string;
    }>;
  };
}

export default function CourseDetailPage() {
  const params = useParams();
  const { id } = params;
  const navigate = useNavigate();


  const [activeTab, setActiveTab] = useState("assignments");


  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);

  const [course, setCourse] = useState<Course | null>(null);

  const fetchCourse = async () => {
    try {
      const { data } = await coursesApi.getCourseById(id);

      setCourse(data);
    } catch (error) {
      console.error('Error fetching course:', error);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [id]);

 

  const handleEmailStudents = () => {

  };

 

  const handleDownloadRoster = () => {};

  const handleDownloadPDF = () => {
    const syllabusData=mapSyllabus(course)
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
      pageWidth - (margin * 2)
    );
    doc.text(descriptionLines, margin, y);
    y += lineHeight * descriptionLines.length + lineHeight;

    // Learning Objectives
    doc.setFontSize(14);
    doc.text("Learning Objectives", margin, y);
    y += lineHeight;
    doc.setFontSize(12);
    syllabusData.learningObjectives.forEach((objective: string) => {
      const objLines = doc.splitTextToSize(`• ${objective}`, pageWidth - (margin * 2));
      doc.text(objLines, margin, y);
      y += lineHeight * objLines.length;
    });
    y += lineHeight;

    // Required Materials
    doc.setFontSize(14);
    doc.text("Required Materials", margin, y);
    y += lineHeight;
    doc.setFontSize(12);
    syllabusData.requiredMaterials.forEach((material: any) => {
      const materialText = `${material.title} by ${material.author} (${material.publisher}, ${material.year}) - ${material.required ? "Required" : "Optional"}`;
      const materialLines = doc.splitTextToSize(materialText, pageWidth - (margin * 2));
      doc.text(materialLines, margin, y);
      y += lineHeight * materialLines.length;
    });
    y += lineHeight;

    // Grading Policy
    doc.setFontSize(14);
    doc.text("Grading Policy", margin, y);
    y += lineHeight;
    doc.setFontSize(12);
    Object.entries(syllabusData.gradingPolicy).forEach(([key, value]: [string, any]) => {
      const policyText = `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value.percentage}% - ${value.description}`;
      const policyLines = doc.splitTextToSize(policyText, pageWidth - (margin * 2));
      doc.text(policyLines, margin, y);
      y += lineHeight * policyLines.length;
    });
    y += lineHeight;

    // Weekly Schedule
    doc.setFontSize(14);
    doc.text("Weekly Schedule", margin, y);
    y += lineHeight;
    doc.setFontSize(12);
    syllabusData.weeklySchedule.forEach((week: any) => {
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
    });

    // Course Policies
    doc.setFontSize(14);
    doc.text("Course Policies", margin, y);
    y += lineHeight;
    doc.setFontSize(12);
    Object.entries(syllabusData.policies).forEach(([key, value]: [string, any]) => {
      if (y > doc.internal.pageSize.height - margin) {
        doc.addPage();
        y = margin;
      }
      const policyTitle = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1");
      doc.text(policyTitle, margin, y);
      y += lineHeight;
      const policyLines = doc.splitTextToSize(value, pageWidth - (margin * 2));
      doc.text(policyLines, margin, y);
      y += lineHeight * policyLines.length + lineHeight;
    });

    // Save the PDF
    doc.save(`${syllabusData.courseTitle || "syllabus"}.pdf`);
  };

  // const handleSyncWithLMS = () => {
  //   setIsSyncing(true);
  //   // Simulate syncing with LMS
  //   setTimeout(() => {
  //     setIsSyncing(false);
  //   }, 2000);
  // };

  // const handleUploadReference = () => {
  //   setIsUploadModalOpen(true);
  // };

  const handleAddLink = () => {
    setIsLinkModalOpen(true);
  };

  const handleLinkSubmit = () => {
    setIsLinkModalOpen(false);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" asChild>
          <Link to="/dashboard/courses">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">{course?.courseName}</h2>
        <Badge className="text-sm">{course?.subject}-{course?.grade ? includeSuffix(course.grade) : ''} Class</Badge>
      </div>
      <div className="grid gap-4 md:grid-cols-7">
        <Card className="md:col-span-5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Course Details</CardTitle>
                <CardDescription>
                  {course?.enrollment?.totalStudents} students enrolled • {course?.parsedSyllabus?.term}
                </CardDescription>
              </div>
              <Button asChild>
                <Link to={`/dashboard/create-assignment?courseId=${params.id}`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Assignment
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs
              defaultValue={activeTab}
              className="space-y-4"
              onValueChange={setActiveTab}
            >
              <TabsList>
                <TabsTrigger value="assignments">Assignments</TabsTrigger>
                <TabsTrigger value="students">Students</TabsTrigger>
                <TabsTrigger value="syllabus">Syllabus</TabsTrigger>
                <TabsTrigger value="references">Grading References</TabsTrigger>
              </TabsList>
              <TabsContent value="assignments" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Assignments</CardTitle>
                    <CardDescription>
                      {course?.assignments?.length} assignments in this course
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {course?.assignments?.map((assignment: any) => (
                          <TableRow key={assignment.id}>
                            <TableCell>{assignment.title}</TableCell>
                            <TableCell>{assignment.description}</TableCell>
                            <TableCell>{assignment.dueDate}</TableCell>
                            <TableCell>{assignment.status}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
             
              <TabsContent value="students" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Enrolled Students</CardTitle>
                        <CardDescription>
                          {/* {course.enrollment.totalStudents} students in this course */}
                        </CardDescription>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" onClick={handleEmailStudents}>
                          Email All
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleDownloadRoster}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download Roster
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Assignments Completed</TableHead>
                          <TableHead>Current Grade</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {course?.enrollment?.classes[0]?.students.map((student: any) => (
                          <TableRow key={"student"}>
                            <TableCell className="font-medium">
                              {student.name}
                            </TableCell>
                            <TableCell>{student.email}</TableCell>
                            {/* <TableCell>{student.completed}</TableCell>
                             <TableCell>{student.grade}</TableCell> */}
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm">
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                         ))} 
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="syllabus" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Course Syllabus</CardTitle>
                        <CardDescription>
                          Review and edit your course syllabus
                        </CardDescription>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          onClick={handleDownloadPDF}
                          // disabled={isDownloadingSyllabus}
                        >
                          {/* {isDownloadingSyllabus ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Downloading...
                            </>
                          ) : ( */}
                            <>
                              <Download className="mr-2 h-4 w-4" />
                              Download PDF
                            </>
                          {/* )} */}
                        </Button>
                        <Button onClick={() => navigate('/dashboard/edit-syllabus',{state:{course}})}>
                            <Save className="mr-2 h-4 w-4" />
                            Edit Syllabus
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none dark:prose-invert">
                      <SyllabusPreview syllabusData={mapSyllabus(course)} />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="references" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Grading References</CardTitle>
                        <CardDescription>
                          Upload links, documents, or text to use as references
                          when grading
                        </CardDescription>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" onClick={handleAddLink}>
                          <Link2 className="mr-2 h-4 w-4" />
                          Add Link
                        </Button>
                        <Button onClick={()=>{}}>
                        {/* <Button onClick={handleUploadReference}> */}
                          <Plus className="mr-2 h-4 w-4" />
                          Upload Reference
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="all" className="space-y-4">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="all">All References</TabsTrigger>
                        <TabsTrigger value="documents">Documents</TabsTrigger>
                        <TabsTrigger value="links">Links</TabsTrigger>
                      </TabsList>

                      <TabsContent value="all" className="space-y-4">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Title</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Added</TableHead>
                              <TableHead>Used In</TableHead>
                              <TableHead className="text-right">
                                Actions
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {course?.parsedSyllabus?.gradingReferences && course.parsedSyllabus.gradingReferences.length > 0 && (
                            course.parsedSyllabus.gradingReferences.map((reference: any) => (
                              <TableRow key={reference.id}>
                                <TableCell className="font-medium">
                                  {reference.title}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      reference.type === "Document"
                                        ? "default"
                                        : reference.type === "Link"
                                        ? "outline"
                                        : "secondary"
                                    }
                                  >
                                    {reference.type}
                                  </Badge>
                                </TableCell>
                                <TableCell>{reference.added}</TableCell>
                                <TableCell>{reference.usedIn}</TableCell>
                                <TableCell className="text-right">
                                  <Button variant="ghost" size="sm">
                                    View
                                  </Button>
                                </TableCell>
                              </TableRow>
                            )))}
                          </TableBody>
                        </Table>
                      </TabsContent>

                      <TabsContent value="documents" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {course?.parsedSyllabus?.gradingReferences
                            .filter((ref: any) => ref.type === "Document")
                            .map((reference: any) => (
                              <Card key={reference.id}>
                                <CardContent className="p-4">
                                  <div className="flex items-start space-x-4">
                                    <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                                      <FileText className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                      <h3 className="font-medium">
                                        {reference.title}
                                      </h3>
                                      <p className="text-sm text-muted-foreground">
                                        Added {reference.added}
                                      </p>
                                      <p className="text-sm mt-1">
                                        Used in {reference.usedIn}
                                      </p>
                                    </div>
                                    <Button variant="ghost" size="icon">
                                      <Download className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                        </div>
                      </TabsContent>

                      <TabsContent value="links" className="space-y-4">
                        <div className="space-y-4">
                          {course?.parsedSyllabus?.gradingReferences
                            .filter((ref: any) => ref.type === "Text")
                            .map((reference: any) => (
                              <div
                                key={reference.id}
                                className="flex items-center justify-between p-4 border rounded-md"
                              >
                                <div className="flex items-center space-x-4">
                                  <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                                    <Link2 className="h-5 w-5 text-primary" />
                                  </div>
                                  <div>
                                    <h3 className="font-medium">
                                      {reference.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                      {reference.url}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex space-x-2">
                                  <Button variant="ghost" size="sm" asChild>
                                    <a
                                      href={reference.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      Open
                                    </a>
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    Copy
                                  </Button>
                                </div>
                              </div>
                            ))}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="integrations" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>LMS Integrations</CardTitle>
                    <CardDescription>
                      Connect this course with your Learning Management Systems
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {lmsIntegrations.map((lms) => (
                        <div
                          key={lms.id}
                          className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 flex items-center justify-center rounded bg-primary/10">
                              {lms.icon}
                            </div>
                            <div>
                              <p className="font-medium">{lms.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {lms.connected
                                  ? "Connected - Course is synced"
                                  : "Not connected - Connect to sync course content"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {lms.connected ? (
                              <>
                                {/* <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8"
                                  // onClick={() => handleSyncWithLMS(lms.name)}
                                  disabled={isSyncing}
                                >
                                  {isSyncing ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Syncing...
                                    </>
                                  ) : (
                                    <>
                                      <Link2 className="mr-2 h-4 w-4" />
                                      Sync Now
                                    </>
                                  )}
                                </Button> */}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8"
                                >
                                  View in {lms.name}
                                </Button>
                              </>
                            ) : (
                              <Button
                                variant="default"
                                size="sm"
                                className="h-8"
                                onClick={() =>
                                  (window.location.href =
                                    "/dashboard/integrations")
                                }
                              >
                                <Link2 className="mr-2 h-4 w-4" />
                                Connect
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() =>
                          (window.location.href = "/dashboard/integrations")
                        }
                      >
                        Manage All Integrations
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full justify-start" asChild>
              <Link to="/dashboard/create-assignment">
                <FileText className="mr-2 h-4 w-4" />
                Create Assignment
              </Link>
            </Button>
            <Button className="w-full justify-start" onClick={() => navigate('/dashboard/edit-syllabus',{state:{course}})}>
                <GraduationCap className="mr-2 h-4 w-4" />
                Edit Syllabus
            </Button>
            <Button
              className="w-full justify-start"
              onClick={handleEmailStudents}
            >
              <Users className="mr-2 h-4 w-4" />
              Email Students
            </Button>
          
          
          </CardContent>
        </Card>
      </div>
      {/* {activeTab === "assignments" && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Assignment Analytics</CardTitle>
            <CardDescription>
              Performance metrics across all assignments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center border rounded-md">
              <p className="text-muted-foreground">
                Assignment performance chart will appear here
              </p>
            </div>
          </CardContent>
        </Card>
      )} */}
      {/* <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Upload Reference Material</DialogTitle>
            <DialogDescription>
              Upload documents or text to use as grading references for this
              course.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                placeholder="APA Style Guide"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="file" className="text-right">
                File
              </Label>
              <Input id="file" type="file" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                placeholder="Optional description"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUploadModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUploadSubmit}>Upload</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}
      <Dialog open={isLinkModalOpen} onOpenChange={setIsLinkModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Reference Link</DialogTitle>
            <DialogDescription>
              Add a web link to use as a grading reference for this course.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="link-title" className="text-right">
                Title
              </Label>
              <Input
                id="link-title"
                placeholder="Purdue OWL Writing Resources"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="link-url" className="text-right">
                URL
              </Label>
              <Input
                id="link-url"
                type="url"
                placeholder="https://example.com/resource"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="link-description" className="text-right">
                Description
              </Label>
              <Input
                id="link-description"
                placeholder="Optional description"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLinkModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleLinkSubmit}>Add Link</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* <Dialog open={isEmailModalOpen} onOpenChange={setIsEmailModalOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Email All Students</DialogTitle>
            <DialogDescription>
              Send an email to all {course.students} students enrolled in this
              course.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email-subject" className="text-right">
                Subject
              </Label>
              <Input
                id="email-subject"
                placeholder="Important course announcement"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email-body" className="text-right">
                Message
              </Label>
              <textarea
                id="email-body"
                placeholder="Enter your message here..."
                className="col-span-3 min-h-[150px] rounded-md border border-input bg-background px-3 py-2"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="text-right">
                <Label htmlFor="email-attachment" className="text-right">
                  Attachment
                </Label>
              </div>
              <Input id="email-attachment" type="file" className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEmailModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSendEmail}>Send Email</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}
    </div>
  );
}

// const courses = [
//   {
//     id: "1",
//     title: "Introduction to Psychology",
//     code: "PSY 101",
//     students: 42,
//     assignments: 8,
//     graded: 5,
//   },
//   {
//     id: "2",
//     title: "Advanced Statistics",
//     code: "STAT 301",
//     students: 28,
//     assignments: 12,
//     graded: 9,
//   },
//   {
//     id: "3",
//     title: "Environmental Science",
//     code: "ENV 201",
//     students: 35,
//     assignments: 6,
//     graded: 4,
//   },
//   {
//     id: "4",
//     title: "Creative Writing",
//     code: "ENG 215",
//     students: 22,
//     assignments: 10,
//     graded: 8,
//   },
// ];

// const courseActivity = [
//   {
//     title: "New assignment created",
//     description: "Research Paper - Due Apr 15, 2025",
//     time: "2h ago",
//   },
//   {
//     title: "Graded 15 submissions",
//     description: "Midterm Exam",
//     time: "1d ago",
//   },
//   {
//     title: "Updated syllabus",
//     description: "Added new reading materials",
//     time: "3d ago",
//   },
//   {
//     title: "New student enrolled",
//     description: "Emma Johnson joined the course",
//     time: "1w ago",
//   },
// ];

// const courseAssignments = [
//   {
//     id: "1",
//     title: "Research Paper",
//     dueDate: "Apr 15, 2025",
//     status: "Active",
//     submissions: "32/42",
//   },
//   {
//     id: "2",
//     title: "Midterm Exam",
//     dueDate: "Mar 20, 2025",
//     status: "Completed",
//     submissions: "40/42",
//   },
//   {
//     id: "3",
//     title: "Weekly Quiz 5",
//     dueDate: "Mar 10, 2025",
//     status: "Completed",
//     submissions: "38/42",
//   },
//   {
//     id: "4",
//     title: "Weekly Quiz 6",
//     dueDate: "Mar 17, 2025",
//     status: "Completed",
//     submissions: "36/42",
//   },
//   {
//     id: "5",
//     title: "Weekly Quiz 7",
//     dueDate: "Mar 24, 2025",
//     status: "Active",
//     submissions: "30/42",
//   },
//   {
//     id: "6",
//     title: "Final Exam",
//     dueDate: "May 10, 2025",
//     status: "Draft",
//     submissions: "0/42",
//   },
// ];

// const courseStudents = [
//   {
//     id: "1",
//     name: "Emma Johnson",
//     email: "emma.j@university.edu",
//     completed: "5/8",
//     grade: "A-",
//   },
//   {
//     id: "2",
//     name: "Michael Chen",
//     email: "m.chen@university.edu",
//     completed: "4/8",
//     grade: "B+",
//   },
//   {
//     id: "3",
//     name: "Sophia Rodriguez",
//     email: "s.rodriguez@university.edu",
//     completed: "6/8",
//     grade: "A",
//   },
//   {
//     id: "4",
//     name: "James Wilson",
//     email: "j.wilson@university.edu",
//     completed: "3/8",
//     grade: "B",
//   },
//   {
//     id: "5",
//     name: "Olivia Smith",
//     email: "o.smith@university.edu",
//     completed: "5/8",
//     grade: "B+",
//   },
//   {
//     id: "6",
//     name: "William Brown",
//     email: "w.brown@university.edu",
//     completed: "4/8",
//     grade: "C+",
//   },
// ];

const lmsIntegrations = [
  {
    id: "canvas",
    name: "Canvas",
    connected: true,
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6 text-primary"
      >
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
        <path d="M3 9h18" />
        <path d="M9 21V9" />
      </svg>
    ),
  },
  {
    id: "google-classroom",
    name: "Google Classroom",
    connected: false,
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6 text-primary"
      >
        <path d="M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z" />
        <path d="m9 16 .348-.24c1.465-1.013 3.84-1.013 5.304 0L15 16" />
        <circle cx="12" cy="11" r="2" />
      </svg>
    ),
  },
  {
    id: "moodle",
    name: "Moodle",
    connected: false,
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6 text-primary"
      >
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
        <path d="m7 10 2 2 7-7" />
      </svg>
    ),
  },
];

// const gradingReferences = [
//   {
//     id: "1",
//     title: "APA Style Guide 7th Edition",
//     type: "Document",
//     added: "Mar 15, 2025",
//     usedIn: "3 assignments",
//     url: "",
//   },
//   {
//     id: "2",
//     title: "Rubric Template - Research Papers",
//     type: "Document",
//     added: "Feb 28, 2025",
//     usedIn: "2 assignments",
//     url: "",
//   },
//   {
//     id: "3",
//     title: "Purdue OWL Writing Resources",
//     type: "Link",
//     added: "Mar 10, 2025",
//     usedIn: "5 assignments",
//     url: "https://owl.purdue.edu/owl/research_and_citation/resources.html",
//   },
//   {
//     id: "4",
//     title: "Psychology Journal Citation Examples",
//     type: "Text",
//     added: "Mar 5, 2025",
//     usedIn: "1 assignment",
//     url: "",
//   },
//   {
//     id: "5",
//     title: "Harvard Referencing Guide",
//     type: "Link",
//     added: "Feb 20, 2025",
//     usedIn: "4 assignments",
//     url: "https://www.citethisforme.com/harvard-referencing",
//   },
// ];
{/* <TabsContent value="assignments" className="space-y-4">
<Card>
  <CardHeader>
    <CardTitle>Course Assignments</CardTitle>
    <CardDescription>
      Manage and grade assignments for this course
    </CardDescription>
  </CardHeader>
  <CardContent>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Assignment</TableHead>
          <TableHead>Due Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Submissions</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {courseAssignments.map((assignment) => (
          <TableRow key={assignment.id}>
            <TableCell className="font-medium">
              {assignment.title}
            </TableCell>
            <TableCell>{assignment.dueDate}</TableCell>
            <TableCell>
              <Badge
                variant={
                  assignment.status === "Active"
                    ? "default"
                    : assignment.status === "Draft"
                    ? "outline"
                    : "secondary"
                }
              >
                {assignment.status}
              </Badge>
            </TableCell>
            <TableCell>{assignment.submissions}</TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  handleGradeAssignment(assignment.id)
                }
              >
                Grade
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </CardContent>
</Card>
</TabsContent> */}