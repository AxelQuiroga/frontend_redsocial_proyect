import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { notificationService } from "@/services/notificationService";
import type { Notification } from "@/types/notification";

const ICONS: Record<Notification["type"], string> = {
  COMMENT_ON_POST: "💬",
  REPLY_ON_COMMENT: "↩️",
};

function timeAgo(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diffSec = Math.floor((now - then) / 1000);

  if (diffSec < 60) return "ahora";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `hace ${diffMin}m`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `hace ${diffHour}h`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `hace ${diffDay}d`;
  return new Date(dateString).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  });
}

export function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [initialFetchDone, setInitialFetchDone] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Cargar contador de no leídas al montar
  useEffect(() => {
    notificationService
      .getUnreadCount()
      .then((res) => setUnreadCount(res.count))
      .catch(() => {});
  }, []);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await notificationService.getNotifications(1, 10);
      setNotifications(res.data);
      setUnreadCount(
        res.data.reduce((acc, n) => acc + (n.read ? 0 : 1), 0)
      );
    } catch {
      // Silencioso
    } finally {
      setIsLoading(false);
      setInitialFetchDone(true);
    }
  }, []);

  const handleToggle = useCallback(() => {
    const next = !isOpen;
    setIsOpen(next);
    if (next && !initialFetchDone) {
      fetchNotifications();
    }
  }, [isOpen, initialFetchDone, fetchNotifications]);

  // Cerrar al hacer click fuera
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleMarkAllRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // Silencioso
    }
  }, []);

  const handleNotificationClick = useCallback(
    async (notification: Notification) => {
      // Marcar como leída
      if (!notification.read) {
        try {
          await notificationService.markAsRead(notification.id);
          setNotifications((prev) =>
            prev.map((n) =>
              n.id === notification.id ? { ...n, read: true } : n
            )
          );
          setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch {
          // Silencioso
        }
      }

      setIsOpen(false);

      // Navegar al post si tiene postId
      if (notification.postId) {
        navigate(`/posts/${notification.postId}`);
      }
    },
    [navigate]
  );

  return (
    <div className="notifications-dropdown" ref={dropdownRef}>
      <button
        type="button"
        className="notifications-bell"
        onClick={handleToggle}
        aria-label="Notificaciones"
      >
        <span className="notifications-bell-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="notifications-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notifications-panel">
          <div className="notifications-panel-header">
            <h4 className="notifications-panel-title">Notificaciones</h4>
            {unreadCount > 0 && (
              <button
                type="button"
                className="notifications-mark-all"
                onClick={handleMarkAllRead}
              >
                Marcar todas leídas
              </button>
            )}
          </div>

          <div className="notifications-panel-body">
            {isLoading && (
              <p className="notifications-loading">Cargando...</p>
            )}

            {!isLoading && notifications.length === 0 && (
              <p className="notifications-empty">
                No tenés notificaciones
              </p>
            )}

            {!isLoading &&
              notifications.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  className={`notifications-item ${
                    !n.read ? "notifications-item--unread" : ""
                  }`}
                  onClick={() => handleNotificationClick(n)}
                >
                  <span className="notifications-item-icon">
                    {ICONS[n.type] || "🔔"}
                  </span>
                  <div className="notifications-item-content">
                    <span className="notifications-item-title">{n.title}</span>
                    <span className="notifications-item-message">
                      {n.message}
                    </span>
                    <span className="notifications-item-time">
                      {timeAgo(n.createdAt)}
                    </span>
                  </div>
                </button>
              ))}
          </div>

          {initialFetchDone && !isLoading && notifications.length > 0 && (
            <div className="notifications-panel-footer">
              <button
                type="button"
                className="notifications-refresh"
                onClick={fetchNotifications}
              >
                Actualizar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
