import { WindowState, WorkerMessage } from "./types";

let client: MessagePort[] = [];
let nextId: number = 0;
let windows: { windowState: WindowState; id: number; port: MessagePort }[] = [];

onconnect = ({ ports }: MessageEvent<WorkerMessage>) => {
  const port = ports[0];
  client.push(port);

  const sendSync = () => {
    windows.forEach((window) =>
      window.port.postMessage({
        action: "sync",
        payload: { allWindows: JSON.parse(JSON.stringify(windows)) },
      } satisfies WorkerMessage)
    );
  };
  nextId += 1;

  port.onmessage = function (event: MessageEvent<WorkerMessage>) {
    const message = event.data;

    switch (message.action) {
      case "connected": {
        windows.push({
          id: nextId,
          windowState: message.payload.state,
          port,
        });
        console.log("connected msg", { message });

        const workerMessage: WorkerMessage = {
          action: "attributedId",
          payload: { id: nextId },
        };
        port.postMessage(workerMessage);

        sendSync();

        break;
      }
      case "windowUnloaded": {
        const id = message.payload.id;
        windows = windows.filter((windowItem) => windowItem.id !== id);
        sendSync();
        break;
      }
      case "windowStateChanged": {
        const { id, newWindow } = message.payload;
        const oldWindowIndex = windows.findIndex((w) => w.id === id);
        if (oldWindowIndex !== -1) {
          windows[oldWindowIndex].windowState = newWindow;
          sendSync();
        }
        break;
      }
    }
  };

  port.onmessageerror = function () {
    console.error("error!!");
  };
};

self.addEventListener("beforeunload", () => console.log("unloading..."));






