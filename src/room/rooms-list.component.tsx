import { Table, TableProps } from "antd";
import { getDealerRooms } from "../dealer/dealer-resolver";
import { RoomId } from "./room.model";
import { Button } from "antd";
import { useNavigateToRoom } from "../app/app.router";
import { Sort, getSortFn } from "../shared/sorting";

interface IData {
  key: string;
  roomId: RoomId;
  updatedAt: string;
  issues: string;
}

function getRoomsData(): IData[] {
  const rooms = getDealerRooms();

  return Object.keys(rooms)
    .map((roomId) => {
      const data = rooms[roomId];

      return {
        roomId,
        key: roomId,
        updatedAt: data.updatedAt,
        issues: `${data.issues.filter((x) => x.result).length}/${
          data.issues.length
        }`,
      };
    })
    .sort(getSortFn<{ updatedAt: number }>("updatedAt", Sort.Desc))
    .map((data) => {
      return {
        ...data,
        updatedAt: new Date(data.updatedAt).toLocaleDateString(),
      };
    });
}

export function RoomsList() {
  const navigateToRoom = useNavigateToRoom();
  const rooms = getRoomsData();

  if (!rooms.length) {
    return null;
  }

  function onRoomClick(roomId: RoomId) {
    navigateToRoom(roomId);
  }

  const columns: TableProps<IData>["columns"] = [
    {
      title: "Last usage",
      dataIndex: "updatedAt",
    },
    {
      title: "Issues",
      dataIndex: "issues",
    },
    {
      title: "Action",
      dataIndex: "roomId",
      render: (roomId) => (
        <Button onClick={onRoomClick.bind(undefined, roomId)}>Open</Button>
      ),
    },
  ];

  return (
    <Table
      className="w-full"
      pagination={false}
      dataSource={rooms}
      columns={columns}
    />
  );
}
