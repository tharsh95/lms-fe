import { CardContent } from "../../ui/card";
import { Loader2 } from "lucide-react";
import { Button } from "../../ui/button";
import { ChevronRight } from "lucide-react";
import { Card } from "../../ui/card";
import { TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Tabs } from "../../ui/tabs";
import { Textarea } from "../../ui/textarea";
import { AnswerKeyItem } from "@/utils/type";
import { useAssignment } from "@/context/AssignmentContext";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

const Generate = () => {
  const navigate = useNavigate();
  const { 
    payload, 
    isGenerating, 
    generatedContent, 
    setGeneratedContent 
  } = useAssignment();

  const outputs = useMemo(
    () => payload?.questionType?.outputs || [],
    [payload?.questionType?.outputs]
  );
  const [activeTab, setActiveTab] = useState(outputs[0] || "");

  if (!generatedContent || Object.keys(generatedContent).length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Helper function to convert complex objects to strings
  const getContentAsString = (
    content: string | object | null | undefined
  ): string => {
    if (!content) return "";
    if (typeof content === "string") return content;
    return JSON.stringify(content, null, 2);
  };

  // Helper function to check if content contains HTML
  const containsHTML = (content: string): boolean => {
    return /<[a-z][\s\S]*>/i.test(content);
  };

  // Helper function to convert answer key to string
  const answerKeyToString = (answerKey: AnswerKeyItem[] | null): string => {
    if (!answerKey) return "";
    return answerKey
      .map((item) => `Question ${item.questionId}: ${item.key} - ${item.value}`)
      .join("\n");
  };

  // Render content based on whether it contains HTML
  const renderContent = (
    content: string | object | null | undefined,
    key: string
  ) => {
    const contentStr = getContentAsString(content);

    if (containsHTML(contentStr)) {
      return (
        <div
          className="min-h-[500px] p-4 border rounded-md overflow-auto prose prose-sm max-w-none
            prose-h1:text-4xl prose-h1:font-bold prose-h1:mb-6 prose-h1:text-primary prose-h1:border-b prose-h1:pb-2
            prose-h2:text-3xl prose-h2:font-semibold prose-h2:mb-4 prose-h2:text-primary/90 prose-h2:border-b prose-h2:pb-1
            prose-h3:text-2xl prose-h3:font-medium prose-h3:mb-3 prose-h3:text-primary/80
            prose-h4:text-xl prose-h4:font-medium prose-h4:mb-2 prose-h4:text-primary/70
            prose-h5:text-lg prose-h5:font-medium prose-h5:mb-2 prose-h5:text-primary/60
            prose-h6:text-base prose-h6:font-medium prose-h6:mb-2 prose-h6:text-primary/50
            prose-p:text-base prose-p:mb-3 prose-p:leading-relaxed
            prose-strong:font-bold prose-strong:text-primary prose-strong:bg-primary/5 prose-strong:px-1 prose-strong:rounded
            prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-4
            prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-4
            prose-li:mb-1
            prose-a:text-primary prose-a:underline
            prose-blockquote:border-l-4 prose-blockquote:border-primary/50 prose-blockquote:pl-4 prose-blockquote:italic
            prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
            prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-md prose-pre:overflow-auto
            prose-table:border-collapse prose-table:w-full prose-table:mb-4
            prose-th:border prose-th:border-border prose-th:p-2 prose-th:bg-muted
            prose-td:border prose-td:border-border prose-td:p-2
            prose-img:rounded-md prose-img:my-4
            prose-hr:border-border prose-hr:my-6"
          dangerouslySetInnerHTML={{ __html: contentStr }}
        />
      );
    }

    return (
      <Textarea
        value={contentStr}
        onChange={(e) =>
          setGeneratedContent({
            ...generatedContent,
            [key]: e.target.value,
          })
        }
        className="min-h-[500px] font-mono"
      />
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          className="p-0 h-auto"
          onClick={() => navigate("/dashboard/create-assignment")}
        >
          <ChevronRight className="h-4 w-4 rotate-180" />
          Back
        </Button>
        <div className="h-1 w-1 rounded-full bg-muted-foreground" />
        <span className="text-muted-foreground">Generate Content</span>
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">{payload?.title}</h1>
        <p className="text-muted-foreground">{payload?.topic}</p>
      </div>

      {isGenerating ? (
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
      ) : (
        <div className="space-y-6">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-4"
          >
            <TabsList>
              {outputs.includes("instructions") && (
                <TabsTrigger value="instructions">Instructions</TabsTrigger>
              )}
              {outputs.includes("rubric") && (
                <TabsTrigger value="rubric">Rubric</TabsTrigger>
              )}
              {outputs.includes("questions") && (
                <TabsTrigger value="questions">Questions</TabsTrigger>
              )}
              {outputs.includes("answer_key") && (
                <TabsTrigger value="answer_key">Answer Key</TabsTrigger>
              )}
              {outputs.includes("checklist") && (
                <TabsTrigger value="checklist">Checklist</TabsTrigger>
              )}
              {outputs.includes("participation_criteria") && (
                <TabsTrigger value="participation_criteria">
                  Participation Criteria
                </TabsTrigger>
              )}
              {outputs.includes("peer_evaluation") && (
                <TabsTrigger value="peer_evaluation">
                  Peer Evaluation
                </TabsTrigger>
              )}
            </TabsList>

            {outputs.includes("instructions") && (
              <TabsContent value="instructions" className="space-y-4">
                {renderContent(generatedContent.instructions, "instructions")}
              </TabsContent>
            )}

            {outputs.includes("rubric") && (
              <TabsContent value="rubric" className="space-y-4">
                {renderContent(generatedContent.rubric, "rubric")}
              </TabsContent>
            )}

            {outputs.includes("questions") && (
              <TabsContent value="questions" className="space-y-4">
                {renderContent(generatedContent.questions, "questions")}
              </TabsContent>
            )}

            {outputs.includes("answer_key") && (
              <TabsContent value="answer_key" className="space-y-4">
                <Textarea
                  value={answerKeyToString(generatedContent.answerKey || null)}
                  onChange={(e) => {
                    // Parse the string into AnswerKeyItem[] format
                    const lines = e.target.value.split("\n");
                    const parsedAnswerKey: AnswerKeyItem[] = lines
                      .filter((line) => line.trim())
                      .map((line) => {
                        const match = line.match(/Question (\d+): (.+) - (.+)/);
                        if (match) {
                          return {
                            questionId: match[1],
                            key: match[2],
                            value: match[3],
                          };
                        }
                        return null;
                      })
                      .filter(Boolean) as AnswerKeyItem[];

                    setGeneratedContent({
                      ...generatedContent,
                      answerKey: parsedAnswerKey,
                    });
                  }}
                  className="min-h-[500px] font-mono"
                />
              </TabsContent>
            )}

            {outputs.includes("checklist") && (
              <TabsContent value="checklist" className="space-y-4">
                {renderContent(generatedContent.checklist, "checklist")}
              </TabsContent>
            )}

            {outputs.includes("participation_criteria") && (
              <TabsContent value="participation_criteria" className="space-y-4">
                {renderContent(
                  generatedContent.participation_criteria,
                  "participation_criteria"
                )}
              </TabsContent>
            )}

            {outputs.includes("peer_evaluation") && (
              <TabsContent value="peer_evaluation" className="space-y-4">
                {renderContent(
                  generatedContent.peer_evaluation,
                  "peer_evaluation"
                )}
              </TabsContent>
            )}
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default Generate;
