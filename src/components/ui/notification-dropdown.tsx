import { Bell, AlertTriangle, Info, CheckCircle, Pill } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { notificationService, Notification } from "@/lib/notificationService";

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
    
    // Refresh notifications every minute
    const interval = setInterval(loadNotifications, 60000);
    
    // Listen for real-time notification updates
    const handleNotificationUpdate = () => {
      loadNotifications();
    };
    
    window.addEventListener('notificationUpdate', handleNotificationUpdate);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('notificationUpdate', handleNotificationUpdate);
    };
  }, []);

  const loadNotifications = () => {
    const allNotifications = notificationService.getNotifications();
    // Update time display and limit to last 10 notifications
    const updated = allNotifications.slice(0, 10).map(n => ({
      ...n,
      time: notificationService.getTimeAgo(n.timestamp)
    }));
    setNotifications(updated);
    setUnreadCount(allNotifications.filter(n => n.urgent).length);
  };

  const handleMarkAllRead = () => {
    notificationService.markAllAsRead();
    setNotifications([]);
    setUnreadCount(0);
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center animate-pulse"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-80 p-0" 
        align="end" 
        sideOffset={4}
      >
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="bg-primary text-primary-foreground">
                {unreadCount} urgent
              </Badge>
            )}
          </div>
        </div>
        
        <ScrollArea className="h-80">
          <div className="p-2">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notifications</p>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`
                      p-3 rounded-lg transition-colors cursor-pointer hover:bg-accent
                      ${notification.urgent 
                        ? 'bg-orange-50 border border-orange-200 hover:bg-orange-100' 
                        : 'bg-background/50 hover:bg-background/80'
                      }
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-1 rounded-full bg-background flex-shrink-0">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm truncate">{notification.title}</h4>
                          <Badge 
                            variant={getBadgeColor(notification.urgent, notification.type)}
                            className="text-xs flex-shrink-0"
                          >
                            {notification.urgent ? "Urgent" : notification.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground">{notification.time}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
        
        {notifications.length > 0 && (
          <div className="p-3 border-t flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1" 
              onClick={handleMarkAllRead}
            >
              Mark All Read
            </Button>
            <Button variant="ghost" size="sm" className="flex-1">
              View All
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}