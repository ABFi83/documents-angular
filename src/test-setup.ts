// jsdom lacks these browser APIs: inert stand-ins let components that merely use them render.
// A spec that needs to drive one still stubs it itself.
HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) {
  this.open = true;
};
HTMLDialogElement.prototype.close ??= function (this: HTMLDialogElement) {
  this.open = false;
  this.dispatchEvent(new Event('close'));
};

// No Popover API either: stand in for it with the toggle event the browser fires.
HTMLElement.prototype.showPopover ??= function (this: HTMLElement) {
  this.dispatchEvent(Object.assign(new Event('toggle'), { newState: 'open' }));
};
HTMLElement.prototype.hidePopover ??= function (this: HTMLElement) {
  this.dispatchEvent(Object.assign(new Event('toggle'), { newState: 'closed' }));
};
