export interface IslamiyyaSessionInfo {
  dayName: string;
  dayIndex: number; // 0 = Sunday, 1 = Monday, ..., 4 = Thursday, 5 = Friday, 6 = Saturday
  isClassDay: boolean;
  scheduleText: string;
  startTime: string;
  endTime: string;
  isCurrentlyInSession: boolean;
}

export function getScheduleForDate(date: Date = new Date()): IslamiyyaSessionInfo {
  const dayIndex = date.getDay(); // 0 = Sunday, 4 = Thursday, 5 = Friday, 6 = Saturday
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const currentMinutes = hours * 60 + minutes;

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayName = dayNames[dayIndex];

  let isClassDay = false;
  let scheduleText = "No Islamiyya Session Scheduled Today";
  let startTime = "--:--";
  let endTime = "--:--";
  let isCurrentlyInSession = false;

  if (dayIndex === 4 || dayIndex === 5) {
    // Thursday (4) & Friday (5): 4:00 PM - 6:00 PM (16:00 - 18:00)
    isClassDay = true;
    scheduleText = "Thursday & Friday Session (4:00 PM – 6:00 PM)";
    startTime = "16:00";
    endTime = "18:00";
    const startMin = 16 * 60;
    const endMin = 18 * 60;
    isCurrentlyInSession = currentMinutes >= startMin && currentMinutes <= endMin;
  } else if (dayIndex === 6 || dayIndex === 0) {
    // Saturday (6) & Sunday (0): 8:30 AM - 1:00 PM (08:30 - 13:00)
    isClassDay = true;
    scheduleText = "Weekend Session (8:30 AM – 1:00 PM)";
    startTime = "08:30";
    endTime = "13:00";
    const startMin = 8 * 60 + 30;
    const endMin = 13 * 60;
    isCurrentlyInSession = currentMinutes >= startMin && currentMinutes <= endMin;
  }

  return {
    dayName,
    dayIndex,
    isClassDay,
    scheduleText,
    startTime,
    endTime,
    isCurrentlyInSession,
  };
}

export function formatSessionDate(date: Date = new Date()): string {
  return date.toISOString().split("T")[0];
}
