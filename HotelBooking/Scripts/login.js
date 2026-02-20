$(document).ready(function () {
    $("#btnLogin").on("click", function (e) {
        e.preventDefault();

        var email = $("#email").val().trim();
        var password = $("#password").val().trim();
        var token = $('input[name="__RequestVerificationToken"]').val();

        if (!email || !password) {
            Swal.fire("Error", "Email and Password are required", "error");
            return;
        }

        $.ajax({
            url: "/Account/Login",
            type: "POST",
            dataType: "json",
            data: {
                Email: email,
                Password: password,
                __RequestVerificationToken: token
            },
            success: function (res) {
                console.log(res);

                if (res.status === "success") {
                    window.location.href = res.redirectUrl; // REDIRECT
                } else {
                    Swal.fire("Error", res.message, "error");
                }
            },
            error: function (xhr, status, error) {
                Swal.fire("Error", "Server error. Try again.", "error");
                console.log(xhr.responseText);
            }
        });
    });
});
