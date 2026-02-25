let allProducts = [];

const loginView = document.getElementById("login-view");
const dashboardView = document.getElementById("dashboard-view");
const productGrid = document.getElementById("product-grid");
const modal = document.getElementById("product-modal");
const modalBody = document.getElementById("modal-body");

document.getElementById("login-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email.includes("@") || password.length < 6) {
    alert("Invalid Validation");
    return;
  }

  loginView.style.display = "none";
  dashboardView.style.display = "grid";
  fetchProducts();
});

document.getElementById("logout-btn").addEventListener("click", () => {
  dashboardView.style.display = "none";
  loginView.style.display = "flex";
});

async function fetchProducts() {
  try {
    const response = await fetch("https://fakestoreapi.com/products");
    allProducts = await response.json();
    renderProducts(allProducts);
  } catch (error) {
    console.error(error);
  }
}

function renderProducts(products) {
  productGrid.innerHTML = products
    .map(
      (product) => `
                <article class="product-card" onclick="openModal(${product.id})">
                    <img src="${product.image}" alt="${product.title}" class="product-card__image">
                    <h4 class="product-card__title">${product.title}</h4>
                    <p class="product-card__price">$${product.price}</p>
                </article>
            `,
    )
    .join("");
}

function openModal(id) {
  const product = allProducts.find((p) => p.id === id);
  modalBody.innerHTML = `
                <img src="${product.image}" class="modal__image">
                <h2>${product.title}</h2>
                <p style="margin: 1rem 0; color: #666;">${product.description}</p>
                <p class="product-card__price">Category: ${product.category}</p>
                <p class="product-card__price" style="margin-top: 1rem;">$${product.price}</p>
            `;
  modal.style.display = "flex";
}

function closeModal() {
  modal.style.display = "none";
}

window.onclick = function (event) {
  if (event.target == modal) {
    closeModal();
  }
};

const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(null, args);
    }, delay);
  };
};

const handleSearch = debounce((e) => {
  const term = e.target.value.toLowerCase();
  const filtered = allProducts.filter((p) =>
    p.title.toLowerCase().includes(term),
  );
  renderProducts(filtered);
}, 300);

document.getElementById("search-input").addEventListener("input", handleSearch);

function switchTab(tab) {
  const productsTab = document.getElementById("products-tab");
  const addTab = document.getElementById("add-product-tab");
  const items = document.querySelectorAll(".nav-list__item");

  if (tab === "products") {
    productsTab.style.display = "block";
    addTab.style.display = "none";
    items[0].classList.add("nav-list__item--active");
    items[1].classList.remove("nav-list__item--active");
  } else {
    productsTab.style.display = "none";
    addTab.style.display = "block";
    items[0].classList.remove("nav-list__item--active");
    items[1].classList.add("nav-list__item--active");
  }
}

$("#add-product-form").on("submit", function (e) {
  e.preventDefault();

  const imageUrl = $('input[name="image"]').val();

  const newProduct = {
    title: $('input[name="title"]').val(),
    price: parseFloat($('input[name="price"]').val()),
    description: $('textarea[name="description"]').val(),
    image: imageUrl,
    category: $('input[name="category"]').val(),
  };

  $.ajax({
    url: "https://fakestoreapi.com/products",
    method: "POST",
    data: JSON.stringify(newProduct),
    success: function (response) {
      newProduct.id = Date.now();

      allProducts.unshift(newProduct);

      alert("Product added successfully!");

      $("#add-product-form")[0].reset();
      switchTab("products");

      renderProducts(allProducts);
    },
    error: function (err) {
      alert("Error adding product");
    },
  });
});
