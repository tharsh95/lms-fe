export const mapSyllabus = (syllabus: any) => {
  const syllabusData = {
    courseTitle: syllabus?.courseName,
    instructor: syllabus?.parsedSyllabus.instructor.name,
    term: syllabus?.parsedSyllabus.term,
    courseDescription: syllabus?.description,
    learningObjectives: syllabus?.parsedSyllabus.learningObjectives,
    requiredMaterials: syllabus?.parsedSyllabus.requiredMaterials,
    gradingPolicy: syllabus?.parsedSyllabus.gradingPolicy,
    weeklySchedule: syllabus?.parsedSyllabus.weeklySchedule,
    policies: syllabus?.parsedSyllabus.policies,
    id: syllabus?._id,

  }
  return syllabusData
}
export const mapCourse = (syllabus: any, course: any) => {
  const courseData = {
    courseName: syllabus.courseTitle,
    grade: course.grade,
    subject: course.subject,
    description: syllabus.courseDescription,
    syllabusPdfUrl: course.syllabusPdfUrl,
    parsedSyllabus: {
      courseTitle: syllabus.courseTitle,
      instructor: {
        name: syllabus.instructor,
        title: course.parsedSyllabus.instructor.title,
      },
      term: syllabus.term,
      courseDescription: syllabus.courseDescription,
      learningObjectives: syllabus.learningObjectives,
      requiredMaterials: syllabus.requiredMaterials,
      gradingPolicy: syllabus.gradingPolicy,
      weeklySchedule: syllabus.weeklySchedule,
      policies: syllabus.policies,
      gradingReferences: course.parsedSyllabus.gradingReferences,
    },
    aiMetaData: {
      prompt: course.aiMetadata.prompt,
      referenceBooks: course.aiMetadata.referenceBooks,
    },
    courseDetails: [],
    createdAt: course.createdAt,
    updatedAt: new Date().toISOString(),
    id: course._id,
  }
  return courseData
}

export const includeSuffix = (grade: number) => {
  console.log(typeof grade,"gra")
  if (grade == 1) return `${grade}st`;
  if (grade == 2) return `${grade}nd`;
  if (grade == 3) return `${grade}rd`;
  return `${grade}th`;
}
