"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
require("zone.js");
require("rxjs/add/operator/first");
var common_1 = require("@angular/common");
var core_1 = require("@angular/core");
var platform_server_1 = require("@angular/platform-server");
var aspnet_prerendering_1 = require("aspnet-prerendering");
var app_server_module_1 = require("./app/app.server.module");
//import { readFileSync } from 'fs';
//import { join } from 'path';
var readFileSync = require('fs').readFileSync;
var path = require('path');
core_1.enableProdMode();
exports.default = aspnet_prerendering_1.createServerRenderer(function (params) {
    var template = readFileSync(path.join(params.data.basePath, 'Scripts/dist/browser', 'index.html'));
    var providers = [
        {
            provide: platform_server_1.INITIAL_CONFIG, useValue: {
                document: template, url: params.url
            }
        },
        { provide: common_1.APP_BASE_HREF, useValue: params.baseUrl },
        { provide: 'BASE_URL', useValue: params.origin + params.baseUrl },
    ];
    return platform_server_1.platformDynamicServer(providers).bootstrapModule(app_server_module_1.AppServerModule).then(function (moduleRef) {
        var appRef = moduleRef.injector.get(core_1.ApplicationRef);
        var state = moduleRef.injector.get(platform_server_1.PlatformState);
        var zone = moduleRef.injector.get(core_1.NgZone);
        var callbacks = moduleRef.injector.get(platform_server_1.BEFORE_APP_SERIALIZED, null);
        return new Promise(function (resolve, reject) {
            zone.onError.subscribe(function (errorInfo) { return reject(errorInfo); });
            appRef.isStable.first(function (isStable) { return isStable; }).subscribe(function () {
                // Because 'onStable' fires before 'onError', we have to delay slightly before
                // completing the request in case there's an error to report
                if (callbacks) {
                    for (var _i = 0, callbacks_1 = callbacks; _i < callbacks_1.length; _i++) {
                        var callback = callbacks_1[_i];
                        try {
                            callback();
                        }
                        catch (e) {
                            // Ignore exceptions.
                            console.warn('Ignoring BEFORE_APP_SERIALIZED Exception: ', e);
                        }
                    }
                }
                setImmediate(function () {
                    resolve({
                        html: state.renderToString()
                    });
                    moduleRef.destroy();
                });
            });
        });
    });
});
//export default function (params ){
//    const opts = {
//        document: `<!doctype html>
//<html lang="en">
//<head>
//    <meta charset="utf-8">
//    <title>UniversalDemoV5</title>
//    <base href="/">
//    <meta name="viewport" content="width=device-width, initial-scale=1">
//    <link rel="icon" type="image/x-icon" href="favicon.ico">
//</head>
//<body>
//    <app-root></app-root>
//    <script type="text/javascript" src="Scripts/dist/browser/inline.bundle.js"></script>
//    <script type="text/javascript" src="Scripts/dist/browser/polyfills.bundle.js"></script>
//    <script type="text/javascript" src="Scripts/dist/browser/styles.bundle.js"></script>
//    <script type="text/javascript" src="Scripts/dist/browser/vendor.bundle.js"></script>
//    <script type="text/javascript" src="Scripts/dist/browser/main.bundle.js"></script>
//</body>
//</html>
//`, url: params.origin + params.baseUrl
//    };
//    return new Promise<void>((res, rej)=>{
//        renderModuleFactory(AppServerModule, opts)
//            .then(html => {
//                new Promise<RenderResult>((resolve, reject) => {
//                    resolve({ html: html });
//                });
//            });
//    });
//});
//# sourceMappingURL=boot.server.js.map