using EdgeJs;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Hosting;
using System.Web.Mvc;

namespace Angular5App.Controllers
{
    public class HomeController : Controller
    {
        public async Task<ActionResult> Index()
        {
            //ViewData["Html"] = "Amit";
            //ViewData["Path"] = "~/Scripts/dist/browser/";
            ViewBag.Html = await  internalPrerender("ClientApp/dist/main-server.js");
            return View();
        }
        public async Task<string> internalPrerender(string name)
        {
            var appBasePath = HostingEnvironment.ApplicationPhysicalPath.Replace(@"\", @"/");
            //appBasePath = @"D:/Study/Angular2App/Angular2App/";
            string filePath = Path.Combine(appBasePath, "prerenderer.js");
            filePath = filePath.Replace("\\", @"/");
            var url = HttpContext.Request.Url.ToString();
            var @function = Edge.Func(@" 
                return function(options, callback){
                    try{
                        var serverApp = require('../../prerenderer');
                        serverApp.renderToString(callback,'" + appBasePath + @"',options,
                        '" + url + @"',
                        '" + url + @"', {basePath:'"+ appBasePath + @"'}, 0);
                    }
                    catch(e){
                        callback(null,{error:e.toString()});
                    }
                }");
            dynamic result = await @function(new { moduleName = name });
            return (string)result.html;
        }
        public ActionResult About()
        {
            ViewBag.Message = "Your application description page.";

            return View();
        }

        public ActionResult Contact()
        {
            ViewBag.Message = "Your contact page.";

            return View();
        }
    }
}