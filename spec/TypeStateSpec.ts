/// <reference path="jasmine.d.ts" />
/// <reference path="../src/typestate.ts" />
enum ValidStates {
      A,
      B,
      C,
      D
}
describe('A finite state machine', ()=>{
   var fsm: FiniteStateMachine<ValidStates>;
   beforeEach(() => {
      fsm = new FiniteStateMachine<ValidStates>(ValidStates.A);
   });

   it('should exist', ()=>{
      expect(FiniteStateMachine).toBeDefined();
   });

   it('can be instantiated with an enum', ()=>{
      expect(fsm).toBeTruthy();
   });

   it('validates cannot transition to a state that is not defined', ()=>{
      expect(fsm.canGo(ValidStates.B)).toBeFalsy();
   });

   it('validates can transition to a state that is defined', () => {
      fsm.from(ValidStates.A).to(ValidStates.B);
      expect(fsm.canGo(ValidStates.B)).toBeTruthy();
   });

   it('validates cannot transition to a state not directly connected', () => {
      fsm.from(ValidStates.A).to(ValidStates.B);
      fsm.from(ValidStates.B).to(ValidStates.C);
      expect(fsm.canGo(ValidStates.C)).toBeFalsy();
   });

   it('can transition to a valid', () => {
      fsm.from(ValidStates.A).to(ValidStates.B);
      fsm.from(ValidStates.B).to(ValidStates.C);
      expect(fsm.currentState).toBe(ValidStates.A);
      fsm.go(ValidStates.B);
      expect(fsm.currentState).toBe(ValidStates.B);
      fsm.go(ValidStates.C);
      expect(fsm.currentState).toBe(ValidStates.C);
   });

   it('can handle cycles', () => {
      fsm.from(ValidStates.A).to(ValidStates.B);
      fsm.from(ValidStates.B).to(ValidStates.A);
      expect(fsm.currentState).toBe(ValidStates.A);

      fsm.go(ValidStates.B);
      expect(fsm.currentState).toBe(ValidStates.B);
      fsm.go(ValidStates.A);
      expect(fsm.currentState).toBe(ValidStates.A);

   });

   it('can define multiple transitions at once', () => {
      fsm.from(ValidStates.A, ValidStates.B).to(ValidStates.A, ValidStates.B);
      expect(fsm.currentState).toBe(ValidStates.A);

      fsm.go(ValidStates.B);
      expect(fsm.currentState).toBe(ValidStates.B);
      fsm.go(ValidStates.A);
      expect(fsm.currentState).toBe(ValidStates.A);
   });

   it('throws an error when transitioning to an invalid state', () => {
      fsm.from(ValidStates.A).to(ValidStates.B);
      expect(fsm.currentState).toBe(ValidStates.A);
      expect(() => { fsm.go(ValidStates.C); }).toThrow('Error no transition function exists from state ' + ValidStates.A.toString() + ' to ' + ValidStates.C.toString());
   });

   it('fires "on" callbacks when transitioning to a listend state', () => {
      fsm.from(ValidStates.A).to(ValidStates.B);
      var called = 0;
      var callback = () => {
         called += 1;
      };
      fsm.on(ValidStates.B, callback);
      fsm.go(ValidStates.B);
      expect(called).toBe(1);
   });

   it('can block transitions to by returning false onEnter events', () => {
      fsm.from(ValidStates.A).to(ValidStates.B);
      fsm.onEnter(ValidStates.B, () => {
         return false;
      });

      var called = 0;
      var callback = () => {
         called += 1;
      };

      fsm.on(ValidStates.B, callback);

      fsm.go(ValidStates.B);
      expect(fsm.currentState).toBe(ValidStates.A);
      expect(called).toBe(0);
   });

   it('can block transitions from by returning false onExit events', () => {
      fsm.from(ValidStates.A).to(ValidStates.B);
      fsm.from(ValidStates.B).to(ValidStates.A);
      fsm.onExit(ValidStates.B, () => {
         return false;
      });

      var called = 0;
      var callback = () => {
         called += 1;
      };

      fsm.on(ValidStates.A, callback);

      fsm.go(ValidStates.B);
      expect(fsm.currentState).toBe(ValidStates.B);

      fsm.go(ValidStates.A);
      expect(fsm.currentState).toBe(ValidStates.B);
      expect(called).toBe(0);
   });

   it('can be reset', () => {
      fsm.from(ValidStates.A).to(ValidStates.B);
      fsm.from(ValidStates.B).to(ValidStates.C);
      expect(fsm.currentState).toBe(ValidStates.A);
      fsm.go(ValidStates.B);
      expect(fsm.currentState).toBe(ValidStates.B);
      fsm.go(ValidStates.C);
      expect(fsm.currentState).toBe(ValidStates.C);
      fsm.reset();
      expect(fsm.currentState).toBe(ValidStates.A);
   });


});