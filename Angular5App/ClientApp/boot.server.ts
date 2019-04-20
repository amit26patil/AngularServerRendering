import 'reflect-metadata';
import 'zone.js';
import 'rxjs/add/operator/first';
import { APP_BASE_HREF } from '@angular/common';
import { enableProdMode, ApplicationRef, NgZone, ValueProvider } from '@angular/core';
import { renderModuleFactory, platformDynamicServer, PlatformState, INITIAL_CONFIG, BEFORE_APP_SERIALIZED } from '@angular/platform-server';
import { createServerRenderer, RenderResult } from 'aspnet-prerendering';
import { AppServerModule } from './app/app.server.module';
declare var require: any;
//import { readFileSync } from 'fs';
//import { join } from 'path';
var readFileSync = require('fs').readFileSync;
var path = require('path');
enableProdMode();
export default createServerRenderer(params => {
    var template = readFileSync(path.join(params.data.basePath, 'Scripts/dist/browser', 'index.html'))
    const providers = [
        {
            provide: INITIAL_CONFIG, useValue: {
                document: template, url: params.url } },
        { provide: APP_BASE_HREF, useValue: params.baseUrl },
        { provide: 'BASE_URL', useValue: params.origin + params.baseUrl },
    ];

    return platformDynamicServer(providers).bootstrapModule(AppServerModule).then(moduleRef => {
        const appRef: ApplicationRef = moduleRef.injector.get(ApplicationRef);
        const state = moduleRef.injector.get(PlatformState);
        const zone = moduleRef.injector.get(NgZone);
        var callbacks = moduleRef.injector.get(BEFORE_APP_SERIALIZED, null);
        
        return new Promise<RenderResult>((resolve, reject) => {
            zone.onError.subscribe((errorInfo: any) => reject(errorInfo));
            appRef.isStable.first(isStable => isStable).subscribe(() => {
                // Because 'onStable' fires before 'onError', we have to delay slightly before
                // completing the request in case there's an error to report
                if (callbacks) {
                    for (var _i = 0, callbacks_1 = callbacks; _i < callbacks_1.length; _i++) {
                        var callback = callbacks_1[_i];
                        try {
                            callback();
                        }
                        catch (/** @type {?} */ e) {
                            // Ignore exceptions.
                            console.warn('Ignoring BEFORE_APP_SERIALIZED Exception: ', e);
                        }
                    }
                }
                setImmediate(() => {
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
