$(document).ready(function () {

    $("#btnRegister").click(function () {

        var fullName = $("#fullname").val().trim();
        var email = $("#email").val().trim();
        var password = $("#password").val().trim();
        var confirmPassword = $("#confirmPassword").val().trim();
        var token = $('input[name="__RequestVerificationToken"]').val();

        // Validation
        if (fullName === "" || email === "" || password === "" || confirmPassword === "") {
            Swal.fire("Error", "All fields are required", "error");
            return;
        }

        if (password !== confirmPassword) {
            Swal.fire("Error", "Passwords do not match", "error");
            return;
        }

        if (password.length < 6) {
            Swal.fire("Error", "Password must be at least 6 characters", "error");
            return;
        }

        $.ajax({
            url: "/Account/Register",
            type: "POST",
            data: {
                FullName: fullName,
                Email: email,
                Password: password,
                __RequestVerificationToken: token
            },
            success: function (res) {
                if (res.status === "success") {
                    Swal.fire("Success", res.message, "success")
                        .then(() => {
                            window.location.href = "/Account/Login";
                        });
                } else {
                    Swal.fire("Error", res.message, "error");
                }
            },
            error: function () {
                Swal.fire("Error", "Registration failed", "error");
            }
        });

    });

});
