// defines the type that holds a reference to the window object properties: "screenX", "screenY", "width", and "height"
export type WindowState = {
  screenX: number;
  screenY: number;
  width: number;
  height: number;
};

export type MessageT<Action extends string, Payload extends unknown> = {
  action: Action;
  payload: Payload;
};




type WindowStateChangedPayload = {
  oldWindow?: WindowState;
  newWindow: WindowState;
  id: number;
};

type AttributedIdPayload = {
  id: number;
};

type WindowUnloadedPayload = {
  id: number;
};

export type WorkerMessage =
  | MessageT<"connected", { state: WindowState }>
  | MessageT<"sync", { allWindows: { windowState: WindowState; id: number }[] }>
  | MessageT<"windowStateChanged", WindowStateChangedPayload>
  | MessageT<"attributedId", AttributedIdPayload>
  | MessageT<"windowUnloaded", WindowUnloadedPayload>;




