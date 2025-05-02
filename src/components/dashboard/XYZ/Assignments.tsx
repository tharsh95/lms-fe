import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
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
import {
  CalendarDays,
  Plus,
  Search,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { assignmentApi } from "@/services/api";

// Define the Assignment type
interface Assignment {
  _id: string;
  title: string;
  topic: string;
  dueDate: string;
  status: "active" | "draft" | "archived";
  submissionsCount: number;
  createdAt: string;
  questions: [];
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  console.log(location.pathname, "Assignments");
  // Fetch assignments when component mounts
  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const { data } = await assignmentApi.getAllAssignments();

      setAssignments(data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch assignments. Please try again later.");
      console.error("Error fetching assignments:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter assignments based on search query
  const filteredAssignments = assignments.filter(
    (assignment) =>
      assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) 
  );

  // Get badge variant based on status
  const getBadgeVariant = (status: Assignment["status"]) => {
    switch (status) {
      case "active":
        return "default";
      case "draft":
        return "outline";
      case "archived":
        return "secondary";
      default:
        return "default";
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Assignments</h2>
        <div className="flex items-center space-x-2">
          <Link to="/dashboard/create-assignment">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Assignment
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex justify-end mb-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search assignments..."
            className="w-[200px] pl-8 md:w-[300px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-center text-red-500 p-4">{error}</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAssignments.map((assignment) => (
            <Card key={assignment._id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle>{assignment.title}</CardTitle>
                  <CardDescription>{assignment.topic}</CardDescription>
                  <CardDescription>{assignment.questions.length} questions</CardDescription>
                </div>
                <Badge variant={getBadgeVariant(assignment.status)}>
                  {assignment?.status?.charAt(0)?.toUpperCase() +
                    assignment?.status?.slice(1)}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <CalendarDays className="mr-1 h-4 w-4" />
                    <span>
                      {assignment.status === "active" ? "Due: " : "Created: "}
                      {new Date(assignment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>  
              </CardContent>
              <CardFooter>
                <Link
                  to={`/dashboard/assignments/${assignment._id}`}
                  className="w-full"
                >
                  <Button variant="outline" className="w-full">
                    {assignment.status === "draft"
                      ? "Edit Draft"
                      : "View Details"}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
