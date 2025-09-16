import { MedicationSchedule } from "@/types/prescription";

export interface Notification {
  id: string;
  type: "medication" | "alert" | "info" | "success";
  title: string;
  message: string;
  time: string;
  timestamp: number;
  urgent: boolean;
  userId?: string;
  forFamily?: boolean;
}

export class NotificationService {
  private static instance: NotificationService;
  private checkInterval: NodeJS.Timeout | null = null;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  startMedicationReminders(): void {
    // Check every minute for medication times
    this.checkInterval = setInterval(() => {
      this.checkMedicationTimes();
    }, 60000);

    // Initial check
    this.checkMedicationTimes();
  }

  stopMedicationReminders(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  private checkMedicationTimes(): void {
    const settings = this.getNotificationSettings();
    if (!settings.enabled) return;

    const schedules = this.getMedicationSchedules();
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

    schedules.forEach(schedule => {
      if (!schedule.taken && schedule.scheduledTime === currentTime) {
        this.createMedicationNotification(schedule, settings.notifyFamily);
      }
    });
  }

  private createMedicationNotification(schedule: MedicationSchedule, notifyFamily: boolean): void {
    const notification: Notification = {
      id: `med-${Date.now()}-${schedule.id}`,
      type: "medication",
      title: "Medication Reminder",
      message: `Time to take ${schedule.medicationName} (${schedule.dosage})`,
      time: "now",
      timestamp: Date.now(),
      urgent: true,
    };

    // Add notification for current user
    this.addNotification(notification);

    // Add notification for family members if enabled
    if (notifyFamily) {
      const familyNotification: Notification = {
        ...notification,
        id: `family-${notification.id}`,
        title: "Family Medication Reminder",
        message: `Reminder: It's time for your family member to take ${schedule.medicationName}`,
        forFamily: true,
      };
      this.addNotification(familyNotification);
    }
  }

  addNotification(notification: Notification): void {
    const notifications = this.getNotifications();
    notifications.unshift(notification);
    
    // Keep only last 50 notifications
    const trimmed = notifications.slice(0, 50);
    localStorage.setItem('healthNotifications', JSON.stringify(trimmed));
  }

  getNotifications(): Notification[] {
    try {
      const stored = localStorage.getItem('healthNotifications');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading notifications:', error);
      return [];
    }
  }

  markAsRead(notificationId: string): void {
    const notifications = this.getNotifications();
    const filtered = notifications.filter(n => n.id !== notificationId);
    localStorage.setItem('healthNotifications', JSON.stringify(filtered));
  }

  markAllAsRead(): void {
    localStorage.setItem('healthNotifications', JSON.stringify([]));
  }

  private getMedicationSchedules(): MedicationSchedule[] {
    try {
      const stored = localStorage.getItem('medicationSchedule');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      return [];
    }
  }

  private getNotificationSettings() {
    try {
      const settings = localStorage.getItem('notificationSettings');
      return settings ? JSON.parse(settings) : { enabled: false, notifyFamily: false };
    } catch (error) {
      return { enabled: false, notifyFamily: false };
    }
  }

  getTimeAgo(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "now";
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
}

export const notificationService = NotificationService.getInstance();
