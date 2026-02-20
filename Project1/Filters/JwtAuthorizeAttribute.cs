using System;
using System.Security.Claims;
using System.Web;
using System.Web.Mvc;

namespace Project1.Helpers
{
    public class JwtAuthorizeAttribute : AuthorizeAttribute
    {
        // 0 = any authenticated user
        public int RequiredRoleId { get; set; } = 0;

        protected override bool AuthorizeCore(HttpContextBase httpContext)
        {
            try
            {
                var authHeader = httpContext.Request.Headers["Authorization"];
                if (string.IsNullOrEmpty(authHeader))
                    return false;

                var token = authHeader.Replace("Bearer ", "");
                var claims = JwtHelper.ValidateToken(token);

                if (claims == null)
                    return false;

                // Role check (if required)
                if (RequiredRoleId > 0)
                {
                    var roleIdClaim = claims.FindFirst("RoleId");
                    int userRoleId;

                    if (roleIdClaim == null ||
                        !int.TryParse(roleIdClaim.Value, out userRoleId) ||
                        userRoleId != RequiredRoleId)
                    {
                        return false;
                    }
                }

                // Store claims for controller access
                httpContext.Items["JwtClaims"] = claims;
                return true;
            }
            catch
            {
                return false;
            }
        }

        public static ClaimsPrincipal GetClaims(HttpContextBase httpContext)
        {
            return httpContext.Items["JwtClaims"] as ClaimsPrincipal;
        }
    }
}
