
import { Class } from "./ClassRoom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface ClassesProps {
  classes: Class[];
}

const Classes = ({ classes }: ClassesProps) => {
  return (
    <>
       <div className="relative flex-1 mt-4 mb-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search students..."
            className="pl-8"
            // value={searchQuery}
            // onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Course Name</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Grade</TableHead>
            <TableHead>Section</TableHead>
            <TableHead>Academic Year</TableHead>
            <TableHead>Students</TableHead>
            <TableHead>Teachers</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {classes.map((cls) => (
            <TableRow key={cls._id}>
              <TableCell className="font-medium">{cls.name}</TableCell>
              <TableCell>{cls.subject}</TableCell>
              <TableCell>{cls.grade}</TableCell>
              <TableCell>{cls.section}</TableCell>
              <TableCell>{cls.academicYear}</TableCell>
              <TableCell>
                <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                  {cls.students.length} Students
                </span>
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                  {cls.teachers.length} Teachers
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
};

export default Classes;
