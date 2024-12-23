# Change Log
All significant changes to this project will be documented in this file.

## [2.1.2] - 2024-12-10

### Added
### Changed
- only load 10 answers per question.
- large code reorg.
### Fixed

### Bugs


## [2.1.1] - 2024-12-03

### Added
- [greenhouse.io] fields: Month-Year, searchable dropdown, employment repeating section.
- [greenhouse.io] scrollback
### Changed
- Extension name.
### Fixed
- [greenhouse.io] fields: multi dropdown.

### Bugs
- [job-boards.greenhous] When filling, scroll flies all over the place.
- [boards.greenhouse] DropdownSearchable doesn't always fill.

## [2.1.0] - 2024-11-19

### Added
- [job-boards.greenhouse] All fields and repeating sections. except that multiselect fields can only be autofilled with one answer. 
### Changed
- [workday] Break up Date fields into separate modules.
- [internal] getElement can now accept a variety of contexts. 

### Fixed

### Bugs
- [job-boards.greenhous] When filling, scroll flies all over the place.
- [boards.greenhouse] DropdownSearchable doesn't always fill.


## [2.0.0] - 2024-11-06

### Added
- [boards.greenhouse] including iFrames. most common fields: 
  - basic select
  - textarea
  - simple dropdown 
  - address-searchabe 
  - single file upload
  - text field
### Changed

### Fixed

### Bugs



## [1.0.10] - 2024-10-06

### Added
- [UI] click outside to close modal.

### Changed
- [lookup] New in memory persisted datastore with text search.
- [UI] Improved Flow to save answers
### Fixed

### Bugs


## [1.0.9] - 2024-09-26

### Added

### Changed
- [lookup] remove page from answer matching.
- [UI] popup closes on clickaway and escape key press.

### Fixed
- [UI] add z-index to popup.
- [UI] prevent widgets from showing up on search pages.

### Bugs


## [1.0.8] - 2024-09-12

### Added
- [workday] Multi checkbox field. Month-day-year field with relative date capabilities. Multi file upload.

### Changed
- [lookup] all matchers match on page start

### Fixed
- [workday] fix bug where number inputs appear filled but don't work at final submit.

### Bugs


## [1.0.7] - 2024-09-04

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
