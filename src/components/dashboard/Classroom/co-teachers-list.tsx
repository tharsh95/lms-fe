import { Teacher } from "./ClassRoom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CoTeachersListProps {
  teachers: Teacher[];
}

export function CoTeachersList({ teachers }: CoTeachersListProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Classes</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {teachers.map((teacher) => (
          <TableRow key={teacher._id}>
            <TableCell>{teacher.name}</TableCell>
            <TableCell>{teacher.email}</TableCell>
            <TableCell>{teacher.role[0].toUpperCase() + teacher.role.slice(1)}</TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-2">
                {teacher.classes.map((cls) => (
                  <span
                    key={cls.classId}
                    className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                  >
                    {cls.name} ({cls.grade}-{cls.section})
                  </span>
                ))}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
