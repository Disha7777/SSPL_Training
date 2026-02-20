$(document).ready(function () {
    console.log('Checking localStorage...');

    // Check BOTH possible token keys
    const token = localStorage.getItem('jwtToken') || localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');

    console.log('Token exists:', !!token);
    console.log('User ID:', userId);
    console.log('User Name:', userName);

    let allFoods = [];
    let cartCount = 0;
    // Store quantities for each food item
    let foodQuantities = {};

    // Load food items
    loadFoods();
    updateCartCount();

    // Search functionality
    $('#searchFood').on('input', function () {
        const searchTerm = $(this).val().toLowerCase();
        filterFoods(searchTerm);
    });

    // Smooth scroll for order button
    $('a[href="#food-section"]').on('click', function (e) {
        e.preventDefault();
        $('html, body').animate({
            scrollTop: $('#food-section').offset().top
        }, 500);
    });

    // Load all food items from FoodController API
    function loadFoods() {
        $.ajax({
            url: '/Food/GetAllFoods',
            method: 'GET',
            success: function (response) {
                if (response.success) {
                    allFoods = response.foods;
                    displayFoods(allFoods);
                    $('#loadingSpinner').hide();

                    // Initialize quantities for all foods
                    allFoods.forEach(food => {
                        foodQuantities[food.Id] = 1; // Default quantity is 1
                    });
                }
            },
            error: function () {
                showError('Failed to load food items');
                $('#loadingSpinner').hide();
            }
        });
    }

    // Display food items
    function displayFoods(foods) {
        const container = $('#foodContainer');
        container.empty();

        if (foods.length === 0) {
            container.html('<div class="col-12 text-center"><p class="text-muted">No food items found</p></div>');
            return;
        }

        foods.forEach(food => {
            const template = $('#foodTemplate').clone().removeClass('d-none').removeAttr('id');
            const quantity = foodQuantities[food.Id] || 1;

            // Set default image if not provided
            const imageUrl = food.ImageUrl || '/Images/default-food.jpg';
            template.find('.food-image').attr('src', imageUrl).attr('alt', food.Name);
            template.find('.food-name').text(food.Name);
            template.find('.food-description').text(food.Description || 'Delicious food item');
            template.find('.food-price').text('$' + parseFloat(food.Price).toFixed(2));

            // Set data-id for all interactive elements
            template.find('.add-to-cart-btn').attr('data-id', food.Id);
            template.find('.quantity-minus').attr('data-id', food.Id);
            template.find('.quantity-plus').attr('data-id', food.Id);
            template.find('.quantity-display').attr('data-id', food.Id).text(quantity);

            // Set quantity badge ID
            template.find('.quantity-badge').attr('id', 'quantityBadge_' + food.Id).text(quantity);

            container.append(template);
        });
    }

    // Filter food items
    function filterFoods(searchTerm) {
        if (!searchTerm) {
            displayFoods(allFoods);
            return;
        }

        const filtered = allFoods.filter(food =>
            food.Name.toLowerCase().includes(searchTerm) ||
            (food.Description && food.Description.toLowerCase().includes(searchTerm))
        );

        displayFoods(filtered);
    }

    // Quantity minus button
    $(document).on('click', '.quantity-minus', function () {
        const foodId = $(this).data('id');
        const quantityDisplay = $(this).closest('.quantity-controls').find('.quantity-display');
        let currentQty = parseInt(quantityDisplay.text());

        if (currentQty > 1) {
            currentQty--;
            quantityDisplay.text(currentQty);
            foodQuantities[foodId] = currentQty;

            // Update quantity badge
            $('#quantityBadge_' + foodId).text(currentQty);
        }
    });

    // Quantity plus button
    $(document).on('click', '.quantity-plus', function () {
        const foodId = $(this).data('id');
        const quantityDisplay = $(this).closest('.quantity-controls').find('.quantity-display');
        let currentQty = parseInt(quantityDisplay.text());

        if (currentQty < 20) { // Limit to 20 items
            currentQty++;
            quantityDisplay.text(currentQty);
            foodQuantities[foodId] = currentQty;

            // Update quantity badge
            $('#quantityBadge_' + foodId).text(currentQty);
        } else {
            showError('Maximum 20 items allowed per order');
        }
    });

    // Add to cart button
    $(document).on('click', '.add-to-cart-btn', function () {
        const foodId = $(this).data('id');
        const quantity = foodQuantities[foodId] || 1;
        const button = $(this);

        // Check BOTH possible token keys
        const token = localStorage.getItem('jwtToken') || localStorage.getItem('token');

        console.log('Add to cart clicked. Food ID:', foodId, 'Quantity:', quantity);
        console.log('Token found:', !!token);

        if (!token) {
            console.log('No token found, asking to login');
            Swal.fire({
                title: 'Login Required',
                text: 'Please login to add items to cart.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Go to Login',
                cancelButtonText: 'Cancel'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = '/Account/Login';
                }
            });
            return;
        }

        button.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Adding...');

        $.ajax({
            url: '/Food/AddToCart',
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            data: {
                foodId: foodId,
                quantity: quantity  // Send quantity to server
            },
            success: function (response) {
                console.log('Add to cart response:', response);
                if (response.success) {
                    showSuccess(quantity + ' item(s) added to cart successfully');
                    updateCartCount();

                    // Button animation
                    button.html('<i class="fas fa-check"></i> Added!');
                    setTimeout(() => {
                        button.html('<i class="fas fa-cart-plus"></i> Add to Cart');
                        button.prop('disabled', false);

                        // Reset quantity to 1 after adding
                        foodQuantities[foodId] = 1;
                        $('.quantity-display[data-id="' + foodId + '"]').text('1');
                        $('#quantityBadge_' + foodId).text('1');
                    }, 1500);
                } else {
                    showError(response.message || 'Failed to add item to cart');
                    button.prop('disabled', false).html('<i class="fas fa-cart-plus"></i> Add to Cart');
                }
            },
            error: function (xhr, status, error) {
                console.log('Add to cart error:', xhr.status, error);
                console.log('Response text:', xhr.responseText);

                if (xhr.status === 401) {
                    showError('Session expired or invalid token. Please login again.');
                    // Clear ALL token variations
                    localStorage.removeItem('jwtToken');
                    localStorage.removeItem('token');
                    localStorage.removeItem('userId');
                    localStorage.removeItem('userName');
                    setTimeout(() => {
                        window.location.href = '/Account/Login';
                    }, 2000);
                } else if (xhr.status === 400) {
                    showError('Bad request. Please check your data.');
                } else if (xhr.status === 500) {
                    showError('Server error. Please try again later.');
                } else {
                    showError('Failed to add item to cart: ' + error);
                }
                button.prop('disabled', false).html('<i class="fas fa-cart-plus"></i> Add to Cart');
            }
        });
    });

    // Update cart count
    function updateCartCount() {
        // Check BOTH possible token keys
        const token = localStorage.getItem('jwtToken') || localStorage.getItem('token');

        if (!token) {
            $('#cartCount').text('0');
            cartCount = 0;
            return;
        }

        $.ajax({
            url: '/Food/GetCart',
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            success: function (response) {
                if (response.success) {
                    // Calculate total items considering quantities
                    let totalItems = 0;
                    if (response.cartItems && response.cartItems.length > 0) {
                        totalItems = response.cartItems.reduce((sum, item) => {
                            return sum + (item.Quantity || 1);
                        }, 0);
                    }
                    cartCount = totalItems;
                    $('#cartCount').text(cartCount);
                }
            },
            error: function (xhr, status, error) {
                console.log('Get cart error:', xhr.status, error);
                $('#cartCount').text('0');
                cartCount = 0;

                // If 401, clear tokens
                if (xhr.status === 401) {
                    localStorage.removeItem('jwtToken');
                    localStorage.removeItem('token');
                }
            }
        });
    }

    // Keyboard shortcuts for quantity
    $(document).on('keydown', function (e) {
        // Get focused element
        const focused = $(':focus');

        if (focused.hasClass('quantity-display')) {
            const foodId = focused.data('id');
            const quantityDisplay = focused;

            if (e.key === 'ArrowUp' || e.key === '+') {
                e.preventDefault();
                const currentQty = parseInt(quantityDisplay.text());
                if (currentQty < 20) {
                    quantityDisplay.text(currentQty + 1);
                    foodQuantities[foodId] = currentQty + 1;
                    $('#quantityBadge_' + foodId).text(currentQty + 1);
                }
            } else if (e.key === 'ArrowDown' || e.key === '-') {
                e.preventDefault();
                const currentQty = parseInt(quantityDisplay.text());
                if (currentQty > 1) {
                    quantityDisplay.text(currentQty - 1);
                    foodQuantities[foodId] = currentQty - 1;
                    $('#quantityBadge_' + foodId).text(currentQty - 1);
                }
            }
        }
    });

    // Notification functions
    function showSuccess(message) {
        if (typeof toastr !== 'undefined') {
            toastr.success(message, 'Success');
        } else if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: message,
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 2000
            });
        } else {
            alert('Success: ' + message);
        }
    }

    function showError(message) {
        if (typeof toastr !== 'undefined') {
            toastr.error(message, 'Error');
        } else if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: message,
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
        } else {
            alert('Error: ' + message);
        }
    }

    // Auto-update cart count every 30 seconds if user is logged in
    setInterval(() => {
        const token = localStorage.getItem('jwtToken') || localStorage.getItem('token');
        if (token) {
            updateCartCount();
        }
    }, 30000);

    // Update cart count on page focus
    $(window).on('focus', function () {
        updateCartCount();
    });

    // Also add this to handle token migration (optional)
    function migrateTokenIfNeeded() {
        const jwtToken = localStorage.getItem('jwtToken');
        const oldToken = localStorage.getItem('token');

        // If we have jwtToken but not token, copy it
        if (jwtToken && !oldToken) {
            localStorage.setItem('token', jwtToken);
            console.log('Token migrated from jwtToken to token');
        }

        // If we have token but not jwtToken, copy it (for consistency)
        if (oldToken && !jwtToken) {
            localStorage.setItem('jwtToken', oldToken);
            console.log('Token migrated from token to jwtToken');
        }
    }

    // Run migration on page load
    migrateTokenIfNeeded();
});