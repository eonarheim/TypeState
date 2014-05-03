[![Build Status](https://travis-ci.org/eonarheim/TypeState.svg?branch=master)](https://travis-ci.org/eonarheim/TypeState)
TypeState
========

TypeState is a strongly typed finite state machine for TypeScript or JavaScript. Finite state machines are useful for modeling complicated flows and keeping track of state.

Installation methods:

`Install-Package TypeState`

`npm install typestate`

`bower install typestate`

###Basic Example:
```javascript
// Let's model the states of an elevator

// Define an Enum with all possible valid states
enum Elevator {
   DoorsOpened,
   DoorsClosed,
   Moving
}

// Construct the FSM with the inital state, in this case the elevator starts with its doors opened
var fsm = new TypeState.FiniteStateMachine<Elevator>(Elevator.DoorsOpened);

// Declare the valid state transitions to model your system

// Doors can go from opened to closed, and vice versa
fsm.from(Elevator.DoorsOpened).to(Elevator.DoorsClosed);
fsm.from(Elevator.DoorsClosed).to(Elevator.DoorsOpened);

// Once the doors are closed the elevator may move
fsm.from(Elevator.DoorsClosed).to(Elevator.Moving);

// When the elevator reaches its destination, it may stop moving
fsm.from(Elevator.Moving).to(Elevator.DoorsClosed);


// Test validity of transitions from the current state, in this case 'Elevator.DoorsOpened'
fsm.canGo(Elevator.DoorsClosed); // returns true
fsm.canGo(Elevator.Moving); //returns false

// Go to a new state, closing the elevator doors. 
fsm.go(Elevator.DoorsClosed); // The fsm.currentState is now set to 'Elevator.DoorsClosed'

// The elevator can now move or open the doors again
fsm.canGo(Elevator.Moving); // returns true
fsm.canGo(Elevator.DoorsOpened); //returns true

```

###Using JavaScript
JavaScript is easy with TypedFSM. The finite state machine relies on states that can be converted to strings with the `.toString()` method. So to use JavaScript simple replace the top few lines of the previous example with the following:

```javascript
var Elevator = {
	DoorsOpened : "DoorsOpened",
	DoorsClosed : "DoorsClosed",
	Moving : "Moving"
}

var fsm = new FiniteStateMachine(Elevator.DoorsOpened)

```


###Listening for state changes
TypedFSM allows you to listen to state changes. For example if the elevator starts moving, we would like to play some elevator music. Additionally we would like to stop the music when the elevator stops.

```javascript

fsm.on(Elevator.Moving, ()=>{
	playGroovyElevatorMusic();
});

fsm.on(Elevator.DoorsClosed, ()=>{
	stopGroovyElevatorMusic();
});

```

###Interrupting Transitions

Sometimes you need to interrupt transitions. You may interrupt transitions to a state with `onEnter(STATE, CALLBACK)` and interrupt transitions from a state with the `onExit(STATE, CALLBACK)`. If the `CALLBACK` returns false the transition is canceled and the state will not change.

```javascript

console.log("DoorsOpened", fsm.currentState === Elevator.DoorsOpened); // true
var handsInDoor = true;

// Listen for transitions to DoorsClosed, if the callback returns false the transition is canceled.
fsm.onEnter(Elevator.DoorsClosed, ()=>{
   if(handsInDoor){
      return false;
   }
   return true;
});

// Attempt to transition
fsm.go(Elevator.DoorsClosed);

// State does not change to DoorsClosed
console.log("DoorsOpened", fsm.currentState === Elevator.DoorsOpened); //true

```

###Wildcard Transitions

If all transitions to or from a certain state are valid, there are a convience wildcard methods `fromAny(STATE_ENUM)` and `toAny(STATE_ENUM)` for such cases.

```javascript

enum ValidStates {
	A,
	B,
	C,
	D
}

var newFsm = new TypeState.FiniteStateMachine<ValidStates>(ValidStates.A);
newFsm.from(ValidStates.A).toAny(ValidStates);
newFsm.fromAny(ValidStates).to(ValidStates.B);


```


