export interface DailyRevenue {
  date: string;
  totalAmount: number;
}

export interface PharmacyFinancialStats {
  totalRevenueLast30Days: number;
  dailyBreakdown: DailyRevenue[];
}
