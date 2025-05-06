import { Loader2 } from "lucide-react";
import { Button } from "../../ui/button";
import { ChevronRight } from "lucide-react";
import { TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Tabs } from "../../ui/tabs";

import { GeneratedContent } from "@/utils/type";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ExtendedRubricItem,
  AssignmentFormData,
} from "./types";

const Generate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data, formData } =
    (location.state as
      | { data: GeneratedContent; formData: AssignmentFormData }
      | undefined) || {};

  // const outputs= ASSIGNMENT_TYPE_INFO[initialData?.type].outputs[0]

  const [activeTab, setActiveTab] = useState("questions");
  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          className="p-0 h-auto"
          onClick={() => navigate("/dashboard/create-assignment", { state: { formData } })}
        >
          <ChevronRight className="h-4 w-4 rotate-180" />
          Back
        </Button>
        <div className="h-1 w-1 rounded-full bg-muted-foreground" />
        <span className="text-muted-foreground">Generate Content</span>
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">{formData?.title}</h1>
        <p className="text-muted-foreground">{formData?.topic}</p>
      </div>

      {/* {isGenerating ? (
        <Card className="flex items-center justify-center py-12">
          <CardContent className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <h3 className="text-xl font-medium">Generating Content</h3>
            <p className="text-muted-foreground mt-2">
              Our AI is creating your{" "}
              {payload?.title.toLowerCase() || "assignment"} content...
            </p>
          </CardContent>
        </Card>
      ) : ( */}
      <div className="space-y-6">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList>
            {data.questions && data.questions.length > 0 && (
              <TabsTrigger value="questions">Questions</TabsTrigger>
            )}
            {data.instructions && data.instructions?.length > 0 && (
              <TabsTrigger value="instructions">Instructions</TabsTrigger>
            )}
            {data.rubric && data.rubric.length > 0 && (
              <TabsTrigger value="rubric">Rubric</TabsTrigger>
            )}
            {data.checklist && data.checklist.length > 0 && (
              <TabsTrigger value="checklist">Checklist</TabsTrigger>
            )}
            {data.participationCriteria &&
              data.participationCriteria.length > 0 && (
                <TabsTrigger value="participation_criteria">
                  Participation Criteria
                </TabsTrigger>
              )}

            {data.answerKey && data.answerKey.length > 0 && (
              <TabsTrigger value="answer_key">Answer Key</TabsTrigger>
            )}
          </TabsList>

          {data.questions && (
            <TabsContent value="questions" className="space-y-4">
              {/* {renderQuestionForm()} */}
              <div className="space-y-4">
                {Array.isArray(data?.questions) && data?.questions?.map((question, index) => (
                  <div key={question._id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">
                          Question {index + 1} ({question.points} points)
                        </h4>
                        <p className="mt-2">{question.question}</p>
                        {Array.isArray(question.options) &&
                          question.options.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {question.options.map((option, i) => (
                                <div
                                  key={i}
                                  className="flex items-center space-x-2"
                                >
                                  <span>{option}</span>
                                </div>
                              ))}
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          )}
          {data.instructions && (
            <TabsContent value="instructions" className="space-y-4">
              {/* {renderInstructionsForm()} */}
              <div className="space-y-4">
                {Array.isArray(data?.instructions) && data?.instructions?.map((section) => (
                  <div key={section._id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{section.title}</h4>
                        <p className="mt-2">{section.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          )}

          {data?.answerKey && data?.answerKey.length > 0 && (
            <TabsContent value="answer_key" className="space-y-4">
              <div className="space-y-4">
                {data?.answerKey?.map((item, index) => (
                  <div key={item.questionId} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">
                          Answer for Question {index + 1}
                        </h4>
                        {/* <p className="mt-2">{item.key}</p> */}
                        {item.value && (
                          <div className="mt-2">
                            <p>
                              {item.key}: {item.value}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          )}

          <TabsContent value="rubric" className="space-y-4">
              <div className="space-y-4">
                {Array.isArray(data?.rubric) && ((data?.rubric as unknown) as ExtendedRubricItem[])?.map((item) => (
                  <div key={item._id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">
                          {item.Criterion} ({item.Points} points)
                        </h4>
                        <p className="mt-2">{item.Description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          {data?.rubric && data?.rubric.length > 0 && (
            <TabsContent value="rubric" className="space-y-4">
              <div className="space-y-4">
                {Array.isArray(data?.rubric) && data?.rubric?.map((item) => (
                  <div key={item._id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">
                          {item.Criterion} ({item.Points} points)
                        </h4>
                        <p className="mt-2">{item.Description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          )}

          {data.checklist && (
            <TabsContent value="checklist" className="space-y-4">
              <div className="space-y-4">
                {Array.isArray(data?.checklist) &&
                  (
                    data?.checklist as unknown as {
                      item: string;
                      description: string;
                      _id: string;
                    }[]
                  )?.map((item) => (
                    <div key={item._id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{item.item}</h4>
                          <p className="mt-2">{item.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </TabsContent>
          )}

          {data.participationCriteria && (
            <TabsContent value="participation_criteria" className="space-y-4">
              <div className="space-y-4">
                {Array.isArray(data?.participationCriteria) &&
                  (
                    data?.participationCriteria as {
                      Criterion: string;
                      Points: number;
                      Description: string;
                      _id: string;
                    }[]
                  )?.map((item) => (
                    <div key={item._id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">
                            {item.Criterion} ({item.Points} )
                          </h4>
                          <p className="mt-2">{item.Description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>{" "}
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default Generate;
