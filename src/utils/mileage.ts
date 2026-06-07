export type FlightType='deep_work'|'study'|'creative'|'reading'
export type CabinClass='economy'|'business'|'first'|'captain'|'legendary'
export type FlightStatus='completed'|'emergency_landing'
export interface Flight{flightNumber:string;routeId:string;departureCity:string;arrivalCity:string;flightType:FlightType;cabinClass:CabinClass;plannedDuration:number;actualDuration:number;mileageEarned:number;status:FlightStatus;emergencyReason?:string;startedAt:string;endedAt:string}
export interface UserStats{totalMileage:number;totalFlights:number;totalFocusMinutes:number;currentStreak:number;longestStreak:number;lastFlightDate:string|null;rankLevel:number;unlockedRoutes:string[];unlockedAircrafts:string[]}

export function getRatingForDuration(minutes:number):{class:CabinClass;icon:string;label:string}{if(minutes>=120)return{class:'captain',icon:'👑',label:'皇冠'};if(minutes>=60)return{class:'first',icon:'⭐⭐⭐',label:'三星'};if(minutes>=25)return{class:'business',icon:'⭐⭐',label:'双星'};return{class:'economy',icon:'⭐',label:'一星'}}

export function getCabinClassForMileage(m:number):CabinClass{return getRatingForDuration(m/50).class} // kept for compat, not used
export function getRankForMileage(m:number):{level:number;name:string;nameEn:string}{const r=getRatingForDuration(m/50);return{level:['economy','business','first','captain'].indexOf(r.class)+1,name:r.label,nameEn:r.icon}}

const CM:Record<CabinClass,number>={economy:1,business:1.3,first:1.5,captain:1.8,legendary:2}
export function calculateMileage(min:number,type:FlightType,cabin:CabinClass,streak:number,completed:boolean):number{const base=min*50;const cm=CM[cabin];const sb=1+Math.min(streak,30)/30*.5;return Math.round(base*cm*sb*(completed?1:.5))}
export function generateFlightNumber():string{return'AF-'+String(Math.floor(Math.random()*9000)+1000)}
