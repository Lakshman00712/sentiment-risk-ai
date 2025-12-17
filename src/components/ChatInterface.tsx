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
      const totalAR = highRisk.reduce((sum, c) => sum + c.invoiceAmount, 0);
      const avgScore = highRisk.length > 0 ? Math.round(highRisk.reduce((sum, c) => sum + c.riskScore, 0) / highRisk.length) : 0;
      return `You have ${highRisk.length} high-risk clients with a total AR value of $${totalAR.toLocaleString()}. Their average risk score is ${avgScore}/100. I recommend reviewing these accounts for immediate follow-up.`;
    }
    
    if (lowerQuery.includes("overdue") || lowerQuery.includes("past due") || lowerQuery.includes("days past")) {
      const overdue90 = data.filter(c => c.daysPastDue >= 90);
      const overdue60 = data.filter(c => c.daysPastDue >= 60 && c.daysPastDue < 90);
      const overdue30 = data.filter(c => c.daysPastDue >= 30 && c.daysPastDue < 60);
      return `Payment status breakdown:\n• 90+ days overdue: ${overdue90.length} clients ($${overdue90.reduce((s, c) => s + c.invoiceAmount, 0).toLocaleString()})\n• 60-89 days: ${overdue60.length} clients\n• 30-59 days: ${overdue30.length} clients\n\nThe 90+ days overdue accounts need immediate attention.`;
    }
    
    if (lowerQuery.includes("credit") || lowerQuery.includes("utilization")) {
      const highUtil = data.filter(c => c.creditUtilization >= 85);
      return `${highUtil.length} clients have credit utilization above 85%, which is a significant risk factor. Their total outstanding is $${highUtil.reduce((s, c) => s + c.invoiceAmount, 0).toLocaleString()}.`;
    }
    
    if (lowerQuery.includes("total") || lowerQuery.includes("ar") || lowerQuery.includes("receivable")) {
      const total = data.reduce((sum, c) => sum + c.invoiceAmount, 0);
      const avgScore = Math.round(data.reduce((sum, c) => sum + c.riskScore, 0) / data.length);
      return `Your total accounts receivable is $${total.toLocaleString()} across ${data.length} clients. The average risk score is ${avgScore}/100.`;
    }
    
    if (lowerQuery.includes("reminder") || lowerQuery.includes("reminders")) {
      const highReminders = data.filter(c => c.remindersCount >= 3);
      return `${highReminders.length} clients have received 3 or more payment reminders, indicating potential payment issues. Consider escalating collection efforts for these accounts.`;
    }

    if (lowerQuery.includes("order") || lowerQuery.includes("orders") || lowerQuery.includes("frequency")) {
      const lowOrders = data.filter(c => c.avgOrders60Days < 5);
      return `${lowOrders.length} clients have low order frequency (less than 5 orders in 60 days), which may indicate reduced business activity or potential churn risk.`;
    }

    if (lowerQuery.includes("why") && (lowerQuery.includes("risk") || lowerQuery.includes("score"))) {
      return `Risk scores are calculated using a weighted formula:\n• Days Past Due (50%): 0-90 days normalized\n• Credit Utilization (25%): 0-85% normalized\n• Reminders Count (15%): 0-3 normalized\n• Avg Orders 60 Days (10%): Lower orders = higher risk\n\nThresholds: High Risk ≥ 65, Medium 35-64, Low < 35`;
    }
    
    return "I can help you analyze risk patterns, overdue payments, credit utilization, and more. Try asking about high-risk clients, overdue accounts, credit utilization, or why clients have specific risk scores.";
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
                <p className="text-sm leading-relaxed whitespace-pre-line">{msg.content}</p>
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
            placeholder="Ask about risk scores, overdue accounts, credit utilization..."
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
