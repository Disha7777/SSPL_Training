using System.Web.Mvc;
using Project1.DAL;

namespace Project1.Controllers
{
    public class HomePageController : Controller
    {
        private FoodDAL foodDAL = new FoodDAL();

        // GET: Home/Index - Main home page with food items
        public ActionResult Index()
        {
            return View(); // This will render Views/Home/Index.cshtml
        }
        // GET: Home/About
        public ActionResult About()
        {
            ViewBag.Message = "Your application description page.";
            return View();
        }

        // GET: Home/Contact
        public ActionResult Contact()
        {
            ViewBag.Message = "Your contact page.";
            return View();
        }
    }
}