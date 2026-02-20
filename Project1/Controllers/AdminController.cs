using System.Web.Mvc;
using Project1.Helpers;
using Project1.DAL;

namespace Project1.Controllers
{
    public class AdminController : Controller
    {
        private readonly UserDAL userDAL = new UserDAL();
        private readonly FoodDAL foodDAL = new FoodDAL();
        private readonly CartDAL cartDAL = new CartDAL();

        // ============================================================
        // ADMIN DASHBOARD VIEW
        // REMOVED [JwtAuthorize] so the browser can load the HTML shell.
        // JS will check the token and redirect if missing.
        // ============================================================
        public ActionResult Dashboard()
        {
            return View();
        }

        // ============================================================
        // DATA API ENDPOINTS (STILL PROTECTED)
        // These will be called via AJAX with the Bearer Token.
        // ============================================================

        [JwtAuthorize(RequiredRoleId = 1)]
        [HttpGet]
        public JsonResult GetAllUsers()
        {
            return Json(userDAL.GetAllUsers(), JsonRequestBehavior.AllowGet);
        }

        [JwtAuthorize(RequiredRoleId = 1)]
        [HttpGet]
        public JsonResult GetAllFoods()
        {
            return Json(foodDAL.GetAllFoods(), JsonRequestBehavior.AllowGet);
        }

        [JwtAuthorize(RequiredRoleId = 1)]
        [HttpGet]
        public JsonResult GetAllCarts()
        {
            return Json(cartDAL.GetAllCartsForAdmin(), JsonRequestBehavior.AllowGet);
        }
    }
}