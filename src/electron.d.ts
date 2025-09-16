/* global definition for Electron bridge */
interface Window {
  electron?: {
    openFile: () => Promise<string | null>
    saveFile: (defaultPath: string, data: string) => Promise<string | null>
  }
}
