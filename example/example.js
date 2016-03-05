var TypeState;
(function (TypeState) {
    /**
     * Transition grouping to faciliate fluent api
     * @class Transitions<T>
     */
    var Transitions = (function () {
        function Transitions(fsm) {
            this.fsm = fsm;
        }
        /**
      * Specify the end state(s) of a transition function
      * @method to
      * @param ...states {T[]}
      */
        Transitions.prototype.to = function () {
            var states = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                states[_i - 0] = arguments[_i];
            }
            this.toStates = states;
            this.fsm.addTransitions(this);
        };
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
    })();
    TypeState.Transitions = Transitions;
    /**
     * Internal representation of a transition function
     * @class TransitionFunction<T>
     */
    var TransitionFunction = (function () {
        function TransitionFunction(fsm, from, to) {
            this.fsm = fsm;
            this.from = from;
            this.to = to;
        }
        return TransitionFunction;
    })();
    TypeState.TransitionFunction = TransitionFunction;
    /***
     * A simple finite state machine implemented in TypeScript, the templated argument is meant to be used
     * with an enumeration.
     * @class FiniteStateMachine<T>
     */
    var FiniteStateMachine = (function () {
        /**
      * @constructor
      * @param startState {T} Intial starting state
      */
        function FiniteStateMachine(startState) {
            this._transitionFunctions = [];
            this._onCallbacks = {};
            this._exitCallbacks = {};
            this._enterCallbacks = {};
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
      * @method on
      * @param state {T} State to listen to
      * @param callback {fcn} Callback to fire
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
            * @method on
            * @param state {T} State to listen to
            * @param callback {fcn} Callback to fire
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
            * @method on
            * @param state {T} State to listen to
            * @param callback {fcn} Callback to fire
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
            * Declares the start state(s) of a transition function, must be followed with a '.to(...endStates)'
            * @method from
            * @param ...states {T[]}
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
      * Check whether a transition to a new state is valide
      * @method canGo
      * @param state {T}
      */
        FiniteStateMachine.prototype.canGo = function (state) {
            return this.currentState === state || this._validTransition(this.currentState, state);
        };
        /**
      * Transition to another valid state
      * @method go
      * @param state {T}
      */
        FiniteStateMachine.prototype.go = function (state) {
            if (!this.canGo(state)) {
                throw new Error('Error no transition function exists from state ' + this.currentState.toString() + ' to ' + state.toString());
            }
            this._transitionTo(state);
        };
        /**
         * This method is availble for overridding for the sake of extensibility.
         * It is called in the event of a successful transition.
         * @method onTransition
         * @param from {T}
         * @param to {T}
         */
        FiniteStateMachine.prototype.onTransition = function (from, to) {
            // pass, does nothing untill overidden
        };
        /**
      * Reset the finite state machine back to the start state, DO NOT USE THIS AS A SHORTCUT for a transition. This is for starting the fsm from the beginning.
      * @method reset
      */
        FiniteStateMachine.prototype.reset = function () {
            this.currentState = this._startState;
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
    })();
    TypeState.FiniteStateMachine = FiniteStateMachine;
})(TypeState || (TypeState = {}));
/// <reference path="../src/typestate.ts" />
/// <reference path="knockout.d.ts" />
// Let's model the states of an elevator
// Define an Enum with all possible valid states
var Elevator;
(function (Elevator) {
    Elevator[Elevator["DoorsOpened"] = 0] = "DoorsOpened";
    Elevator[Elevator["DoorsClosed"] = 1] = "DoorsClosed";
    Elevator[Elevator["Moving"] = 2] = "Moving";
})(Elevator || (Elevator = {}));
// Construct the FSM with the inital state, in this case the elevator starts with its doors opened
var fsm = new TypeState.FiniteStateMachine(Elevator.DoorsOpened);
// Declare the valid state transitions to model your system
// Doors can go from opened to closed, and vice versa
fsm.from(Elevator.DoorsOpened).to(Elevator.DoorsClosed);
fsm.from(Elevator.DoorsClosed).to(Elevator.DoorsOpened);
// Once the doors are closed the elevator may move
fsm.from(Elevator.DoorsClosed).to(Elevator.Moving);
// When the elevator reaches its destination, it may stop moving
fsm.from(Elevator.Moving).to(Elevator.DoorsClosed);
var handsInDoor = false;
// Listen for transitions to DoorsClosed, if the callback returns false the transition is canceled.
fsm.onEnter(Elevator.DoorsClosed, function () {
    if (handsInDoor) {
        return false;
    }
    return true;
});
var ViewModel = (function () {
    function ViewModel() {
        var _this = this;
        this.HandsInDoor = ko.observable();
        this.CurrentState = ko.observable(fsm.currentState);
        this.CanMove = ko.computed(function () {
            _this.CurrentState();
            return fsm.canGo(Elevator.Moving);
        });
        this.CanOpen = ko.computed(function () {
            _this.CurrentState();
            return fsm.canGo(Elevator.DoorsOpened);
        });
        this.CanClose = ko.computed(function () {
            _this.CurrentState();
            return fsm.canGo(Elevator.DoorsClosed);
        });
    }
    ViewModel.prototype.Move = function () {
        fsm.go(Elevator.Moving);
        this.CurrentState(fsm.currentState);
    };
    ViewModel.prototype.Open = function () {
        fsm.go(Elevator.DoorsOpened);
        this.CurrentState(fsm.currentState);
    };
    ViewModel.prototype.Close = function () {
        fsm.go(Elevator.DoorsClosed);
        this.CurrentState(fsm.currentState);
    };
    return ViewModel;
})();
var vm = new ViewModel();
vm.HandsInDoor.subscribe(function (val) {
    handsInDoor = val;
});
ko.applyBindings(vm);
