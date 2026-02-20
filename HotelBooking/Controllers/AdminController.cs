using HotelBookingSystem.DAL;
using System;
using System.Data;
using System.Data.SqlClient;
using System.Web.Mvc;

namespace HotelBooking.Controllers
{
    public class AdminController : Controller
    {
        DBHelper db = new DBHelper();

        // 🔐 Admin Dashboard
        public ActionResult Dashboard()
        {
            // Returns dataset for dashboard view
            DataSet ds = db.ExecuteDataSet("sp_AdminDashboard1");
            return View(ds);
        }

        // 👤 Manage Users (GET)
        public ActionResult Users()
        {
            // Only allow admin
            if (Session["Role"]?.ToString() != "Admin")
                return RedirectToAction("Login", "Account");

            DataTable dt = db.GetData("sp_GetAllUsers");
            return View(dt);
        }
        public ActionResult FilterRooms(bool ac, bool breakfast, bool lunch, bool pet, string roomType)
        {
            DataTable dt = db.GetData(
                "sp_FilterRooms",
                new SqlParameter[]
                {
            new SqlParameter("@AC", ac),
            new SqlParameter("@Breakfast", breakfast),
            new SqlParameter("@Lunch", lunch),
            new SqlParameter("@Pet", pet),
            new SqlParameter("@RoomType", roomType ?? "")
                }
            );

            return PartialView("_RoomList", dt);
        }


        // 🟢 UPDATE USER (POST via AJAX)
        [HttpPost]
        public JsonResult UpdateUser(int userId, string role, bool isActive)
        {
            try
            {
                SqlParameter[] param =
                {
                    new SqlParameter("@UserId", userId),
                    new SqlParameter("@Role", role),
                    new SqlParameter("@IsActive", isActive)
                };

                db.Execute("sp_UpdateUserStatus", param);

                return Json(new { success = true, message = "User updated successfully" });
            }
            catch (Exception ex)
            {
                // Return error message for AJAX
                Response.StatusCode = 500;
                return Json(new { success = false, message = ex.Message });
            }
        }

        // 📅 Booking Report
        public ActionResult BookingReport()
        {
            DataTable dt = db.GetData("sp_BookingReport");
            return View(dt);
        }
        [HttpGet]
        public JsonResult GetUsers()
        {
            DataTable dt = db.GetData("sp_GetAllUsers");

            var users = dt.AsEnumerable().Select(r => new {
                UserId = r["UserId"],
                FullName = r["FullName"],
                Email = r["Email"],
                Role = r["Role"],
                IsActive = r["IsActive"]
            });

            return Json(users, JsonRequestBehavior.AllowGet);
        }


        // ❌ DELETE BOOKING (POST via AJAX)
        [HttpPost]
        public JsonResult DeleteBooking(int id)
        {
            try
            {
                SqlParameter[] param =
                {
                    new SqlParameter("@BookingId", id)
                };

                db.Execute("sp_DeleteBooking", param);

                return Json(new { success = true, message = "Booking deleted successfully" });
            }
            catch (Exception ex)
            {
                Response.StatusCode = 500;
                return Json(new { success = false, message = ex.Message });
            }
        }
    }
}
