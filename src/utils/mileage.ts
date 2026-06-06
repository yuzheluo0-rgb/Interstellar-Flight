export type FlightType='deep_work'|'study'|'creative'|'reading'
export type CabinClass='economy'|'business'|'first'|'captain'|'legendary'
export type FlightStatus='completed'|'emergency_landing'
export interface Flight{flightNumber:string;routeId:string;departureCity:string;arrivalCity:string;flightType:FlightType;cabinClass:CabinClass;plannedDuration:number;actualDuration:number;mileageEarned:number;status:FlightStatus;emergencyReason?:string;startedAt:string;endedAt:string}
export interface UserStats{totalMileage:number;totalFlights:number;totalFocusMinutes:number;currentStreak:number;longestStreak:number;lastFlightDate:string|null;rankLevel:number;unlockedRoutes:string[];unlockedAircrafts:string[]}
export interface FlightFilter{type?:FlightType;dateFrom?:string;limit?:number}
export function getCabinClassForMileage(m:number):CabinClass{if(m>=50000)return'legendary';if(m>=20000)return'captain';if(m>=8000)return'first';if(m>=2000)return'business';return'economy'}
export function getRankForMileage(m:number):{level:number;name:string;nameEn:string}{if(m>=50000)return{level:5,name:'传奇',nameEn:'Legend'};if(m>=15000)return{level:4,name:'王牌',nameEn:'Ace'};if(m>=5000)return{level:3,name:'机长',nameEn:'Captain'};if(m>=1000)return{level:2,name:'副驾',nameEn:'Co-Pilot'};return{level:1,name:'学员',nameEn:'Cadet'}}
const CM:Record<CabinClass,number>={economy:1,business:1.3,first:1.5,captain:1.8,legendary:2}
export function calculateMileage(min:number,type:FlightType,cabin:CabinClass,streak:number,completed:boolean):number{const base=min*50;const cm=CM[cabin];const sb=1+Math.min(streak,30)/30*.5;return Math.round(base*cm*sb*(completed?1:.5))}
export function generateFlightNumber():string{return'AF-'+String(Math.floor(Math.random()*9000)+1000)}
