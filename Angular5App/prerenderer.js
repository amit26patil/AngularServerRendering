var path = require("path");
exports.renderToString = renderToStringImpl;
function renderToStringImpl(callback, applicationBasePath, bootModule, absoluteRequestUrl, requestPathAndQuery, customDataParameter, overrideTimeoutMilliseconds) {
    try {
        var forceLegacy = isLegacyAspNetPrerendering();
        var renderToStringFunc = !forceLegacy && findRenderToStringFunc(applicationBasePath, bootModule);
        var isNotLegacyMode = renderToStringFunc;// && renderToStringFunc['isServerRenderer'];
        if (isNotLegacyMode) {
            renderToStringFunc.apply(null, arguments);
        }
        else {
            callback(null, { error: 11 })
        }
    }
    catch (ex) {

        callback(null, { error: ex.toString() })
        // Make sure loading errors are reported back to the .NET part of the app
        //callback('Prerendering failed because of error: '
        //    + ex.stack
        //    + '\nCurrent directory is: '
        //    + process.cwd());
    }
}
function findBootModule(applicationBasePath, bootModule) {
    var bootModuleNameFullPath = path.resolve(applicationBasePath, bootModule.moduleName);
    if (bootModule.webpackConfig) {
        return null;
    }
    else {
        return require(bootModuleNameFullPath);
    }
}
function findRenderToStringFunc(applicationBasePath, bootModule) {
    // First try to load the module
    var foundBootModule = findBootModule(applicationBasePath, bootModule);
    if (foundBootModule === null) {
        return null; // Must be legacy mode
    }
    // Now try to pick out the function they want us to invoke
    var renderToStringFunc;
    if (bootModule.exportName) {
        // Explicitly-named export
        renderToStringFunc = foundBootModule[bootModule.exportName];
    }
    else if (typeof foundBootModule !== 'function') {
        // TypeScript-style default export
        renderToStringFunc = foundBootModule.default;
    }
    else {
        // Native default export
        renderToStringFunc = foundBootModule;
    }
    // Validate the result
    if (typeof renderToStringFunc !== 'function') {
        if (bootModule.exportName) {
            throw new Error("The module at " + bootModule.moduleName + " has no function export named " + bootModule.exportName + ".");
        }
        else {
            throw new Error("The module at " + bootModule.moduleName + " does not export a default function, and you have not specified which export to invoke.");
        }
    }
    return renderToStringFunc;
}
function isLegacyAspNetPrerendering() {
    var version = getAspNetPrerenderingPackageVersion();
    return version && /^1\./.test(version);
}
function getAspNetPrerenderingPackageVersion() {
    return null
}
