declare module TypeState {
    /**
     * Transition grouping to faciliate fluent api
     * @class Transitions<T>
     */
    class Transitions<T> {
        fsm: FiniteStateMachine<T>;
        constructor(fsm: FiniteStateMachine<T>);
        fromStates: T[];
        toStates: T[];
        /**
      * Specify the end state(s) of a transition function
      * @method to
      * @param ...states {T[]}
      */
        to(...states: T[]): void;
        toAny(states: any): void;
    }
    /**
     * Internal representation of a transition function
     * @class TransitionFunction<T>
     */
    class TransitionFunction<T> {
        fsm: FiniteStateMachine<T>;
        from: T;
        to: T;
        constructor(fsm: FiniteStateMachine<T>, from: T, to: T);
    }
    /***
     * A simple finite state machine implemented in TypeScript, the templated argument is meant to be used
     * with an enumeration.
     * @class FiniteStateMachine<T>
     */
    class FiniteStateMachine<T> {
        currentState: T;
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
        addTransitions(fcn: Transitions<T>): void;
        /**
      * Listen for the transition to this state and fire the associated callback
      * @method on
      * @param state {T} State to listen to
      * @param callback {fcn} Callback to fire
      */
        on(state: T, callback: (from?: T) => any): FiniteStateMachine<T>;
        /**
            * Listen for the transition to this state and fire the associated callback, returning
            * false in the callback will block the transition to this state.
            * @method on
            * @param state {T} State to listen to
            * @param callback {fcn} Callback to fire
            */
        onEnter(state: T, callback: (from?: T) => boolean): FiniteStateMachine<T>;
        /**
            * Listen for the transition to this state and fire the associated callback, returning
            * false in the callback will block the transition from this state.
            * @method on
            * @param state {T} State to listen to
            * @param callback {fcn} Callback to fire
            */
        onExit(state: T, callback: (to?: T) => boolean): FiniteStateMachine<T>;
        /**
            * Declares the start state(s) of a transition function, must be followed with a '.to(...endStates)'
            * @method from
            * @param ...states {T[]}
            */
        from(...states: T[]): Transitions<T>;
        fromAny(states: any): Transitions<T>;
        private _validTransition(from, to);
        /**
      * Check whether a transition to a new state is valide
      * @method canGo
      * @param state {T}
      */
        canGo(state: T): boolean;
        /**
      * Transition to another valid state
      * @method go
      * @param state {T}
      */
        go(state: T): void;
        /**
         * This method is availble for overridding for the sake of extensibility.
         * It is called in the event of a successful transition.
         * @method onTransition
         * @param from {T}
         * @param to {T}
         */
        onTransition(from: T, to: T): void;
        /**
      * Reset the finite state machine back to the start state, DO NOT USE THIS AS A SHORTCUT for a transition. This is for starting the fsm from the beginning.
      * @method reset
      */
        reset(): void;
        private _transitionTo(state);
    }
}
