import { Typography } from "antd";
import { ReactNode } from "react";

export function SettingsItem(props: { children: ReactNode; title: string }) {
  return (
    <div className="flex flex-col items-start">
      <Typography.Text className="text-sm">{props.title}</Typography.Text>
      {props.children}
    </div>
  );
}
