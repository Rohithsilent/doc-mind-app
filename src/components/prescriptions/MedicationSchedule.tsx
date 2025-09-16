import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Calendar, Clock, Pill, Check, Bell, Users } from "lucide-react";
import { MedicationSchedule as ScheduleType, PrescriptionData } from "@/types/prescription";
import { useToast } from "@/components/ui/use-toast";

export function MedicationSchedule() {
  const [schedules, setSchedules] = useState<ScheduleType[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [familyNotifications, setFamilyNotifications] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    generateScheduleFromPrescriptions();
    loadNotificationSettings();
  }, []);

  const generateScheduleFromPrescriptions = () => {
    try {
      const prescriptions: PrescriptionData[] = JSON.parse(localStorage.getItem('prescriptions') || '[]');
      const newSchedules: ScheduleType[] = [];

      prescriptions.forEach(prescription => {
        prescription.medications.forEach(medication => {
          medication.times.forEach(time => {
            newSchedules.push({
              id: `${prescription.id}-${medication.name}-${time}`,
              medicationName: medication.name,
              dosage: medication.dosage,
              scheduledTime: time,
              taken: false,
              notes: medication.notes,
            });
          });
        });
      });

      setSchedules(newSchedules);
    } catch (error) {
      console.error('Error generating schedule:', error);
    }
  };

  const loadNotificationSettings = () => {
    const settings = localStorage.getItem('notificationSettings');
    if (settings) {
      const parsed = JSON.parse(settings);
      setNotificationsEnabled(parsed.enabled || false);
      setFamilyNotifications(parsed.notifyFamily || false);
    }
  };

  const saveNotificationSettings = (enabled: boolean, notifyFamily: boolean) => {
    const settings = {
      enabled,
      notifyFamily,
      reminderMinutes: 15,
    };
    localStorage.setItem('notificationSettings', JSON.stringify(settings));
  };

  const markAsTaken = (scheduleId: string) => {
    const updated = schedules.map(schedule => 
      schedule.id === scheduleId 
        ? { ...schedule, taken: true, takenAt: new Date().toISOString() }
        : schedule
    );
    setSchedules(updated);
    
    // Save to localStorage
    localStorage.setItem('medicationSchedule', JSON.stringify(updated));
    
    toast({
      title: "Medication taken",
      description: "Marked as taken successfully",
    });

    // TODO: Send notification to family members when Supabase is integrated
    if (familyNotifications) {
      console.log('Would notify family members about medication taken');
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        saveNotificationSettings(true, familyNotifications);
        
        toast({
          title: "Notifications enabled",
          description: "You'll receive medication reminders",
        });
      } else {
        toast({
          title: "Notifications denied",
          description: "Please enable notifications in your browser settings",
          variant: "destructive",
        });
      }
    }
  };

  const toggleNotifications = async (enabled: boolean) => {
    if (enabled) {
      await requestNotificationPermission();
    } else {
      setNotificationsEnabled(false);
      saveNotificationSettings(false, familyNotifications);
    }
  };

  const toggleFamilyNotifications = (enabled: boolean) => {
    setFamilyNotifications(enabled);
    saveNotificationSettings(notificationsEnabled, enabled);
  };

  // Group schedules by time
  const groupedSchedules = schedules.reduce((acc, schedule) => {
    const time = schedule.scheduledTime;
    if (!acc[time]) {
      acc[time] = [];
    }
    acc[time].push(schedule);
    return acc;
  }, {} as Record<string, ScheduleType[]>);

  // Sort times
  const sortedTimes = Object.keys(groupedSchedules).sort((a, b) => {
    const timeA = new Date(`2000-01-01 ${a}`);
    const timeB = new Date(`2000-01-01 ${b}`);
    return timeA.getTime() - timeB.getTime();
  });

  return (
    <div className="space-y-6">
      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium">Medication Reminders</p>
              <p className="text-sm text-muted-foreground">
                Get notified when it's time to take your medication
              </p>
            </div>
            <Switch
              checked={notificationsEnabled}
              onCheckedChange={toggleNotifications}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium">Notify Family Members</p>
              <p className="text-sm text-muted-foreground">
                Send notifications to linked family members
              </p>
            </div>
            <Switch
              checked={familyNotifications}
              onCheckedChange={toggleFamilyNotifications}
              disabled={!notificationsEnabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Today's Medication Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedTimes.length > 0 ? (
            <div className="space-y-6">
              {sortedTimes.map((time, index) => (
                <motion.div
                  key={time}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-3 pb-2 border-b">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-lg">{time}</span>
                  </div>
                  
                  <div className="space-y-2 ml-7">
                    {groupedSchedules[time].map((schedule) => (
                      <div
                        key={schedule.id}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          schedule.taken ? 'bg-success/10 border-success/20' : 'bg-background'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Pill className={`h-4 w-4 ${schedule.taken ? 'text-success' : 'text-primary'}`} />
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{schedule.medicationName}</span>
                              <Badge variant="secondary" className="text-xs">
                                {schedule.dosage}
                              </Badge>
                            </div>
                            {schedule.notes && (
                              <p className="text-xs text-muted-foreground">
                                {schedule.notes}
                              </p>
                            )}
                            {schedule.taken && schedule.takenAt && (
                              <p className="text-xs text-success">
                                Taken at {new Date(schedule.takenAt).toLocaleTimeString()}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {!schedule.taken ? (
                          <Button
                            size="sm"
                            onClick={() => markAsTaken(schedule.id)}
                            className="gap-2"
                          >
                            <Check className="h-3 w-3" />
                            Mark as Taken
                          </Button>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <Check className="h-3 w-3" />
                            Taken
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">No medications scheduled</h3>
              <p className="text-muted-foreground">
                Upload a prescription to automatically generate your medication schedule.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}