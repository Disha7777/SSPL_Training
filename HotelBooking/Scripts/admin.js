$(document).ready(function () {

    // =============================
    // 🔴 DELETE BOOKING
    // =============================
    $(".btn-delete-booking").click(function () {

        var bookingId = $(this).data("id");

        Swal.fire({
            title: "Are you sure?",
            text: "This booking will be deleted",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it"
        }).then((result) => {

            if (result.isConfirmed) {
                $.ajax({
                    url: "/Admin/DeleteBooking",
                    type: "POST",
                    data: { id: bookingId },
                    success: function () {
                        Swal.fire("Deleted!", "Booking removed", "success")
                            .then(() => {
                                location.reload(); // ✅ reload page
                            });
                    },
                    error: function () {
                        Swal.fire("Error", "Delete failed", "error");
                    }
                });
            }
        });
    });
    $(document).ready(function () {

        $("#filterAC, #filterBreakfast, #filterLunch, #filterPet, #filterRoomType")
            .on("change", function () {

                $.ajax({
                    url: "/Admin/FilterRooms",
                    type: "GET",
                    data: {
                        ac: $("#filterAC").is(":checked"),
                        breakfast: $("#filterBreakfast").is(":checked"),
                        lunch: $("#filterLunch").is(":checked"),
                        pet: $("#filterPet").is(":checked"),
                        roomType: $("#filterRoomType").val()
                    },
                    success: function (html) {
                        $("#roomList").html(html);
                    },
                    error: function () {
                        alert("Failed to load filtered rooms");
                    }
                });
            });
    });


    // =============================
    // 🟢 UPDATE USER (ROLE + ACTIVE)
    // =============================
    $(document).on("click", ".save", function () {

        var row = $(this).closest("tr");

        var userId = $(this).data("id");
        var role = row.find(".role").val();
        var isActive = row.find(".isActive").is(":checked");

        $.ajax({
            url: "/Admin/UpdateUser", // ✅ correct action
            type: "POST",
            data: {
                userId: userId,
                role: role,
                isActive: isActive
            },
            success: function () {
                Swal.fire("Success", "User updated successfully", "success")
                    .then(() => {
                        location.reload(); // ✅ THIS IS THE KEY FIX
                    });
            },
            error: function () {
                Swal.fire("Error", "Update failed", "error");
            }
        });
    });

});
