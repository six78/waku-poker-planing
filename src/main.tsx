import ReactDOM from "react-dom/client";
import "./index.css";
import { StyleProvider } from "@ant-design/cssinjs";
import { RouterProvider, createHashRouter } from "react-router-dom";
import { AuthorizedUserGuard } from "./user/authorized-user-guard.component";
import { UserAuth } from "./user/user-auth.component";
import { CreateOrJoinRoom } from "./room/create-or-join-room.component";
import { App } from "./App";
import { RecoilRoot } from "recoil";
import { cleanUpDealerRoomHistory } from "./dealer/dealer-resolver";

const router = createHashRouter([
  {
    path: "/",
    element: (
      <AuthorizedUserGuard>
        <CreateOrJoinRoom />
      </AuthorizedUserGuard>
    ),
  },
  {
    path: "/register-user",
    element: <UserAuth />,
  },
  {
    path: "/room/:id",
    element: (
      <AuthorizedUserGuard>
        <App />
      </AuthorizedUserGuard>
    ),
  },
  {
    path: "*",
    element: <div>TODO: 404</div>,
  },
]);

cleanUpDealerRoomHistory();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <RecoilRoot>
    <StyleProvider hashPriority="high">
      <RouterProvider router={router} />
    </StyleProvider>
  </RecoilRoot>
);
