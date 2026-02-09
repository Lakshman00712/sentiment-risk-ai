import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, User, Loader2 } from "lucide-react";
import { ClientData } from "@/utils/csvParser";
import { filterClientsForQuery } from "@/utils/clientDataFilter";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatInterfaceProps {
  clientData: ClientData[];
}

const ChatInterface = ({ clientData }: ChatInterfaceProps) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hi! I'm your AI credit risk assistant. I can help you analyze your ${clientData.length} client records, answer questions about risk patterns, payment behaviors, and provide insights. What would you like to know?`
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const generateDataSummary = (userQuery: string): string => {
    const highRisk = clientData.filter(c => c.riskCategory === "High");
    const mediumRisk = clientData.filter(c => c.riskCategory === "Medium");
    const lowRisk = clientData.filter(c => c.riskCategory === "Low");
    
    const totalAR = clientData.reduce((sum, c) => sum + c.invoiceAmount, 0);
    const avgRiskScore = clientData.length > 0 
      ? Math.round(clientData.reduce((sum, c) => sum + c.riskScore, 0) / clientData.length) 
      : 0;
    
    const overdue90 = clientData.filter(c => c.daysPastDue >= 90);
    const overdue60 = clientData.filter(c => c.daysPastDue >= 60 && c.daysPastDue < 90);
    const overdue30 = clientData.filter(c => c.daysPastDue >= 30 && c.daysPastDue < 60);
    
    const highUtilization = clientData.filter(c => c.creditUtilization >= 85);

    // Smart pre-filtering: only send relevant clients based on the question
    const { clients: filteredClients, filterDescription } = filterClientsForQuery(userQuery, clientData);

    const clientDetails = filteredClients
      .map(c => 
        `ID: ${c.id} | Name: ${c.name} | Risk: ${c.riskCategory} (${c.riskScore}/100) | Invoice: $${c.invoiceAmount.toLocaleString()} | Days Overdue: ${c.daysPastDue} | Credit Used: $${c.creditUsed.toLocaleString()}/$${c.creditLimit.toLocaleString()} (${c.creditUtilization}%) | Reminders: ${c.remindersCount} | Avg Orders 60d: ${c.avgOrders60Days} | Rationale: ${c.riskRationale}`
      )
      .join("\n");

    return `
## Portfolio Summary (${clientData.length} total clients)
Total Accounts Receivable: $${totalAR.toLocaleString()}
Average Risk Score: ${avgRiskScore}/100

## Risk Distribution
- High Risk: ${highRisk.length} clients ($${highRisk.reduce((s, c) => s + c.invoiceAmount, 0).toLocaleString()} AR)
- Medium Risk: ${mediumRisk.length} clients ($${mediumRisk.reduce((s, c) => s + c.invoiceAmount, 0).toLocaleString()} AR)
- Low Risk: ${lowRisk.length} clients ($${lowRisk.reduce((s, c) => s + c.invoiceAmount, 0).toLocaleString()} AR)

## Overdue Analysis
- 90+ days overdue: ${overdue90.length} clients ($${overdue90.reduce((s, c) => s + c.invoiceAmount, 0).toLocaleString()})
- 60-89 days overdue: ${overdue60.length} clients ($${overdue60.reduce((s, c) => s + c.invoiceAmount, 0).toLocaleString()})
- 30-59 days overdue: ${overdue30.length} clients ($${overdue30.reduce((s, c) => s + c.invoiceAmount, 0).toLocaleString()})

## Credit Utilization
- Clients with 85%+ utilization: ${highUtilization.length}

## Filtered Client Records
Filter: ${filterDescription}
${clientDetails}
`;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    let assistantContent = "";

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/credit-risk-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: [...messages, userMessage].map(m => ({
              role: m.role,
              content: m.content
            })),
            dataSummary: generateDataSummary(input),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get response");
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => 
                    i === prev.length - 1 ? { ...m, content: assistantContent } : m
                  );
                }
                return [...prev, { role: "assistant", content: assistantContent }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => 
                    i === prev.length - 1 ? { ...m, content: assistantContent } : m
                  );
                }
                return [...prev, { role: "assistant", content: assistantContent }];
              });
            }
          } catch { /* ignore partial leftovers */ }
        }
      }

    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get AI response",
        variant: "destructive",
      });
      // Remove the loading state but keep user message
    } finally {
      setIsLoading(false);
    }
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
          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <div className="flex gap-3 justify-start">
              <div className="h-8 w-8 rounded-full bg-gradient-orange flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <Card className="p-4 bg-muted/50">
                <Loader2 className="h-4 w-4 animate-spin" />
              </Card>
            </div>
          )}
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
            disabled={isLoading}
          />
          <Button onClick={handleSend} disabled={!input.trim() || isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Powered by AI • Press Enter to send
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;
