# Change Log
All significant changes to this project will be documented in this file.

## [1.0.7] - unreleased

### Added
- Advanced answer matching.
- Custom answer editing.
- React context.
- Refresh button.

### Changed
- Improved isFilled implementation.

### Fixed

- If a question had a colon in it, parse key was leaving out any part after the last colon.

### Bugs




## [1.0.6] - 2024-08-09

### Added

- [workday] year input field. boolean radio field. education field of study
- ability to add backup answers for single dropdowns
- [popup] contact me button, 'what's new' dialog

### Changed

- Change answer storage format from nested to flat.
- update ui a little.
- switch to universal answer type.
- remove 'wd1' prefix for workday sites.
- change path display to use breadcrumbs.

### Fixed

### Bugs

- desired total comp, a number only input doesn't fill.
- field more info popup (in extension) is blocked by post application login popup (from workday, see grubhub for example ) 


## [1.0.5] - 2024-08-02

### Added

- [workday] single checkbox, montYear & textarea.
- Has answer badge and is filled badge.
- question path info to popup.

### Changed
 - change tootltip placement to top.
 - more info menu now goes upward.
 - add all field fill methods to queue.
 - make react app refresh function async.

### Fixed

- [workday] simple dropdown hasAnswer 
- [workday] text input bugs
- [fieldFillerQueue] make the result of enqueue awaitable.


## [1.0.4] - 2024-07-31

### Added

- [Workday] Added support for searchable single dropdown.

### Changed

- Change fill button from 'fill' to magic wand icon.

### Fixed

- issues with the ui not syncing

## [1.0.3] - 2024-07-25

### Added
- [Workday] Added Support for simple dropdown fields.
- field filler queue. allows fields to be filled synchronously
- waitForElement util. 
- scroll utills. scrollBack, is in view, wait for element to scroll into view.

### Changed
- [Workday] Moved extension widgets to between label and field so as not to be blocked by dropdown.

### Fixed


## [1.0.2] - 2024-07-22

Initial release!

### Added
- Support for workday text fields.

### Changed

### Fixed
