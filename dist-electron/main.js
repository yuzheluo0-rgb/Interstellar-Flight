import { createRequire as e } from "node:module";
import { BrowserWindow as t, Menu as n, Tray as r, app as i, ipcMain as a, nativeImage as o } from "electron";
import { join as s } from "path";
import c from "sql.js";
import { existsSync as l, mkdirSync as u, readFileSync as d, writeFileSync as f } from "fs";
//#region \0rolldown/runtime.js
var p = /* @__PURE__ */ e(import.meta.url), m = null, h = s(i.getPath("userData"), "data"), g = s(h, "focusflight.db");
async function _() {
	let e = await c();
	if (l(h) || u(h, { recursive: !0 }), l(g)) {
		let t = d(g);
		m = new e.Database(t);
	} else m = new e.Database();
	let t = s(import.meta.dirname, "../electron/db/schema.sql"), n = s(import.meta.dirname, "db/schema.sql"), r = l(t) ? d(t, "utf-8") : l(n) ? d(n, "utf-8") : v();
	m.exec(r), y();
}
function v() {
	return "\n    CREATE TABLE IF NOT EXISTS flights (\n      id INTEGER PRIMARY KEY AUTOINCREMENT,\n      flight_number TEXT NOT NULL,\n      route_id TEXT NOT NULL,\n      departure_city TEXT NOT NULL,\n      arrival_city TEXT NOT NULL,\n      flight_type TEXT NOT NULL,\n      cabin_class TEXT NOT NULL DEFAULT 'economy',\n      planned_duration INTEGER NOT NULL,\n      actual_duration INTEGER NOT NULL DEFAULT 0,\n      mileage_earned REAL NOT NULL DEFAULT 0,\n      status TEXT NOT NULL,\n      emergency_reason TEXT,\n      started_at TEXT NOT NULL,\n      ended_at TEXT,\n      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))\n    );\n    CREATE TABLE IF NOT EXISTS user_stats (\n      id INTEGER PRIMARY KEY CHECK(id = 1),\n      total_mileage REAL NOT NULL DEFAULT 0,\n      total_flights INTEGER NOT NULL DEFAULT 0,\n      total_focus_minutes INTEGER NOT NULL DEFAULT 0,\n      current_streak INTEGER NOT NULL DEFAULT 0,\n      longest_streak INTEGER NOT NULL DEFAULT 0,\n      last_flight_date TEXT,\n      rank_level INTEGER NOT NULL DEFAULT 1,\n      unlocked_routes TEXT NOT NULL DEFAULT '[]',\n      unlocked_aircrafts TEXT NOT NULL DEFAULT '[]',\n      updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))\n    );\n    CREATE TABLE IF NOT EXISTS achievements (\n      id TEXT PRIMARY KEY,\n      unlocked_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))\n    );\n    CREATE TABLE IF NOT EXISTS settings (\n      key TEXT PRIMARY KEY,\n      value TEXT NOT NULL\n    );\n    INSERT OR IGNORE INTO user_stats (id) VALUES (1);\n  ";
}
function y() {
	if (!m) return;
	let e = m.export();
	f(g, Buffer.from(e));
}
function b(e) {
	if (!m) throw Error("Database not initialized");
	m.run("INSERT INTO flights (flight_number, route_id, departure_city, arrival_city, flight_type, cabin_class, planned_duration, actual_duration, mileage_earned, status, emergency_reason, started_at, ended_at)\n     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
		e.flightNumber,
		e.routeId,
		e.departureCity,
		e.arrivalCity,
		e.flightType,
		e.cabinClass,
		e.plannedDuration,
		e.actualDuration,
		e.mileageEarned,
		e.status,
		e.emergencyReason || null,
		e.startedAt,
		e.endedAt
	]), m.run("UPDATE user_stats SET\n      total_mileage = total_mileage + ?,\n      total_flights = total_flights + 1,\n      total_focus_minutes = total_focus_minutes + ?,\n      last_flight_date = ?,\n      updated_at = datetime('now', 'localtime')\n    WHERE id = 1", [
		e.mileageEarned,
		Math.round(e.actualDuration / 60),
		e.endedAt.split("T")[0]
	]), y();
}
function x(e) {
	if (!m) return [];
	let t = "SELECT * FROM flights WHERE 1=1", n = [];
	e?.type && (t += " AND flight_type = ?", n.push(e.type)), e?.dateFrom && (t += " AND started_at >= ?", n.push(e.dateFrom)), t += " ORDER BY started_at DESC", e?.limit && (t += " LIMIT ?", n.push(e.limit));
	let r = m.prepare(t);
	r.bind(n);
	let i = [];
	for (; r.step();) i.push(r.getAsObject());
	return r.free(), i;
}
function S() {
	if (!m) return null;
	let e = m.prepare("SELECT * FROM user_stats WHERE id = 1");
	e.step();
	let t = e.getAsObject();
	return e.free(), t;
}
function C(e, t) {
	m && (m.run("UPDATE user_stats SET current_streak = ?, longest_streak = ?, updated_at = datetime('now', 'localtime') WHERE id = 1", [e, t]), y());
}
function w(e) {
	m && (m.run("UPDATE user_stats SET unlocked_routes = ?, updated_at = datetime('now', 'localtime') WHERE id = 1", [JSON.stringify(e)]), y());
}
function T(e) {
	if (!m) return null;
	let t = m.prepare("SELECT value FROM settings WHERE key = ?");
	if (t.bind([e]), t.step()) {
		let e = t.getAsObject();
		return t.free(), e.value;
	}
	return t.free(), null;
}
function E(e, t) {
	m && (m.run("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", [e, t]), y());
}
//#endregion
//#region electron/floatWindow.ts
var L = null; var D = null;
function O() {
	if (D) {
		D.show();
		return;
	}
	D = new t({
		width: 420,
		height: 260,
		frame: !1,
		transparent: !0,
		alwaysOnTop: !0,
		skipTaskbar: !0,
		resizable: !1,
		webPreferences: {
			contextIsolation: !1,
			nodeIntegration: !0
		}
	}), D.setPosition(p("electron").screen.getPrimaryDisplay().workAreaSize.width - 440, p("electron").screen.getPrimaryDisplay().workAreaSize.height - 280), D.loadFile(s(import.meta.dirname, "../dist/float.html")), D.on("closed", () => {
		D = null;
	});
}
function k() {
	D?.hide();
}
function A() {
	a.on("window:showFloat", () => O()), a.on("window:hideFloat", () => k()), a.on("window:minimize", () => { let w = t.getAllWindows()[0]; w?.minimize() }), a.on("window:maximize", () => { let w = t.getAllWindows()[0]; w?.isMaximized() ? w?.unmaximize() : w?.maximize() }), a.on("window:close", () => { let w = t.getAllWindows()[0]; w?.close() }), a.on("window:restoreMain", () => { P?.restore(); P?.focus(); k(); }), a.handle("getFlightState", async () => { if (!P || P.isDestroyed()) return null; try { var state = await P.webContents.executeJavaScript("window.__flightState||null"); if (!state) return null; return state; } catch(e) { return null; } }), a.on("flight:start", (e, t) => { L = t; L.startedAt = Date.now(); }), a.on("flight:clear", () => { L = null; });
}
//#endregion
//#region electron/tray.ts
var j = null;
function M(e) {
	s(import.meta.dirname, "../src/assets/icon.png");
	let t = o.createEmpty();
	j = new r(t.isEmpty() ? o.createFromBuffer(N()) : t);
	let a = n.buildFromTemplate([
		{
			label: "显示主窗口 Show",
			click: () => e.show()
		},
		{ type: "separator" },
		{
			label: "退出 Quit",
			click: () => i.quit()
		}
	]);
	j.setToolTip("FocusFlight"), j.setContextMenu(a), j.on("click", () => {
		e.show();
	});
}
function N() {
	let e = Buffer.alloc(256 * 4);
	for (let t = 0; t < 256; t++) e[t * 4] = 59, e[t * 4 + 1] = 130, e[t * 4 + 2] = 246, e[t * 4 + 3] = 255;
	return o.createFromBuffer(e, {
		width: 16,
		height: 16
	}).toPNG();
}
//#endregion
//#region electron/main.ts
var P = null;
function F() {
	P = new t({
		width: 1200,
		height: 800,
		minWidth: 900,
		minHeight: 600,
		title: "FocusFlight",
		frame: !0,
		titleBarStyle: "default",
		webPreferences: {
			preload: s(import.meta.dirname, "preload.js"),
			contextIsolation: !0,
			nodeIntegration: !1
		},
		show: !1,
		backgroundColor: "#0f172a"
	}), P.on("ready-to-show", () => {
		P?.show(); P.on("minimize", () => O()); P.on("restore", () => k());
	}), process.env.VITE_DEV_SERVER_URL ? P.loadURL(process.env.VITE_DEV_SERVER_URL) : P.loadFile(s(import.meta.dirname, "../dist/index.html"));
}
function I() {
	a.handle("db:saveFlight", (e, t) => b(t)), a.handle("db:getFlights", (e, t) => x(t)), a.handle("db:getStats", () => S()), a.handle("db:getSetting", (e, t) => T(t)), a.handle("db:setSetting", (e, t, n) => E(t, n)), a.handle("db:updateStreak", (e, t, n) => C(t, n)), a.handle("db:updateUnlockedRoutes", (e, t) => w(t));
}
i.whenReady().then(async () => {
	await _(), I(), A(), F(), P && M(P);
}), i.on("window-all-closed", () => {
	process.platform !== "darwin" && i.quit();
}), i.on("activate", () => {
	t.getAllWindows().length === 0 && F();
});
//#endregion
export {};
