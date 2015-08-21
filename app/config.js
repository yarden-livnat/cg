System.config({
  "baseURL": "/",
  "transpiler": "babel",
  "babelOptions": {
    "optional": [
      "runtime"
    ]
  },
  "paths": {
    "*": "*.js",
    "github:*": "jspm_packages/github/*.js",
    "npm:*": "jspm_packages/npm/*.js"
  },
  "shim": {
    "bootstrap-multiselect": {
      "deps": [
        "jquery"
      ]
    }
  }
});

System.config({
  "map": {
    "babel": "npm:babel-core@5.8.20",
    "babel-runtime": "npm:babel-runtime@5.8.20",
    "bootstrap": "github:twbs/bootstrap@3.3.5",
    "bootstrap-multiselect": "github:davidstutz/bootstrap-multiselect@0.9.13",
    "core-js": "npm:core-js@0.9.18",
    "d3": "github:mbostock/d3@3.5.6",
    "davidstutz/bootstrap-multiselect": "github:davidstutz/bootstrap-multiselect@0.9.13",
    "firstopinion/formatter.js": "github:firstopinion/formatter.js@0.1.5",
    "font-awesome": "npm:font-awesome@4.4.0",
    "formatter.js": "github:firstopinion/formatter.js@0.1.5",
    "jquery": "github:components/jquery@2.1.4",
    "leaflet": "github:Leaflet/Leaflet@0.7.3",
    "lockr": "github:tsironis/lockr@0.8.2",
    "lodash": "npm:lodash@3.10.1",
    "mbostock/queue": "github:mbostock/queue@1.0.7",
    "postal": "npm:postal@1.0.6",
    "queue": "github:mbostock/queue@1.0.7",
    "crossfilter": "github:square/crossfilter@1.3.12",
    "github:jspm/nodelibs-process@0.1.1": {
      "process": "npm:process@0.10.1"
    },
    "github:twbs/bootstrap@3.3.5": {
      "jquery": "github:components/jquery@2.1.4"
    },
    "npm:babel-runtime@5.8.20": {
      "process": "github:jspm/nodelibs-process@0.1.1"
    },
    "npm:core-js@0.9.18": {
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "process": "github:jspm/nodelibs-process@0.1.1",
      "systemjs-json": "github:systemjs/plugin-json@0.1.0"
    },
    "npm:font-awesome@4.4.0": {
      "css": "github:systemjs/plugin-css@0.1.13"
    },
    "npm:lodash@3.10.1": {
      "process": "github:jspm/nodelibs-process@0.1.1"
    },
    "npm:postal@1.0.6": {
      "lodash": "npm:lodash@3.10.1"
    }
  }
});

