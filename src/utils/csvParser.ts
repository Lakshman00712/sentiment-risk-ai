export interface ClientData {
  // Input fields (11 columns from CSV)
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  invoiceAmount: number;
  invoiceDate: string;
  dueDate: string;
  paymentDate: string;
  avgOrders60Days: number;
  remindersCount: number;
  creditLimit: number;
  creditUsed: number;
  
  // Calculated fields
  daysPastDue: number;
  creditUtilization: number;
  riskScore: number;
  riskCategory: "Low" | "Medium" | "High";
  riskRationale: string;
}

// Normalization ranges
const NORMALIZATION = {
  daysPastDue: { min: 0, max: 90 },      // 0-90 days, capped at 90
  avgOrders60Days: { min: 5, max: 20 },   // <5 = max risk, >20 = min risk
  remindersCount: { min: 0, max: 3 },     // 0-3, capped at 3
  creditUtilization: { min: 0, max: 85 }, // 0-85%, capped at 85
};

// Weights for risk calculation
const WEIGHTS = {
  daysPastDue: 0.50,       // 50%
  creditUtilization: 0.25, // 25%
  remindersCount: 0.15,    // 15%
  avgOrders60Days: 0.10,   // 10%
};

// Risk category thresholds
const RISK_THRESHOLDS = {
  high: 65,
  medium: 35,
};

/**
 * Normalize a value to 0-100 scale with capping
 */
const normalizeScore = (value: number, min: number, max: number, inverse: boolean = false): number => {
  // Cap the value
  const cappedValue = Math.max(min, Math.min(value, max));
  
  // Normalize to 0-100
  let normalized = ((cappedValue - min) / (max - min)) * 100;
  
  // If inverse (lower value = higher risk), flip the score
  if (inverse) {
    normalized = 100 - normalized;
  }
  
  return Math.round(normalized);
};

/**
 * Calculate days past due
 */
const calculateDaysPastDue = (dueDate: string, paymentDate: string): number => {
  const due = new Date(dueDate);
  const today = new Date();
  
  // If payment date is empty/invalid, use today
  const payment = paymentDate && paymentDate.trim() !== "" ? new Date(paymentDate) : today;
  
  // Calculate difference in days
  const diffTime = payment.getTime() - due.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Negative means paid early (treat as 0 risk)
  return Math.max(0, diffDays);
};

/**
 * Calculate credit utilization percentage
 */
const calculateCreditUtilization = (creditUsed: number, creditLimit: number): number => {
  if (creditLimit <= 0) return 100; // No credit limit = max risk
  return Math.round((creditUsed / creditLimit) * 100);
};

/**
 * Calculate weighted risk score (0-100)
 */
const calculateRiskScore = (
  daysPastDue: number,
  creditUtilization: number,
  remindersCount: number,
  avgOrders60Days: number
): number => {
  const dpd = normalizeScore(daysPastDue, NORMALIZATION.daysPastDue.min, NORMALIZATION.daysPastDue.max);
  const cu = normalizeScore(creditUtilization, NORMALIZATION.creditUtilization.min, NORMALIZATION.creditUtilization.max);
  const rc = normalizeScore(remindersCount, NORMALIZATION.remindersCount.min, NORMALIZATION.remindersCount.max);
  const ao = normalizeScore(avgOrders60Days, NORMALIZATION.avgOrders60Days.min, NORMALIZATION.avgOrders60Days.max, true); // Inverse
  
  const score = (dpd * WEIGHTS.daysPastDue) + 
                (cu * WEIGHTS.creditUtilization) + 
                (rc * WEIGHTS.remindersCount) + 
                (ao * WEIGHTS.avgOrders60Days);
  
  return Math.round(score);
};

/**
 * Determine risk category based on score
 */
const getRiskCategory = (score: number): "Low" | "Medium" | "High" => {
  if (score >= RISK_THRESHOLDS.high) return "High";
  if (score >= RISK_THRESHOLDS.medium) return "Medium";
  return "Low";
};

/**
 * Generate human-readable risk rationale
 */
const generateRiskRationale = (
  daysPastDue: number,
  creditUtilization: number,
  remindersCount: number,
  avgOrders60Days: number,
  riskScore: number
): string => {
  const factors: string[] = [];
  
  // Days Past Due
  if (daysPastDue >= 90) {
    factors.push(`Severely overdue (${daysPastDue} days)`);
  } else if (daysPastDue >= 60) {
    factors.push(`Significantly overdue (${daysPastDue} days)`);
  } else if (daysPastDue >= 30) {
    factors.push(`Overdue by ${daysPastDue} days`);
  } else if (daysPastDue > 0) {
    factors.push(`Slightly overdue (${daysPastDue} days)`);
  }
  
  // Credit Utilization
  if (creditUtilization >= 85) {
    factors.push(`Very high credit utilization (${creditUtilization}%)`);
  } else if (creditUtilization >= 70) {
    factors.push(`High credit utilization (${creditUtilization}%)`);
  } else if (creditUtilization >= 50) {
    factors.push(`Moderate credit utilization (${creditUtilization}%)`);
  }
  
  // Reminders
  if (remindersCount >= 3) {
    factors.push(`Multiple payment reminders sent (${remindersCount})`);
  } else if (remindersCount >= 2) {
    factors.push(`${remindersCount} reminders sent`);
  }
  
  // Average Orders (lower = higher risk)
  if (avgOrders60Days < 5) {
    factors.push(`Very low order frequency (${avgOrders60Days.toFixed(1)} avg/60 days)`);
  } else if (avgOrders60Days < 10) {
    factors.push(`Below average order frequency (${avgOrders60Days.toFixed(1)} avg/60 days)`);
  }
  
  if (factors.length === 0) {
    return "Good standing - no significant risk factors identified.";
  }
  
  return factors.join(". ") + ".";
};

export const parseCSV = (csvText: string): ClientData[] => {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  return lines.slice(1).map((line, index) => {
    const values = line.split(',');
    const obj: Record<string, string> = {};
    
    headers.forEach((header, i) => {
      obj[header] = values[i]?.trim() || '';
    });

    // Parse input fields
    const invoiceAmount = parseFloat(obj.InvoiceAmount || '0');
    const invoiceDate = obj.InvoiceDate || '';
    const dueDate = obj.DueDate || '';
    const paymentDate = obj.PaymentDate || '';
    const avgOrders60Days = parseFloat(obj.AvgOrders60Days || '0');
    const remindersCount = parseInt(obj.RemindersCount || '0', 10);
    const creditLimit = parseFloat(obj.CreditLimit || '0');
    const creditUsed = parseFloat(obj.CreditUsed || '0');
    
    // Calculate derived fields
    const daysPastDue = calculateDaysPastDue(dueDate, paymentDate);
    const creditUtilization = calculateCreditUtilization(creditUsed, creditLimit);
    const riskScore = calculateRiskScore(daysPastDue, creditUtilization, remindersCount, avgOrders60Days);
    const riskCategory = getRiskCategory(riskScore);
    const riskRationale = generateRiskRationale(daysPastDue, creditUtilization, remindersCount, avgOrders60Days, riskScore);

    return {
      id: obj.CustomerID || `client-${index}`,
      name: obj.Name || 'Unknown',
      email: obj.Email || '',
      phoneNumber: obj.PhoneNumber || '',
      invoiceAmount,
      invoiceDate,
      dueDate,
      paymentDate,
      avgOrders60Days,
      remindersCount,
      creditLimit,
      creditUsed,
      daysPastDue,
      creditUtilization,
      riskScore,
      riskCategory,
      riskRationale,
    };
  });
};

export const fetchCSVFromURL = async (url: string): Promise<ClientData[]> => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch CSV');
    const csvText = await response.text();
    return parseCSV(csvText);
  } catch (error) {
    console.error('Error fetching CSV:', error);
    throw error;
  }
};

export const loadSampleData = async (): Promise<ClientData[]> => {
  try {
    const response = await fetch('/data/sample_data.csv');
    const csvText = await response.text();
    return parseCSV(csvText);
  } catch (error) {
    console.error('Error loading sample data:', error);
    return [];
  }
};
