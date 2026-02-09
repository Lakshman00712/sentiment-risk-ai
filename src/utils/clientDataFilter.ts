import { ClientData } from "./csvParser";

const MAX_RECORDS = 200;

interface FilterResult {
  clients: ClientData[];
  filterDescription: string;
  totalMatched: number;
  wasTruncated: boolean;
}

/**
 * Analyze user's question and return only relevant client records.
 * Keeps AI context small even with 2,000+ clients.
 */
export const filterClientsForQuery = (
  query: string,
  allClients: ClientData[]
): FilterResult => {
  const q = query.toLowerCase();

  // Try to match a specific client by name or ID
  const nameMatch = allClients.filter(
    (c) =>
      q.includes(c.name.toLowerCase()) ||
      q.includes(c.id.toLowerCase())
  );
  if (nameMatch.length > 0 && nameMatch.length <= 20) {
    return {
      clients: nameMatch,
      filterDescription: `Showing ${nameMatch.length} client(s) matching the name/ID in the question.`,
      totalMatched: nameMatch.length,
      wasTruncated: false,
    };
  }

  // Risk-category filters
  if (/\bhigh[\s-]?risk\b/.test(q)) {
    return buildResult(allClients.filter((c) => c.riskCategory === "High"), "High Risk");
  }
  if (/\bmedium[\s-]?risk\b/.test(q)) {
    return buildResult(allClients.filter((c) => c.riskCategory === "Medium"), "Medium Risk");
  }
  if (/\blow[\s-]?risk\b/.test(q)) {
    return buildResult(allClients.filter((c) => c.riskCategory === "Low"), "Low Risk");
  }

  // Overdue filters
  if (/\b(overdue|past\s*due|late|delinquent)\b/.test(q)) {
    if (/\b90\b/.test(q)) {
      return buildResult(allClients.filter((c) => c.daysPastDue >= 90), "90+ days overdue");
    }
    if (/\b60\b/.test(q)) {
      return buildResult(allClients.filter((c) => c.daysPastDue >= 60), "60+ days overdue");
    }
    if (/\b30\b/.test(q)) {
      return buildResult(allClients.filter((c) => c.daysPastDue >= 30), "30+ days overdue");
    }
    return buildResult(allClients.filter((c) => c.daysPastDue > 0), "all overdue");
  }

  // Credit utilization filters
  if (/\b(utilization|credit\s*us|maxed|over[\s-]?limit)\b/.test(q)) {
    return buildResult(
      allClients.filter((c) => c.creditUtilization >= 70),
      "credit utilization ≥ 70%"
    );
  }

  // Top / worst / highest risk
  if (/\b(top|worst|highest|riskiest)\b/.test(q)) {
    const count = extractNumber(q) || 10;
    const sorted = [...allClients].sort((a, b) => b.riskScore - a.riskScore);
    return {
      clients: sorted.slice(0, count),
      filterDescription: `Top ${count} highest-risk clients.`,
      totalMatched: count,
      wasTruncated: false,
    };
  }

  // Best / lowest / safest
  if (/\b(best|lowest|safest|healthiest)\b/.test(q)) {
    const count = extractNumber(q) || 10;
    const sorted = [...allClients].sort((a, b) => a.riskScore - b.riskScore);
    return {
      clients: sorted.slice(0, count),
      filterDescription: `Top ${count} lowest-risk clients.`,
      totalMatched: count,
      wasTruncated: false,
    };
  }

  // Reminders
  if (/\breminder/i.test(q)) {
    return buildResult(
      allClients.filter((c) => c.remindersCount >= 2),
      "clients with 2+ reminders"
    );
  }

  // Default: send summary + top risk clients capped at MAX_RECORDS
  const sorted = [...allClients].sort((a, b) => b.riskScore - a.riskScore);
  const capped = sorted.slice(0, MAX_RECORDS);
  return {
    clients: capped,
    filterDescription:
      allClients.length > MAX_RECORDS
        ? `Showing top ${MAX_RECORDS} highest-risk clients out of ${allClients.length} total (sorted by risk). Ask about a specific risk category, client name, or overdue range to see targeted results.`
        : `All ${allClients.length} clients included.`,
    totalMatched: capped.length,
    wasTruncated: allClients.length > MAX_RECORDS,
  };
};

function buildResult(filtered: ClientData[], label: string): FilterResult {
  const sorted = [...filtered].sort((a, b) => b.riskScore - a.riskScore);
  const truncated = sorted.length > MAX_RECORDS;
  return {
    clients: sorted.slice(0, MAX_RECORDS),
    filterDescription: truncated
      ? `Showing top ${MAX_RECORDS} of ${sorted.length} ${label} clients (sorted by risk score).`
      : `All ${sorted.length} ${label} client(s).`,
    totalMatched: sorted.length,
    wasTruncated: truncated,
  };
}

function extractNumber(text: string): number | null {
  const match = text.match(/\b(\d+)\b/);
  return match ? parseInt(match[1], 10) : null;
}
