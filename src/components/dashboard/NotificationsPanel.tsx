import { Bell, AlertTriangle, Info, CheckCircle, Pill } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { notificationService, Notification } from "@/lib/notificationService";

export function NotificationsPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    loadNotifications();
    
    // Refresh notifications every minute
    const interval = setInterval(loadNotifications, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = () => {
    const allNotifications = notificationService.getNotifications();
    // Update time display
    const updated = allNotifications.map(n => ({
      ...n,
      time: notificationService.getTimeAgo(n.timestamp)
    }));
    setNotifications(updated);
  };

  const handleMarkAllRead = () => {
    notificationService.markAllAsRead();
    setNotifications([]);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "alert":
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "medication":
        return <Pill className="h-4 w-4 text-purple-600" />;
      default:
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getBadgeColor = (urgent: boolean, type: string) => {
    if (urgent) return "destructive";
    switch (type) {
      case "success":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      whileHover={{ scale: 1.02 }}
      className="transition-transform duration-200"
    >
      <Card className="bg-gradient-card shadow-card border-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bell className="h-5 w-5 text-primary" />
              Notifications
            </CardTitle>
            <Badge variant="secondary" className="bg-primary text-primary-foreground">
              {notifications.filter(n => n.urgent).length} urgent
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {notifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`
                p-3 rounded-lg transition-colors cursor-pointer
                ${notification.urgent 
                  ? 'bg-orange-50 border border-orange-200 hover:bg-orange-100' 
                  : 'bg-background/50 hover:bg-background/80'
                }
              `}
            >
              <div className="flex items-start gap-3">
                <div className="p-1 rounded-full bg-background">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm truncate">{notification.title}</h4>
                    <Badge 
                      variant={getBadgeColor(notification.urgent, notification.type)}
                      className="text-xs"
                    >
                      {notification.urgent ? "Urgent" : notification.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground">{notification.time}</p>
                </div>
              </div>
            </motion.div>
          ))}
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="pt-2 border-t border-border flex gap-2"
          >
            <Button variant="outline" size="sm" className="flex-1" onClick={handleMarkAllRead}>
              Mark All Read
            </Button>
            <Button variant="ghost" size="sm" className="flex-1">
              View All
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}