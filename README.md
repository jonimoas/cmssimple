# cmssimple

cmssimple is a fully dockerized cms for text based sites, using lowdb as a database, expressjs as a rest api and vue.js for the editor, offering simplicity and speed both during deployment and during usage.

In order to run the application, you can either use the example docker-compose file, or set the variables manually.

Variables:

      HOST: the location of the site
      NAME: the name of the site
      ADMIN_PASSWORD: the password for making changes using the editor
      MAIN_PORT: the port that the site will be hosted (hardcoded to 8023 in dockerfile)
      NEW_PORT: the port that is seen from the outside, if forwarding has been applied. Else the same as main.

the editor can be acessed on the /vue/#/editor endpoint of your host

the editor can then be used to add a logo and a color scheme, and then the user can start adding and sorting pages at will, also adding new rest api calls, using the text editor and code editors. The user can also backup and restore the database file. 

NOTES during deployment.

The ports are hardcoded in the dockerfiles, to be 8023, if there is a requirement for change, the dockerfiles need to be changed accordingly and the images rebuilt.

The document and code editor for pages do not work well together, you may lose content switching from the code to the document editor.

The rest API editor simply takes a plain javascript function as follows for a call that uses momentjs to return the date and a value that has been sent:

        function(a){var moment=require('moment');console.log(moment()); return [a,moment()];}

The code itself is in the form of an anonymous function, with one argument for requests that only use get parameters and two arguments for requests that use get parameters and post bodies. the npm modules will be installed automatically. The call on the above example can then be called via:

        localhost/plugins/moment/momentTest?test=test

assuming you used 'moment' as the name of the plugin

You can upload your own .vue files, using the editor have a button for them and access them either from that button 
or from the /vue/#/componentName endpoint

libraries used:

        https://github.com/v-comp/v-color
        https://github.com/vuejs/vue
        https://github.com/egoist/vue-slim-tabs
        https://github.com/davidroyer/vue2-editor
        https://github.com/SortableJS/Vue.Draggable
        https://github.com/koca/vue-prism-editor
        https://github.com/cmp-cc/vue-cookies
        https://github.com/expressjs/cors
        https://github.com/expressjs/express
        https://github.com/expressjs/multer
        https://github.com/reworkcss/css
        https://github.com/Jxck/html2json
        https://github.com/typicode/lowdb

![Demo Placeholder](demo.gif)
