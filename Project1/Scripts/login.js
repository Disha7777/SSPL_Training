$(document).ready(function () {
    // Function to handle login
    function login() {
        var email = $("#email").val().trim();
        var password = $("#password").val().trim();

        // Validation
        if (email === "" || password === "") {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Fields',
                text: 'Please enter both email and password'
            });
            return;
        }

        var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid Email',
                text: 'Please enter a valid email address'
            });
            return;
        }

        if (password.length < 6) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid Password',
                text: 'Password must be at least 6 characters'
            });
            return;
        }

        // Disable button during AJAX call
        var $btn = $("#btnLogin");
        $btn.prop("disabled", true).text("Logging in...");

        $.ajax({
            url: "/Account/Login",
            type: "POST",
            data: {
                email: email,
                password: password
            },
            success: function (res) {
                $btn.prop("disabled", false).text("Login");

                if (res.success) {
                    // ✅ STORE JWT TOKEN
                    localStorage.setItem("jwtToken", res.token);

                    // ✅ STORE USER INFORMATION
                    localStorage.setItem("userId", res.userId);
                    localStorage.setItem("userName", res.name);
                    localStorage.setItem("userRoleId", res.roleId); // Store only RoleId

                    Swal.fire({
                        icon: 'success',
                        title: 'Login Successful',
                        text: `Welcome ${res.name}!`,
                        timer: 1500,
                        showConfirmButton: false
                    }).then(() => {
                        // Redirect based on RoleId only
                        // Redirect based on RoleId
                        if (res.roleId === 1) { // Admin (RoleId = 1)
                            window.location.href = "/Admin/Dashboard";  // Goes to AdminController.Dashboard()
                        } else { // User (RoleId = 2)
                            window.location.href = "/MyAccount/Dashboard"; // Goes to MyAccountController.Dashboard()
                        }
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Login Failed',
                        text: res.message || 'Invalid email or password'
                    });
                }
            }, // ← ADDED MISSING COMMA HERE
            error: function (xhr) {
                $btn.prop("disabled", false).text("Login");
                var errorMsg = xhr.responseJSON && xhr.responseJSON.message
                    ? xhr.responseJSON.message
                    : 'Server error. Please try again later.';

                Swal.fire({
                    icon: 'error',
                    title: 'Login Failed',
                    text: errorMsg
                });
            }
        });
    }

    // Click event for login button
    $("#btnLogin").click(login);

    // Enter key support
    $(document).on('keypress', function (e) {
        if (e.which === 13) { // Enter key
            login();
        }
    });

    // Focus first input on load
    $("#email").focus();
});