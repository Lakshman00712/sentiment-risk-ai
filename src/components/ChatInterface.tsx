import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, User } from "lucide-react";
import { ClientData } from "@/utils/csvParser";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatInterfaceProps {
  clientData: ClientData[];
}

const ChatInterface = ({ clientData }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hi! I'm your AI credit risk assistant. I can help you analyze your ${clientData.length} client records, answer questions about risk patterns, payment behaviors, and provide insights. What would you like to know?`
    }
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    
    // Simulate AI response based on data
    setTimeout(() => {
      const response = generateResponse(input, clientData);
      setMessages(prev => [...prev, { role: "assistant", content: response }]);
    }, 500);

    setInput("");
  };

  const generateResponse = (query: string, data: ClientData[]): string => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes("high risk") || lowerQuery.includes("risky")) {
      const highRisk = data.filter(c => c.riskCategory === "High");
      return `You have ${highRisk.length} high-risk clients with a total AR value of $${highRisk.reduce((sum, c) => sum + c.invoiceAmount, 0).toLocaleString()}. I recommend reviewing these accounts for immediate follow-up.`;
    }
    
    if (lowerQuery.includes("sentiment") || lowerQuery.includes("negative")) {
      const negSentiment = data.filter(c => c.sentimentScore < -0.3);
      return `${negSentiment.length} clients show negative sentiment patterns. This could indicate dissatisfaction or potential payment issues. Would you like me to show you the details?`;
    }
    
    if (lowerQuery.includes("total") || lowerQuery.includes("ar")) {
      const total = data.reduce((sum, c) => sum + c.invoiceAmount, 0);
      return `Your total accounts receivable is $${total.toLocaleString()} across ${data.length} clients. The average invoice amount is $${(total / data.length).toLocaleString()}.`;
    }
    
    if (lowerQuery.includes("late") || lowerQuery.includes("overdue")) {
      const late = data.filter(c => c.paymentHistory === "Late");
      return `${late.length} clients have late payment history. This represents $${late.reduce((sum, c) => sum + c.invoiceAmount, 0).toLocaleString()} in potential risk.`;
    }
    
    return "I can help you analyze risk patterns, payment behaviors, sentiment analysis, and more. Try asking about high-risk clients, sentiment trends, or specific metrics you'd like to explore.";
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      <ScrollArea className="flex-1 p-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="h-8 w-8 rounded-full bg-gradient-orange flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              )}
              <Card className={`p-4 max-w-[80%] ${msg.role === "user" ? "bg-orange/10 border-orange/20" : "bg-muted/50"}`}>
                <p className="text-sm leading-relaxed">{msg.content}</p>
              </Card>
              {msg.role === "user" && (
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="border-t bg-background p-4">
        <div className="max-w-3xl mx-auto flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Ask about your data, risk patterns, or specific insights..."
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={!input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;
