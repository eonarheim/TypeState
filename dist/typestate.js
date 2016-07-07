// polyfile exports for browser usages
"use strict";
var exports = exports || {};
var typestate;
(function (typestate) {
    /**
     * Transition grouping to faciliate fluent api
     */
    var Transitions = (function () {
        function Transitions(fsm) {
            this.fsm = fsm;
        }
        /**
         * Specify the end state(s) of a transition function
         */
        Transitions.prototype.to = function () {
            var states = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                states[_i - 0] = arguments[_i];
            }
            this.toStates = states;
            this.fsm.addTransitions(this);
        };
        /**
         * Specify that any state in the state enum is value
         * Takes the state enum as an argument
         */
        Transitions.prototype.toAny = function (states) {
            var toStates = [];
            for (var s in states) {
                if (states.hasOwnProperty(s)) {
                    toStates.push(states[s]);
                }
            }
            this.toStates = toStates;
            this.fsm.addTransitions(this);
        };
        return Transitions;
    }());
    typestate.Transitions = Transitions;
    /**
     * Internal representation of a transition function
     */
    var TransitionFunction = (function () {
        function TransitionFunction(fsm, from, to) {
            this.fsm = fsm;
            this.from = from;
            this.to = to;
        }
        return TransitionFunction;
    }());
    typestate.TransitionFunction = TransitionFunction;
    /**
     * Creates a hierarchical state machine, which allows the nesting of states in a super state, usefule
     * for modeling more complicated behaviors than with just FSMs
     * Please refer to https://en.wikipedia.org/wiki/UML_state_machine
     */
    var HierarchicalStateMachine = (function () {
        function HierarchicalStateMachine() {
        }
        return HierarchicalStateMachine;
    }());
    typestate.HierarchicalStateMachine = HierarchicalStateMachine;
    /**
     * A simple finite state machine implemented in TypeScript, the templated argument is meant to be used
     * with an enumeration.
     */
    var FiniteStateMachine = (function () {
        function FiniteStateMachine(startState) {
            this._transitionFunctions = [];
            this._onCallbacks = {};
            this._exitCallbacks = {};
            this._enterCallbacks = {};
            this._invalidTransitionCallback = null;
            this.currentState = startState;
            this._startState = startState;
        }
        FiniteStateMachine.prototype.addTransitions = function (fcn) {
            var _this = this;
            fcn.fromStates.forEach(function (from) {
                fcn.toStates.forEach(function (to) {
                    // self transitions are invalid and don't add duplicates
                    if (from !== to && !_this._validTransition(from, to)) {
                        _this._transitionFunctions.push(new TransitionFunction(_this, from, to));
                    }
                });
            });
        };
        /**
         * Listen for the transition to this state and fire the associated callback
         */
        FiniteStateMachine.prototype.on = function (state, callback) {
            var key = state.toString();
            if (!this._onCallbacks[key]) {
                this._onCallbacks[key] = [];
            }
            this._onCallbacks[key].push(callback);
            return this;
        };
        /**
         * Listen for the transition to this state and fire the associated callback, returning
         * false in the callback will block the transition to this state.
         */
        FiniteStateMachine.prototype.onEnter = function (state, callback) {
            var key = state.toString();
            if (!this._enterCallbacks[key]) {
                this._enterCallbacks[key] = [];
            }
            this._enterCallbacks[key].push(callback);
            return this;
        };
        /**
         * Listen for the transition to this state and fire the associated callback, returning
         * false in the callback will block the transition from this state.
         */
        FiniteStateMachine.prototype.onExit = function (state, callback) {
            var key = state.toString();
            if (!this._exitCallbacks[key]) {
                this._exitCallbacks[key] = [];
            }
            this._exitCallbacks[key].push(callback);
            return this;
        };
        /**
         * List for an invalid transition and handle the error, returning a falsy value will throw an
         * exception, a truthy one will swallow the exception
         */
        FiniteStateMachine.prototype.onInvalidTransition = function (callback) {
            if (!this._invalidTransitionCallback) {
                this._invalidTransitionCallback = callback;
            }
            return this;
        };
        /**
         * Declares the start state(s) of a transition function, must be followed with a '.to(...endStates)'
         */
        FiniteStateMachine.prototype.from = function () {
            var states = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                states[_i - 0] = arguments[_i];
            }
            var _transition = new Transitions(this);
            _transition.fromStates = states;
            return _transition;
        };
        FiniteStateMachine.prototype.fromAny = function (states) {
            var fromStates = [];
            for (var s in states) {
                if (states.hasOwnProperty(s)) {
                    fromStates.push(states[s]);
                }
            }
            var _transition = new Transitions(this);
            _transition.fromStates = fromStates;
            return _transition;
        };
        FiniteStateMachine.prototype._validTransition = function (from, to) {
            return this._transitionFunctions.some(function (tf) {
                return (tf.from === from && tf.to === to);
            });
        };
        /**
         * Check whether a transition to a new state is valid
         */
        FiniteStateMachine.prototype.canGo = function (state) {
            return this.currentState === state || this._validTransition(this.currentState, state);
        };
        /**
         * Transition to another valid state
         */
        FiniteStateMachine.prototype.go = function (state) {
            if (!this.canGo(state)) {
                if (!this._invalidTransitionCallback || !this._invalidTransitionCallback(this.currentState, state)) {
                    throw new Error('Error no transition function exists from state ' + this.currentState.toString() + ' to ' + state.toString());
                }
            }
            else {
                this._transitionTo(state);
            }
        };
        /**
         * This method is availble for overridding for the sake of extensibility.
         * It is called in the event of a successful transition.
         */
        FiniteStateMachine.prototype.onTransition = function (from, to) {
            // pass, does nothing until overidden
        };
        /**
        * Reset the finite state machine back to the start state, DO NOT USE THIS AS A SHORTCUT for a transition.
        * This is for starting the fsm from the beginning.
        */
        FiniteStateMachine.prototype.reset = function () {
            this.currentState = this._startState;
        };
        /**
         * Whether or not the current state equals the given state
         */
        FiniteStateMachine.prototype.is = function (state) {
            return this.currentState === state;
        };
        FiniteStateMachine.prototype._transitionTo = function (state) {
            var _this = this;
            if (!this._exitCallbacks[this.currentState.toString()]) {
                this._exitCallbacks[this.currentState.toString()] = [];
            }
            if (!this._enterCallbacks[state.toString()]) {
                this._enterCallbacks[state.toString()] = [];
            }
            if (!this._onCallbacks[state.toString()]) {
                this._onCallbacks[state.toString()] = [];
            }
            var canExit = this._exitCallbacks[this.currentState.toString()].reduce(function (accum, next) {
                return accum && next.call(_this, state);
            }, true);
            var canEnter = this._enterCallbacks[state.toString()].reduce(function (accum, next) {
                return accum && next.call(_this, _this.currentState);
            }, true);
            if (canExit && canEnter) {
                var old = this.currentState;
                this.currentState = state;
                this._onCallbacks[this.currentState.toString()].forEach(function (fcn) {
                    fcn.call(_this, old);
                });
                this.onTransition(old, state);
            }
        };
        return FiniteStateMachine;
    }());
    typestate.FiniteStateMachine = FiniteStateMachine;
})(typestate = exports.typestate || (exports.typestate = {}));
exports.TypeState = typestate;
// maintain backwards compatibility for people using the pascal cased version
var TypeState = typestate;
//# sourceMappingURL=typestate.js.map