using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using Project1.Models;

namespace Project1.DAL
{
    public class CartDAL
    {
        private readonly string cs =
            ConfigurationManager.ConnectionStrings["DefaultConnection"].ConnectionString;

        // ============================
        // ADD OR UPDATE CART ITEM
        // ============================
        public bool AddToCart(int userId, int foodId, int quantity = 1)
        {
            using (SqlConnection con = new SqlConnection(cs))
            {
                con.Open();

                // Check food exists
                SqlCommand checkFoodCmd = new SqlCommand(
                    "SELECT COUNT(*) FROM dbo.Foods WHERE Id = @FoodId", con);
                checkFoodCmd.Parameters.AddWithValue("@FoodId", foodId);

                if ((int)checkFoodCmd.ExecuteScalar() == 0)
                    return false;

                // Check if item already exists
                SqlCommand checkCmd = new SqlCommand(
                    "SELECT Id, Quantity FROM dbo.MyCart WHERE UserId = @UserId AND FoodId = @FoodId",
                    con);
                checkCmd.Parameters.AddWithValue("@UserId", userId);
                checkCmd.Parameters.AddWithValue("@FoodId", foodId);

                SqlDataReader dr = checkCmd.ExecuteReader();
                bool exists = dr.Read();
                int cartId = exists ? (int)dr["Id"] : 0;
                int existingQty = exists ? (int)dr["Quantity"] : 0;
                dr.Close();

                if (exists)
                {
                    int newQty = existingQty + quantity;
                    if (newQty > 20) newQty = 20;

                    SqlCommand updateCmd = new SqlCommand(
                        "UPDATE dbo.MyCart SET Quantity = @Qty WHERE Id = @Id", con);
                    updateCmd.Parameters.AddWithValue("@Qty", newQty);
                    updateCmd.Parameters.AddWithValue("@Id", cartId);

                    return updateCmd.ExecuteNonQuery() > 0;
                }
                else
                {
                    SqlCommand insertCmd = new SqlCommand(
                        @"INSERT INTO dbo.MyCart (UserId, FoodId, Quantity, CreatedAt)
                          VALUES (@UserId, @FoodId, @Quantity, GETDATE())", con);

                    insertCmd.Parameters.AddWithValue("@UserId", userId);
                    insertCmd.Parameters.AddWithValue("@FoodId", foodId);
                    insertCmd.Parameters.AddWithValue("@Quantity", quantity);

                    return insertCmd.ExecuteNonQuery() > 0;
                }
            }
        }

        // ============================
        // GET USER CART
        // ============================
        public List<CartItem> GetUserCart(int userId)
        {
            List<CartItem> list = new List<CartItem>();

            using (SqlConnection con = new SqlConnection(cs))
            {
                SqlCommand cmd = new SqlCommand(
                    @"SELECT c.Id AS CartId,
                             f.Name,
                             f.Price,
                             f.ImageUrl,
                             c.Quantity
                      FROM dbo.MyCart c
                      INNER JOIN dbo.Foods f ON c.FoodId = f.Id
                      WHERE c.UserId = @UserId
                      ORDER BY c.CreatedAt DESC", con);

                cmd.Parameters.AddWithValue("@UserId", userId);

                con.Open();
                SqlDataReader dr = cmd.ExecuteReader();

                while (dr.Read())
                {
                    list.Add(new CartItem
                    {
                        CartId = (int)dr["CartId"],
                        Name = dr["Name"].ToString(),
                        Price = (decimal)dr["Price"],
                        ImageUrl = dr["ImageUrl"].ToString(),
                        Quantity = (int)dr["Quantity"]
                    });
                }
            }
            return list;
        }

        // ============================
        // REMOVE ITEM
        // ============================
        public bool RemoveItem(int cartId)
        {
            using (SqlConnection con = new SqlConnection(cs))
            {
                SqlCommand cmd = new SqlCommand(
                    "DELETE FROM dbo.MyCart WHERE Id = @Id", con);
                cmd.Parameters.AddWithValue("@Id", cartId);

                con.Open();
                return cmd.ExecuteNonQuery() > 0;
            }
        }

        // ============================
        // UPDATE QUANTITY
        // ============================
        public bool UpdateQuantity(int cartId, int quantity)
        {
            if (quantity < 1 || quantity > 20) return false;

            using (SqlConnection con = new SqlConnection(cs))
            {
                SqlCommand cmd = new SqlCommand(
                    "UPDATE dbo.MyCart SET Quantity = @Qty WHERE Id = @Id", con);
                cmd.Parameters.AddWithValue("@Qty", quantity);
                cmd.Parameters.AddWithValue("@Id", cartId);

                con.Open();
                return cmd.ExecuteNonQuery() > 0;
            }
        }

        // ============================
        // CLEAR USER CART
        // ============================
        public bool ClearCart(int userId)
        {
            using (SqlConnection con = new SqlConnection(cs))
            {
                SqlCommand cmd = new SqlCommand(
                    "DELETE FROM dbo.MyCart WHERE UserId = @UserId", con);
                cmd.Parameters.AddWithValue("@UserId", userId);

                con.Open();
                return cmd.ExecuteNonQuery() > 0;
            }
        }

        // ============================
        // TOTAL ITEM COUNT
        // ============================
        public int GetCartItemCount(int userId)
        {
            using (SqlConnection con = new SqlConnection(cs))
            {
                SqlCommand cmd = new SqlCommand(
                    "SELECT ISNULL(SUM(Quantity), 0) FROM dbo.MyCart WHERE UserId = @UserId", con);
                cmd.Parameters.AddWithValue("@UserId", userId);

                con.Open();
                return (int)cmd.ExecuteScalar();
            }
        }

        // ============================
        // ADMIN: GET ALL CARTS
        // ============================
        public List<dynamic> GetAllCartsForAdmin()
        {
            List<dynamic> list = new List<dynamic>();

            using (SqlConnection con = new SqlConnection(cs))
            {
                SqlCommand cmd = new SqlCommand(
                    @"SELECT u.Name AS UserName,
                             f.Name AS FoodName,
                             c.Quantity,
                             f.Price,
                             (c.Quantity * f.Price) AS Total
                      FROM dbo.MyCart c
                      INNER JOIN dbo.AM_Users u ON c.UserId = u.Id
                      INNER JOIN dbo.Foods f ON c.FoodId = f.Id
                      ORDER BY c.CreatedAt DESC", con);

                con.Open();
                SqlDataReader dr = cmd.ExecuteReader();

                while (dr.Read())
                {
                    list.Add(new
                    {
                        UserName = dr["UserName"].ToString(),
                        FoodName = dr["FoodName"].ToString(),
                        Quantity = (int)dr["Quantity"],
                        Price = (decimal)dr["Price"],
                        Total = (decimal)dr["Total"]
                    });
                }
            }
            return list;
        }

        // ============================
        // DISTINCT CART ITEM COUNT
        // ============================
        public int GetCartDistinctItemCount(int userId)
        {
            using (SqlConnection con = new SqlConnection(cs))
            {
                SqlCommand cmd = new SqlCommand(
                    "SELECT COUNT(*) FROM dbo.MyCart WHERE UserId = @UserId", con);
                cmd.Parameters.AddWithValue("@UserId", userId);

                con.Open();
                return (int)cmd.ExecuteScalar();
            }
        }
    }
}
