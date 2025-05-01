
// Simple JavaScript for mobile menu toggle
document.addEventListener('DOMContentLoaded', function () {
    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.getElementById('main-nav');
    const navItems = document.querySelectorAll('.nav-item');

    // Toggle mobile menu
    menuToggle.addEventListener('click', function () {
        mainNav.classList.toggle('active');
    });

    // Handle dropdown on mobile
    navItems.forEach(item => {
        const link = item.querySelector('.nav-link');

        link.addEventListener('click', function (e) {
            // Only for mobile view
            if (window.innerWidth <= 768) {
                if (item.querySelector('.dropdown-menu')) {
                    e.preventDefault();
                    item.classList.toggle('dropdown-active');

                    // Close other open dropdowns
                    navItems.forEach(otherItem => {
                        if (otherItem !== item && otherItem.classList.contains('dropdown-active')) {
                            otherItem.classList.remove('dropdown-active');
                        }
                    });
                }
            }
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function (e) {
        if (!e.target.closest('.nav') && !e.target.closest('.menu-toggle') && mainNav.classList.contains('active')) {
            mainNav.classList.remove('active');
        }
    });

    // Reset on resize
    window.addEventListener('resize', function () {
        if (window.innerWidth > 768) {
            mainNav.classList.remove('active');
            navItems.forEach(item => {
                item.classList.remove('dropdown-active');
            });
        }
    });
});

// Global variables
let allJobs = [];
const jobGrid = document.getElementById('jobGrid');
const searchInfo = document.getElementById('searchInfo');
const resultsTitle = document.querySelector('.results-title h2');
const loader = document.getElementById('loader');
const scrollTop = document.getElementById('scrollTop');

// API endpoint

// Fetch jobs from API
async function fetchJobs() {
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error("HTTP error: " + response.status);
        }
        const result = await response.json();
        allJobs = result;

        // Hide loader
        loader.style.display = 'none';

        // Display all jobs initially
        displayJobs(allJobs);

        // Update category counts and add click handlers
        updateCategoryInfo(allJobs);

        // Add click handlers for header dropdown categories
        setupHeaderCategoryLinks();
    } catch (err) {
        console.error(err);
        loader.style.display = 'none';
        jobGrid.innerHTML = "<div class='no-results'><h3>Error loading jobs</h3><p>Please try again later</p></div>";
    }
}

// Display jobs in the grid
function displayJobs(jobs) {
    // Clear the container first
    jobGrid.innerHTML = "";

    // Update results info
    updateResultsInfo(jobs);

    if (jobs.length === 0) {
        jobGrid.innerHTML = "<div class='no-results'><h3>No jobs found</h3><p>Try adjusting your search criteria</p></div>";
        return;
    }

    jobs.forEach(job => {
        const jobCard = document.createElement("div");
        jobCard.className = "job-card";
        jobCard.innerHTML = `
            <h2>${job.company}</h2>
            <div class="category-badge">${job.category}</div>
            <h4>${job.title}</h4>
            <p><strong>Location:</strong> ${job.location}</p>
            <p><strong>Employment Type:</strong> ${job.employmentType}</p>
            <p><strong>Skills:</strong> ${job.skills}</p>
            <p><strong>Experience:</strong> ${job.experience}</p>
            <p><strong>Salary:</strong> ${job.salary}</p>
            <p><strong>Deadline:</strong> ${job.applicationDeadline}</p>
            <button>Apply Now</button>
        `;
        jobGrid.appendChild(jobCard);
    });

    // Scroll to results section
    document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
}

// Update category information
function updateCategoryInfo(jobs) {
    const categoryCards = document.querySelectorAll('.category-card');

    categoryCards.forEach(card => {
        const category = card.getAttribute('data-category');
        const countElement = card.querySelector('.category-count');

        // Count jobs in this category
        const jobCount = jobs.filter(job =>
            job.category && job.category.toLowerCase() === category.toLowerCase()
        ).length;

        // Update the count
        countElement.textContent = jobCount;

        // Add click handler
        card.addEventListener('click', function () {
            filterJobsByCategory(category);
        });
    });
}

// Setup header category links
function setupHeaderCategoryLinks() {
    const dropdownItems = document.querySelectorAll('.nav-item:nth-child(2) .dropdown-item');

    dropdownItems.forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault();
            const category = item.textContent.trim();
            filterJobsByCategory(category);
        });
    });
}

// Filter jobs by category
function filterJobsByCategory(category) {
    // Reset all category cards
    document.querySelectorAll('.category-card').forEach(c =>
        c.classList.remove('active-category')
    );

    // Highlight the matching category card if it exists
    const matchingCard = document.querySelector(`.category-card[data-category="${category}"]`);
    if (matchingCard) {
        matchingCard.classList.add('active-category');
    }

    const filteredJobs = allJobs.filter(job =>
        job.category && job.category.toLowerCase() === category.toLowerCase()
    );

    // Update results title
    resultsTitle.textContent = `${category} Jobs`;

    // Clear search inputs
    document.getElementById('keywordInput').value = '';
    document.getElementById('locationInput').value = '';

    // Display filtered jobs
    displayJobs(filteredJobs);
}

// Update results information
function updateResultsInfo(jobs) {
    if (jobs.length === 0) {
        searchInfo.textContent = "No jobs found";
        return;
    }

    // Check if filtering by search
    const keyword = document.getElementById('keywordInput').value.trim();
    const location = document.getElementById('locationInput').value.trim();

    if (keyword || location) {
        let infoText = `Found ${jobs.length} job${jobs.length !== 1 ? 's' : ''}`;

        if (keyword) {
            infoText += ` matching "${keyword}"`;
        }

        if (location) {
            infoText += keyword ? ` in "${location}"` : ` in "${location}"`;
        }

        searchInfo.textContent = infoText;
    } else {
        // Check if filtering by category
        const activeCategory = document.querySelector('.category-card.active-category');
        if (activeCategory) {
            const category = activeCategory.getAttribute('data-category');
            searchInfo.textContent = `Showing ${jobs.length} job${jobs.length !== 1 ? 's' : ''} in ${category}`;
        } else {
            searchInfo.textContent = `Showing all ${jobs.length} job${jobs.length !== 1 ? 's' : ''}`;
        }
    }
}

// Search function
function searchJobs(keyword, location) {
    keyword = keyword.toLowerCase().trim();
    location = location.toLowerCase().trim();

    // Reset category cards highlighting
    document.querySelectorAll('.category-card').forEach(c =>
        c.classList.remove('active-category')
    );

    let filteredJobs = allJobs;

    // Filter by keyword (in title, company, description, skills)
    if (keyword) {
        filteredJobs = filteredJobs.filter(job =>
            (job.title && job.title.toLowerCase().includes(keyword)) ||
            (job.company && job.company.toLowerCase().includes(keyword)) ||
            (job.description && job.description.toLowerCase().includes(keyword)) ||
            (job.skills && job.skills.toLowerCase().includes(keyword))
        );
    }

    // Filter by location
    if (location) {
        filteredJobs = filteredJobs.filter(job =>
            job.location && job.location.toLowerCase().includes(location)
        );
    }

    // Update results title based on search
    if (keyword || location) {
        resultsTitle.textContent = "Search Results";
    } else {
        resultsTitle.textContent = "All Available Jobs";
    }

    // Display filtered results
    displayJobs(filteredJobs);
}

// Setup search form event listener
document.getElementById('searchForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const keyword = document.getElementById('keywordInput').value;
    const location = document.getElementById('locationInput').value;
    searchJobs(keyword, location);
});

// Scroll to top button functionality
window.addEventListener('scroll', function () {
    if (window.pageYOffset > 300) {
        scrollTop.classList.add('visible');
    } else {
        scrollTop.classList.remove('visible');
    }
});

scrollTop.addEventListener('click', function () {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});
document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
        // Toggle 'active' class for arrow rotation
        question.classList.toggle('active');

        // Get the answer element right next to the question
        const answer = question.nextElementSibling;

        // Toggle 'show' class to expand/collapse answer
        if (answer.classList.contains('show')) {
            answer.classList.remove('show');
        } else {
            // Optionally close other open answers:
            document.querySelectorAll('.faq-answer.show').forEach(openAnswer => {
                openAnswer.previousElementSibling.classList.remove('active');
                openAnswer.classList.remove('show');
            });

            answer.classList.add('show');
        }
    });
});





