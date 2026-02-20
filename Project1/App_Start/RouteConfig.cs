using System.Web.Mvc;
using System.Web.Routing;

namespace Project1
{
    public class RouteConfig
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            // Add specific routes first
            routes.MapRoute(
                name: "Login",
                url: "login",
                defaults: new { controller = "Account", action = "Login" }
            );

            routes.MapRoute(
                name: "Register",
                url: "register",
                defaults: new { controller = "Account", action = "Register" }
            );

            routes.MapRoute(
                name: "AdminDashboard",
                url: "admin/dashboard",
                defaults: new { controller = "Admin", action = "Dashboard" }
            );

            routes.MapRoute(
                name: "UserDashboard",
                url: "myaccount/dashboard",
                defaults: new { controller = "MyAccount", action = "Dashboard" }
            );

            // Default route (should be last)
            routes.MapRoute(
                name: "Default",
                url: "{controller}/{action}/{id}",
                defaults: new
                {
                    controller = "HomePage",
                    action = "Index",
                    id = UrlParameter.Optional
                }
            );
        }
    }
}