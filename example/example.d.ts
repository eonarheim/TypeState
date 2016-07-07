/// <reference path="../src/typestate.d.ts" />
/// <reference path="knockout.d.ts" />
declare enum Elevator {
    DoorsOpened = 0,
    DoorsClosed = 1,
    Moving = 2,
}
declare var fsm: any;
declare var handsInDoor: boolean;
declare class ViewModel {
    constructor();
    HandsInDoor: KnockoutObservable<boolean>;
    CurrentState: KnockoutObservable<Elevator>;
    Move(): void;
    Open(): void;
    Close(): void;
    CanMove: KnockoutComputed<boolean>;
    CanOpen: KnockoutComputed<boolean>;
    CanClose: KnockoutComputed<boolean>;
}
declare var vm: ViewModel;
