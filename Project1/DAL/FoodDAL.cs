using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using Project1.Models;

namespace Project1.DAL
{
    public class FoodDAL
    {
        string cs = ConfigurationManager.ConnectionStrings["DefaultConnection"].ConnectionString;

        // ✅ Get all foods (NO filters)
        public List<Food> GetAllFoods()
        {
            List<Food> list = new List<Food>();

            using (SqlConnection con = new SqlConnection(cs))
            {
                SqlCommand cmd = new SqlCommand(
                    "SELECT Id, Name, Description, Price, ImageUrl FROM Foods ORDER BY Name",
                    con);

                con.Open();
                SqlDataReader dr = cmd.ExecuteReader();

                while (dr.Read())
                {
                    list.Add(new Food
                    {
                        Id = (int)dr["Id"],
                        Name = dr["Name"].ToString(),
                        Description = dr["Description"].ToString(),
                        Price = (decimal)dr["Price"],
                        ImageUrl = dr["ImageUrl"].ToString()
                    });
                }
            }
            return list;
        }

        // ✅ Get food by ID
        public Food GetFoodById(int id)
        {
            using (SqlConnection con = new SqlConnection(cs))
            {
                SqlCommand cmd = new SqlCommand(
                    "SELECT Id, Name, Description, Price, ImageUrl FROM Foods WHERE Id = @Id",
                    con);

                cmd.Parameters.AddWithValue("@Id", id);

                con.Open();
                SqlDataReader dr = cmd.ExecuteReader();

                if (dr.Read())
                {
                    return new Food
                    {
                        Id = (int)dr["Id"],
                        Name = dr["Name"].ToString(),
                        Description = dr["Description"].ToString(),
                        Price = (decimal)dr["Price"],
                        ImageUrl = dr["ImageUrl"].ToString()
                    };
                }
                return null;
            }
        }
    }
}
