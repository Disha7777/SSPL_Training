using System;

namespace Project1.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public int RoleId { get; set; }    // Role ID (1=Admin, 2=User)
    }
}