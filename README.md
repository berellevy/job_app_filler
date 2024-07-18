
# Job App Filler 1.0.2

Job App Filler is a chrome extension that autofills fields properly 
on tedious job sites such as workday, icims, etc.

### Features:

- Open source.
- User's data isn't sent *anywhere*

## Quickstart

To get started, clone the repo, install the packages and run webpack.

```bash
git clone https://github.com/berellevy/job_app_filler.git
npm i
npm start
```
This will create a **dist** folder in the project root.

Install the extension locally by going to <chrome://extensions/> in your browswer 
and clicking the **Load unpacked** button on the top right hand of the page, choosing the **dist** 
folder in package and hitting ok.

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

#### Form Field Discovery
See [video](https://youtu.be/mXEDv9PpdGs)

#### Answer Lookup
Answers are correlated with fields by a path containing, in this order, page, section, field type and field name.
Answers are then stored in the extension's localstorage in an object nested in that structure.

Path: see [video](https://youtu.be/mXEDv9PpdGs) 

#### Answer Filling

See [video](https://youtu.be/mXEDv9PpdGs)

#### Saving Current Values as an answer.

See [video](https://youtu.be/mXEDv9PpdGs)

#### React App
A small `React` app is attached to each fillable filed on the job app site to provide a ui.
This app recieves it's instance of the `FormField` class as a prop. 

#### Design

Utilising Material UI. This project is very open to design suggestions on every topic, including the logo.

### Shared Resources

The context script has access to extension APIs that the injected script doesn't, so if the injected 
script imports something from the content script directly it can break. Shared resources need to be 
broken out into a separate file which can be imported by both the content script and the injected script.

### Reloading

Changes reflect in the browser in different ways. making changes to the react app

## Versioning

major.site.field.fix
- major: Initial release, and nothing else for now.
- site: Increment each time a site is completed
- field: Increment each time fields are added.
- fix: Fixes
Version 1.0.2

