SystemJS.config({
  warnings: true,
  paths: {
    "npm:": "jspm_packages/npm/",
    "github:": "jspm_packages/github/",
    "local:": "jspm_packages/local/",
    "cg/": "src/"
  },
  browserConfig: {
    "baseURL": "/"
  },
  devConfig: {
    "map": {
      "plugin-babel": "npm:systemjs-plugin-babel@0.0.21"
    }
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
    "assert": "npm:jspm-nodelibs-assert@0.2.0",
    "buffer": "npm:jspm-nodelibs-buffer@0.2.1",
    "cg-core": "local:cg-core@0.7.2",
    "child_process": "npm:jspm-nodelibs-child_process@0.2.0",
    "constants": "npm:jspm-nodelibs-constants@0.2.0",
    "crossfilter": "github:square/crossfilter@1.3.12",
    "crypto": "npm:jspm-nodelibs-crypto@0.2.0",
    "d3": "npm:d3@4.7.3",
    "d3-queue": "npm:d3-queue@3.0.5",
    "d3-scale-chromatic": "npm:d3-scale-chromatic@1.1.1",
    "d3-time-format": "npm:d3-time-format@2.0.5",
    "events": "npm:jspm-nodelibs-events@0.2.0",
    "font-awesome": "npm:font-awesome@4.7.0",
    "formatter": "github:firstopinion/formatter.js@0.1.5",
    "fs": "npm:jspm-nodelibs-fs@0.2.0",
    "http": "npm:jspm-nodelibs-http@0.2.0",
    "https": "npm:jspm-nodelibs-https@0.2.1",
    "leaflet": "github:Leaflet/Leaflet@0.7.7",
    "lockr": "github:tsironis/lockr@0.8.4",
    "os": "npm:jspm-nodelibs-os@0.2.0",
    "path": "npm:jspm-nodelibs-path@0.2.1",
    "postal": "npm:postal@2.0.5",
    "process": "npm:jspm-nodelibs-process@0.2.0",
    "stream": "npm:jspm-nodelibs-stream@0.2.0",
    "string_decoder": "npm:jspm-nodelibs-string_decoder@0.2.0",
    "systemjs-plugin-babel": "npm:systemjs-plugin-babel@0.0.21",
    "url": "npm:jspm-nodelibs-url@0.2.0",
    "util": "npm:jspm-nodelibs-util@0.2.1",
    "vm": "npm:jspm-nodelibs-vm@0.2.0"
  },
  packages: {
    "npm:d3-scale-chromatic@1.1.1": {
      "map": {
        "d3-interpolate": "npm:d3-interpolate@1.1.4"
      }
    },
    "npm:d3@4.7.3": {
      "map": {
        "d3-queue": "npm:d3-queue@3.0.5",
        "d3-time-format": "npm:d3-time-format@2.0.5",
        "d3-interpolate": "npm:d3-interpolate@1.1.4",
        "d3-time": "npm:d3-time@1.0.6",
        "d3-color": "npm:d3-color@1.0.3",
        "d3-array": "npm:d3-array@1.1.1",
        "d3-collection": "npm:d3-collection@1.0.3",
        "d3-axis": "npm:d3-axis@1.0.6",
        "d3-chord": "npm:d3-chord@1.0.4",
        "d3-polygon": "npm:d3-polygon@1.0.3",
        "d3-drag": "npm:d3-drag@1.0.4",
        "d3-hierarchy": "npm:d3-hierarchy@1.1.4",
        "d3-random": "npm:d3-random@1.0.3",
        "d3-force": "npm:d3-force@1.0.6",
        "d3-quadtree": "npm:d3-quadtree@1.0.3",
        "d3-format": "npm:d3-format@1.1.1",
        "d3-dispatch": "npm:d3-dispatch@1.0.3",
        "d3-transition": "npm:d3-transition@1.0.4",
        "d3-geo": "npm:d3-geo@1.6.3",
        "d3-brush": "npm:d3-brush@1.0.4",
        "d3-selection": "npm:d3-selection@1.0.5",
        "d3-ease": "npm:d3-ease@1.0.3",
        "d3-shape": "npm:d3-shape@1.0.6",
        "d3-dsv": "npm:d3-dsv@1.0.5",
        "d3-voronoi": "npm:d3-voronoi@1.1.2",
        "d3-scale": "npm:d3-scale@1.0.5",
        "d3-request": "npm:d3-request@1.0.5",
        "d3-zoom": "npm:d3-zoom@1.1.3",
        "d3-timer": "npm:d3-timer@1.0.5",
        "d3-path": "npm:d3-path@1.0.5"
      }
    },
    "npm:d3-time-format@2.0.5": {
      "map": {
        "d3-time": "npm:d3-time@1.0.6"
      }
    },
    "npm:d3-interpolate@1.1.4": {
      "map": {
        "d3-color": "npm:d3-color@1.0.3"
      }
    },
    "npm:d3-chord@1.0.4": {
      "map": {
        "d3-array": "npm:d3-array@1.1.1",
        "d3-path": "npm:d3-path@1.0.5"
      }
    },
    "npm:d3-force@1.0.6": {
      "map": {
        "d3-collection": "npm:d3-collection@1.0.3",
        "d3-quadtree": "npm:d3-quadtree@1.0.3",
        "d3-dispatch": "npm:d3-dispatch@1.0.3",
        "d3-timer": "npm:d3-timer@1.0.5"
      }
    },
    "npm:postal@2.0.5": {
      "map": {
        "lodash": "npm:lodash@4.17.4"
      }
    },
    "npm:d3-drag@1.0.4": {
      "map": {
        "d3-dispatch": "npm:d3-dispatch@1.0.3",
        "d3-selection": "npm:d3-selection@1.0.5"
      }
    },
    "npm:d3-transition@1.0.4": {
      "map": {
        "d3-color": "npm:d3-color@1.0.3",
        "d3-dispatch": "npm:d3-dispatch@1.0.3",
        "d3-interpolate": "npm:d3-interpolate@1.1.4",
        "d3-ease": "npm:d3-ease@1.0.3",
        "d3-selection": "npm:d3-selection@1.0.5",
        "d3-timer": "npm:d3-timer@1.0.5"
      }
    },
    "npm:d3-geo@1.6.3": {
      "map": {
        "d3-array": "npm:d3-array@1.1.1"
      }
    },
    "npm:d3-brush@1.0.4": {
      "map": {
        "d3-drag": "npm:d3-drag@1.0.4",
        "d3-interpolate": "npm:d3-interpolate@1.1.4",
        "d3-selection": "npm:d3-selection@1.0.5",
        "d3-transition": "npm:d3-transition@1.0.4",
        "d3-dispatch": "npm:d3-dispatch@1.0.3"
      }
    },
    "npm:d3-shape@1.0.6": {
      "map": {
        "d3-path": "npm:d3-path@1.0.5"
      }
    },
    "npm:d3-request@1.0.5": {
      "map": {
        "d3-collection": "npm:d3-collection@1.0.3",
        "d3-dispatch": "npm:d3-dispatch@1.0.3",
        "d3-dsv": "npm:d3-dsv@1.0.5",
        "xmlhttprequest": "npm:xmlhttprequest@1.8.0"
      }
    },
    "npm:d3-zoom@1.1.3": {
      "map": {
        "d3-dispatch": "npm:d3-dispatch@1.0.3",
        "d3-drag": "npm:d3-drag@1.0.4",
        "d3-interpolate": "npm:d3-interpolate@1.1.4",
        "d3-selection": "npm:d3-selection@1.0.5",
        "d3-transition": "npm:d3-transition@1.0.4"
      }
    },
    "npm:d3-scale@1.0.5": {
      "map": {
        "d3-array": "npm:d3-array@1.1.1",
        "d3-collection": "npm:d3-collection@1.0.3",
        "d3-color": "npm:d3-color@1.0.3",
        "d3-format": "npm:d3-format@1.1.1",
        "d3-interpolate": "npm:d3-interpolate@1.1.4",
        "d3-time": "npm:d3-time@1.0.6",
        "d3-time-format": "npm:d3-time-format@2.0.5"
      }
    },
    "npm:d3-dsv@1.0.5": {
      "map": {
        "iconv-lite": "npm:iconv-lite@0.4.15",
        "commander": "npm:commander@2.9.0",
        "rw": "npm:rw@1.3.3"
      }
    },
    "npm:font-awesome@4.7.0": {
      "map": {
        "css": "github:systemjs/plugin-css@0.1.33"
      }
    },
    "npm:commander@2.9.0": {
      "map": {
        "graceful-readlink": "npm:graceful-readlink@1.0.1"
      }
    },
    "npm:jspm-nodelibs-http@0.2.0": {
      "map": {
        "http-browserify": "npm:stream-http@2.6.3"
      }
    },
    "npm:jspm-nodelibs-url@0.2.0": {
      "map": {
        "url-browserify": "npm:url@0.11.0"
      }
    },
    "npm:jspm-nodelibs-buffer@0.2.1": {
      "map": {
        "buffer": "npm:buffer@4.9.1"
      }
    },
    "npm:jspm-nodelibs-string_decoder@0.2.0": {
      "map": {
        "string_decoder-browserify": "npm:string_decoder@0.10.31"
      }
    },
    "npm:jspm-nodelibs-stream@0.2.0": {
      "map": {
        "stream-browserify": "npm:stream-browserify@2.0.1"
      }
    },
    "npm:stream-http@2.6.3": {
      "map": {
        "inherits": "npm:inherits@2.0.3",
        "readable-stream": "npm:readable-stream@2.2.6",
        "xtend": "npm:xtend@4.0.1",
        "to-arraybuffer": "npm:to-arraybuffer@1.0.1",
        "builtin-status-codes": "npm:builtin-status-codes@3.0.0"
      }
    },
    "npm:stream-browserify@2.0.1": {
      "map": {
        "inherits": "npm:inherits@2.0.3",
        "readable-stream": "npm:readable-stream@2.2.6"
      }
    },
    "npm:url@0.11.0": {
      "map": {
        "punycode": "npm:punycode@1.3.2",
        "querystring": "npm:querystring@0.2.0"
      }
    },
    "npm:buffer@4.9.1": {
      "map": {
        "ieee754": "npm:ieee754@1.1.8",
        "base64-js": "npm:base64-js@1.2.0",
        "isarray": "npm:isarray@1.0.0"
      }
    },
    "npm:readable-stream@2.2.6": {
      "map": {
        "isarray": "npm:isarray@1.0.0",
        "string_decoder": "npm:string_decoder@0.10.31",
        "inherits": "npm:inherits@2.0.3",
        "util-deprecate": "npm:util-deprecate@1.0.2",
        "process-nextick-args": "npm:process-nextick-args@1.0.7",
        "buffer-shims": "npm:buffer-shims@1.0.0",
        "core-util-is": "npm:core-util-is@1.0.2"
      }
    },
    "npm:jspm-nodelibs-crypto@0.2.0": {
      "map": {
        "crypto-browserify": "npm:crypto-browserify@3.11.0"
      }
    },
    "npm:jspm-nodelibs-os@0.2.0": {
      "map": {
        "os-browserify": "npm:os-browserify@0.2.1"
      }
    },
    "npm:crypto-browserify@3.11.0": {
      "map": {
        "inherits": "npm:inherits@2.0.3",
        "public-encrypt": "npm:public-encrypt@4.0.0",
        "pbkdf2": "npm:pbkdf2@3.0.9",
        "browserify-sign": "npm:browserify-sign@4.0.0",
        "browserify-cipher": "npm:browserify-cipher@1.0.0",
        "diffie-hellman": "npm:diffie-hellman@5.0.2",
        "create-ecdh": "npm:create-ecdh@4.0.0",
        "create-hmac": "npm:create-hmac@1.1.4",
        "randombytes": "npm:randombytes@2.0.3",
        "create-hash": "npm:create-hash@1.1.2"
      }
    },
    "npm:public-encrypt@4.0.0": {
      "map": {
        "create-hash": "npm:create-hash@1.1.2",
        "randombytes": "npm:randombytes@2.0.3",
        "bn.js": "npm:bn.js@4.11.6",
        "parse-asn1": "npm:parse-asn1@5.1.0",
        "browserify-rsa": "npm:browserify-rsa@4.0.1"
      }
    },
    "npm:pbkdf2@3.0.9": {
      "map": {
        "create-hmac": "npm:create-hmac@1.1.4"
      }
    },
    "npm:browserify-sign@4.0.0": {
      "map": {
        "create-hmac": "npm:create-hmac@1.1.4",
        "inherits": "npm:inherits@2.0.3",
        "create-hash": "npm:create-hash@1.1.2",
        "bn.js": "npm:bn.js@4.11.6",
        "parse-asn1": "npm:parse-asn1@5.1.0",
        "browserify-rsa": "npm:browserify-rsa@4.0.1",
        "elliptic": "npm:elliptic@6.4.0"
      }
    },
    "npm:create-hmac@1.1.4": {
      "map": {
        "inherits": "npm:inherits@2.0.3",
        "create-hash": "npm:create-hash@1.1.2"
      }
    },
    "npm:diffie-hellman@5.0.2": {
      "map": {
        "randombytes": "npm:randombytes@2.0.3",
        "bn.js": "npm:bn.js@4.11.6",
        "miller-rabin": "npm:miller-rabin@4.0.0"
      }
    },
    "npm:create-hash@1.1.2": {
      "map": {
        "inherits": "npm:inherits@2.0.3",
        "cipher-base": "npm:cipher-base@1.0.3",
        "sha.js": "npm:sha.js@2.4.8",
        "ripemd160": "npm:ripemd160@1.0.1"
      }
    },
    "npm:create-ecdh@4.0.0": {
      "map": {
        "bn.js": "npm:bn.js@4.11.6",
        "elliptic": "npm:elliptic@6.4.0"
      }
    },
    "npm:browserify-cipher@1.0.0": {
      "map": {
        "evp_bytestokey": "npm:evp_bytestokey@1.0.0",
        "browserify-des": "npm:browserify-des@1.0.0",
        "browserify-aes": "npm:browserify-aes@1.0.6"
      }
    },
    "npm:parse-asn1@5.1.0": {
      "map": {
        "create-hash": "npm:create-hash@1.1.2",
        "pbkdf2": "npm:pbkdf2@3.0.9",
        "evp_bytestokey": "npm:evp_bytestokey@1.0.0",
        "browserify-aes": "npm:browserify-aes@1.0.6",
        "asn1.js": "npm:asn1.js@4.9.1"
      }
    },
    "npm:browserify-des@1.0.0": {
      "map": {
        "cipher-base": "npm:cipher-base@1.0.3",
        "inherits": "npm:inherits@2.0.3",
        "des.js": "npm:des.js@1.0.0"
      }
    },
    "npm:browserify-rsa@4.0.1": {
      "map": {
        "randombytes": "npm:randombytes@2.0.3",
        "bn.js": "npm:bn.js@4.11.6"
      }
    },
    "npm:evp_bytestokey@1.0.0": {
      "map": {
        "create-hash": "npm:create-hash@1.1.2"
      }
    },
    "npm:elliptic@6.4.0": {
      "map": {
        "bn.js": "npm:bn.js@4.11.6",
        "inherits": "npm:inherits@2.0.3",
        "minimalistic-assert": "npm:minimalistic-assert@1.0.0",
        "hmac-drbg": "npm:hmac-drbg@1.0.0",
        "minimalistic-crypto-utils": "npm:minimalistic-crypto-utils@1.0.1",
        "brorand": "npm:brorand@1.1.0",
        "hash.js": "npm:hash.js@1.0.3"
      }
    },
    "npm:miller-rabin@4.0.0": {
      "map": {
        "bn.js": "npm:bn.js@4.11.6",
        "brorand": "npm:brorand@1.1.0"
      }
    },
    "npm:cipher-base@1.0.3": {
      "map": {
        "inherits": "npm:inherits@2.0.3"
      }
    },
    "npm:browserify-aes@1.0.6": {
      "map": {
        "cipher-base": "npm:cipher-base@1.0.3",
        "create-hash": "npm:create-hash@1.1.2",
        "evp_bytestokey": "npm:evp_bytestokey@1.0.0",
        "inherits": "npm:inherits@2.0.3",
        "buffer-xor": "npm:buffer-xor@1.0.3"
      }
    },
    "npm:sha.js@2.4.8": {
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
    },
    "npm:des.js@1.0.0": {
      "map": {
        "inherits": "npm:inherits@2.0.3",
        "minimalistic-assert": "npm:minimalistic-assert@1.0.0"
      }
    },
    "npm:hmac-drbg@1.0.0": {
      "map": {
        "minimalistic-assert": "npm:minimalistic-assert@1.0.0",
        "minimalistic-crypto-utils": "npm:minimalistic-crypto-utils@1.0.1",
        "hash.js": "npm:hash.js@1.0.3"
      }
    },
    "npm:hash.js@1.0.3": {
      "map": {
        "inherits": "npm:inherits@2.0.3"
      }
    },
    "github:Leaflet/Leaflet@0.7.7": {
      "map": {
        "css": "github:systemjs/plugin-css@0.1.33"
      }
    },
    "local:cg-core@0.7.2": {
      "map": {
        "d3": "npm:d3@4.7.3"
      }
    }
  }
});
