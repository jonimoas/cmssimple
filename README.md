# cmssimple

cmssimple is a fully dockerized cms for text based sites, using lowdb as a database, expressjs as a rest api and vue.js for the editor, offering simplicity and speed both during deployment and during usage.

In order to run the application, you can either use the example docker-compose file, or set the variables manually.

CMS variables:

      HOST: the location of the site
      NAME: the name of the site
      ADMIN_PASSWORD: the password for making changes using the editor

EDITOR variables:

      HOST: the location of the site

the editor can be used to add a logo and a color scheme, and then the user can start adding and sorting pages at will, also adding new rest api calls, using the text editor and code editors.

NOTES during deployment.

The ports are hardcoded in the dockerfiles, to be 80 for the cms and 2000 for the editor, if there is a requirement for change, the dockerfiles need to be changed accordingly and the images rebuilt.

The document and code editor for pages do not work well together, you may lose content switching from the code to the document editor.

The rest API editor has a specific format for the new calls that need to be made and is as follows for a call that uses momentjs to return the date and a value that has been sent:

        {"momentTest": ["function(a){var moment=require('moment');console.log(moment()); return [a,moment()];}",["moment"]]}

where each field of the JSON file is the name of the function, the first entry in the array is the code itself in the form of an anonymous function, with one argument for requests that
only use get parameters and two arguments for requests that use get parameters and post bodies. The second entry in the array includes the names of the npm modules that need to be installed
and will be installed automatically. The call on the above example can then be called via:

        localhost/plugins/moment/momentTest?test=test

assuming you used 'moment' as the name of the plugin

libraries used:

    editor:
        https://github.com/v-comp/v-color
        https://github.com/vuejs/vue
        https://github.com/egoist/vue-slim-tabs
        https://github.com/davidroyer/vue2-editor
        https://github.com/SortableJS/Vue.Draggable
        https://github.com/koca/vue-prism-editor

    cms:
        https://github.com/expressjs/cors
        https://github.com/expressjs/express
        https://github.com/reworkcss/css
        https://github.com/Jxck/html2json
        https://github.com/typicode/lowdb

![Demo Placeholder](demo.gif)
