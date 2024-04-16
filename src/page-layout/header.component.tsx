import { Button, Space } from "antd";
import useMessage from "antd/es/message/useMessage";
import { Link, useParams } from "react-router-dom";
import { copyTextToClipboard } from "../shared/clipboard";
import { HomeOutlined } from "@ant-design/icons";
import { AppSettings } from "../settings/settings.component";

export function Header() {
  const [messageApi, contextHolder] = useMessage();
  const { id: roomId } = useParams();

  function copyToClipboard(value: string): void {
    copyTextToClipboard(value)
      .then(() => messageApi.success(`${value} was copied to a clipboard`))
      .catch(() => messageApi.error(`Couldn't copy to a clipboard`));
  }

  return (
    <div className="bg-white h-14 drop-shadow-md">
      <div className="w-full h-full px-6 bg-white flex items-center">
        {contextHolder}
        <Link className="justify-self-start" to="/">
          <Button type="primary" icon={<HomeOutlined />} />
        </Link>
        <Space className="ml-auto">
          <Button onClick={() => copyToClipboard(roomId!)}>
            Copy room hash
          </Button>
          <Button onClick={() => copyToClipboard(location.href)}>
            Copy game url
          </Button>
          <AppSettings />
        </Space>
      </div>
    </div>
  );
}
