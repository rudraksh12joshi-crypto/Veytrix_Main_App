export type NotificationKind = "system" | "export" | "collaboration" | "billing" | "ai";

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body?: string;
  createdAt: string;
  read: boolean;
  actionUri?: string;
}
