export interface ClientData {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  invoiceAmount: number;
  paymentHistory: string;
  lastPaymentDate: string;
  sentimentScore: number;
  behaviorScore: number;
  socialMediaSignal: string;
  riskCategory: "Low" | "Medium" | "High";
  industry?: string;
  outstandingBalance?: number;
  lastContact?: string;
}

export const parseCSV = (csvText: string): ClientData[] => {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map((line, index) => {
    const values = line.split(',');
    const obj: any = {};
    
    headers.forEach((header, i) => {
      obj[header.trim()] = values[i]?.trim() || '';
    });

    return {
      id: obj.CustomerID || `client-${index}`,
      name: obj.Name || 'Unknown',
      email: obj.Email || '',
      phoneNumber: obj.PhoneNumber || '',
      invoiceAmount: parseFloat(obj.InvoiceAmount || '0'),
      paymentHistory: obj.PaymentHistory || 'Unknown',
      lastPaymentDate: obj.LastPaymentDate || '',
      sentimentScore: parseFloat(obj.SentimentScore || '0'),
      behaviorScore: parseFloat(obj.BehaviorScore || '0'),
      socialMediaSignal: obj.SocialMediaSignal || 'Neutral',
      riskCategory: obj.RiskCategory as "Low" | "Medium" | "High" || 'Low',
      industry: obj.Industry || 'General',
      outstandingBalance: parseFloat(obj.InvoiceAmount || '0'),
      lastContact: obj.LastPaymentDate || 'Unknown'
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