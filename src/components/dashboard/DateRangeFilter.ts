
// Type definition for date range selection
export type DateRangeType = 'daily' | 'weekly' | 'monthly' | 'custom';

// Type for custom date range picker
export interface DateRangeValue {
  from: Date | undefined;
  to: Date | undefined;
}
