import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardFooter, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SendHorizontal, Sparkles, Info } from "lucide-react";
import { chatWithAssistant, type AiAssistantMessage } from "@/lib/openai";
import { useToast } from "@/hooks/use-toast";

interface AiAssistantProps {
  jobId?: number;
}

export default function AiAssistant({ jobId }: AiAssistantProps) {
  const { toast } = useToast();
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<AiAssistantMessage[]>([
    {
      role: "system",
      content: "I'm your AI hiring assistant. I can help analyze candidates, generate insights, and recommend actions. What would you like to know about your applicant pool?"
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage: AiAssistantMessage = {
      role: "user",
      content: inputMessage
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await chatWithAssistant([...messages, userMessage], jobId);
      
      const assistantMessage: AiAssistantMessage = {
        role: "assistant",
        content: response.response
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get response from AI assistant. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="overflow-hidden h-full">
      <CardHeader className="bg-primary-700 text-white py-4">
        <div className="flex items-center">
          <Sparkles className="h-6 w-6 mr-2" />
          <CardTitle>AI Hiring Assistant</CardTitle>
        </div>
      </CardHeader>

      <ScrollArea className="h-[500px] p-4 border-b border-neutral-200" type="always">
        <div className="space-y-4">
          {messages.map((message, index) => (
            message.role !== "system" ? (
              <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div 
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === "user" 
                      ? "bg-primary-100 text-primary-800" 
                      : "bg-neutral-100 text-neutral-800"
                  }`}
                >
                  {message.content.split('\n').map((line, i) => (
                    <p key={i} className="text-sm">
                      {line}
                      {i < message.content.split('\n').length - 1 && <br />}
                    </p>
                  ))}
                </div>
              </div>
            ) : null
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <CardFooter className="p-4">
        <form onSubmit={handleSendMessage} className="w-full space-y-2">
          <div className="flex items-center">
            <Input
              type="text"
              placeholder="Ask a question about applicants..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              type="submit"
              className="ml-3"
              disabled={isLoading || !inputMessage.trim()}
            >
              <SendHorizontal className="h-5 w-5" />
              <span className="sr-only">Send</span>
            </Button>
          </div>
          <div className="flex items-center text-xs text-neutral-500">
            <Info className="h-3 w-3 mr-1" />
            Responses are generated using AI and may require human verification
          </div>
        </form>
      </CardFooter>
    </Card>
  );
}
