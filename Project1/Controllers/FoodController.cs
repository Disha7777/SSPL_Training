using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Web.Mvc;
using Project1.DAL;
using Project1.Models;
using Project1.Helpers;

namespace Project1.Controllers
{
    public class FoodController : Controller
    {
        private FoodDAL foodDAL = new FoodDAL();
        private CartDAL cartDAL = new CartDAL();

        // GET: Food/Cart - Cart page
        public ActionResult Cart()
        {
            return View();
        }

        // API: Get all food items (used by Home page)
        [HttpGet]
        public JsonResult GetAllFoods()
        {
            try
            {
                List<Food> foods = foodDAL.GetAllFoods();
                return Json(new
                {
                    success = true,
                    foods = foods
                }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    success = false,
                    message = "Failed to load foods: " + ex.Message
                }, JsonRequestBehavior.AllowGet);
            }
        }

        // API: Get food by ID
        [HttpGet]
        public JsonResult GetFood(int id)
        {
            try
            {
                Food food = foodDAL.GetFoodById(id);
                if (food == null)
                {
                    return Json(new
                    {
                        success = false,
                        message = "Food item not found"
                    }, JsonRequestBehavior.AllowGet);
                }

                return Json(new
                {
                    success = true,
                    food = food
                }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    success = false,
                    message = "Error: " + ex.Message
                }, JsonRequestBehavior.AllowGet);
            }
        }

        // API: Add item to cart with quantity (authenticated)
        [JwtAuthorize]
        [HttpPost]
        public JsonResult AddToCart(int foodId, int quantity = 1)
        {
            try
            {
                // Validate quantity
                if (quantity < 1 || quantity > 20)
                {
                    return Json(new
                    {
                        success = false,
                        message = "Quantity must be between 1 and 20"
                    });
                }

                // Get user ID from JWT
                var authHeader = Request.Headers["Authorization"];
                var token = authHeader.Replace("Bearer ", "");
                ClaimsPrincipal claims = JwtHelper.ValidateToken(token);
                int userId = int.Parse(claims.FindFirst("Id").Value);

                // Check if food exists and is available
               

                bool result = cartDAL.AddToCart(userId, foodId, quantity);

                if (result)
                {
                    // Get updated cart count
                    int cartCount = cartDAL.GetCartItemCount(userId);

                    return Json(new
                    {
                        success = true,
                        message = $"{quantity} item(s) added to cart successfully",
                        cartCount = cartCount
                    });
                }
                else
                {
                    return Json(new
                    {
                        success = false,
                        message = "Failed to add item to cart"
                    });
                }
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

        // API: Get user's cart items
        [JwtAuthorize]
        [HttpGet]
        public JsonResult GetCart()
        {
            try
            {
                var authHeader = Request.Headers["Authorization"];
                var token = authHeader.Replace("Bearer ", "");
                ClaimsPrincipal claims = JwtHelper.ValidateToken(token);
                int userId = int.Parse(claims.FindFirst("Id").Value);

                List<CartItem> cartItems = cartDAL.GetUserCart(userId);
                int itemCount = cartDAL.GetCartItemCount(userId);
                int distinctCount = cartDAL.GetCartDistinctItemCount(userId);

                // Calculate totals
                decimal subtotal = 0;
                foreach (var item in cartItems)
                {
                    subtotal += item.Price * item.Quantity;
                }

                decimal tax = subtotal * 0.10m; // 10% tax
                decimal total = subtotal + tax;

                return Json(new
                {
                    success = true,
                    cartItems = cartItems,
                    summary = new
                    {
                        itemCount = itemCount,
                        distinctCount = distinctCount,
                        subtotal = subtotal,
                        tax = tax,
                        total = total
                    }
                }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    success = false,
                    message = "Failed to load cart: " + ex.Message
                }, JsonRequestBehavior.AllowGet);
            }
        }

        // API: Remove item from cart
        [JwtAuthorize]
        [HttpPost]
        public JsonResult RemoveFromCart(int cartId)
        {
            try
            {
                // First, get user ID to verify ownership (optional security check)
                var authHeader = Request.Headers["Authorization"];
                var token = authHeader.Replace("Bearer ", "");
                ClaimsPrincipal claims = JwtHelper.ValidateToken(token);
                int userId = int.Parse(claims.FindFirst("Id").Value);

                cartDAL.RemoveItem(cartId);

                // Get updated cart count
                int cartCount = cartDAL.GetCartItemCount(userId);

                return Json(new
                {
                    success = true,
                    message = "Item removed from cart",
                    cartCount = cartCount
                });
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    success = false,
                    message = "Failed to remove item: " + ex.Message
                });
            }
        }

        // API: Update cart item quantity
        [JwtAuthorize]
        [HttpPost]
        public JsonResult UpdateCartQuantity(int cartId, int quantity)
        {
            try
            {
                // Validate quantity
                if (quantity < 1 || quantity > 20)
                {
                    return Json(new
                    {
                        success = false,
                        message = "Quantity must be between 1 and 20"
                    });
                }

                // Get user ID for security check (optional)
                var authHeader = Request.Headers["Authorization"];
                var token = authHeader.Replace("Bearer ", "");
                ClaimsPrincipal claims = JwtHelper.ValidateToken(token);
                int userId = int.Parse(claims.FindFirst("Id").Value);

                bool result = cartDAL.UpdateQuantity(cartId, quantity);

                if (result)
                {
                    // Get updated cart items and totals
                    List<CartItem> cartItems = cartDAL.GetUserCart(userId);
                    decimal subtotal = 0;
                    foreach (var item in cartItems)
                    {
                        subtotal += item.Price * item.Quantity;
                    }


                    return Json(new
                    {
                        success = true,
                        message = "Quantity updated",
                        subtotal = subtotal
                    });
                }
                else
                {
                    return Json(new
                    {
                        success = false,
                        message = "Failed to update quantity"
                    });
                }
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    success = false,
                    message = "Failed to update quantity: " + ex.Message
                });
            }
        }

        // API: Clear entire cart
        [JwtAuthorize]
        [HttpPost]
        public JsonResult ClearCart()
        {
            try
            {
                var authHeader = Request.Headers["Authorization"];
                var token = authHeader.Replace("Bearer ", "");
                ClaimsPrincipal claims = JwtHelper.ValidateToken(token);
                int userId = int.Parse(claims.FindFirst("Id").Value);

                cartDAL.ClearCart(userId);

                return Json(new
                {
                    success = true,
                    message = "Cart cleared successfully",
                    cartCount = 0
                });
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    success = false,
                    message = "Failed to clear cart: " + ex.Message
                });
            }
        }

        // API: Get cart count only (for badge)
        [JwtAuthorize]
        [HttpGet]
        public JsonResult GetCartCount()
        {
            try
            {
                var authHeader = Request.Headers["Authorization"];
                var token = authHeader.Replace("Bearer ", "");
                ClaimsPrincipal claims = JwtHelper.ValidateToken(token);
                int userId = int.Parse(claims.FindFirst("Id").Value);

                int cartCount = cartDAL.GetCartItemCount(userId);

                return Json(new
                {
                    success = true,
                    cartCount = cartCount
                }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    success = false,
                    message = "Failed to get cart count: " + ex.Message
                }, JsonRequestBehavior.AllowGet);
            }
        }
    }
}