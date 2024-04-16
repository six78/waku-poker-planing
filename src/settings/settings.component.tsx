import { Button, Input, Modal, Space, Switch } from "antd";
import { useMemo, useState } from "react";
import { SettingOutlined } from "@ant-design/icons";
import { SettingsItem } from "./settings-item.component";
import { getAppSettings, saveAppSettings } from "./settings.storage";

interface IAppSettings {
  node?: string;
}

export function AppSettings() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const savedSettings = useMemo(getAppSettings, []);
  const [settings, setSettings] = useState<IAppSettings>(savedSettings);

  const handleSave = () => {
    if (settings.node === undefined || settings.node.length > 0) {
      saveAppSettings(settings);
      location.reload();
    }
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  function useCustomNodeChanged(checked: boolean): void {
    setSettings({
      node: checked ? "" : undefined,
    });
  }

  return (
    <>
      <Button onClick={() => setIsModalOpen(true)} icon={<SettingOutlined />} />

      <Modal
        title="App settings"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Close
          </Button>,
          <Button key="submit" type="primary" onClick={handleSave}>
            Save and reload
          </Button>,
        ]}
      >
        <Space direction="vertical" className="w-full">
          <SettingsItem title="Use custom node">
            <Switch
              onChange={useCustomNodeChanged}
              checked={settings.node !== undefined}
            />
          </SettingsItem>

          <SettingsItem title="Custom node url">
            <Input
              disabled={settings.node === undefined}
              value={settings.node ?? ""}
              onChange={(e) => setSettings({ node: e.target.value })}
              placeholder="e.g. /dns4/node-0..."
            />
          </SettingsItem>
        </Space>
      </Modal>
    </>
  );
}
