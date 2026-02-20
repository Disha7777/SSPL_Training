$(document).ready(function () {
    // Function to handle registration
    function register() {
        var name = $("#name").val().trim();
        var email = $("#email").val().trim();
        var password = $("#password").val().trim();

        if (name === "" || email === "" || password === "") {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Fields',
                text: 'All fields are required'
            });
            return;
        }

        if (name.length < 3) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid Name',
                text: 'Name must be at least 3 characters'
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
                title: 'Weak Password',
                text: 'Password must be at least 6 characters'
            });
            return;
        }

        // Disable button during AJAX call
        var $btn = $("#btnRegister");
        $btn.prop("disabled", true).text("Registering...");

        $.ajax({
            url: "/Account/Register",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                Name: name,
                Email: email,
                Password: password
            }),
            success: function (res) {
                $btn.prop("disabled", false).text("Register");

                if (res.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Registration Successful',
                        text: res.message || 'You can now login',
                        timer: 2000,
                        showConfirmButton: false
                    }).then(() => {
                        window.location.href = "/Account/Login";
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Registration Failed',
                        text: res.message || 'Something went wrong'
                    });
                }
            },
            error: function (xhr) {
                $btn.prop("disabled", false).text("Register");
                var errorMsg = xhr.responseJSON && xhr.responseJSON.message
                    ? xhr.responseJSON.message
                    : 'Registration failed. Please try again.';

                Swal.fire({
                    icon: 'error',
                    title: 'Registration Failed',
                    text: errorMsg
                });
            }
        });
    }

    // Click event for register button
    $("#btnRegister").click(register);

    // Enter key support
    $(document).on('keypress', function (e) {
        if (e.which === 13) { // Enter key
            register();
        }
    });

    // Focus first input on load
    $("#name").focus();
});