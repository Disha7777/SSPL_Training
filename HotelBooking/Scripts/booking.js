$(document).ready(function () {

    let today = new Date().toISOString().split("T")[0];
    $("#checkIn, #checkOut").attr("min", today);

    $("#checkIn").change(function () {
        $("#checkOut").val("").attr("min", $(this).val());
    });

    // 🔹 LOAD ROOMS ON DATE OR FILTER CHANGE
    $("#checkOut, #filterAC, #filterFood").change(loadRooms);

    function loadRooms() {

        let checkIn = $("#checkIn").val();
        let checkOut = $("#checkOut").val();

        if (!checkIn || !checkOut) return;

        $.post("/Booking/GetRooms", {
            checkIn: checkIn,
            checkOut: checkOut,
            ac: $("#filterAC").is(":checked"),
            food: $("#filterFood").is(":checked")
        }, function (rooms) {

            $("#roomId").empty();
            $("#roomDiv").hide();
            $("#price").hide();
            $("#imageSlider").hide();

            if (rooms.length === 0) {
                alert("No rooms available");
                return;
            }

            $("#roomDiv").show();
            $("#roomId").append(`<option value="">-- Select Room --</option>`);

            $.each(rooms, function (i, r) {
                $("#roomId").append(`
                    <option value="${r.RoomId}" data-price="${r.Price}" data-type="${r.RoomType}">
                        ${r.RoomType} - ₹${r.Price}
                    </option>
                `);
            });
        });
    }

    // 🔹 ROOM SELECT
    $("#roomId").change(function () {

        let opt = $("#roomId option:selected");
        if (!opt.val()) return;

        $("#price").val("₹ " + opt.data("price")).show();

        let type = opt.data("type");
        let images = [1, 2, 3];

        $("#sliderImages").empty();

        $.each(images, function (i, n) {
            $("#sliderImages").append(`
                <div class="carousel-item ${i === 0 ? "active" : ""}">
                    <img src="/Content/Images/rooms/${type}/${n}.jpg"
                         class="d-block w-100"
                         onerror="this.src='/Content/Images/rooms/placeholder.jpg'"
                         style="height:250px;object-fit:cover">
                </div>
            `);
        });

        $("#imageSlider").show();
    });
    $("#filterAC, #filterBreakfast, #filterLunch, #filterPet, #filterRoomType")
.on("change", function () {
    $.get("/Booking/FilterRooms", {
        ac: $("#filterAC").is(":checked"),
        breakfast: $("#filterBreakfast").is(":checked"),
        lunch: $("#filterLunch").is(":checked"),
        pet: $("#filterPet").is(":checked"),
        type: $("#filterRoomType").val()
    }, function (html) {
        $("#roomList").html(html);
    });
});


    // 🔹 BOOK
    $("#btnBook").click(function () {

        $.post("/Booking/Create", {
            roomId: $("#roomId").val(),
            checkIn: $("#checkIn").val(),
            checkOut: $("#checkOut").val()
        }, function (res) {

            if (res.status === "Login") {
                window.location.href = "/Account/Login";
                return;
            }

            if (res.status === "OK") {
                window.location.href = "/Booking/History";
            }
        });
    });
});
