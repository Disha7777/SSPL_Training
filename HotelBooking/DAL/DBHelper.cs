using System;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;

namespace HotelBookingSystem.DAL
{
    public class DBHelper
    {
        private readonly string conStr =
            ConfigurationManager.ConnectionStrings["HotelDB"].ConnectionString;

        // =========================
        // Returns a single DataTable
        // =========================
        public DataTable GetData(string sp, SqlParameter[] param = null)
        {
            using (SqlConnection con = new SqlConnection(conStr))
            using (SqlCommand cmd = new SqlCommand(sp, con))
            {
                cmd.CommandType = CommandType.StoredProcedure;

                if (param != null)
                    cmd.Parameters.AddRange(param);

                using (SqlDataAdapter da = new SqlDataAdapter(cmd))
                {
                    DataTable dt = new DataTable();
                    da.Fill(dt);
                    return dt;
                }
            }
        }

        // =========================
        // Execute stored procedure (NO RETURN)
        // =========================
        public void Execute(string sp, SqlParameter[] param)
        {
            using (SqlConnection con = new SqlConnection(conStr))
            using (SqlCommand cmd = new SqlCommand(sp, con))
            {
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddRange(param);
                con.Open();
                cmd.ExecuteNonQuery();
            }
        }

        // =========================
        // ExecuteNonQuery (NEW METHOD)
        // =========================
        public int ExecuteNonQuery(string sp, SqlParameter[] param)
        {
            using (SqlConnection con = new SqlConnection(conStr))
            using (SqlCommand cmd = new SqlCommand(sp, con))
            {
                cmd.CommandType = CommandType.StoredProcedure;

                if (param != null)
                    cmd.Parameters.AddRange(param);

                con.Open();
                return cmd.ExecuteNonQuery();
            }
        }

        // =========================
        // Returns DataSet
        // =========================
        public DataSet ExecuteDataSet(string sp, SqlParameter[] param = null)
        {
            using (SqlConnection con = new SqlConnection(conStr))
            using (SqlCommand cmd = new SqlCommand(sp, con))
            {
                cmd.CommandType = CommandType.StoredProcedure;

                if (param != null)
                    cmd.Parameters.AddRange(param);

                using (SqlDataAdapter da = new SqlDataAdapter(cmd))
                {
                    DataSet ds = new DataSet();
                    da.Fill(ds);
                    return ds;
                }
            }
        }
    }
}
