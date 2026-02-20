using System;
using System.Data;
using System.Data.SqlClient;
using System.Web.Mvc;
using HotelBookingSystem.DAL;
using HotelBooking.Models;

namespace HotelBookingSystem.Controllers
{
    public class AccountController : Controller
    {
        private readonly DBHelper db = new DBHelper();

        // =========================
        // GET: Login
        // =========================
        [HttpGet]
        public ActionResult Login()
        {
            return View();
        }

        // =========================
        // POST: Login (AJAX)
        // =========================
        [HttpPost]
        [ValidateAntiForgeryToken]
        public JsonResult Login(LoginViewModel model)
        {
            try
            {
                if (!ModelState.IsValid)
                    return Json(new { status = "error", message = "Invalid login data" });

                DataTable dt = db.GetData(
                    "sp_UserLogin",
                    new[] { new SqlParameter("@Email", model.Email) }
                );

                if (dt.Rows.Count == 0)
                    return Json(new { status = "error", message = "Invalid email or account blocked" });

                string dbPassword = dt.Rows[0]["PasswordHash"].ToString();

                if (model.Password != dbPassword)
                    return Json(new { status = "error", message = "Invalid email or password" });

                Session["UserId"] = dt.Rows[0]["UserId"];
                Session["UserName"] = dt.Rows[0]["FullName"];
                Session["Role"] = dt.Rows[0]["Role"];

                string role = dt.Rows[0]["Role"].ToString().Trim().ToLower();
                string redirectUrl = role == "admin"
                    ? Url.Action("Dashboard", "Admin")
                    : Url.Action("Create", "Booking");

                return Json(new { status = "success", message = "Login successful", redirectUrl });
            }
            catch
            {
                return Json(new { status = "error", message = "Server error occurred" });
            }
        }

        // =========================
        // GET: Register
        // =========================
        [HttpGet]
        public ActionResult Register()
        {
            return View();
        }

        // =========================
        // POST: Register (AJAX)
        // =========================
        [HttpPost]
        [ValidateAntiForgeryToken]
        public JsonResult Register(RegisterViewModel model)
        {
            try
            {
                if (!ModelState.IsValid)
                    return Json(new { status = "error", message = "Invalid data" });

                // Check if email exists
                DataTable dt = db.GetData(
                    "sp_CheckEmailExists",
                    new[] { new SqlParameter("@Email", model.Email) }
                );

                if (dt.Rows.Count > 0)
                    return Json(new { status = "error", message = "Email already registered" });

                // Insert new user
                db.ExecuteNonQuery(
                    "sp_RegisterUser",
                    new[]
                    {
                        new SqlParameter("@FullName", model.FullName),
                        new SqlParameter("@Email", model.Email),
                        new SqlParameter("@PasswordHash", model.Password), // plain text (not secure, can add bcrypt later)
                        new SqlParameter("@Role", "User")
                    }
                );

                return Json(new { status = "success", message = "Registration successful! Please login.", redirectUrl = Url.Action("Login") });
            }
            catch
            {
                return Json(new { status = "error", message = "Server error occurred" });
            }
        }

        // =========================
        // GET: Logout
        // =========================
        public ActionResult Logout()
        {
            Session.Clear();
            Session.Abandon();
            return RedirectToAction("Login");
        }
    }
}
