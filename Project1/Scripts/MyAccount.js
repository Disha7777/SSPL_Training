$(document).ready(function () {

    // ============================
    // AUTH CHECK
    // ============================
    const token = localStorage.getItem("jwtToken");

    if (!token) {
        window.location.href = "/Account/Login";
        return;
    }

    // ============================
    // LOAD USER INFO
    // ============================
    $.ajax({
        url: "/MyAccount/GetUser",
        type: "GET",
        headers: {
            Authorization: "Bearer " + token
        },
        success: function (res) {
            if (!res.success) {
                logoutSilently();
                return;
            }

            // 1. UPDATE SIDEBAR & HEADER
            $("#welcomeName").text("Welcome, " + res.name + "!");
            $("#userName").text(res.name);
            $("#userEmail").text(res.email);

            const roleName = res.roleId === 1 ? "Admin" : "User";
            $("#userRole").text(roleName);

            // 2. UPDATE MAIN "MY DETAILS" SECTION (Fixed here)
            $("#uname").text(res.name);      // Fills <span id="uname">
            $("#uemail").text(res.email);    // Fills <span id="uemail">
            $("#urole").text(res.roleId === 1 ? "Administrator" : "Registered User");

            // Change badge color for Admin
            if (res.roleId === 1) {
                $("#roleBadge").css("background", "#ff6b35");
            }

            // Store for later use
            localStorage.setItem("userName", res.name);
            localStorage.setItem("userEmail", res.email);
            localStorage.setItem("userRole", res.roleId);
            localStorage.setItem("userId", res.id);
        },
        error: function () {
            logoutSilently();
        }
    });

    // ============================
    // SIDEBAR NAV
    // ============================
    $(".sidebar-nav li").click(function () {
        $(".sidebar-nav li").removeClass("active");
        $(this).addClass("active");

        const sectionId = $(this).data("section");
        $(".content-section").removeClass("active");
        $("#" + sectionId).addClass("active");

        if (sectionId === "myOrders") {
            // Optional: load orders if implemented
        }
    });

    // ============================
    // LOGOUT
    // ============================
    $("#btnLogout").click(logout);
});


// ============================
// LOGOUT FUNCTIONS
// ============================

function logout() {
    Swal.fire({
        title: "Logout?",
        text: "Are you sure you want to end your session?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: '#764ba2',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, logout!'
    }).then(result => {
        if (result.isConfirmed) {
            logoutSilently();
        }
    });
}

function logoutSilently() {
    localStorage.clear();
    window.location.href = "/Account/Login";
}

// ============================
// EXTRA UI HANDLERS (FAQ Accordion)
// ============================
$(document).on("click", ".faq-question", function () {
    $(this).next(".faq-answer").slideToggle();
    $(this).find("i").toggleClass("fa-chevron-down fa-chevron-up");
});