declare module TypeState {
    /**
    * Transition grouping to faciliate fluent api
    * @class Transitions<T>
    */
    class Transitions<T> {
        public fsm: FiniteStateMachine<T>;
        constructor(fsm: FiniteStateMachine<T>);
        public fromStates: T[];
        public toStates: T[];
        /**
        * Specify the end state(s) of a transition function
        * @method to
        * @param ...states {T[]}
        */
        public to(...states: T[]): void;
        public toAny(states: any): void;
    }
    /**
    * Internal representation of a transition function
    * @class TransitionFunction<T>
    */
    class TransitionFunction<T> {
        public fsm: FiniteStateMachine<T>;
        public from: T;
        public to: T;
        constructor(fsm: FiniteStateMachine<T>, from: T, to: T);
    }
    /***
    * A simple finite state machine implemented in TypeScript, the templated argument is meant to be used
    * with an enumeration.
    * @class FiniteStateMachine<T>
    */
    class FiniteStateMachine<T> {
        public currentState: T;
        private _startState;
        private _transitionFunctions;
        private _onCallbacks;
        private _exitCallbacks;
        private _enterCallbacks;
        /**
        * @constructor
        * @param startState {T} Intial starting state
        */
        constructor(startState: T);
        public addTransitions(fcn: Transitions<T>): void;
        /**
        * Listen for the transition to this state and fire the associated callback
        * @method on
        * @param state {T} State to listen to
        * @param callback {fcn} Callback to fire
        */
        public on(state: T, callback: (from?: T) => any): FiniteStateMachine<T>;
        /**
        * Listen for the transition to this state and fire the associated callback, returning
        * false in the callback will block the transition to this state.
        * @method on
        * @param state {T} State to listen to
        * @param callback {fcn} Callback to fire
        */
        public onEnter(state: T, callback: (from?: T) => boolean): FiniteStateMachine<T>;
        /**
        * Listen for the transition to this state and fire the associated callback, returning
        * false in the callback will block the transition from this state.
        * @method on
        * @param state {T} State to listen to
        * @param callback {fcn} Callback to fire
        */
        public onExit(state: T, callback: (to?: T) => boolean): FiniteStateMachine<T>;
        /**
        * Declares the start state(s) of a transition function, must be followed with a '.to(...endStates)'
        * @method from
        * @param ...states {T[]}
        */
        public from(...states: T[]): Transitions<T>;
        public fromAny(states: any): Transitions<T>;
        private _validTransition(from, to);
        /**
        * Check whether a transition to a new state is valide
        * @method canGo
        * @param state {T}
        */
        public canGo(state: T): boolean;
        /**
        * Transition to another valid state
        * @method go
        * @param state {T}
        */
        public go(state: T): void;
        /**
        * Reset the finite state machine back to the start state, DO NOT USE THIS AS A SHORTCUT for a transition. This is for starting the fsm from the beginning.
        * @method reset
        */
        public reset(): void;
        private _transitionTo(state);
    }
}
