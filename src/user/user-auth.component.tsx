import { useRef } from "react";
import { Button, Card, Input, InputRef } from "antd";
import {
  getUserDataFromLocalStorage,
  saveUserToLocalStorage,
} from "./current-user";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { REDIRECT_TO_ROOM_URL_PARAM } from "../app/app.router";

function normalizeUserName(name: string): string {
  return name.trim();
}

function isValidUserName(name: string): boolean {
  return name.length > 0;
}

export function UserAuth() {
  const [searchParams] = useSearchParams();
  const user = getUserDataFromLocalStorage();
  const navigate = useNavigate();
  const input = useRef<InputRef>(null);

  if (user) {
    return <Navigate to="/" />;
  }

  function submit() {
    const userName = normalizeUserName(input.current?.input?.value || "");
    if (isValidUserName(userName)) {
      saveUserToLocalStorage(userName);
      const roomId = searchParams.get(REDIRECT_TO_ROOM_URL_PARAM);
      navigate(roomId ? `/room/${roomId}` : "/");
    }
  }

  return (
    <div className="w-scren h-screen flex justify-center items-center">
      <Card title="Enter your name to continue" className="w-1/3">
        <div className="flex flex-col items-end">
          <Input
            autoFocus
            onPressEnter={submit}
            ref={input}
            placeholder="name"
          ></Input>
          <Button onClick={submit} type="primary" className="mt-4">
            Continue
          </Button>
        </div>
      </Card>
    </div>
  );
}
