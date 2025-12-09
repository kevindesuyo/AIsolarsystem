import { useEffect, useCallback } from 'react';

type KeyboardShortcutsConfig = {
  onPause: () => void;
  onResume: () => void;
  onSpeedUp: () => void;
  onSlowDown: () => void;
  onReset: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onToggleHelp: () => void;
  isRunning: boolean;
};

/**
 * キーボードショートカットを管理するカスタムフック
 */
export function useKeyboardShortcuts({
  onPause,
  onResume,
  onSpeedUp,
  onSlowDown,
  onReset,
  onZoomIn,
  onZoomOut,
  onToggleHelp,
  isRunning,
}: KeyboardShortcutsConfig) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in input fields
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      event.target instanceof HTMLSelectElement
    ) {
      return;
    }

    switch (event.key.toLowerCase()) {
      case ' ':
        event.preventDefault();
        if (isRunning) {
          onPause();
        } else {
          onResume();
        }
        break;
      case '+':
      case '=':
        event.preventDefault();
        onSpeedUp();
        break;
      case '-':
        event.preventDefault();
        onSlowDown();
        break;
      case 'r':
        if (!event.ctrlKey && !event.metaKey) {
          event.preventDefault();
          onReset();
        }
        break;
      case 'z':
        if (!event.ctrlKey && !event.metaKey) {
          event.preventDefault();
          onZoomIn();
        }
        break;
      case 'x':
        event.preventDefault();
        onZoomOut();
        break;
      case '?':
      case '/':
        if (event.shiftKey || event.key === '?') {
          event.preventDefault();
          onToggleHelp();
        }
        break;
      case 'h':
        event.preventDefault();
        onToggleHelp();
        break;
      default:
        break;
    }
  }, [
    isRunning,
    onPause,
    onResume,
    onSpeedUp,
    onSlowDown,
    onReset,
    onZoomIn,
    onZoomOut,
    onToggleHelp,
  ]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}
