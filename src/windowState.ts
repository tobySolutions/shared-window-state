import { WindowState } from "./types";

type WindowChangeParams = {
  newWindow: WindowState;
  oldWindow: WindowState;
};

export function getCurrentWindowState(): WindowState {
  return {
    screenX: window.screenX,
    screenY: window.screenY,
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

export function didWindowChange({ newWindow, oldWindow }: WindowChangeParams) {
  if (!oldWindow) {
    return true;
  }

  const hasWindowChanged =
    oldWindow.height !== newWindow.height ||
    oldWindow.width !== newWindow.width ||
    oldWindow.screenX !== newWindow.screenX ||
    oldWindow.screenY !== newWindow.screenY;

  return hasWindowChanged;
}

export function generateId() {
  return Math.random() * 10; // handle unique generation of ids
}

export function getWindowCenter(window: WindowState) {
  return {
    x: window.width / 2,
    y: window.height / 2,
  };
}

