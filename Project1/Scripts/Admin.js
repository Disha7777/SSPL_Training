$(document).ready(function () {
    // ============================
    // CONSTANTS & STATE
    // ============================
    const API_BASE = "";
    let currentAdmin = null;
    let allUsers = [];
    let allFoods = [];
    let allCarts = [];

    // ============================
    // AUTHENTICATION CHECK
    // ============================
    function checkAuth() {
        const token = localStorage.getItem("jwtToken");
        const roleId = localStorage.getItem("userRoleId");
        const userName = localStorage.getItem("userName");

        // 1. Client-side check
        if (!token) {
            redirectToLogin("No authentication token found");
            return;
        }

        if (roleId !== "1") {
            redirectToLogin("Access denied. Admin privileges required.");
            return;
        }

        currentAdmin = {
            name: userName || "Administrator",
            token: token
        };
        $("#logoutBtn").click(() => {
            if (confirm("Are you sure you want to logout?")) {
                localStorage.clear();
                window.location.href = "/Account/Login";
            }
        });
        // 2. Setup Global AJAX Headers
        // This ensures the token is sent in every $.ajax call
        $.ajaxSetup({
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });

        // 3. Reveal Dashboard UI and Load Data
        $("#authLoading").fadeOut(300, function () {
            $("#adminDashboard").removeClass("content-hidden").hide().fadeIn(500);
            $("#adminName").text(currentAdmin.name);
            loadAllData();
        });
    }

    function redirectToLogin(message) {
        Swal.fire({
            icon: 'warning',
            title: 'Access Denied',
            text: message || 'Unauthorized access',
            confirmButtonText: 'Go to Login'
        }).then(() => {
            localStorage.clear();
            window.location.href = "/Account/Login";
        });
    }

    // ============================
    // DATA LOADING (Promise.all with jQuery)
    // ============================
    function loadAllData() {
        // Show loading indicators for all tables
        $("#usersTable tbody").html('<tr><td colspan="5" style="text-align: center; padding: 40px;"><div class="spinner small"></div> Loading users...</td></tr>');
        $("#foodsTable tbody").html('<tr><td colspan="4" style="text-align: center; padding: 40px;"><div class="spinner small"></div> Loading foods...</td></tr>');
        $("#cartTable tbody").html('<tr><td colspan="5" style="text-align: center; padding: 40px;"><div class="spinner small"></div> Loading cart data...</td></tr>');

        // Use Promise.all for parallel loading
        Promise.all([
            loadUsers(),
            loadFoods(),
            loadCarts()
        ]).then(() => {
            console.log("All dashboard data loaded successfully");
            setupEventListeners();
        }).catch((error) => {
            console.error("Error loading data:", error);
            if (error.status === 401) {
                redirectToLogin("Session expired. Please login again.");
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Load Error',
                    text: 'Failed to load dashboard data. Please refresh the page.',
                    confirmButtonText: 'Refresh'
                }).then(() => {
                    location.reload();
                });
            }
        });
    }

    function loadUsers() {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: API_BASE + "/Admin/GetAllUsers",
                type: "GET",
                success: function (users) {
                    allUsers = users || [];
                    $("#totalUsers").text(users.length);

                    const tbody = $("#usersTable tbody");
                    tbody.empty();

                    if (users.length === 0) {
                        tbody.html('<tr><td colspan="5" style="text-align: center; padding: 40px;">No users found</td></tr>');
                        resolve();
                        return;
                    }

                    users.forEach(u => {
                        const roleText = u.RoleId === 1 ?
                            '<span style="color: #ff6b35; font-weight: bold;">Admin</span>' :
                            '<span style="color: #28a745;">User</span>';

                        tbody.append(`
                            <tr data-user-id="${u.Id}" class="user-row">
                                <td>${u.Id}</td>
                                <td><strong>${u.Name || 'N/A'}</strong></td>
                                <td>${u.Email || 'N/A'}</td>
                                <td>${roleText}</td>
                                <td>
                                    <button class="nav-btn view-user" data-id="${u.Id}" style="padding: 5px 10px; font-size: 12px;">
                                        <i class="fas fa-eye"></i> View
                                    </button>
                                </td>
                            </tr>
                        `);
                    });
                    resolve();
                },
                error: function (xhr, status, error) {
                    console.error("Failed to load users:", xhr);

                    const tbody = $("#usersTable tbody");
                    if (xhr.status === 401) {
                        tbody.html('<tr><td colspan="5" style="text-align: center; padding: 40px; color: #dc3545;">Unauthorized - Please login again</td></tr>');
                        reject(xhr);
                    } else {
                        tbody.html('<tr><td colspan="5" style="text-align: center; padding: 40px; color: #dc3545;">Error loading users. Please try again.</td></tr>');
                        reject(xhr);
                    }
                }
            });
        });
    }

    function loadFoods() {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: API_BASE + "/Admin/GetAllFoods",
                type: "GET",
                success: function (foods) {
                    allFoods = foods || [];
                    $("#totalFoods").text(foods.length);

                    const tbody = $("#foodsTable tbody");
                    tbody.empty();

                    if (foods.length === 0) {
                        tbody.html('<tr><td colspan="4" style="text-align: center; padding: 40px;">No food items found</td></tr>');
                        resolve();
                        return;
                    }

                    foods.forEach(f => {
                        tbody.append(`
                            <tr>
                                <td>${f.Id}</td>
                                <td><strong>${f.Name || 'N/A'}</strong></td>
                                <td><span style="color: #28a745; font-weight: bold;">₹${f.Price || '0'}</span></td>
                                <td>
                                    <button class="nav-btn edit-food" data-id="${f.Id}" style="padding: 5px 10px; font-size: 12px;">
                                        <i class="fas fa-edit"></i> Edit
                                    </button>
                                </td>
                            </tr>
                        `);
                    });
                    resolve();
                },
                error: function (xhr) {
                    console.error("Failed to load foods:", xhr);

                    const tbody = $("#foodsTable tbody");
                    if (xhr.status === 401) {
                        tbody.html('<tr><td colspan="4" style="text-align: center; padding: 40px; color: #dc3545;">Unauthorized</td></tr>');
                        reject(xhr);
                    } else {
                        tbody.html('<tr><td colspan="4" style="text-align: center; padding: 40px; color: #dc3545;">Error loading foods</td></tr>');
                        reject(xhr);
                    }
                }
            });
        });
    }

    function loadCarts() {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: API_BASE + "/Admin/GetAllCarts",
                type: "GET",
                success: function (carts) {
                    allCarts = carts || [];
                    $("#totalCartItems").text(carts.length);

                    const tbody = $("#cartTable tbody");
                    tbody.empty();

                    if (carts.length === 0) {
                        tbody.html('<tr><td colspan="5" style="text-align: center; padding: 40px;">No cart items found</td></tr>');
                        resolve();
                        return;
                    }

                    // Calculate total revenue from carts
                    let totalRevenue = 0;

                    carts.forEach(c => {
                        const total = c.Total || 0;
                        totalRevenue += total;

                        tbody.append(`
                            <tr>
                                <td><strong>${c.UserName || 'Unknown User'}</strong></td>
                                <td>${c.FoodName || 'N/A'}</td>
                                <td>${c.Quantity || '0'}</td>
                                <td>₹${c.Price || '0'}</td>
                                <td><strong>₹${total}</strong></td>
                            </tr>
                        `);
                    });

                    // Add total revenue row if needed
                    if (carts.length > 0) {
                        tbody.append(`
                            <tr style="background: #f8f9fa; font-weight: bold;">
                                <td colspan="4" style="text-align: right;">Total Revenue:</td>
                                <td>₹${totalRevenue.toFixed(2)}</td>
                            </tr>
                        `);
                    }

                    resolve();
                },
                error: function (xhr) {
                    console.error("Failed to load carts:", xhr);

                    const tbody = $("#cartTable tbody");
                    if (xhr.status === 401) {
                        tbody.html('<tr><td colspan="5" style="text-align: center; padding: 40px; color: #dc3545;">Unauthorized</td></tr>');
                        reject(xhr);
                    } else {
                        tbody.html('<tr><td colspan="5" style="text-align: center; padding: 40px; color: #dc3545;">Error loading cart data</td></tr>');
                        reject(xhr);
                    }
                }
            });
        });
    }

    // ============================
    // EVENT HANDLERS
    // ============================
    function setupEventListeners() {
        // Logout
        $("#logoutBtn").click(function () {
            Swal.fire({
                title: 'Logout?',
                text: "Are you sure you want to logout?",
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#ff6b35',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Yes, logout!',
                cancelButtonText: 'Cancel'
            }).then((result) => {
                if (result.isConfirmed) {
                    localStorage.removeItem("jwtToken");
                    localStorage.removeItem("userRoleId");
                    localStorage.removeItem("userName");
                    localStorage.removeItem("userId");
                    Swal.fire({
                        icon: 'success',
                        title: 'Logged Out',
                        text: 'You have been successfully logged out',
                        timer: 1500,
                        showConfirmButton: false
                    }).then(() => {
                        window.location.href = "/Account/Login";
                    });
                }
            });
        });

        // Home button
        $(".home-btn").click(function () {
            window.location.href = "/";
        });

        // Sidebar menu
        $(".menu-item").click(function () {
            $(".menu-item").removeClass("active");
            $(this).addClass("active");

            const target = $(this).data("target");
            navigateToSection(target);
        });

        // User row click (whole row)
        $(document).on("click", ".user-row", function (e) {
            // Don't trigger if clicking on the view button
            if (!$(e.target).closest('.view-user').length) {
                const userId = $(this).data("user-id");
                showUserDetails(userId);
            }
        });

        // View user button
        $(document).on("click", ".view-user", function (e) {
            e.stopPropagation();
            const userId = $(this).data("id");
            showUserDetails(userId);
        });

        // Edit food button
        $(document).on("click", ".edit-food", function () {
            const foodId = $(this).data("id");
            const food = allFoods.find(f => f.Id == foodId);
            if (food) {
                Swal.fire({
                    title: 'Edit Food Item',
                    html: `
                        <input id="foodName" class="swal2-input" placeholder="Food Name" value="${food.Name || ''}">
                        <input id="foodPrice" class="swal2-input" placeholder="Price" value="${food.Price || ''}" type="number">
                        <input id="foodDescription" class="swal2-input" placeholder="Description" value="${food.Description || ''}">
                    `,
                    focusConfirm: false,
                    showCancelButton: true,
                    confirmButtonText: 'Update',
                    cancelButtonText: 'Cancel',
                    preConfirm: () => {
                        return {
                            name: document.getElementById('foodName').value,
                            price: document.getElementById('foodPrice').value,
                            description: document.getElementById('foodDescription').value
                        }
                    }
                }).then((result) => {
                    if (result.isConfirmed) {
                        Swal.fire({
                            icon: 'info',
                            title: 'Feature Coming Soon',
                            text: 'Food editing functionality will be available in the next update.',
                            confirmButtonText: 'OK'
                        });
                    }
                });
            }
        });

        // Refresh button (if you add one)
        $(document).on("click", ".refresh-btn", function () {
            loadAllData();
        });

        // Close user details panel
        $(document).on("click", ".close-details", function () {
            $("#userDetailsPanel").removeClass("active");
            $(".user-row").removeClass("selected").css({
                'background': '',
                'border-left': ''
            });
        });

        // Manage User button in details panel
        $(document).on("click", ".user-details-panel .nav-btn", function () {
            const userId = $("#detailUserId").text();
            if (userId !== "-") {
                Swal.fire({
                    title: 'Manage User',
                    html: `
                        <div style="text-align: left; margin: 20px 0;">
                            <p><strong>User ID:</strong> ${userId}</p>
                            <p><strong>Name:</strong> ${$("#selectedUserName").text()}</p>
                        </div>
                    `,
                    showCancelButton: true,
                    confirmButtonText: 'Edit User',
                    cancelButtonText: 'View Orders',
                    showDenyButton: true,
                    denyButtonText: 'Reset Password'
                }).then((result) => {
                    if (result.isConfirmed) {
                        Swal.fire('Info', 'User editing feature coming soon!', 'info');
                    } else if (result.isDenied) {
                        Swal.fire('Info', 'Password reset feature coming soon!', 'info');
                    }
                });
            }
        });
    }

    // ============================
    // NAVIGATION
    // ============================
    function navigateToSection(section) {
        // Hide all panels first
        $(".panel").hide();
        $("#userDetailsPanel").removeClass("active");

        // Clear user selection
        $(".user-row").removeClass("selected").css({
            'background': '',
            'border-left': ''
        });

        // Show selected section
        switch (section) {
            case 'users':
                $("#usersPanel").show();
                break;
            case 'foods':
                $("#foodsPanel").show();
                break;
            case 'carts':
                $("#cartsPanel").show();
                break;
            case 'orders':
                $("#ordersPanel").show();
                break;
            default:
                // Dashboard - show all panels
                $(".panel").show();
                break;
        }

        // Update URL hash for bookmarking
        window.location.hash = section;
    }

    // ============================
    // USER DETAILS
    // ============================
    function showUserDetails(userId) {
        const user = allUsers.find(u => u.Id == userId);
        if (!user) {
            Swal.fire('Error', 'User not found', 'error');
            return;
        }

        // Update user details panel
        $("#selectedUserName").text(user.Name || "Unknown User");
        $("#selectedUserRole").text(user.RoleId === 1 ? "Administrator" : "Regular User");
        $("#userAvatar").text(user.Name ? user.Name.charAt(0).toUpperCase() : "U");
        $("#detailUserId").text(user.Id || "-");
        $("#detailUserEmail").text(user.Email || "-");

        // Format date (you would get this from your API)
        const createdDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        $("#detailUserCreated").text(createdDate);

        $("#detailUserStatus").html('<span style="color: #28a745;">Active</span>');

        // Calculate user's cart items
        const userCartItems = allCarts.filter(c => c.UserId == userId);
        $("#detailUserOrders").text(userCartItems.length || "0");

        // Calculate total spent by user
        const totalSpent = userCartItems.reduce((sum, item) => sum + (item.Total || 0), 0);

        // Add total spent if not already in the panel
        if (!$("#detailUserSpent").length) {
            $(".detail-item:last").after(`
                <div class="detail-item">
                    <label>Total Spent</label>
                    <div class="value" id="detailUserSpent">₹${totalSpent.toFixed(2)}</div>
                </div>
            `);
        } else {
            $("#detailUserSpent").text(`₹${totalSpent.toFixed(2)}`);
        }

        // Show the panel
        $("#userDetailsPanel").addClass("active");

        // Highlight selected user row
        $(".user-row").removeClass("selected").css({
            'background': '',
            'border-left': ''
        });

        $(`.user-row[data-user-id="${userId}"]`).addClass("selected").css({
            'background': 'rgba(255, 107, 53, 0.1)',
            'border-left': '4px solid #ff6b35'
        });
    }

    // ============================
    // INITIALIZATION
    // ============================
    function init() {
        // Add CSS for small spinner
        $('head').append(`
            <style>
                .spinner.small {
                    width: 20px;
                    height: 20px;
                    border: 3px solid #f3f3f3;
                    border-top: 3px solid #ff6b35;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    display: inline-block;
                    margin-right: 10px;
                    vertical-align: middle;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .user-row:hover {
                    background-color: rgba(0,0,0,0.02);
                    cursor: pointer;
                }

                .user-row.selected {
                    background-color: rgba(255, 107, 53, 0.1) !important;
                    border-left: 4px solid #ff6b35 !important;
                }

                .nav-btn {
                    background: #ff6b35;
                    color: white;
                    border: none;
                    padding: 8px 15px;
                    border-radius: 4px;
                    cursor: pointer;
                    transition: background 0.3s;
                }

                .nav-btn:hover {
                    background: #e55a2b;
                }
            </style>
        `);

        // Check hash on load for section navigation
        const hash = window.location.hash.substring(1);
        if (hash && ['dashboard', 'users', 'foods', 'carts', 'orders'].includes(hash)) {
            setTimeout(() => {
                $(`.menu-item[data-target="${hash}"]`).click();
            }, 100);
        }

        // Start authentication check
        checkAuth();
    }

    // Start everything
    init();
});