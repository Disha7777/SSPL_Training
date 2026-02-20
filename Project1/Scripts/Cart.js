$(document).ready(function () {

    let cartItems = [];

    loadCart();

    // ================= LOAD CART =================
    function loadCart() {
        const token = localStorage.getItem('jwtToken') || localStorage.getItem('token');

        if (!token) {
            showNotLoggedInMessage();
            return;
        }

        showLoading();

        $.ajax({
            url: '/Food/GetCart',
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            success: function (response) {
                console.log('Cart response:', response);
                if (response.success && response.cartItems?.length > 0) {
                    cartItems = response.cartItems;
                displayCartItems(cartItems);
                updateOrderSummary(response.summary);
                $('#emptyCartMessage').addClass('d-none');
                $('#cartContainer').removeClass('d-none');
            } else {
                    showEmptyCartMessage();
    }
},
    error: function (xhr) {
        console.log('Cart load error:', xhr);
        if (xhr.status === 401) {
            localStorage.clear();
            showNotLoggedInMessage();
        } else {
            showError('Failed to load cart. Please try again.');
        }
    }
});
}

// ================= DISPLAY CART ITEMS =================
function displayCartItems(items) {
    const container = $('#cartItemsContainer');
    container.empty();

    if (items.length === 0) {
        showEmptyCartMessage();
        return;
    }

    items.forEach(item => {
        const template = $('#cartItemTemplate')
            .clone()
            .removeClass('d-none')
            .removeAttr('id');

        const price = parseFloat(item.Price);
    
        const quantity = item.Quantity || 1;
        const total = price * quantity;

        // Set image with fallback
        const img = template.find('.cart-item-image');
        img.attr('src', item.ImageUrl || '/Content/images/default-food.jpg');
        img.on('error', function() {
            $(this).attr('src', '/Content/images/default-food.jpg');
        });

        // Set text content
        template.find('.cart-item-name').text(item.Name);
        template.find('.cart-item-price').text('₹' + price.toFixed(2) + ' each');
        if (item.Description) {
            template.find('.cart-item-description').text(item.Description).removeClass('d-none');
        }
            
        // Set quantity controls
        const quantityInput = template.find('.quantity-input');
        quantityInput.val(quantity);
        quantityInput.attr('data-id', item.CartId);
            
        // Set unit price display
        template.find('.cart-item-unit-price').text('₹' + price.toFixed(2));
        template.find('.cart-item-quantity').text(quantity);
            
        // Set total price
        template.find('.cart-item-total').text('₹' + total.toFixed(2));

        // Set button data attributes
        template.find('.remove-item-btn').attr('data-id', item.CartId);
        template.find('.save-item-btn').attr('data-id', item.FoodId);
        template.find('.quantity-minus').attr('data-id', item.CartId);
        template.find('.quantity-plus').attr('data-id', item.CartId);

        container.append(template);
    });
}

// ================= UPDATE ORDER SUMMARY =================
function updateOrderSummary(summary) {
    if (!summary) {
        calculateTotals();
        return;
    }

    // Update item count
    $('#itemCount').text(summary.itemCount + ' items');
    $('#itemCountBadge').text(summary.distinctCount);
        
    // Update prices
    const subtotal = summary.subtotal || 0;
    const tax = subtotal * 0.10;
        
    // Calculate delivery (free above 300)
    let delivery = 40; // Default delivery charge
    if (subtotal >= 300) {
        delivery = 0;
    }
        
    const total = subtotal + tax + delivery;

    $('#subtotal').text('₹' + subtotal.toFixed(2));
    $('#tax').text('₹' + tax.toFixed(2));
    $('#delivery').text(delivery === 0 ? 'FREE' : '₹' + delivery.toFixed(2));
    $('#total').text('₹' + total.toFixed(2));
        
    // Highlight free delivery
    if (delivery === 0) {
        $('#delivery').addClass('text-success fw-bold');
    } else {
        $('#delivery').removeClass('text-success fw-bold');
    }
}

// ================= CALCULATE TOTALS (Fallback) =================
function calculateTotals() {
    let subtotal = 0;
    let itemCount = 0;

    cartItems.forEach(item => {
        const quantity = item.Quantity || 1;
        subtotal += parseFloat(item.Price) * quantity;
        itemCount += quantity;
    });

    const tax = subtotal * 0.10;
    let delivery = 40;
    if (subtotal >= 300) {
        delivery = 0;
    }
    const total = subtotal + tax + delivery;

    // Update UI
    $('#itemCount').text(itemCount + ' items');
    $('#itemCountBadge').text(cartItems.length);
    $('#subtotal').text('₹' + subtotal.toFixed(2));
    $('#tax').text('₹' + tax.toFixed(2));
    $('#delivery').text(delivery === 0 ? 'FREE' : '₹' + delivery.toFixed(2));
    $('#total').text('₹' + total.toFixed(2));
        
    if (delivery === 0) {
        $('#delivery').addClass('text-success fw-bold');
    }
}

// ================= REMOVE ITEM =================
$(document).on('click', '.remove-item-btn', function () {
    const cartId = $(this).data('id');
    const itemName = $(this).closest('.cart-item').find('.cart-item-name').text();
        
    Swal.fire({
        title: 'Remove Item',
        text: `Remove "${itemName}" from cart?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Yes, remove it',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            removeItemFromCart(cartId);
        }
    });
});

function removeItemFromCart(cartId) {
    const token = localStorage.getItem('jwtToken') || localStorage.getItem('token');

    $.ajax({
        url: '/Food/RemoveFromCart',
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token
        },
        data: { cartId: cartId },
        success: function (res) {
            if (res.success) {
                toastr.success('Item removed from cart');
                // Update cart count in header
                if (res.cartCount !== undefined) {
                    $('#cartCount').text(res.cartCount);
                }
                loadCart(); // Reload cart
            } else {
                showError(res.message);
            }
        },
        error: function() {
            showError('Failed to remove item');
        }
    });
}

// ================= QUANTITY UPDATE =================
$(document).on('click', '.quantity-minus, .quantity-plus', function () {
    const cartId = $(this).data('id');
    const input = $(this).closest('.quantity-controls').find('.quantity-input');
    let qty = parseInt(input.val());

    // Calculate new quantity
    if ($(this).hasClass('quantity-minus')) {
        qty = Math.max(1, qty - 1);
    } else {
        qty = Math.min(20, qty + 1);
    }

    // Update UI immediately
    updateItemQuantityUI(cartId, qty);
        
    // Send update to server
    updateQuantity(cartId, qty);
});

// ================= DIRECT INPUT CHANGE =================
$(document).on('change', '.quantity-input', function () {
    let qty = parseInt($(this).val());
    const cartId = $(this).data('id');
        
    // Validate
    if (isNaN(qty) || qty < 1) {
        qty = 1;
        $(this).val(1);
    } else if (qty > 20) {
        qty = 20;
        $(this).val(20);
        toastr.warning('Maximum quantity is 20 per item');
    }
        
    updateItemQuantityUI(cartId, qty);
    updateQuantity(cartId, qty);
});

// Update item UI when quantity changes
function updateItemQuantityUI(cartId, quantity) {
    const itemElement = $(`.quantity-input[data-id="${cartId}"]`).closest('.cart-item');
    const priceText = itemElement.find('.cart-item-price').text();
    const price = parseFloat(priceText.replace('₹', '').replace(' each', ''));
    const total = price * quantity;
        
    // Update displays
    itemElement.find('.quantity-input').val(quantity);
    itemElement.find('.cart-item-quantity').text(quantity);
    itemElement.find('.cart-item-total').text('₹' + total.toFixed(2));
        
    // Update cartItems array
    const itemIndex = cartItems.findIndex(x => x.CartId === cartId);
    if (itemIndex !== -1) {
        cartItems[itemIndex].Quantity = quantity;
    }
        
    // Recalculate totals
    calculateTotals();
}

function updateQuantity(cartId, quantity) {
    const token = localStorage.getItem('jwtToken') || localStorage.getItem('token');

    $.ajax({
        url: '/Food/UpdateCartQuantity',
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token
        },
        data: { cartId: cartId, quantity: quantity },
        success: function (res) {
            if (res.success) {
                // Update subtotal if returned from server
                if (res.subtotal !== undefined) {
                    const itemIndex = cartItems.findIndex(x => x.CartId === cartId);
                    if (itemIndex !== -1) {
                        cartItems[itemIndex].Quantity = quantity;
                    }
                        
                    const tax = res.subtotal * 0.10;
                    let delivery = 40;
                    if (res.subtotal >= 300) delivery = 0;
                        
                    $('#subtotal').text('₹' + res.subtotal.toFixed(2));
                    $('#tax').text('₹' + tax.toFixed(2));
                    $('#delivery').text(delivery === 0 ? 'FREE' : '₹' + delivery.toFixed(2));
                    $('#total').text('₹' + (res.subtotal + tax + delivery).toFixed(2));
                }
                    
                toastr.success('Quantity updated');
            } else {
                showError(res.message);
                // Reload cart to sync with server
                loadCart();
            }
        },
        error: function() {
            showError('Failed to update quantity');
            loadCart(); // Reload to sync
        }
    });
}

// ================= CLEAR CART =================
$('#clearCartBtn').on('click', function() {
    if (cartItems.length === 0) {
        toastr.info('Your cart is already empty');
        return;
    }
        
    Swal.fire({
        title: 'Clear Cart?',
        text: 'This will remove all items from your cart.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Yes, clear it',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            clearCart();
        }
    });
});

function clearCart() {
    const token = localStorage.getItem('jwtToken') || localStorage.getItem('token');
        
    $.ajax({
        url: '/Food/ClearCart',
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token
        },
        success: function(res) {
            if (res.success) {
                toastr.success('Cart cleared successfully');
                showEmptyCartMessage();
                // Update header cart count
                if (res.cartCount !== undefined) {
                    $('#cartCount').text(res.cartCount);
                }
            } else {
                showError(res.message);
            }
        },
        error: function() {
            showError('Failed to clear cart');
        }
    });
}

// ================= CHECKOUT =================
$('#checkoutBtn').on('click', function() {
    const token = localStorage.getItem('jwtToken') || localStorage.getItem('token');
        
    if (!token) {
        Swal.fire({
            icon: 'warning',
            title: 'Login Required',
            text: 'Please login to proceed to checkout',
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
        
    if (cartItems.length === 0) {
        toastr.error('Your cart is empty');
        return;
    }
        
    // Show loading on button
    const btn = $(this);
    const originalText = btn.html();
    btn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Processing...');
        
    // Here you would redirect to checkout page
    // For now, simulate checkout process
    setTimeout(() => {
        toastr.success('Redirecting to checkout...');
        btn.prop('disabled', false).html(originalText);
        // Uncomment to redirect to checkout page
        // window.location.href = '/Order/Checkout';
    }, 1000);
});

// ================= REFRESH CART =================
$('#refreshCartBtn').on('click', function() {
    const btn = $(this);
    const originalHtml = btn.html();
    btn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i>');
        
    loadCart();
        
    setTimeout(() => {
        btn.prop('disabled', false).html(originalHtml);
        toastr.info('Cart refreshed');
    }, 500);
});

// ================= SAVE ITEM (Add to favorites) =================
$(document).on('click', '.save-item-btn', function() {
    const foodId = $(this).data('id');
    const token = localStorage.getItem('jwtToken') || localStorage.getItem('token');
        
    if (!token) {
        toastr.warning('Please login to save items');
        return;
    }
        
    // Here you would call an API to add to favorites
    // For now, just show a message
    toastr.info('Added to saved items');
});

// ================= HELPERS =================
function showEmptyCartMessage() {
    $('#emptyCartMessage').removeClass('d-none');
    $('#cartContainer').addClass('d-none');
}

function showNotLoggedInMessage() {
    $('#cartSection').html(`
            <div class="alert alert-warning text-center py-5">
                <i class="fas fa-exclamation-triangle fa-3x mb-3"></i>
                <h4>Please Login</h4>
                <p>You need to be logged in to view your cart.</p>
                <div class="mt-3">
                    <a href="/Account/Login" class="btn btn-primary me-2">Login</a>
                    <a href="/Account/Register" class="btn btn-outline-primary">Register</a>
                </div>
            </div>
        `);
}

function showLoading() {
    $('#cartItemsContainer').html($('#loadingTemplate').html());
}

function showError(msg) {
    toastr.error(msg || 'Something went wrong');
}

// Initialize
updateHeaderCartCount();

// Function to update header cart count
function updateHeaderCartCount() {
    const token = localStorage.getItem('jwtToken') || localStorage.getItem('token');
        
    if (!token) {
        $('#cartCount').text('0');
        return;
    }

    $.ajax({
        url: '/Food/GetCartCount',
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        },
        success: function(response) {
            if (response.success) {
                $('#cartCount').text(response.cartCount);
            }
        },
        error: function() {
            // Silently fail
        }
    });
}
});