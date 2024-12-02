export function keydownEscape(): KeyboardEvent {
  return new KeyboardEvent('keydown', {
    key: 'Escape',    // Key name
    code: 'Escape',   // Physical key code
    keyCode: 27,      // Deprecated but still widely used
    which: 27,        // Deprecated but still widely used
    bubbles: true,    // Allow the event to bubble
    cancelable: true, // Allow the event to be canceled
  })
}

export function keydownEnter(): KeyboardEvent {
  return new KeyboardEvent('keydown', {
    key: 'Enter',    // Key name
    code: 'Enter',   // Physical key code
    keyCode: 13,     // Deprecated but still widely used
    which: 13,       // Deprecated but still widely used
    bubbles: true,   // Allow the event to bubble
    cancelable: true // Allow the event to be canceled
  });
}