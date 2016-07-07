export declare module typestate {
    /**
     * Transition grouping to faciliate fluent api
     */
    class Transitions<T> {
        fsm: FiniteStateMachine<T>;
        constructor(fsm: FiniteStateMachine<T>);
        fromStates: T[];
        toStates: T[];
        /**
         * Specify the end state(s) of a transition function
         */
        to(...states: T[]): void;
        /**
         * Specify that any state in the state enum is value
         * Takes the state enum as an argument
         */
        toAny(states: any): void;
    }
    /**
     * Internal representation of a transition function
     */
    class TransitionFunction<T> {
        fsm: FiniteStateMachine<T>;
        from: T;
        to: T;
        constructor(fsm: FiniteStateMachine<T>, from: T, to: T);
    }
    /**
     * Creates a hierarchical state machine, which allows the nesting of states in a super state, usefule
     * for modeling more complicated behaviors than with just FSMs
     * Please refer to https://en.wikipedia.org/wiki/UML_state_machine
     */
    class HierarchicalStateMachine {
    }
    /**
     * A simple finite state machine implemented in TypeScript, the templated argument is meant to be used
     * with an enumeration.
     */
    class FiniteStateMachine<T> {
        currentState: T;
        private _startState;
        private _transitionFunctions;
        private _onCallbacks;
        private _exitCallbacks;
        private _enterCallbacks;
        private _invalidTransitionCallback;
        constructor(startState: T);
        addTransitions(fcn: Transitions<T>): void;
        /**
         * Listen for the transition to this state and fire the associated callback
         */
        on(state: T, callback: (from?: T) => any): FiniteStateMachine<T>;
        /**
         * Listen for the transition to this state and fire the associated callback, returning
         * false in the callback will block the transition to this state.
         */
        onEnter(state: T, callback: (from?: T) => boolean): FiniteStateMachine<T>;
        /**
         * Listen for the transition to this state and fire the associated callback, returning
         * false in the callback will block the transition from this state.
         */
        onExit(state: T, callback: (to?: T) => boolean): FiniteStateMachine<T>;
        /**
         * List for an invalid transition and handle the error, returning a falsy value will throw an
         * exception, a truthy one will swallow the exception
         */
        onInvalidTransition(callback: (from?: T, to?: T) => boolean): FiniteStateMachine<T>;
        /**
         * Declares the start state(s) of a transition function, must be followed with a '.to(...endStates)'
         */
        from(...states: T[]): Transitions<T>;
        fromAny(states: any): Transitions<T>;
        private _validTransition(from, to);
        /**
         * Check whether a transition to a new state is valid
         */
        canGo(state: T): boolean;
        /**
         * Transition to another valid state
         */
        go(state: T): void;
        /**
         * This method is availble for overridding for the sake of extensibility.
         * It is called in the event of a successful transition.
         */
        onTransition(from: T, to: T): void;
        /**
        * Reset the finite state machine back to the start state, DO NOT USE THIS AS A SHORTCUT for a transition.
        * This is for starting the fsm from the beginning.
        */
        reset(): void;
        /**
         * Whether or not the current state equals the given state
         */
        is(state: T): boolean;
        private _transitionTo(state);
    }
}
export { typestate as TypeState };
