import { AccordionContent } from '@/components/ui/accordion';
import { Accordion, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardTitle,CardHeader,CardDescription,CardContent,CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { coursesApi } from '@/services/courses';
import { includeSuffix, mapCourse, mapSyllabus } from '@/utils/map';
import { Save } from 'lucide-react';
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const EditSyllabus: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const course = location.state.course;
    const [syllabusData, setSyllabusData] = useState(mapSyllabus(course));
    const courseData = location.state.course;
  return (
    <div>
 {syllabusData && (
            <Card>
              <CardHeader>
                <CardTitle className='text-2xl font-bold underline'>Edit Your Syllabus-{courseData.subject}-{includeSuffix(courseData.grade)} Class</CardTitle>
                <CardDescription>
                  Review and customize the AI-generated syllabus to fit your
                  needs.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion
                  type="multiple"
                  defaultValue={["basic-info", "objectives"]}
                >
                  <AccordionItem value="basic-info">
                    <AccordionTrigger>Basic Information</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="courseTitle">Course Title</Label>
                          <Input
                            id="courseTitle"
                            value={syllabusData.courseTitle}
                            onChange={(e) =>
                              setSyllabusData({
                                ...syllabusData,
                                courseTitle: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="instructor">Instructor Name</Label>
                          <Input
                            id="instructor"
                            value={syllabusData.instructor}
                            onChange={(e) =>
                              setSyllabusData({
                                ...syllabusData,
                                instructor: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="term">Term</Label>
                          <Input
                            id="term"
                            value={syllabusData.term}
                            onChange={(e) =>
                              setSyllabusData({
                                ...syllabusData,
                                term: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="courseDescription">
                            Course Description
                          </Label>
                          <Textarea
                            id="courseDescription"
                            value={syllabusData.courseDescription}
                            onChange={(e) =>
                              setSyllabusData({
                                ...syllabusData,
                                courseDescription: e.target.value,
                              })
                            }
                            className="min-h-[100px]"
                          />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="objectives">
                    <AccordionTrigger>Learning Objectives</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        {syllabusData.learningObjectives.map(
                          (objective: string, index: number) => (
                            <div key={index} className="flex items-start gap-2">
                              <Input
                                value={objective}
                                onChange={(e) => {
                                  const newObjectives = [
                                    ...syllabusData.learningObjectives,
                                  ];
                                  newObjectives[index] = e.target.value;
                                  setSyllabusData({
                                    ...syllabusData,
                                    learningObjectives: newObjectives,
                                  });
                                }}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  const newObjectives =
                                    syllabusData.learningObjectives.filter(
                                      (_: any, i: number) => i !== index
                                    );
                                  setSyllabusData({
                                    ...syllabusData,
                                    learningObjectives: newObjectives,
                                  });
                                }}
                              >
                                ✕
                              </Button>
                            </div>
                          )
                        )}
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSyllabusData({
                              ...syllabusData,
                              learningObjectives: [
                                ...syllabusData.learningObjectives,
                                "New learning objective",
                              ],
                            });
                          }}
                        >
                          Add Objective
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="materials">
                    <AccordionTrigger>Required Materials</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        {syllabusData.requiredMaterials.map(
                          (material: any, index: number) => (
                            <div key={index} className="border p-3 rounded-md">
                              <div className="flex justify-between items-center mb-2">
                                <h4 className="font-medium">
                                  Material {index + 1}
                                </h4>
                                <Badge
                                  variant={
                                    material.required ? "default" : "outline"
                                  }
                                >
                                  {material.required ? "Required" : "Optional"}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <Label htmlFor={`material-title-${index}`}>
                                    Title
                                  </Label>
                                  <Input
                                    id={`material-title-${index}`}
                                    value={material.title}
                                    onChange={(e) => {
                                      const newMaterials = [
                                        ...syllabusData.requiredMaterials,
                                      ];
                                      newMaterials[index] = {
                                        ...material,
                                        title: e.target.value,
                                      };
                                      setSyllabusData({
                                        ...syllabusData,
                                        requiredMaterials: newMaterials,
                                      });
                                    }}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`material-author-${index}`}>
                                    Author
                                  </Label>
                                  <Input
                                    id={`material-author-${index}`}
                                    value={material.author}
                                    onChange={(e) => {
                                      const newMaterials = [
                                        ...syllabusData.requiredMaterials,
                                      ];
                                      newMaterials[index] = {
                                        ...material,
                                        author: e.target.value,
                                      };
                                      setSyllabusData({
                                        ...syllabusData,
                                        requiredMaterials: newMaterials,
                                      });
                                    }}
                                  />
                                </div>
                                <div>
                                  <Label
                                    htmlFor={`material-publisher-${index}`}
                                  >
                                    Publisher
                                  </Label>
                                  <Input
                                    id={`material-publisher-${index}`}
                                    value={material.publisher}
                                    onChange={(e) => {
                                      const newMaterials = [
                                        ...syllabusData.requiredMaterials,
                                      ];
                                      newMaterials[index] = {
                                        ...material,
                                        publisher: e.target.value,
                                      };
                                      setSyllabusData({
                                        ...syllabusData,
                                        requiredMaterials: newMaterials,
                                      });
                                    }}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`material-year-${index}`}>
                                    Year
                                  </Label>
                                  <Input
                                    id={`material-year-${index}`}
                                    value={material.year}
                                    onChange={(e) => {
                                      const newMaterials = [
                                        ...syllabusData.requiredMaterials,
                                      ];
                                      newMaterials[index] = {
                                        ...material,
                                        year: e.target.value,
                                      };
                                      setSyllabusData({
                                        ...syllabusData,
                                        requiredMaterials: newMaterials,
                                      });
                                    }}
                                  />
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 mt-3">
                                <Switch
                                  id={`required-${index}`}
                                  checked={material.required}
                                  onCheckedChange={(checked) => {
                                    const newMaterials = [
                                      ...syllabusData.requiredMaterials,
                                    ];
                                    newMaterials[index] = {
                                      ...material,
                                      required: checked,
                                    };
                                    setSyllabusData({
                                      ...syllabusData,
                                      requiredMaterials: newMaterials,
                                    });
                                  }}
                                />
                                <Label htmlFor={`required-${index}`}>
                                  Required
                                </Label>
                              </div>
                            </div>
                          )
                        )}
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSyllabusData({
                              ...syllabusData,
                              requiredMaterials: [
                                ...syllabusData.requiredMaterials,
                                {
                                  title: "New Material",
                                  author: "",
                                  publisher: "",
                                  year: "",
                                  required: true,
                                },
                              ],
                            });
                          }}
                        >
                          Add Material
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="grading">
                    <AccordionTrigger>Grading Policy</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        {Object.entries(syllabusData.gradingPolicy).map(
                          ([key, value]: [string, any]) => (
                            <div
                              key={key}
                              className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end"
                            >
                              <div>
                                <Label htmlFor={`grading-${key}`}>
                                  {key.charAt(0).toUpperCase() + key.slice(1)}
                                </Label>
                                <Input
                                  id={`grading-${key}`}
                                  value={value.description}
                                  onChange={(e) => {
                                    const newGradingPolicy = {
                                      ...syllabusData.gradingPolicy,
                                    };
                                    newGradingPolicy[key] = {
                                      ...value,
                                      description: e.target.value,
                                    };
                                    setSyllabusData({
                                      ...syllabusData,
                                      gradingPolicy: newGradingPolicy,
                                    });
                                  }}
                                />
                              </div>
                              <div>
                                <Label htmlFor={`percentage-${key}`}>
                                  Percentage
                                </Label>
                                <div className="flex items-center">
                                  <Input
                                    id={`percentage-${key}`}
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={value.percentage}
                                    onChange={(e) => {
                                      const newGradingPolicy = {
                                        ...syllabusData.gradingPolicy,
                                      };
                                      newGradingPolicy[key] = {
                                        ...value,
                                        percentage: Number.parseInt(
                                          e.target.value
                                        ),
                                      };
                                      setSyllabusData({
                                        ...syllabusData,
                                        gradingPolicy: newGradingPolicy,
                                      });
                                    }}
                                  />
                                  <span className="ml-2">%</span>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  const newGradingPolicy = {
                                    ...syllabusData.gradingPolicy,
                                  };
                                  delete newGradingPolicy[key];
                                  setSyllabusData({
                                    ...syllabusData,
                                    gradingPolicy: newGradingPolicy,
                                  });
                                }}
                              >
                                ✕
                              </Button>
                            </div>
                          )
                        )}
                        <Button
                          variant="outline"
                          onClick={() => {
                            const newKey = `component${
                              Object.keys(syllabusData.gradingPolicy).length + 1
                            }`;
                            const newGradingPolicy = {
                              ...syllabusData.gradingPolicy,
                            };
                            newGradingPolicy[newKey] = {
                              percentage: 0,
                              description: "New component",
                            };
                            setSyllabusData({
                              ...syllabusData,
                              gradingPolicy: newGradingPolicy,
                            });
                          }}
                        >
                          Add Grading Component
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="schedule">
                    <AccordionTrigger>Weekly Schedule</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        {syllabusData.weeklySchedule.map(
                          (week: any, index: number) => (
                            <div key={index} className="border p-3 rounded-md">
                              <h4 className="font-medium mb-2">
                                Week {week.week}
                              </h4>
                              <div className="grid grid-cols-1 gap-3">
                                <div>
                                  <Label htmlFor={`week-topic-${index}`}>
                                    Topic
                                  </Label>
                                  <Input
                                    id={`week-topic-${index}`}
                                    value={week.topic}
                                    onChange={(e) => {
                                      const newSchedule = [
                                        ...syllabusData.weeklySchedule,
                                      ];
                                      newSchedule[index] = {
                                        ...week,
                                        topic: e.target.value,
                                      };
                                      setSyllabusData({
                                        ...syllabusData,
                                        weeklySchedule: newSchedule,
                                      });
                                    }}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`week-readings-${index}`}>
                                    Readings
                                  </Label>
                                  <Input
                                    id={`week-readings-${index}`}
                                    value={week.readings}
                                    onChange={(e) => {
                                      const newSchedule = [
                                        ...syllabusData.weeklySchedule,
                                      ];
                                      newSchedule[index] = {
                                        ...week,
                                        readings: e.target.value,
                                      };
                                      setSyllabusData({
                                        ...syllabusData,
                                        weeklySchedule: newSchedule,
                                      });
                                    }}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`week-assignments-${index}`}>
                                    Assignments
                                  </Label>
                                  <Input
                                    id={`week-assignments-${index}`}
                                    value={week.assignments}
                                    onChange={(e) => {
                                      const newSchedule = [
                                        ...syllabusData.weeklySchedule,
                                      ];
                                      newSchedule[index] = {
                                        ...week,
                                        assignments: e.target.value,
                                      };
                                      setSyllabusData({
                                        ...syllabusData,
                                        weeklySchedule: newSchedule,
                                      });
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          )
                        )}
                        <div className="flex justify-between">
                          <Button
                            variant="outline"
                            onClick={() => {
                              const lastWeek =
                                syllabusData.weeklySchedule[
                                  syllabusData.weeklySchedule.length - 1
                                ];
                              const newWeek = {
                                week: lastWeek.week + 1,
                                topic: "New Topic",
                                readings: "TBD",
                                assignments: "TBD",
                              };
                              setSyllabusData({
                                ...syllabusData,
                                weeklySchedule: [
                                  ...syllabusData.weeklySchedule,
                                  newWeek,
                                ],
                              });
                            }}
                          >
                            Add Week
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              const newSchedule = [
                                ...syllabusData.weeklySchedule,
                              ];
                              newSchedule.pop();
                              setSyllabusData({
                                ...syllabusData,
                                weeklySchedule: newSchedule,
                              });
                            }}
                            disabled={syllabusData.weeklySchedule.length}
                          >
                            Remove Last Week
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="policies">
                    <AccordionTrigger>Course Policies</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        {Object.entries(syllabusData.policies).map(
                          ([key, value]: [string, any]) => (
                            <div key={key}>
                              <Label htmlFor={`policy-${key}`}>
                                {key.charAt(0).toUpperCase() +
                                  key.slice(1).replace(/([A-Z])/g, " $1")}{" "}
                                Policy
                              </Label>
                              <Textarea
                                id={`policy-${key}`}
                                value={value}
                                onChange={(e) => {
                                  const newPolicies = {
                                    ...syllabusData.policies,
                                  };
                                  newPolicies[key] = e.target.value;
                                  setSyllabusData({
                                    ...syllabusData,
                                    policies: newPolicies,
                                  });
                                }}
                                className="min-h-[100px] mt-2"
                              />
                            </div>
                          )
                        )}
                        <Button
                          variant="outline"
                          onClick={() => {
                            const newPolicies = { ...syllabusData.policies };
                            newPolicies.newPolicy =
                              "Enter policy details here.";
                            setSyllabusData({
                              ...syllabusData,
                              policies: newPolicies,
                            });
                          }}
                        >
                          Add Policy
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
              <CardFooter className="flex justify-end">
                <div className="flex space-x-2">
                  <Button
                    variant="default"
                    onClick={async () => {
                      const course = mapCourse(syllabusData, courseData);
                      console.log(course, "course");
                      await coursesApi.updateCourse(course);
                      navigate(`/dashboard/courses/${courseData._id}`);
                    }}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                </div>
        
              </CardFooter>
            </Card>
          )}
    </div>
  );
};

export default EditSyllabus;

