/// <reference path="../dist/typestate.d.ts" />
/// <reference path="knockout.d.ts" />
// Let's model the states of an elevator
// Define an Enum with all possible valid states
var Elevator;
/// <reference path="../dist/typestate.d.ts" />
/// <reference path="knockout.d.ts" />
// Let's model the states of an elevator
// Define an Enum with all possible valid states
(function (Elevator) {
    Elevator[Elevator["DoorsOpened"] = 0] = "DoorsOpened";
    Elevator[Elevator["DoorsClosed"] = 1] = "DoorsClosed";
    Elevator[Elevator["Moving"] = 2] = "Moving";
})(Elevator || (Elevator = {}));
// Construct the FSM with the inital state, in this case the elevator starts with its doors opened
var fsm = new typestate.FiniteStateMachine(Elevator.DoorsOpened);
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
}());
var vm = new ViewModel();
vm.HandsInDoor.subscribe(function (val) {
    handsInDoor = val;
});
ko.applyBindings(vm);
//# sourceMappingURL=example.js.map