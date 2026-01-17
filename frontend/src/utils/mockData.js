// Mock data for testing the dashboard when API is not available

export const mockDashboardStats = {
  totalCollectedToday: 145000,
  totalCollectedTodayChange: 12, // percentage change vs yesterday
  outstandingBalance: 3200000,
  outstandingPercentage: 35,
  activeStudents: 842,
  smsSent: 1204,
  systemStatus: 'operational'
};

export const mockRecentTransactions = [
  {
    id: 'TXN-8842',
    studentName: 'Alice Wanjiku',
    admissionNumber: '4022',
    amount: 12000,
    source: 'MPESA',
    time: '10:42 AM',
    timestamp: new Date('2026-01-15T10:42:00'),
  },
  {
    id: 'TXN-8841',
    studentName: 'Brian Ochieng',
    admissionNumber: '3910',
    amount: 45000,
    source: 'BANK',
    time: '10:38 AM',
    timestamp: new Date('2026-01-15T10:38:00'),
  },
  {
    id: 'TXN-8840',
    studentName: 'Grace Kamau',
    admissionNumber: '4105',
    amount: 8500,
    source: 'MPESA',
    time: '10:15 AM',
    timestamp: new Date('2026-01-15T10:15:00'),
  },
  {
    id: 'TXN-8839',
    studentName: 'Daniel Kiprop',
    admissionNumber: '4055',
    amount: 2000,
    source: 'MPESA',
    time: '09:55 AM',
    timestamp: new Date('2026-01-15T09:55:00'),
  },
  {
    id: 'TXN-8838',
    studentName: 'Sarah Njoroge',
    admissionNumber: '3882',
    amount: 24000,
    source: 'BANK',
    time: '09:12 AM',
    timestamp: new Date('2026-01-15T09:12:00'),
  },
  {
    id: 'TXN-8837',
    studentName: 'Michael Mwangi',
    admissionNumber: '4120',
    amount: 15000,
    source: 'MPESA',
    time: '08:45 AM',
    timestamp: new Date('2026-01-15T08:45:00'),
  },
  {
    id: 'TXN-8836',
    studentName: 'Faith Achieng',
    admissionNumber: '3995',
    amount: 18500,
    source: 'MPESA',
    time: '08:30 AM',
    timestamp: new Date('2026-01-15T08:30:00'),
  },
  {
    id: 'TXN-8835',
    studentName: 'John Kariuki',
    admissionNumber: '4008',
    amount: 30000,
    source: 'BANK',
    time: '08:15 AM',
    timestamp: new Date('2026-01-15T08:15:00'),
  }
];

export const mockCollectionTrends = {
  totalRevenue: 4500000,
  weeks: [
    { label: 'Week 1', amount: 980000 },
    { label: 'Week 2', amount: 1200000 },
    { label: 'Week 3', amount: 1050000 },
    { label: 'Week 4', amount: 1270000 }
  ],
  dailyData: [
    { day: 1, amount: 145000 },
    { day: 2, amount: 162000 },
    { day: 3, amount: 138000 },
    { day: 4, amount: 175000 },
    { day: 5, amount: 152000 },
    { day: 6, amount: 98000 },
    { day: 7, amount: 110000 },
    { day: 8, amount: 185000 },
    { day: 9, amount: 195000 },
    { day: 10, amount: 142000 },
    { day: 11, amount: 168000 },
    { day: 12, amount: 155000 },
    { day: 13, amount: 102000 },
    { day: 14, amount: 88000 },
    { day: 15, amount: 192000 },
    { day: 16, amount: 178000 },
    { day: 17, amount: 165000 },
    { day: 18, amount: 182000 },
    { day: 19, amount: 148000 },
    { day: 20, amount: 125000 },
    { day: 21, amount: 95000 },
    { day: 22, amount: 205000 },
    { day: 23, amount: 198000 },
    { day: 24, amount: 172000 },
    { day: 25, amount: 188000 },
    { day: 26, amount: 165000 },
    { day: 27, amount: 110000 },
    { day: 28, amount: 105000 },
    { day: 29, amount: 215000 },
    { day: 30, amount: 225000 }
  ]
};

export const mockPaymentMethods = {
  mpesa: {
    percentage: 75,
    amount: 3375000,
    count: 634
  },
  bank: {
    percentage: 25,
    amount: 1125000,
    count: 208
  }
};

// Student avatars for display
export const mockStudentAvatars = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC8Ry5tBN6w6U-cd6_sWJYT8Z5Jcmosjh23Vi1pn9G-uO07IWU_ESJLPP1hKWDaBPqE2rUuwcclR6na9RcPMxhONZpK_cPuuxz68Ud7hSM3zEp0XRwiDibtJpy6V6ZNIk6Zn4WZ6HCAMcCSv-kCZa4WnhRFRaH9Tm2oAqfl4uhbiUhYEeul29M4cbw1RlrqCrLg-ytoMs0ofXaCHIxR2gtrR8LhWg5AXj8aZKGFtl6AfpUzn1_d-i7trjjeVzVLqb4o1IPRc2X4eYA',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCdVXIFXdomV4OS9LsSWB1gu5_-5daCA296-hI7__yKXBQYjt26v5pYjUgl0c5r-wdHO8nT5Za6Weqr8kCqBs0HsjDcmsAZWa2pb1jK7qw4Qw6MMhrU3M6-FmW2HIklyIOtG6tM3E5_qYB11XDQZucOmwfA149LuVIDyRarK-lyNXGVuu0wKtfF6_nT8tIFs5Zig8CX0fnK3oENs3KSLSVsfiU34Przj0BJnjx9wNJOZPdYVTZU4IylR--6d4aQ1uA6nDPszwHPm1Q',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCuWp_GHVYbqEfkQfQZJTrFsYHaKGLykI6E_01fa48VT0nEJDSEfSvngn-zthc_M6TfD67R8wBuRAF-w_JZpBxaLi7b_HsYlsu2uGBNKds33NkYxMc28sSlwINkmI7VTS8Of609UOLciR4EbnsHjtZ_G8jHSv8fjWrqmVpPsCWlVdL0Nj3Ecjdxbz-saqIM-G568YmjvqVY8VcjVHYjnDS8WINM3dozRR8VMtIFdaV0J1mCSGku3DzW2QnU1VNOebL5jgdietEplq4'
];
