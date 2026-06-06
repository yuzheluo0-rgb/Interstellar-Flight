import {BrowserWindow,ipcMain,screen} from 'electron';import {join} from 'path'
let fw:BrowserWindow|null=null
export function createFloatWindow(){if(fw){fw.show();return};fw=new BrowserWindow({width:420,height:260,frame:false,transparent:true,alwaysOnTop:true,skipTaskbar:true,resizable:false,webPreferences:{contextIsolation:false,nodeIntegration:true}});const{width}=screen.getPrimaryDisplay().workAreaSize;fw.setPosition(width-440,screen.getPrimaryDisplay().workAreaSize.height-280);if(process.env.VITE_DEV_SERVER_URL)fw.loadURL(process.env.VITE_DEV_SERVER_URL+'float.html');else fw.loadFile(join(__dirname,'../dist/float.html'));fw.on('closed',()=>{fw=null})}
export function hideFloatWindow(){fw?.hide()}
export function destroyFloatWindow(){fw?.close();fw=null}
export function registerFloatWindowIpc(){ipcMain.on('window:showFloat',()=>createFloatWindow());ipcMain.on('window:hideFloat',()=>hideFloatWindow())}
