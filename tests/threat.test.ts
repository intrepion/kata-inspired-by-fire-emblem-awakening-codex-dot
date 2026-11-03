import {it,expect} from 'vitest';
import {fresh,battle,enemyThreat} from '../src/domain';
it('threat includes moving before striking and respects bow minimum distance',()=>{
 const s=battle(fresh()),e=s.units.find(u=>u.team==='enemy')!;s.units=[e];e.pos=0;e.weapon='blade';e.move=1;
 expect(enemyThreat(s)).toContain(2);expect(enemyThreat(s)).not.toContain(3);
 e.weapon='bow';e.move=0;expect(enemyThreat(s)).toContain(2);expect(enemyThreat(s)).not.toContain(1);
});
it('threat pays forest costs, excludes water, and ignores fallen enemies',()=>{
 const s=battle(fresh()),e=s.units.find(u=>u.team==='enemy')!;s.units=[e];e.pos=9;e.weapon='blade';e.move=1;
 expect(enemyThreat(s)).not.toContain(11);e.move=2;expect(enemyThreat(s)).toContain(11);
 expect(enemyThreat(s)).not.toContain(26);e.hp=0;expect(enemyThreat(s)).toEqual([]);
});
