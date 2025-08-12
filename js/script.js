/**
 * Career Exploration Website JavaScript
 * Handles API integration, animations, and user interactions
 */

$(document).ready(function () {
  // Configuration - Use AppConfig if available, fallback to defaults
  const CONFIG = window.AppConfig
    ? {
        API_BASE_URL: window.AppConfig.API.BASE_URL,
        CAREERS_ENDPOINT: window.AppConfig.API.ENDPOINTS.CAREERS,
        CAREER_DETAILS_ENDPOINT: window.AppConfig.API.ENDPOINTS.CAREER_DETAILS,
        CAREERS_PER_PAGE: window.AppConfig.SETTINGS.CAREERS_PER_PAGE,
        ANIMATION_DURATION: window.AppConfig.SETTINGS.ANIMATION_DURATION,
      }
    : {
        API_BASE_URL: "https://www.ehlcrm.theskyroute.com/api",
        CAREERS_ENDPOINT: "/test/top-future-career",
        CAREER_DETAILS_ENDPOINT: "/future-career-details",
        CAREERS_PER_PAGE: 12,
        ANIMATION_DURATION: 300,
      };

  // State management
  let allCareers = [];
  let filteredCareers = [];
  let currentPage = 1;
  let totalPages = 1;
  let totalCareers = 0;
  let isLoading = false;
  let currentFilter = "all";
  let searchQuery = "";
  let apiPaginationData = null;

  // DOM elements
  const $loadingOverlay = $("#loadingOverlay");
  const $careerCardsContainer = $("#careerCardsContainer");
  const $paginationNav = $("#paginationNav");
  const $noResults = $("#noResults");
  const $searchInput = $("#searchInput");
  const $filterButtons = $(".filter-buttons .btn");

  /**
   * Initialize the application
   */
  function init() {
    showLoading();

    // Determine which page we're on
    const isDetailsPage = window.location.pathname.includes(
      "career-details.html"
    );

    if (isDetailsPage) {
      initCareerDetailsPage();
    } else {
      initCareerListingPage();
    }

    // Initialize event listeners
    initEventListeners();

    // Initialize animations
    initAnimations();
  }

  /**
   * Initialize career listing page
   */
  function initCareerListingPage() {
    fetchCareers(currentPage)
      .then((response) => {
        allCareers = response.data;
        filteredCareers = response.data;
        displayCareers(response.data);
        updatePagination();
        hideLoading();

        // Add staggered animation to cards
        setTimeout(() => {
          animateCareerCards();
        }, 100);
      })
      .catch((error) => {
        console.error("Error fetching careers:", error);
        showError(
          "Failed to load career opportunities. Please try again later."
        );
        hideLoading();
      });
  }

  /**
   * Initialize career details page
   */
  function initCareerDetailsPage() {
    const careerId = getCareerIdFromURL();

    if (!careerId) {
      showError("Invalid career ID");
      hideLoading();
      return;
    }

    Promise.all([fetchCareerDetails(careerId), fetchCareers()])
      .then(([careerDetails, allCareersData]) => {
        displayCareerDetails(careerDetails);
        displayRelatedCareers(allCareersData, careerDetails.id);
        hideLoading();

        // Add animation to content sections
        setTimeout(() => {
          animateContentSections();
        }, 100);
      })
      .catch((error) => {
        console.error("Error fetching career details:", error);
        showError("Failed to load career details. Please try again later.");
        hideLoading();
      });
  }

  /**
   * Fetch careers from API with pagination
   */
  function fetchCareers(page = 1) {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: `${CONFIG.API_BASE_URL}${CONFIG.CAREERS_ENDPOINT}?page=${page}`,
        method: "GET",
        dataType: "json",
        success: function (response) {
          if (response && response.rows && response.rows.data) {
            // Store pagination data
            apiPaginationData = response.rows;
            totalPages = response.rows.last_page;
            totalCareers = response.totalCareer || response.rows.total;

            resolve({
              data: response.rows.data,
              pagination: response.rows,
              total: totalCareers,
            });
          } else {
            reject("Invalid API response format");
          }
        },
        error: function (xhr, status, error) {
          reject(`API Error: ${error}`);
        },
      });
    });
  }

  /**
   * Fetch career details from API
   */
  function fetchCareerDetails(careerId) {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: `${CONFIG.API_BASE_URL}${CONFIG.CAREER_DETAILS_ENDPOINT}?id=${careerId}`,
        method: "GET",
        dataType: "json",
        success: function (response) {
          if (response && response.id) {
            resolve(response);
          } else {
            reject("Invalid career details response");
          }
        },
        error: function (xhr, status, error) {
          reject(`API Error: ${error}`);
        },
      });
    });
  }

  /**
   * Display careers in grid layout
   */
  function displayCareers(careers) {
    const cardsHtml = careers
      .map((career, index) => {
        const imageUrl = career.image
          ? `https://ehlcrm.theskyroute.com${career.image}`
          : "";
        const delay = (index % 16) * 50; // Stagger animation

        return `
                <div class="col-lg-3 col-md-4 col-sm-6 mb-4" style="animation-delay: ${delay}ms;">
                    <article class="career-card h-100" data-career-id="${
                      career.id
                    }" data-career-name="${career.name.toLowerCase()}" data-popular="${
          career.is_popular
        }">
                        <div class="career-image-container">
                            ${
                              imageUrl
                                ? `<img src="${imageUrl}" alt="${career.name}" class="career-image" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                               `
                                : `<div class="career-image d-flex align-items-center justify-content-center">
                                    <i class="fas fa-briefcase fa-3x placeholder-icon"></i>
                                </div>`
                            }
                        </div>
                        <div class="card-body d-flex flex-column">
                            <h3 class="career-title">${career.name}</h3>
                            <p class="career-description flex-grow-1">${truncateText(
                              career.overview,
                              120
                            )}</p>
                            <div class="career-meta mt-auto">
                                <div class="d-flex justify-content-between align-items-center">
                                
                                     ${
                                       career.is_popular
                                         ? '<span class="badge bg-primary mb-2"><i class="fas fa-star me-1"></i>Popular</span>'
                                         : ""
                                     }
                                    <a href="career-details.html?id=${
                                      career.id
                                    }" class="btn btn-outline-primary btn-sm">
                                        <i class="fas fa-eye me-1"></i>View Details
                                    </a>
                                </div>
                            </div>
                        </div>
                    </article>
                </div>
            `;
      })
      .join("");

    // Always replace content for pagination (not infinite scroll)
    $careerCardsContainer.html(cardsHtml);

    // Check if we have results
    if (careers.length === 0 && currentPage === 1) {
      $noResults.show();
    } else {
      $noResults.hide();
    }
  }

  /**
   * Display career details on detail page
   */
  function displayCareerDetails(career) {
    // Update page title and meta
    document.title = `${career.name} - Career Details - Education Hub`;
    $("#breadcrumbCareer").text(career.name);

    // Update header
    $("#careerTitle").text(career.name);

    // Update image
    const imageUrl = career.image
      ? `https://ehlcrm.theskyroute.com${career.image}`
      : "";
    if (imageUrl) {
      $("#careerImage")
        .attr("src", imageUrl)
        .attr("alt", career.name)
        .show()
        .siblings(".placeholder-image")
        .hide();
    }

    // Update overview
    $("#careerOverview").text(
      career.overview || "No overview available for this career."
    );

    // Update why this career
    const whyThisList = parseListItems(career.why_this);
    const whyThisHtml = whyThisList
      .map(
        (item) => `
            <li class="d-flex align-items-start mb-3">
                <i class="fas fa-check-circle text-success me-3 mt-1"></i>
                <span>${item}</span>
            </li>
        `
      )
      .join("");
    $("#whyThisCareer").html(whyThisHtml);

    // Update requirements
    const requirementsList = parseListItems(career.requirement);
    const requirementsHtml = requirementsList
      .map(
        (item) => `
            <li class="d-flex align-items-start mb-3">
                <i class="fas fa-clipboard-check text-warning me-3 mt-1"></i>
                <span>${item}</span>
            </li>
        `
      )
      .join("");
    $("#careerRequirements").html(requirementsHtml);
  }

  /**
   * Display related careers in sidebar
   */
  function displayRelatedCareers(allCareers, currentCareerId) {
    const relatedCareers = allCareers
      .filter((career) => career.id !== currentCareerId)
      .slice(0, 5);

    const relatedHtml = relatedCareers
      .map(
        (career) => `
            <a href="career-details.html?id=${career.id}" class="btn btn-outline-secondary btn-sm d-block text-start">
                <i class="fas fa-arrow-right me-2"></i>${career.name}
            </a>
        `
      )
      .join("");

    $("#relatedCareers").html(relatedHtml);
  }

  /**
   * Initialize event listeners
   */
  function initEventListeners() {
    // Search functionality
    $searchInput.on("input", debounce(handleSearch, 300));
    $("#searchBtn").on("click", handleSearch);
    $searchInput.on("keypress", function (e) {
      if (e.which === 13) {
        handleSearch();
      }
    });

    // Filter buttons
    $filterButtons.on("click", handleFilter);

    // Pagination
    $(document).on("click", ".pagination .page-link", handlePagination);

    // Smooth scrolling for anchor links
    $('a[href^="#"]').on("click", function (e) {
      e.preventDefault();
      const target = $(this.getAttribute("href"));
      if (target.length) {
        $("html, body").animate(
          {
            scrollTop: target.offset().top - 100,
          },
          800
        );
      }
    });

    // Navbar scroll effect
    $(window).on("scroll", handleNavbarScroll);

    // Career card hover effects
    $(document)
      .on("mouseenter", ".career-card", function () {
        $(this).addClass("shadow-lg");
      })
      .on("mouseleave", ".career-card", function () {
        $(this).removeClass("shadow-lg");
      });

    // Handle window resize
    $(window).on("resize", debounce(handleResize, 250));
  }

  /**
   * Handle search functionality
   */
  function handleSearch() {
    searchQuery = $searchInput.val().toLowerCase().trim();
    currentPage = 1;
    applyFilters();
  }

  /**
   * Handle filter functionality
   */
  function handleFilter(e) {
    e.preventDefault();
    const $button = $(this);
    const filter = $button.data("filter");

    // Update active button
    $filterButtons.removeClass("active");
    $button.addClass("active");

    currentFilter = filter;
    currentPage = 1;

    // If "All Careers" is selected, fetch fresh data from API
    if (filter === "all") {
      // Clear search query when showing all careers
      searchQuery = "";
      $searchInput.val("");

      // Show loading state
      $careerCardsContainer.html(`
        <div class="col-12 text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-3">Loading all careers...</p>
        </div>
      `);

      // Fetch fresh data from API
      fetchCareers(currentPage)
        .then((response) => {
          allCareers = response.data;
          filteredCareers = response.data;
          displayCareers(response.data);
          updatePagination();

          // Add staggered animation to new cards
          setTimeout(() => {
            animateCareerCards();
          }, 100);
        })
        .catch((error) => {
          console.error("Error fetching all careers:", error);
          showError("Failed to load careers. Please try again.");
        });
    } else {
      // For other filters, use the existing filter logic
      applyFilters();
    }
  }

  /**
   * Apply filters and search
   */
  function applyFilters() {
    // Reset to first page when applying filters
    currentPage = 1;

    // Show loading state
    $careerCardsContainer.html(`
      <div class="col-12 text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3">Searching careers...</p>
      </div>
    `);

    // Use setTimeout to ensure the loading state is visible before processing
    setTimeout(() => {
      // For now, we'll filter client-side since the API doesn't support search/filter parameters
      // In a real implementation, you'd pass search and filter parameters to the API
      let filtered = [...allCareers];

      // Apply search filter
      if (searchQuery) {
        filtered = filtered.filter(
          (career) =>
            career.name.toLowerCase().includes(searchQuery) ||
            career.overview.toLowerCase().includes(searchQuery)
        );
      }

      // Apply category filter
      if (currentFilter !== "all") {
        filtered = filtered.filter((career) => {
          switch (currentFilter) {
            case "popular":
              return career.is_popular === 1;
            case "engineering":
              return career.name.toLowerCase().includes("engineer");
            case "business":
              return [
                "financial analyst",
                "marketing manager",
                "accountant",
              ].some((term) =>
                career.name.toLowerCase().includes(term.toLowerCase())
              );
            case "healthcare":
              return career.name.toLowerCase().includes("doctor");
            default:
              return true;
          }
        });
      }

      filteredCareers = filtered;

      // Update pagination data for filtered results
      totalPages = Math.ceil(filtered.length / CONFIG.CAREERS_PER_PAGE);
      totalCareers = filtered.length;

      // Create mock pagination data for filtered results
      apiPaginationData = {
        current_page: currentPage,
        last_page: totalPages,
        total: totalCareers,
        per_page: CONFIG.CAREERS_PER_PAGE,
      };

      displayCareers(filtered.slice(0, CONFIG.CAREERS_PER_PAGE));
      updatePagination();

      // Smooth scroll to results
      if (searchQuery || currentFilter !== "all") {
        $("html, body").animate(
          {
            scrollTop: $("#careers").offset().top - 100,
          },
          500
        );
      }
    }, 100); // Small delay to show loading state
  }

  /**
   * Handle pagination functionality
   */
  function handlePagination(e) {
    e.preventDefault();

    if (isLoading) return;

    const $link = $(this);
    const page = parseInt($link.data("page"));

    if (isNaN(page) || page === currentPage) return;

    isLoading = true;
    currentPage = page;

    // Show loading state
    $careerCardsContainer.html(`
      <div class="col-12 text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3">Loading careers...</p>
      </div>
    `);

    // Check if we're dealing with filtered results or API pagination
    if (searchQuery || currentFilter !== "all") {
      // Handle client-side pagination for filtered results
      setTimeout(() => {
        const startIndex = (currentPage - 1) * CONFIG.CAREERS_PER_PAGE;
        const endIndex = startIndex + CONFIG.CAREERS_PER_PAGE;
        const pageData = filteredCareers.slice(startIndex, endIndex);

        displayCareers(pageData);
        updatePagination();

        // Smooth scroll to results
        $("html, body").animate(
          {
            scrollTop: $("#careers").offset().top - 100,
          },
          500
        );

        // Add staggered animation to new cards
        setTimeout(() => {
          animateCareerCards();
        }, 100);

        isLoading = false;
      }, 200); // Small delay to show loading state
    } else {
      // Handle API pagination for unfiltered results
      fetchCareers(currentPage)
        .then((response) => {
          allCareers = response.data;
          filteredCareers = response.data;
          displayCareers(response.data);
          updatePagination();

          // Smooth scroll to results
          $("html, body").animate(
            {
              scrollTop: $("#careers").offset().top - 100,
            },
            500
          );

          // Add staggered animation to new cards
          setTimeout(() => {
            animateCareerCards();
          }, 100);

          isLoading = false;
        })
        .catch((error) => {
          console.error("Error fetching page:", error);
          showError("Failed to load page. Please try again.");
          isLoading = false;
        });
    }
  }

  /**
   * Update pagination navigation
   */
  function updatePagination() {
    if (!apiPaginationData || totalPages <= 1) {
      $paginationNav.hide();
      return;
    }

    $paginationNav.show();

    let paginationHtml = "";

    // Previous button
    paginationHtml += `
            <li class="page-item ${currentPage === 1 ? "disabled" : ""}">
                <a class="page-link" href="#" data-page="${
                  currentPage - 1
                }" aria-label="Previous">
                    <span aria-hidden="true" class="d-none d-sm-inline">&laquo; Previous</span>
                    <span aria-hidden="true" class="d-sm-none">&laquo;</span>
                </a>
            </li>
        `;

    // Page numbers - responsive display
    const maxVisiblePages = window.innerWidth < 768 ? 3 : 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // First page and ellipsis (only on larger screens)
    if (startPage > 1 && window.innerWidth >= 768) {
      paginationHtml += `
                <li class="page-item">
                    <a class="page-link" href="#" data-page="1">1</a>
                </li>
            `;
      if (startPage > 2) {
        paginationHtml += `
                    <li class="page-item disabled">
                        <span class="page-link">...</span>
                    </li>
                `;
      }
    }

    // Visible page numbers
    for (let i = startPage; i <= endPage; i++) {
      paginationHtml += `
                <li class="page-item ${i === currentPage ? "active" : ""}">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>
            `;
    }

    // Last page and ellipsis (only on larger screens)
    if (endPage < totalPages && window.innerWidth >= 768) {
      if (endPage < totalPages - 1) {
        paginationHtml += `
                    <li class="page-item disabled">
                        <span class="page-link">...</span>
                    </li>
                `;
      }
      paginationHtml += `
                <li class="page-item">
                    <a class="page-link" href="#" data-page="${totalPages}">${totalPages}</a>
                </li>
            `;
    }

    // Next button
    paginationHtml += `
            <li class="page-item ${
              currentPage === totalPages ? "disabled" : ""
            }">
                <a class="page-link" href="#" data-page="${
                  currentPage + 1
                }" aria-label="Next">
                    <span aria-hidden="true" class="d-none d-sm-inline">Next &raquo;</span>
                    <span aria-hidden="true" class="d-sm-none">&raquo;</span>
                </a>
            </li>
        `;

    // Add page info for mobile
    if (window.innerWidth < 768) {
      paginationHtml += `
                <li class="page-item disabled d-sm-none">
                    <span class="page-link small">Page ${currentPage} of ${totalPages}</span>
                </li>
            `;
    }

    $paginationNav.html(paginationHtml);
  }

  /**
   * Initialize animations
   */
  function initAnimations() {
    // Animate elements on scroll
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.animationPlayState = "running";
        }
      });
    }, observerOptions);

    // Observe elements with animation classes
    $(".animate-slide-up, .animate-fade-in").each(function () {
      this.style.animationPlayState = "paused";
      observer.observe(this);
    });
  }

  /**
   * Animate career cards with staggered effect
   */
  function animateCareerCards() {
    $careerCardsContainer.find(".career-card").each(function (index) {
      $(this)
        .css({
          opacity: "0",
          transform: "translateY(50px)",
        })
        .delay(index * 100)
        .animate(
          {
            opacity: "1",
          },
          {
            duration: CONFIG.ANIMATION_DURATION,
            step: function (now) {
              $(this).css("transform", `translateY(${50 * (1 - now)}px)`);
            },
          }
        );
    });
  }

  /**
   * Animate content sections on details page
   */
  function animateContentSections() {
    $(".content-card, .sidebar-card").each(function (index) {
      $(this)
        .css({
          opacity: "0",
          transform: "translateX(-30px)",
        })
        .delay(index * 150)
        .animate(
          {
            opacity: "1",
          },
          {
            duration: CONFIG.ANIMATION_DURATION * 2,
            step: function (now) {
              $(this).css("transform", `translateX(${-30 * (1 - now)}px)`);
            },
          }
        );
    });
  }

  /**
   * Handle navbar scroll effect
   */
  function handleNavbarScroll() {
    const scrollTop = $(window).scrollTop();
    const navbar = $(".navbar");

    if (scrollTop > 100) {
      navbar.addClass("shadow-lg").css("backdrop-filter", "blur(15px)");
    } else {
      navbar.removeClass("shadow-lg").css("backdrop-filter", "blur(10px)");
    }
  }

  /**
   * Handle window resize
   */
  function handleResize() {
    // Adjust animations for mobile
    if ($(window).width() < 768) {
      $(".animate-float").css("animation", "none");
    } else {
      $(".animate-float").css("animation", "");
    }

    // Update pagination display for responsive design
    updatePagination();
  }

  /**
   * Utility Functions
   */

  /**
   * Get career ID from URL parameters
   */
  function getCareerIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("id");
  }

  /**
   * Parse list items from API response
   */
  function parseListItems(text) {
    if (!text) return [];
    return text
      .split(/[;\n]/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  /**
   * Truncate text to specified length
   */
  function truncateText(text, maxLength) {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength).replace(/\s+\S*$/, "") + "...";
  }

  /**
   * Debounce function to limit API calls
   */
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Show loading overlay
   */
  function showLoading() {
    $loadingOverlay.removeClass("fade-out");
  }

  /**
   * Hide loading overlay
   */
  function hideLoading() {
    $loadingOverlay.addClass("fade-out");
    setTimeout(() => {
      $loadingOverlay.hide();
    }, 300);
  }

  /**
   * Show error message
   */
  function showError(message) {
    const errorHtml = `
            <div class="col-12">
                <div class="alert alert-danger alert-dismissible fade show" role="alert">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    <strong>Error:</strong> ${message}
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            </div>
        `;
    $careerCardsContainer.html(errorHtml);
  }

  // Initialize the application
  init();

  // Expose some functions globally for debugging
  window.CareerApp = {
    refreshCareers: initCareerListingPage,
    searchCareers: handleSearch,
    filterCareers: applyFilters,
  };
});

// Service Worker Registration (for future PWA capabilities)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    // Service worker can be added later for offline functionality
  });
}

// Google Analytics Integration (placeholder)
// Remove when integrating actual analytics
if (typeof window.dataLayer !== "undefined") {
  function gtag() {
    dataLayer.push(arguments);
  }
  gtag("config", "GA_TRACKING_ID");
}
