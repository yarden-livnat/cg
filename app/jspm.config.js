SystemJS.config({
  paths: {
    "npm:": "jspm_packages/npm/",
    "github:": "jspm_packages/github/",
    "local:": "jspm_packages/local/",
    "cg/": "src/"
  },
  browserConfig: {
    "baseURL": "/"
  },
  transpiler: "plugin-babel",
  packages: {
    "cg": {
      "main": "app.js",
      "format": "esm",
      "meta": {
        "*.js": {
          "loader": "plugin-babel"
        }
      }
    }
  },
  map: {
    "crossfilter": "github:square/crossfilter@1.3.12",
    "lockr": "github:tsironis/lockr@0.8.4"
  }
});

SystemJS.config({
  packageConfigPaths: [
    "npm:@*/*.json",
    "npm:*.json",
    "github:*/*.json",
    "local:*.json"
  ],
  map: {
    "babel-polyfill": "npm:babel-polyfill@6.22.0",
    "es6-shim": "github:es-shims/es6-shim@0.35.2",
    "cg-core": "github:yarden-livnat/cg-core@master",
    "constants": "npm:jspm-nodelibs-constants@0.2.0",
    "crypto": "github:jspm/nodelibs-crypto@0.2.0-alpha",
    "d3-scale-chromatic": "npm:d3-scale-chromatic@1.1.0",
    "d3/d3-queue": "github:d3/d3-queue@3.0.3",
    "d3-time-format": "npm:d3-time-format@2.0.3",
    "d3": "npm:d3@4.4.2",
    "d3-queue": "npm:d3-queue@3.0.3",
    "assert": "npm:jspm-nodelibs-assert@0.2.0",
    "buffer": "github:jspm/nodelibs-buffer@0.2.0-alpha",
    "child_process": "npm:jspm-nodelibs-child_process@0.2.0",
    "events": "npm:jspm-nodelibs-events@0.2.0",
    "firstopinion/formatter.js": "github:firstopinion/formatter.js@0.1.5",
    "font-awesome": "npm:font-awesome@4.7.0",
    "fs": "github:jspm/nodelibs-fs@0.2.0-alpha",
    "http": "npm:jspm-nodelibs-http@0.2.0",
    "https": "npm:jspm-nodelibs-https@0.2.1",
    "leaflet": "github:Leaflet/Leaflet@0.7.7",
    "os": "npm:jspm-nodelibs-os@0.2.0",
    "path": "npm:jspm-nodelibs-path@0.2.1",
    "plugin-babel": "npm:systemjs-plugin-babel@0.0.12",
    "postal": "npm:postal@2.0.5",
    "process": "github:jspm/nodelibs-process@0.2.0-alpha",
    "square/crossfilter": "github:square/crossfilter@1.3.12",
    "stream": "github:jspm/nodelibs-stream@0.2.0-alpha",
    "string_decoder": "npm:jspm-nodelibs-string_decoder@0.2.0",
    "tsironis/lockr": "github:tsironis/lockr@0.8.4",
    "url": "npm:jspm-nodelibs-url@0.2.0",
    "util": "npm:jspm-nodelibs-util@0.2.1",
    "vm": "github:jspm/nodelibs-vm@0.2.0-alpha",
    "yarden-livnat/cg-core": "github:yarden-livnat/cg-core@master"
  },
  packages: {
    "github:jspm/nodelibs-buffer@0.2.0-alpha": {
      "map": {
        "buffer-browserify": "npm:buffer@4.9.1"
      }
    },
    "npm:url@0.11.0": {
      "map": {
        "querystring": "npm:querystring@0.2.0",
        "punycode": "npm:punycode@1.3.2"
      }
    },
    "github:yarden-livnat/cg-core@master": {
      "map": {
        "d3": "npm:d3@4.4.2",
        "css": "github:systemjs/plugin-css@0.1.32"
      }
    },
    "npm:buffer@4.9.1": {
      "map": {
        "isarray": "npm:isarray@1.0.0",
        "base64-js": "npm:base64-js@1.2.0",
        "ieee754": "npm:ieee754@1.1.8"
      }
    },
    "github:jspm/nodelibs-crypto@0.2.0-alpha": {
      "map": {
        "crypto-browserify": "npm:crypto-browserify@3.11.0"
      }
    },
    "npm:crypto-browserify@3.11.0": {
      "map": {
        "inherits": "npm:inherits@2.0.3",
        "create-ecdh": "npm:create-ecdh@4.0.0",
        "browserify-cipher": "npm:browserify-cipher@1.0.0",
        "pbkdf2": "npm:pbkdf2@3.0.9",
        "browserify-sign": "npm:browserify-sign@4.0.0",
        "create-hash": "npm:create-hash@1.1.2",
        "randombytes": "npm:randombytes@2.0.3",
        "public-encrypt": "npm:public-encrypt@4.0.0",
        "create-hmac": "npm:create-hmac@1.1.4",
        "diffie-hellman": "npm:diffie-hellman@5.0.2"
      }
    },
    "npm:browserify-sign@4.0.0": {
      "map": {
        "inherits": "npm:inherits@2.0.3",
        "create-hash": "npm:create-hash@1.1.2",
        "create-hmac": "npm:create-hmac@1.1.4",
        "bn.js": "npm:bn.js@4.11.6",
        "elliptic": "npm:elliptic@6.3.2",
        "browserify-rsa": "npm:browserify-rsa@4.0.1",
        "parse-asn1": "npm:parse-asn1@5.0.0"
      }
    },
    "npm:create-hash@1.1.2": {
      "map": {
        "inherits": "npm:inherits@2.0.3",
        "ripemd160": "npm:ripemd160@1.0.1",
        "cipher-base": "npm:cipher-base@1.0.3",
        "sha.js": "npm:sha.js@2.4.8"
      }
    },
    "npm:create-hmac@1.1.4": {
      "map": {
        "inherits": "npm:inherits@2.0.3",
        "create-hash": "npm:create-hash@1.1.2"
      }
    },
    "npm:public-encrypt@4.0.0": {
      "map": {
        "create-hash": "npm:create-hash@1.1.2",
        "randombytes": "npm:randombytes@2.0.3",
        "bn.js": "npm:bn.js@4.11.6",
        "browserify-rsa": "npm:browserify-rsa@4.0.1",
        "parse-asn1": "npm:parse-asn1@5.0.0"
      }
    },
    "npm:diffie-hellman@5.0.2": {
      "map": {
        "randombytes": "npm:randombytes@2.0.3",
        "bn.js": "npm:bn.js@4.11.6",
        "miller-rabin": "npm:miller-rabin@4.0.0"
      }
    },
    "npm:create-ecdh@4.0.0": {
      "map": {
        "bn.js": "npm:bn.js@4.11.6",
        "elliptic": "npm:elliptic@6.3.2"
      }
    },
    "npm:browserify-cipher@1.0.0": {
      "map": {
        "browserify-des": "npm:browserify-des@1.0.0",
        "evp_bytestokey": "npm:evp_bytestokey@1.0.0",
        "browserify-aes": "npm:browserify-aes@1.0.6"
      }
    },
    "npm:browserify-des@1.0.0": {
      "map": {
        "inherits": "npm:inherits@2.0.3",
        "cipher-base": "npm:cipher-base@1.0.3",
        "des.js": "npm:des.js@1.0.0"
      }
    },
    "npm:evp_bytestokey@1.0.0": {
      "map": {
        "create-hash": "npm:create-hash@1.1.2"
      }
    },
    "npm:browserify-aes@1.0.6": {
      "map": {
        "inherits": "npm:inherits@2.0.3",
        "create-hash": "npm:create-hash@1.1.2",
        "evp_bytestokey": "npm:evp_bytestokey@1.0.0",
        "cipher-base": "npm:cipher-base@1.0.3",
        "buffer-xor": "npm:buffer-xor@1.0.3"
      }
    },
    "npm:browserify-rsa@4.0.1": {
      "map": {
        "bn.js": "npm:bn.js@4.11.6",
        "randombytes": "npm:randombytes@2.0.3"
      }
    },
    "npm:parse-asn1@5.0.0": {
      "map": {
        "browserify-aes": "npm:browserify-aes@1.0.6",
        "create-hash": "npm:create-hash@1.1.2",
        "evp_bytestokey": "npm:evp_bytestokey@1.0.0",
        "pbkdf2": "npm:pbkdf2@3.0.9",
        "asn1.js": "npm:asn1.js@4.9.1"
      }
    },
    "npm:miller-rabin@4.0.0": {
      "map": {
        "bn.js": "npm:bn.js@4.11.6",
        "brorand": "npm:brorand@1.0.6"
      }
    },
    "npm:des.js@1.0.0": {
      "map": {
        "inherits": "npm:inherits@2.0.3",
        "minimalistic-assert": "npm:minimalistic-assert@1.0.0"
      }
    },
    "npm:hash.js@1.0.3": {
      "map": {
        "inherits": "npm:inherits@2.0.3"
      }
    },
    "github:jspm/nodelibs-stream@0.2.0-alpha": {
      "map": {
        "stream-browserify": "npm:stream-browserify@2.0.1"
      }
    },
    "npm:stream-browserify@2.0.1": {
      "map": {
        "inherits": "npm:inherits@2.0.3",
        "readable-stream": "npm:readable-stream@2.2.2"
      }
    },
    "github:Leaflet/Leaflet@0.7.7": {
      "map": {
        "css": "github:systemjs/plugin-css@0.1.32"
      }
    },
    "npm:d3@4.4.2": {
      "map": {
        "d3-queue": "npm:d3-queue@3.0.3",
        "d3-time-format": "npm:d3-time-format@2.0.3",
        "d3-interpolate": "npm:d3-interpolate@1.1.3",
        "d3-collection": "npm:d3-collection@1.0.2",
        "d3-polygon": "npm:d3-polygon@1.0.2",
        "d3-path": "npm:d3-path@1.0.3",
        "d3-array": "npm:d3-array@1.0.2",
        "d3-drag": "npm:d3-drag@1.0.2",
        "d3-shape": "npm:d3-shape@1.0.4",
        "d3-random": "npm:d3-random@1.0.2",
        "d3-scale": "npm:d3-scale@1.0.4",
        "d3-request": "npm:d3-request@1.0.3",
        "d3-selection": "npm:d3-selection@1.0.3",
        "d3-voronoi": "npm:d3-voronoi@1.1.1",
        "d3-time": "npm:d3-time@1.0.4",
        "d3-geo": "npm:d3-geo@1.4.0",
        "d3-hierarchy": "npm:d3-hierarchy@1.0.3",
        "d3-timer": "npm:d3-timer@1.0.3",
        "d3-format": "npm:d3-format@1.0.2",
        "d3-ease": "npm:d3-ease@1.0.2",
        "d3-axis": "npm:d3-axis@1.0.4",
        "d3-color": "npm:d3-color@1.0.2",
        "d3-transition": "npm:d3-transition@1.0.3",
        "d3-quadtree": "npm:d3-quadtree@1.0.2",
        "d3-chord": "npm:d3-chord@1.0.3",
        "d3-dsv": "npm:d3-dsv@1.0.3",
        "d3-force": "npm:d3-force@1.0.4",
        "d3-dispatch": "npm:d3-dispatch@1.0.2",
        "d3-brush": "npm:d3-brush@1.0.3",
        "d3-zoom": "npm:d3-zoom@1.1.1"
      }
    },
    "npm:babel-polyfill@6.22.0": {
      "map": {
        "regenerator-runtime": "npm:regenerator-runtime@0.10.1",
        "core-js": "npm:core-js@2.4.1",
        "babel-runtime": "npm:babel-runtime@6.22.0"
      }
    },
    "npm:d3-scale-chromatic@1.1.0": {
      "map": {
        "d3-interpolate": "npm:d3-interpolate@1.1.3"
      }
    },
    "npm:d3-time-format@2.0.3": {
      "map": {
        "d3-time": "npm:d3-time@1.0.4"
      }
    },
    "npm:d3-interpolate@1.1.3": {
      "map": {
        "d3-color": "npm:d3-color@1.0.2"
      }
    },
    "npm:d3-shape@1.0.4": {
      "map": {
        "d3-path": "npm:d3-path@1.0.3"
      }
    },
    "npm:d3-drag@1.0.2": {
      "map": {
        "d3-selection": "npm:d3-selection@1.0.3",
        "d3-dispatch": "npm:d3-dispatch@1.0.2"
      }
    },
    "npm:d3-scale@1.0.4": {
      "map": {
        "d3-format": "npm:d3-format@1.0.2",
        "d3-array": "npm:d3-array@1.0.2",
        "d3-collection": "npm:d3-collection@1.0.2",
        "d3-color": "npm:d3-color@1.0.2",
        "d3-interpolate": "npm:d3-interpolate@1.1.3",
        "d3-time": "npm:d3-time@1.0.4",
        "d3-time-format": "npm:d3-time-format@2.0.3"
      }
    },
    "npm:d3-request@1.0.3": {
      "map": {
        "d3-collection": "npm:d3-collection@1.0.2",
        "d3-dsv": "npm:d3-dsv@1.0.3",
        "d3-dispatch": "npm:d3-dispatch@1.0.2",
        "xmlhttprequest": "npm:xmlhttprequest@1.8.0"
      }
    },
    "npm:d3-geo@1.4.0": {
      "map": {
        "d3-array": "npm:d3-array@1.0.2"
      }
    },
    "npm:d3-transition@1.0.3": {
      "map": {
        "d3-timer": "npm:d3-timer@1.0.3",
        "d3-color": "npm:d3-color@1.0.2",
        "d3-ease": "npm:d3-ease@1.0.2",
        "d3-interpolate": "npm:d3-interpolate@1.1.3",
        "d3-selection": "npm:d3-selection@1.0.3",
        "d3-dispatch": "npm:d3-dispatch@1.0.2"
      }
    },
    "npm:postal@2.0.5": {
      "map": {
        "lodash": "npm:lodash@4.17.4"
      }
    },
    "npm:babel-runtime@6.22.0": {
      "map": {
        "core-js": "npm:core-js@2.4.1",
        "regenerator-runtime": "npm:regenerator-runtime@0.10.1"
      }
    },
    "npm:d3-force@1.0.4": {
      "map": {
        "d3-timer": "npm:d3-timer@1.0.3",
        "d3-collection": "npm:d3-collection@1.0.2",
        "d3-dispatch": "npm:d3-dispatch@1.0.2",
        "d3-quadtree": "npm:d3-quadtree@1.0.2"
      }
    },
    "npm:d3-chord@1.0.3": {
      "map": {
        "d3-array": "npm:d3-array@1.0.2",
        "d3-path": "npm:d3-path@1.0.3"
      }
    },
    "npm:d3-brush@1.0.3": {
      "map": {
        "d3-dispatch": "npm:d3-dispatch@1.0.2",
        "d3-drag": "npm:d3-drag@1.0.2",
        "d3-interpolate": "npm:d3-interpolate@1.1.3",
        "d3-selection": "npm:d3-selection@1.0.3",
        "d3-transition": "npm:d3-transition@1.0.3"
      }
    },
    "npm:d3-zoom@1.1.1": {
      "map": {
        "d3-dispatch": "npm:d3-dispatch@1.0.2",
        "d3-drag": "npm:d3-drag@1.0.2",
        "d3-interpolate": "npm:d3-interpolate@1.1.3",
        "d3-selection": "npm:d3-selection@1.0.3",
        "d3-transition": "npm:d3-transition@1.0.3"
      }
    },
    "npm:stream-http@2.6.3": {
      "map": {
        "builtin-status-codes": "npm:builtin-status-codes@3.0.0",
        "xtend": "npm:xtend@4.0.1",
        "to-arraybuffer": "npm:to-arraybuffer@1.0.1",
        "inherits": "npm:inherits@2.0.3",
        "readable-stream": "npm:readable-stream@2.2.2"
      }
    },
    "npm:font-awesome@4.7.0": {
      "map": {
        "css": "github:systemjs/plugin-css@0.1.32"
      }
    },
    "npm:d3-dsv@1.0.3": {
      "map": {
        "rw": "npm:rw@1.3.3",
        "iconv-lite": "npm:iconv-lite@0.4.15",
        "commander": "npm:commander@2.9.0"
      }
    },
    "npm:jspm-nodelibs-string_decoder@0.2.0": {
      "map": {
        "string_decoder-browserify": "npm:string_decoder@0.10.31"
      }
    },
    "npm:jspm-nodelibs-url@0.2.0": {
      "map": {
        "url-browserify": "npm:url@0.11.0"
      }
    },
    "npm:jspm-nodelibs-os@0.2.0": {
      "map": {
        "os-browserify": "npm:os-browserify@0.2.1"
      }
    },
    "npm:jspm-nodelibs-http@0.2.0": {
      "map": {
        "http-browserify": "npm:stream-http@2.6.3"
      }
    },
    "npm:pbkdf2@3.0.9": {
      "map": {
        "create-hmac": "npm:create-hmac@1.1.4"
      }
    },
    "npm:readable-stream@2.2.2": {
      "map": {
        "isarray": "npm:isarray@1.0.0",
        "string_decoder": "npm:string_decoder@0.10.31",
        "inherits": "npm:inherits@2.0.3",
        "util-deprecate": "npm:util-deprecate@1.0.2",
        "buffer-shims": "npm:buffer-shims@1.0.0",
        "core-util-is": "npm:core-util-is@1.0.2",
        "process-nextick-args": "npm:process-nextick-args@1.0.7"
      }
    },
    "npm:commander@2.9.0": {
      "map": {
        "graceful-readlink": "npm:graceful-readlink@1.0.1"
      }
    },
    "npm:elliptic@6.3.2": {
      "map": {
        "bn.js": "npm:bn.js@4.11.6",
        "inherits": "npm:inherits@2.0.3",
        "hash.js": "npm:hash.js@1.0.3",
        "brorand": "npm:brorand@1.0.6"
      }
    },
    "npm:sha.js@2.4.8": {
      "map": {
        "inherits": "npm:inherits@2.0.3"
      }
    },
    "npm:cipher-base@1.0.3": {
      "map": {
        "inherits": "npm:inherits@2.0.3"
      }
    },
    "npm:asn1.js@4.9.1": {
      "map": {
        "bn.js": "npm:bn.js@4.11.6",
        "inherits": "npm:inherits@2.0.3",
        "minimalistic-assert": "npm:minimalistic-assert@1.0.0"
      }
    }
  }
});
