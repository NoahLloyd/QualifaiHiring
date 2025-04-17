import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface SkillDistributionProps {
  jobId: number;
}

export default function SkillDistribution({ jobId }: SkillDistributionProps) {
  const { data, isLoading } = useQuery({
    queryKey: [`/api/jobs/${jobId}/skill-gap-analysis`],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Skill Gap Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i}>
                <div className="bg-neutral-200 h-4 w-32 mb-1 rounded animate-pulse" />
                <div className="bg-neutral-200 h-2 w-full rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || !data.skills) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Skill Gap Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-neutral-500">No skill data available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skill Gap Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-neutral-700 mb-3">Based on job requirements and current candidate pool:</p>
        <div className="space-y-3">
          {Object.entries(data.skills).map(([skill, percentage]: [string, any]) => (
            <div key={skill}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-neutral-600">{skill}</span>
                <span className="text-xs font-medium text-neutral-700">{percentage}% of candidates</span>
              </div>
              <Progress value={percentage} className="h-2" />
            </div>
          ))}
        </div>

        {data.recommendations && (
          <Alert className="mt-4 bg-yellow-50 border-yellow-100">
            <AlertTriangle className="h-4 w-4 text-yellow-800" />
            <AlertDescription className="text-sm text-yellow-800">
              <strong>Insight:</strong> {data.recommendations}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
