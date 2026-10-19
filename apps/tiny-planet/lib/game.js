export const ORIGIN=process.env.TINY_PLANET_ORIGIN||'https://tiny-planet-trmnl.vercel.app';
export {TILES,ACTIONS,legalActions} from '../public/game.js';
export function devicePayload(world){return {...world,tiles:world.tiles.map(row=>[...row]),events:world.events.slice(0,3),mission:'Grow 8 groves + build a beacon. Then sail.',website:ORIGIN.replace('https://','')};}
import {ACTIONS} from '../public/game.js';
export function validateMove(body){if(!body||typeof body!=='object'||!Object.hasOwn(ACTIONS,body.action)||!Number.isInteger(body.x)||!Number.isInteger(body.y)||body.x<0||body.x>7||body.y<0||body.y>5||!/^[-a-zA-Z0-9]{16,80}$/.test(body.nonce||''))throw Object.assign(Error('Choose a valid cell and action.'),{status:400});return {action:body.action,x:body.x,y:body.y,nonce:body.nonce};}
