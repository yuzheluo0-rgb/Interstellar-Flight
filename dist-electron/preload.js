import { contextBridge as e, ipcRenderer as t } from "electron";
//#region electron/preload.ts
e.exposeInMainWorld("electronAPI", {
	saveFlight: (e) => t.invoke("db:saveFlight", e),
	getFlights: (e) => t.invoke("db:getFlights", e),
	getStats: () => t.invoke("db:getStats"),
	getSettings: () => t.invoke("db:getSettings"),
	saveSettings: (e) => t.invoke("db:saveSettings", e),
	showFloatWindow: () => t.send("window:showFloat"),
	hideFloatWindow: () => t.send("window:hideFloat"),
	minimizeToTray: () => t.send("window:minimizeToTray"),
	minimizeWindow: () => t.send("window:minimize"),
	maximizeWindow: () => t.send("window:maximize"),
	closeWindow: () => t.send("window:close"),
	restoreMainWindow: () => t.send("window:restoreMain"),
	getFlightState: () => t.invoke("getFlightState"),
	sendFlightStart: (e) => t.send("flight:start", e),
	clearFlight: () => t.send("flight:clear")
});
//#endregion
export {};
