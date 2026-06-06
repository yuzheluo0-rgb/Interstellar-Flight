import {useFlightStore} from '../stores/flightStore'
export function useTimer(){const{elapsedSeconds,currentFlight}=useFlightStore();const progress=currentFlight?elapsedSeconds/currentFlight.plannedDuration:0;const remainingSeconds=currentFlight?Math.max(0,currentFlight.plannedDuration-elapsedSeconds):0;const formatTime=(s:number)=>{const m=Math.floor(s/60),sec=s%60;return`${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`};return{remainingSeconds,progress,formatTime,isFlying:useFlightStore.getState().isFlying}
}
