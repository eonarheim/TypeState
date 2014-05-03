module TypeState {
   /**
    * Transition grouping to faciliate fluent api
    * @class Transitions<T>
    */
   export class Transitions<T> {
      constructor(public fsm: FiniteStateMachine<T>) { }

      public fromStates: T[];
      public toStates: T[];


      /**
    * Specify the end state(s) of a transition function
    * @method to
    * @param ...states {T[]}
    */
      public to(...states: T[]) {
         this.toStates = states;
         this.fsm.addTransitions(this);
      }

      public toAny(states: any) {
         var toStates: T[] = [];
         for (var s in states) {
            if (states.hasOwnProperty(s)) {
               toStates.push((<T>states[s]));
            }
         }

         this.toStates = toStates;
         this.fsm.addTransitions(this);
      }
   }

   /**
    * Internal representation of a transition function
    * @class TransitionFunction<T>
    */
   export class TransitionFunction<T> {
      constructor(public fsm: FiniteStateMachine<T>, public from: T, public to: T) { }
   }

   /***
    * A simple finite state machine implemented in TypeScript, the templated argument is meant to be used
    * with an enumeration.
    * @class FiniteStateMachine<T>
    */
   export class FiniteStateMachine<T> {
      public currentState: T;
      private _startState: T;
      private _transitionFunctions: TransitionFunction<T>[] = [];
      private _onCallbacks: { [key: string]: { (from: T): void; }[] } = {};
      private _exitCallbacks: { [key: string]: { (to: T): boolean; }[] } = {};
      private _enterCallbacks: { [key: string]: { (from: T): boolean; }[] } = {};


      /**
    * @constructor
    * @param startState {T} Intial starting state
    */
      constructor(startState: T) {
         this.currentState = startState;
         this._startState = startState;
      }

      public addTransitions(fcn: Transitions<T>) {
         fcn.fromStates.forEach(from => {
            fcn.toStates.forEach(to => {
               // self transitions are invalid and don't add duplicates
               if (from !== to && !this._validTransition(from, to)) {
                  this._transitionFunctions.push(new TransitionFunction<T>(this, from, to));
               }
            });
         });
      }

      /**
    * Listen for the transition to this state and fire the associated callback
    * @method on
    * @param state {T} State to listen to
    * @param callback {fcn} Callback to fire
    */
      public on(state: T, callback: (from?: T) => any): FiniteStateMachine<T> {
         var key = state.toString();
         if (!this._onCallbacks[key]) {
            this._onCallbacks[key] = [];
         }
         this._onCallbacks[key].push(callback);
         return this;
      }

      /**
          * Listen for the transition to this state and fire the associated callback, returning
          * false in the callback will block the transition to this state.
          * @method on
          * @param state {T} State to listen to
          * @param callback {fcn} Callback to fire
          */
      public onEnter(state: T, callback: (from?: T) => boolean): FiniteStateMachine<T> {
         var key = state.toString();
         if (!this._enterCallbacks[key]) {
            this._enterCallbacks[key] = [];
         }
         this._enterCallbacks[key].push(callback);
         return this;
      }

      /**
          * Listen for the transition to this state and fire the associated callback, returning
          * false in the callback will block the transition from this state.
          * @method on
          * @param state {T} State to listen to
          * @param callback {fcn} Callback to fire
          */
      public onExit(state: T, callback: (to?: T) => boolean): FiniteStateMachine<T> {
         var key = state.toString();
         if (!this._exitCallbacks[key]) {
            this._exitCallbacks[key] = [];
         }
         this._exitCallbacks[key].push(callback);
         return this;
      }

      /**
          * Declares the start state(s) of a transition function, must be followed with a '.to(...endStates)'
          * @method from
          * @param ...states {T[]}
          */
      public from(...states: T[]): Transitions<T> {
         var _transition = new Transitions<T>(this);
         _transition.fromStates = states;
         return _transition;
      }

      public fromAny(states: any): Transitions<T> {
         var fromStates: T[] = [];
         for (var s in states) {
            if (states.hasOwnProperty(s)) {
               fromStates.push((<T>states[s]));
            }
         }

         var _transition = new Transitions<T>(this);
         _transition.fromStates = fromStates;
         return _transition;
      }

      private _validTransition(from: T, to: T): boolean {
         return this._transitionFunctions.some(tf => {
            return (tf.from === from && tf.to === to);
         });
      }

      /**
    * Check whether a transition to a new state is valide
    * @method canGo
    * @param state {T}
    */
      public canGo(state: T): boolean {
         return this.currentState === state || this._validTransition(this.currentState, state);
      }

      /**
    * Transition to another valid state
    * @method go
    * @param state {T}
    */
      public go(state: T): void {
         if (!this.canGo(state)) {
            throw new Error('Error no transition function exists from state ' + this.currentState.toString() + ' to ' + state.toString());
         }
         this._transitionTo(state);
      }

      /**
    * Reset the finite state machine back to the start state, DO NOT USE THIS AS A SHORTCUT for a transition. This is for starting the fsm from the beginning.
    * @method reset
    */
      public reset(): void {
         this.currentState = this._startState;
      }

      private _transitionTo(state: T) {
         if (!this._exitCallbacks[this.currentState.toString()]) {
            this._exitCallbacks[this.currentState.toString()] = [];
         }

         if (!this._enterCallbacks[state.toString()]) {
            this._enterCallbacks[state.toString()] = [];
         }

         if (!this._onCallbacks[state.toString()]) {
            this._onCallbacks[state.toString()] = [];
         }


         var canExit = this._exitCallbacks[this.currentState.toString()].reduce<boolean>((accum: boolean, next: () => boolean) => {
            return accum && (<boolean> next.call(this, state));
         }, true);

         var canEnter = this._enterCallbacks[state.toString()].reduce<boolean>((accum: boolean, next: () => boolean) => {
            return accum && (<boolean> next.call(this, this.currentState));
         }, true);

         if (canExit && canEnter) {
            var old = this.currentState;
            this.currentState = state;
            this._onCallbacks[this.currentState.toString()].forEach(fcn => {
               fcn.call(this, old);
            });
         }
      }
   }
}