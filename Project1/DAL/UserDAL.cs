using System;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using Project1.Models;
using Project1.Helpers;
using System.Collections.Generic;
namespace Project1.DAL
{
    public class UserDAL
    {
        private readonly string connectionString =
            ConfigurationManager.ConnectionStrings["DefaultConnection"].ConnectionString;

        // ============================
        // LOGIN (STORED PROC + HASH)
        // ============================
        public User Login(string email, string password)
        {
            string hashedPassword = PasswordHelper.HashPassword(password);

            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                SqlCommand cmd = new SqlCommand("sp_AM_LoginUser", conn);
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@Email", email);
                cmd.Parameters.AddWithValue("@Password", hashedPassword);

                conn.Open();
                SqlDataReader reader = cmd.ExecuteReader();

                if (reader.Read())
                {
                    return new User
                    {
                        Id = Convert.ToInt32(reader["Id"]),
                        Name = reader["Name"].ToString(),
                        Email = reader["Email"].ToString(),
                        RoleId = Convert.ToInt32(reader["RoleId"])
                    };
                }
                return null;
            }
        }

        // ============================
        // REGISTER (STORED PROC + HASH)
        // ============================
        public int Register(User user)
        {
            string hashedPassword = PasswordHelper.HashPassword(user.Password);

            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                SqlCommand cmd = new SqlCommand("sp_AM_RegisterUser", conn);
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@Name", user.Name);
                cmd.Parameters.AddWithValue("@Email", user.Email);
                cmd.Parameters.AddWithValue("@Password", hashedPassword);
                cmd.Parameters.AddWithValue("@RoleId", 2); // User

                conn.Open();
                object result = cmd.ExecuteScalar();
                return result != null ? Convert.ToInt32(result) : 0;
            }
        }

        // ============================
        // EMAIL EXISTS
        // ============================
        public bool EmailExists(string email)
        {
            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                SqlCommand cmd = new SqlCommand(
                    "SELECT COUNT(*) FROM AM_Users WHERE Email = @Email",
                    conn);

                cmd.Parameters.AddWithValue("@Email", email);

                conn.Open();
                return Convert.ToInt32(cmd.ExecuteScalar()) > 0;
            }
        }
        public List<User> GetAllUsers()
        {
            List<User> users = new List<User>();

            using (SqlConnection con = new SqlConnection(connectionString))
            {
                SqlCommand cmd = new SqlCommand(
                    "SELECT Id, Name, Email, RoleId FROM AM_Users ORDER BY Id DESC", con);

                con.Open();
                SqlDataReader dr = cmd.ExecuteReader();

                while (dr.Read())
                {
                    users.Add(new User
                    {
                        Id = (int)dr["Id"],
                        Name = dr["Name"].ToString(),
                        Email = dr["Email"].ToString(),
                        RoleId = (int)dr["RoleId"]
                    });
                }
            }
            return users;
        }

        // ============================
        // GET USER BY ID
        // ============================
        public User GetUserById(int id)
        {
            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                SqlCommand cmd = new SqlCommand(
                    "SELECT Id, Name, Email, RoleId FROM AM_Users WHERE Id = @Id",
                    conn);

                cmd.Parameters.AddWithValue("@Id", id);

                conn.Open();
                SqlDataReader reader = cmd.ExecuteReader();

                if (reader.Read())
                {
                    return new User
                    {
                        Id = Convert.ToInt32(reader["Id"]),
                        Name = reader["Name"].ToString(),
                        Email = reader["Email"].ToString(),
                        RoleId = Convert.ToInt32(reader["RoleId"])
                    };
                }
                return null;
            }
        }
    }
}