import { WindowState, WorkerMessage } from "./types";
import { didWindowChange, getCurrentWindowState } from "./windowState";

// Represents a window state with an ID
type StateWithId = { id: number; windowState: WindowState };

// Represents a callback function for synchronization
type OnSyncCallbackFunction = (allWindows: StateWithId[]) => void;

// Class to handle communication and synchronization with a shared worker
export class WindowWorkerHandler {
  // Array to store window states with IDs
  windows: StateWithId[] = [];

  // Represents the current state of the window
  currentWindow: WindowState = getCurrentWindowState();

  // Represents the ID of the window
  id!: number;

  // Array to store callback functions for synchronization
  onSyncCallbacks: OnSyncCallbackFunction[] = [];

  // Represents a shared worker for parallel processing
  worker: SharedWorker;

  // Constructor method
  constructor() {
    // Create a shared worker using a script file named "worker.ts"
    this.worker = new SharedWorker(new URL("./worker.ts", import.meta.url));

    // Prepare a message indicating that the window is connected
    const connectedMessage: WorkerMessage = {
      action: "connected",
      payload: { state: this.currentWindow },
    };

    // Bind the onSyncCallback method to the current instance of the class
    this.onSyncCallback = this.onSyncCallback.bind(this);

    // Send the connected message to the shared worker
    this.worker.port.postMessage(connectedMessage);

    // Set up an event listener for incoming messages from the shared worker
    this.worker.port.onmessage = (event: MessageEvent<WorkerMessage>) => {
      const message = event.data;
      switch (message.action) {
        // Handle the attribution of an ID to the window
        case "attributedId": {
          this.id = message.payload.id;
          break;
        }
        // Handle synchronization messages
        case "sync": {
          this.onSyncCallback(message.payload.allWindows);
          break;
        }
      }
    };

    // Set up an event listener for the window's "beforeunload" event
    window.addEventListener("beforeunload", () => {
      // Send a message when the window is about to be closed
      this.worker.port.postMessage({
        action: "windowUnloaded",
        payload: { id: this.id },
      } as WorkerMessage);
    });
  }

  // Private method to handle synchronization callbacks
  private onSyncCallback(allWindows: StateWithId[]) {
    // Update the current window state and trigger synchronization callbacks
    this.currentWindow = getCurrentWindowState();
    this.windows = allWindows;
    this.onSyncCallbacks.forEach((callback) => callback(allWindows));
  }

  // Public method to subscribe to synchronization events
  onSync(callback: OnSyncCallbackFunction) {
    this.onSyncCallbacks.push(callback);
  }

  // Public method to check for changes in the window state
  windowHasChanged() {
    // Compare current and new window states and send a message if there's a change
    const newWindow = getCurrentWindowState();
    const oldWindow = this.currentWindow;
    if (didWindowChange({ newWindow, oldWindow })) {
      this.currentWindow = newWindow;
      this.worker.port.postMessage({
        action: "windowStateChanged",
        payload: { id: this.id, newWindow, oldWindow },
      } as WorkerMessage);
    }
  }
}




