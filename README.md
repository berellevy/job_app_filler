# Job App Filler 2.1.2

Job App Filler is a chrome extension that autofills fields properly
on tedious job sites such as workday, icims, etc. 

[Download](https://chromewebstore.google.com/detail/job-app-filler/gdballabidaicjchgomokfmalodbkeoc)

### Features:

- Open source.
- User's data isn't sent _anywhere_.

## Quickstart

To get started, clone the repo, install the packages and run webpack.

```bash
git clone https://github.com/berellevy/job_app_filler.git
npm i
npm start
```

This will create a **dist** folder in the project root.

Install the extension locally by going to your chrome extensions page by pasting **chrome://extensions/** in your address bar
and clicking the **Load unpacked** button on the top left of the page, choosing the **dist**
folder in the package and hitting ok.

![how to load unpacked](https://github.com/berellevy/job_app_filler/blob/main/docs/load_unpacked.gif)

## Project layout

Because autofilling fields isn't always simple, the project structure is a bit complicated.

**Note:** Because I want to release this project already, I've posted a [video](https://youtu.be/mXEDv9PpdGs) explaining the more complex topics.

### Sandboxing

The extension consists of a content script and an injected script.
The content script injects the injected script and communicates with storage.
The injected script handles all interactions with the webpage and renders the per-fieldd guis.
This is because the content script has very limited access to the webpage and is sandboxed from
any custom js on the webpage, which is needed to fill React controled form fields.

On the other hand, the script injected in the page is has no access to the extensions context,
which is necessary to store saved responses.

The solution to this lies in the fact that the extension context can listen for events dispatched
on the DOM by the page and vice versa. To take advantage of that, the code contains a 'server'
instantiated in the context script that can recieve 'requests' from a 'client' instantiated in
the injected script. The client recieves a 'response' to each 'request', mimicking classic web requests.

### Main Logic

The main logic lives mostly in the injected script and is broken into two main parts;
The `FormField` class and a `React` app which are attached to each fillable input.

#### FormField

The `FormField` class contains all the logic to discover inputs on a page and fill them.
This structure is ported from a python/selenium project [site_applier](https://github.com/berellevy/site_applier).
This includes form field discovery, answer lookup, answer filling and saving current values as an answer.

For a complete description of every field [see here](https://docs.google.com/spreadsheets/d/1DwpJbDmqmOngjBXQNKXoQaExnx4sHvrND0GoHctqoiQ/edit?usp=drive_link).

#### Form Field Discovery

The `BaseFormInput` has a static method called `autoDiscover` which references a static property called `XPATH`. Each subclass needs to override `XPATH` and then call `autoDiscover` to automatically register any fields that match that `XPATH`.
Since fields are grouped by site, the formFields directory will have a separate subdirectory for each website, which will have an index.js with an autoDiscover 
method that collects all the fields.

When is autoDiscover called? Upon loading the extension, a MutationObserver starts watching for any time elements are added or removed from the dom. Every time, we scan the dom for new fields and register them.
This way, we can register fields that are added to the dom in response to a user action.

See [video](https://youtu.be/mXEDv9PpdGs)

#### Answer Lookup

Answers are correlated with fields by a path containing, in this order, page, section, field type and field name.
Answers are then stored in the extension's localstorage in an object nested in that structure.

Path: see [video](https://youtu.be/mXEDv9PpdGs)

#### Answer Filling

Each field usually requuires it's own field filling logic. Workday, for example, 
is a React site with controlled form fields. To fill a field, you have to find the 
correct method which updates the fields state. For example, for text fields it's onChange, but for text fields that have frontend validation, it's onBlur.

#### Saving Current Values as an answer.

When you want to save or update an answer, the simple way is to take the current value and save it. this works well for text fields, because the current answer can be the exact same format as stored answer. For single dropdowns, however, you need to store more that one answer, in case the current dropdown doesn't have your stored 
answer. Then you need a different method which has not yet been implemented.

#### React App

A small `React` app is attached to each fillable filed on the job app site to provide a ui.
This app recieves it's instance of the `FormField` class as a prop.

#### Design

Utilising Material UI. This project is very open to design suggestions on every topic, including the logo.

### Shared Resources

The context script has access to extension APIs that the injected script doesn't, so if the injected
script imports something from the content script directly it can break. Shared resources need to be
broken out into a separate file which can be imported by both the content script and the injected script.

## Versioning

major.site.field.fix

- major: Initial release, and nothing else for now.
- site: Increment each time a site is completed
- field: Increment each time fields are added.
- fix: Fixes
  Version 1.0.2

## Contributing

Contributors are welcome!


## Roadmap

This is a rough outlook of what's to come. For more specifics, see issues.

### Milestones
* Complete functionality for workday job applications.
* Add startswith matching for answers
* add UI for advanced answer saving
* Complete functionality for icims job applications.
* Profiles for for tailored inputs.


## Changelog 

See CHANGELOG.md
