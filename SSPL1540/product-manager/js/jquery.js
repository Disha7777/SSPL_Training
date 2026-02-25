/* PRODUCT DETAILS MODAL */
$(document).on("click", ".product", function () {
    const id = $(this).data("id");
  
    $.get(`https://fakestoreapi.com/products/${id}`, data => {
      $("#modalBody").html(`
        <h3>${data.title}</h3>
        <p>${data.description}</p>
        <strong>$${data.price}</strong>
      `);
      $("#productModal").removeClass("hidden");
    });
  });
  
  $("#closeModal").click(() => {
    $("#productModal").addClass("hidden");
  });
  
  /* ADD PRODUCT (AJAX) */
  $("#addProductBtn").click(() => {
    $("#addModal").removeClass("hidden");
  });
  
  $("#closeAddModal").click(() => {
    $("#addModal").addClass("hidden");
  });
  
  $("#addProductForm").submit(function (e) {
    e.preventDefault();
  
    $.ajax({
      url: "https://fakestoreapi.com/products",
      method: "POST",
      data: $(this).serialize(),
      success: function () {
        alert("Product added successfully (mock API)");
        $("#addModal").addClass("hidden");
      }
    });
  });
  