import { WindowState } from "./types";
import { getWindowCenter } from "./windowState";
import "./style.css";
import { WindowWorkerHandler } from "./workerHandler";

export type Coordinates = {
  x: number;
  y: number;
};

export type BaseChangeParameters = {
  currentWindowOffset: Coordinates;
  targetWindowOffset: Coordinates;
  targetPosition: Coordinates;
};

export type DrawConnectingLinesParameters = {
  context: CanvasRenderingContext2D;
  hostWindow: WindowState;
  targetWindow: WindowState;
};

function drawCenterCircle(
  context: CanvasRenderingContext2D,
  center: Coordinates
) {
  const { x, y } = center;

  context.strokeStyle = "#eeeeee";
  context.lineWidth = 10;
  context.beginPath();
  context.arc(x, y, 100, 0, Math.PI * 2, false);
  context.stroke();
  context.closePath();
}

function baseChange({
  currentWindowOffset,
  targetWindowOffset,
  targetPosition,
}: BaseChangeParameters) {
  const monitorWindowOffset = {
    x: targetWindowOffset.x + targetPosition.x,
    y: targetWindowOffset.y + targetPosition.y,
  };

  const currentWindowCoordinate = {
    x: monitorWindowOffset.x - currentWindowOffset.x,
    y: monitorWindowOffset.y - currentWindowOffset.y,
  };

  return currentWindowCoordinate;
}

function drawConnectingLine({
  context,
  hostWindow,
  targetWindow,
}: DrawConnectingLinesParameters) {
  context.strokeStyle = "#ff0000";
  context.lineCap = "round";

  const currentWindowOffset: Coordinates = {
    x: hostWindow.screenX,
    y: hostWindow.screenY,
  };

  const targetWindowOffset = {
    x: targetWindow.screenX,
    y: targetWindow.screenY,
  };

  const origin = getWindowCenter(hostWindow);
  const target = getWindowCenter(targetWindow);

  const targetWithBaseChange = baseChange({
    currentWindowOffset,
    targetWindowOffset,
    targetPosition: target,
  });

  context.strokeStyle = "#ff0000";
  context.lineCap = "round";
  context.beginPath();
  context.moveTo(origin.x, origin.y);
  context.lineTo(targetWithBaseChange.x, targetWithBaseChange.y);
  context.stroke();
  context.closePath();
}

function executeSharedWindowSync() {
  const workerHandler = new WindowWorkerHandler();

  const canvas = document.querySelector<HTMLCanvasElement>("#canvas")!;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const context = canvas.getContext("2d");

  if (!context) {
    return;
  }

  const currentWindow = workerHandler.currentWindow;
  const currentId = workerHandler.id;
  const center = getWindowCenter(currentWindow);

  workerHandler.onSync((windows) => {
    context.reset();
    drawCenterCircle(context, center);

    const windowsWithDifferentId = windows.filter(
      (window) => window.id !== currentId
    );

    // Draw connecting lines
    windowsWithDifferentId.forEach(({ windowState: targetWindow }) => {
      drawConnectingLine({
        context,
        hostWindow: workerHandler.currentWindow,
        targetWindow,
      });
    });
  });

  // check every millisecond to see if window has changed state
  setInterval(() => {
    workerHandler.windowHasChanged();
  }, 100);
}

executeSharedWindowSync();





