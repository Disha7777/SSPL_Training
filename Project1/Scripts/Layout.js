$(document).ready(function () {

    // ===============================
    // CHECK LOGIN STATUS
    // ===============================
    function checkLoginStatus() {
        const token = localStorage.getItem("jwtToken");
        const userName = localStorage.getItem("userName");
        const userRoleId = localStorage.getItem("userRoleId");

        if (token && userName) {
            // ✅ User logged in
            $("#authButtons").hide();
            $("#accountBtn").show();
            $("#logoutBtn").show();

            // Set correct dashboard URL based on role
            setDashboardUrl(userRoleId);
        } else {
            // ❌ User not logged in
            $("#authButtons").show();
            $("#accountBtn").hide();
            $("#logoutBtn").hide();
        }
    }

    // ===============================
    // SET DASHBOARD URL BASED ON ROLE
    // ===============================
    function setDashboardUrl(roleId) {
        const accountBtn = $("#accountBtn");

        if (roleId == "1") { // Admin
            accountBtn.attr("href", "/Admin/Dashboard");
            accountBtn.html('<i class="fas fa-user-shield"></i> Admin Dashboard');
        } else if (roleId == "2") { // Regular user
            accountBtn.attr("href", "/MyAccount/Dashboard");
            accountBtn.html('<i class="fas fa-user"></i> My Account');
        } else {
            // Default fallback
            accountBtn.attr("href", "/MyAccount/Dashboard");
            accountBtn.html('<i class="fas fa-user"></i> My Account');
        }
    }

    // Run on page load
    checkLoginStatus();


    // ===============================
    // LOGOUT
    // ===============================
    $("#logoutBtn").on("click", function (e) {
        e.preventDefault();

        // Clear all user data
        localStorage.removeItem("jwtToken");
        localStorage.removeItem("userName");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userId");
        localStorage.removeItem("userRoleId");

        toastr.success("Logged out successfully");

        // Update navbar immediately
        $("#authButtons").show();
        $("#accountBtn").hide();
        $("#logoutBtn").hide();

        // Reset account button to default
        $("#accountBtn").attr("href", "#");
        $("#accountBtn").html('<i class="fas fa-user"></i> My Account');

        // Redirect to home
        setTimeout(function () {
            window.location.href = "/";
        }, 800);
    });


    // ===============================
    // GLOBAL AJAX JWT HANDLER
    // ===============================
    $.ajaxSetup({
        beforeSend: function (xhr) {
            const token = localStorage.getItem("jwtToken");
            if (token) {
                xhr.setRequestHeader("Authorization", "Bearer " + token);
            }
        },
        error: function (xhr) {
            if (xhr.status === 401) {
                toastr.error("Session expired. Please login again.");

                // Clear all local storage
                localStorage.clear();

                // Reset UI
                $("#authButtons").show();
                $("#accountBtn").hide();
                $("#logoutBtn").hide();
                $("#accountBtn").attr("href", "#");
                $("#accountBtn").html('<i class="fas fa-user"></i> My Account');

                setTimeout(function () {
                    window.location.href = "/Account/Login";
                }, 1200);
            }
        }
    });

});