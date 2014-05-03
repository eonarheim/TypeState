/// <reference path="jasmine.d.ts" />
/// <reference path="../src/typestate.ts" />
enum ValidStates {
      A,
      B,
      C,
      D
}
describe('A finite state machine', ()=>{
   var fsm: TypeState.FiniteStateMachine<ValidStates>;
   beforeEach(() => {
      fsm = new TypeState.FiniteStateMachine<ValidStates>(ValidStates.A);
   });

   it('should exist', ()=>{
      expect(TypeState.FiniteStateMachine).toBeDefined();
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

   it('can handle the wildcard ".fromAny()" from state', ()=>{
      fsm.fromAny(ValidStates).to(ValidStates.B);

      this.currentState = ValidStates.A;
      expect(fsm.canGo(ValidStates.B)).toBe(true);

      this.currentState = ValidStates.B;
      expect(fsm.canGo(ValidStates.B)).toBe(true);

      this.currentState = ValidStates.C;
      expect(fsm.canGo(ValidStates.B)).toBe(true);

      this.currentState = ValidStates.D;
      expect(fsm.canGo(ValidStates.B)).toBe(true);
   });

   it('can handle the wildcard ".toAny()" to state', ()=>{
      fsm.from(ValidStates.A).toAny(ValidStates);

      expect(fsm.canGo(ValidStates.A)).toBe(true);
      expect(fsm.canGo(ValidStates.B)).toBe(true);
      expect(fsm.canGo(ValidStates.C)).toBe(true);
      expect(fsm.canGo(ValidStates.D)).toBe(true);
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

   it('passes the "from" state to the ".on" callback', () => {
      fsm.from(ValidStates.A).to(ValidStates.B);
      fsm.from(ValidStates.B).to(ValidStates.A);
      var fromState: ValidStates;
      fsm.on(ValidStates.B, (from: ValidStates) => {
         fromState = from;
      });
      fsm.go(ValidStates.B);
      expect(fromState).toBe(ValidStates.A);
   });

   it('passes the "from" state to the ".onEnter" callback', ()=>{
      fsm.from(ValidStates.A).to(ValidStates.B);
      fsm.from(ValidStates.B).to(ValidStates.A);
      var fromState: ValidStates;
      fsm.onEnter(ValidStates.B, (from: ValidStates) => {
         fromState = from;
         return false;
      });
      fsm.go(ValidStates.B);
      expect(fromState).toBe(ValidStates.A);
   });

   it('passes the "to" state to the ".onExit" callback', ()=>{
      fsm.from(ValidStates.A).to(ValidStates.B);
      fsm.from(ValidStates.B).to(ValidStates.A);
      var toState: ValidStates;
      fsm.onExit(ValidStates.A, (to: ValidStates) => {
         toState = to;
         return false;
      });
      fsm.go(ValidStates.B);
      expect(toState).toBe(ValidStates.B);
      expect(fsm.currentState).toBe(ValidStates.A);
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