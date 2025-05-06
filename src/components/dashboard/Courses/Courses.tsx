import {Link} from "react-router-dom"
import { Loader2, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { coursesApi } from "@/services/courses"
import { includeSuffix } from "@/utils/map"

interface Course {
  id: string;
  _id: string;
  courseName: string;
  subject: string;
  grade: number;
  description: string;
  enrollment: {
    totalStudents: number;
      totalAssignments: number;
  };
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const fetchCourses = async () => {
    const { data } = await coursesApi.getAllCourses();
    setCourses(data);
    setIsLoading(false);
  }
  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <PageHeader heading="Courses" subheading="Manage your courses and create new ones" />
        <Button asChild>
          <Link to="/dashboard/courses/create" title="Create a new course with details and AI-generated syllabus">
            <Plus className="mr-2 h-4 w-4" />
            Create New Course
          </Link>
        </Button>
      </div>
      {isLoading&&(
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card key={course._id}>
            <CardHeader>
              <CardTitle>{course.courseName}</CardTitle>
              <CardDescription>{course.subject}-{includeSuffix(course.grade)} Grade</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{course.description}</p>
              <div className="flex justify-between text-sm">
                <div>
                  <span className="font-medium">{course.enrollment.totalStudents}</span> Students
                </div>
                <div>
                  <span className="font-medium">{course.enrollment.totalAssignments}</span> Assignments
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" asChild className="w-full">
                <Link to={`/dashboard/courses/${course._id}`}>View Details</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
