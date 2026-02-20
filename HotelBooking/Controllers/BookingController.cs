using HotelBookingSystem.DAL;
using System;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Web.Mvc;

namespace HotelBooking.Controllers
{
    public class BookingController : Controller
    {
        DBHelper db = new DBHelper();

        // =========================
        // CREATE BOOKING PAGE
        // =========================
        [HttpGet]
        public ActionResult Create()
        {
            if (Session["UserId"] == null)
                return RedirectToAction("Login", "Account");

            return View();
        }

        // =========================
        // LOAD AVAILABLE ROOMS
        // =========================
        [HttpPost]
        public JsonResult GetRooms(DateTime checkIn, DateTime checkOut, bool ac, bool food)
        {
            DataTable dt = db.GetData("sp_GetAvailableRooms", new[]
            {
                new SqlParameter("@CheckIn", checkIn),
                new SqlParameter("@CheckOut", checkOut)
            });

            var rooms = dt.AsEnumerable()
                .Where(r =>
                    (!ac || Convert.ToBoolean(r["IsAC"])) &&
                    (!food || Convert.ToBoolean(r["IncludesFood"]))
                )
                .Select(r => new
                {
                    RoomId = r["RoomId"],
                    RoomType = r["RoomType"].ToString(),
                    Price = r["Price"]
                })
                .ToList();

            return Json(rooms);
        }

        // =========================
        // BOOK ROOM
        // =========================
        [HttpPost]
        public JsonResult Create(int roomId, DateTime checkIn, DateTime checkOut)
        {
            if (Session["UserId"] == null)
                return Json(new { status = "Login" });

            int userId = Convert.ToInt32(Session["UserId"]);

            DataTable dtRoom = db.GetData(
                "sp_GetRoomPrice",
                new[] { new SqlParameter("@RoomId", roomId) }
            );

            if (dtRoom.Rows.Count == 0)
                return Json(new { status = "Error" });

            decimal price = Convert.ToDecimal(dtRoom.Rows[0]["Price"]);
            int days = (checkOut - checkIn).Days;
            decimal total = price * days;

            db.Execute("sp_CreateBooking", new[]
            {
                new SqlParameter("@UserId", userId),
                new SqlParameter("@RoomId", roomId),
                new SqlParameter("@CheckIn", checkIn),
                new SqlParameter("@CheckOut", checkOut),
                new SqlParameter("@TotalAmount", total)
            });

            return Json(new { status = "OK" });
        }

        // =========================
        // BOOKED DATES
        // =========================
        [HttpPost]
        public JsonResult GetBookedDates(int roomId)
        {
            DataTable dt = db.GetData("sp_GetBookedDates", new[]
            {
                new SqlParameter("@RoomId", roomId)
            });

            var dates = dt.AsEnumerable().Select(r => new
            {
                start = Convert.ToDateTime(r["CheckInDate"]).ToString("yyyy-MM-dd"),
                end = Convert.ToDateTime(r["CheckOutDate"]).ToString("yyyy-MM-dd")
            }).ToList();

            return Json(dates);
        }

        // =========================
        // CANCEL BOOKING
        // =========================
        [HttpPost]
        public JsonResult Cancel(int bookingId)
        {
            if (Session["UserId"] == null)
                return Json("Login");

            db.Execute("sp_CancelBooking", new[]
            {
                new SqlParameter("@BookingId", bookingId)
            });

            return Json("OK");
        }

        // =========================
        // BOOKING PREFERENCES (STEP BEFORE ROOMS)
        // =========================
        [HttpGet]
        public ActionResult Preferences()
        {
            if (Session["UserId"] == null)
                return RedirectToAction("Login", "Account");

            return View();
        }

        [HttpPost]
        public ActionResult Preferences(BookingPreferenceViewModel model)
        {
            if (Session["UserId"] == null)
                return RedirectToAction("Login", "Account");

            // ✅ FIX: Execute instead of ExecuteNonQuery
            db.Execute(
                "sp_SaveBookingPreferences",
                new[]
                {
                    new SqlParameter("@UserId", Session["UserId"]),
                    new SqlParameter("@StayType", model.StayType),
                    new SqlParameter("@HasPet", model.HasPet),
                    new SqlParameter("@WantsAC", model.WantsAC),
                    new SqlParameter("@WantsBreakfast", model.WantsBreakfast),
                    new SqlParameter("@WantsLunch", model.WantsLunch)
                }
            );

            return RedirectToAction("Create");
        }

        // =========================
        // MY BOOKINGS
        // =========================
        [HttpGet]
        public ActionResult History()
        {
            if (Session["UserId"] == null)
                return RedirectToAction("Login", "Account");

            DataTable dt = db.GetData("sp_GetMyBookings", new[]
            {
                new SqlParameter("@UserId", Session["UserId"])
            });

            return View(dt);
        }
    }
}
