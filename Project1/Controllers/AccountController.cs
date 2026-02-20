using System.Web.Mvc;
using Project1.Models;
using Project1.DAL;
using Project1.Helpers;
using System;

namespace Project1.Controllers
{
    public class AccountController : Controller
    {
        private readonly UserDAL userDAL = new UserDAL();

        // GET: Account/Register
        public ActionResult Register()
        {
            return View();
        }

        // POST: Account/Register
        [HttpPost]
        public JsonResult Register(User user)
        {
            try
            {
                // Validation
                if (string.IsNullOrEmpty(user.Name) ||
                    string.IsNullOrEmpty(user.Email) ||
                    string.IsNullOrEmpty(user.Password))
                {
                    return Json(new
                    {
                        success = false,
                        message = "All fields are required"
                    });
                }

                // Check if email already exists
                if (userDAL.EmailExists(user.Email))
                {
                    return Json(new
                    {
                        success = false,
                        message = "Email already registered"
                    });
                }

                int userId = userDAL.Register(user);

                return Json(new
                {
                    success = userId > 0,
                    userId = userId,
                    message = userId > 0 ?
                        "Registration successful! You can now login." :
                        "Registration failed. Please try again."
                });
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    success = false,
                    message = "Error: " + ex.Message
                });
            }
        }

        // GET: Account/Login
        public ActionResult Login()
        {
            return View();
        }

        [HttpPost]
        public JsonResult Login(string email, string password)
        {
            try
            {
                var user = userDAL.Login(email, password);

                if (user == null)
                {
                    return Json(new
                    {
                        success = false,
                        message = "Invalid email or password"
                    });
                }

                // Generate JWT token with only RoleId
                string token = JwtHelper.GenerateToken(user);

                return Json(new
                {
                    success = true,
                    token = token,
                    userId = user.Id,
                    name = user.Name,
                    roleId = user.RoleId,  // Only send RoleId to frontend
                    message = "Login successful!"
                });
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    success = false,
                    message = "Login failed: " + ex.Message
                });
            }
        }

        // GET: Account/Logout
        public ActionResult Logout()
        {
            return View();
        }
    }
}