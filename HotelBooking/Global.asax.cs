using System.Web.Mvc;
using System.Web.Routing;

namespace HotelBooking // <-- your project namespace!
{
    public class MvcApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();
            HotelBooking.RouteConfig.RegisterRoutes(RouteTable.Routes);
        }
    }
}
