using System;
using System.Web.Mvc;
using Project1.DAL;
using Project1.Helpers;

namespace Project1.Controllers
{
    public class MyAccountController : Controller
    {
        private readonly UserDAL userDAL = new UserDAL();

        // ============================
        // DASHBOARD VIEW (PUBLIC)
        // ============================
        public ActionResult Dashboard()
        {
            // JWT will be validated using JS
            return View();
        }

        // ============================
        // API: GET LOGGED-IN USER
        // RoleId = 2 (User)
        // ============================
        [JwtAuthorize]
        [HttpGet]
        public JsonResult GetUser()
        {
            try
            {
                var authHeader = Request.Headers["Authorization"];
                if (string.IsNullOrEmpty(authHeader))
                {
                    return Json(new
                    {
                        success = false,
                        message = "Authorization header missing"
                    }, JsonRequestBehavior.AllowGet);
                }

                var token = authHeader.Replace("Bearer ", "");
                var userId = JwtHelper.GetUserIdFromToken(token);

                if (!userId.HasValue)
                {
                    return Json(new
                    {
                        success = false,
                        message = "Invalid token"
                    }, JsonRequestBehavior.AllowGet);
                }

                var user = userDAL.GetUserById(userId.Value);
                if (user == null)
                {
                    return Json(new
                    {
                        success = false,
                        message = "User not found"
                    }, JsonRequestBehavior.AllowGet);
                }

                return Json(new
                {
                    success = true,
                    id = user.Id,
                    name = user.Name,
                    email = user.Email,
                    roleId = user.RoleId
                }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    success = false,
                    message = ex.Message
                }, JsonRequestBehavior.AllowGet);
            }
        }
    }
}
