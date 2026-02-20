using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Project1.Models;

namespace Project1.Helpers
{
    public static class JwtHelper
    {
        private static readonly string SecretKey =
            "scausdghcfue890hqwe9cujqefcuicikaschiosdc90fe8qwf9ui0uiacf9asu";

        private static readonly int ExpiryMinutes = 60;

        public static string GenerateToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(SecretKey);

            var claims = new[]
            {
                new Claim("Id", user.Id.ToString()),
                new Claim("RoleId", user.RoleId.ToString())
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(ExpiryMinutes),
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature
                )
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        public static ClaimsPrincipal ValidateToken(string token)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(SecretKey);

            try
            {
                var validationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ClockSkew = TimeSpan.Zero
                };

                SecurityToken validatedToken;
                return tokenHandler.ValidateToken(token, validationParameters, out validatedToken);
            }
            catch
            {
                return null;
            }
        }

        // Get UserId from token
        public static int? GetUserIdFromToken(string token)
        {
            var claims = ValidateToken(token);
            if (claims == null) return null;

            var idClaim = claims.FindFirst("Id");
            int userId;

            if (idClaim != null && int.TryParse(idClaim.Value, out userId))
                return userId;

            return null;
        }

        // Get RoleId from token
        public static int? GetRoleIdFromToken(string token)
        {
            var claims = ValidateToken(token);
            if (claims == null) return null;

            var roleIdClaim = claims.FindFirst("RoleId");
            int roleId;

            if (roleIdClaim != null && int.TryParse(roleIdClaim.Value, out roleId))
                return roleId;

            return null;
        }
    }
}
