/// <reference path="../src/typestate.ts" />
/// <reference path="knockout.d.ts" />

// Let's model the states of an elevator

// Define an Enum with all possible valid states
enum Elevator {
   DoorsOpened,
   DoorsClosed,
   Moving
}

// Construct the FSM with the inital state, in this case the elevator starts with its doors opened
var fsm = new FiniteStateMachine<Elevator>(Elevator.DoorsOpened);

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
fsm.onEnter(Elevator.DoorsClosed, ()=>{
   if(handsInDoor){
      return false;
   }
   return true;
});


class ViewModel {
   constructor() { }
   public HandsInDoor: KnockoutObservable<boolean> = ko.observable<boolean>()
   public CurrentState: KnockoutObservable<Elevator> = ko.observable<Elevator>(fsm.currentState)
 
   public Move() {
      fsm.go(Elevator.Moving);
      this.CurrentState(fsm.currentState);
   }

   public Open() {
      fsm.go(Elevator.DoorsOpened);
      this.CurrentState(fsm.currentState);
   }

   public Close() {
      fsm.go(Elevator.DoorsClosed);
      this.CurrentState(fsm.currentState);
   }


   public CanMove: KnockoutComputed<boolean> = ko.computed<boolean>(() => {
      this.CurrentState();
      return fsm.canGo(Elevator.Moving);
   });

   public CanOpen: KnockoutComputed<boolean> = ko.computed<boolean>(() => {
      this.CurrentState();
      return fsm.canGo(Elevator.DoorsOpened);
   });

   public CanClose: KnockoutComputed<boolean> = ko.computed<boolean>(() => {
      this.CurrentState();
      return fsm.canGo(Elevator.DoorsClosed);
   });

}

var vm = new ViewModel();
vm.HandsInDoor.subscribe((val) => {
   handsInDoor = val;
});
ko.applyBindings(vm);