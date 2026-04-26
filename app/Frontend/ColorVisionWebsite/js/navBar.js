async function authorizePage() {
    // Select elements once at the top
    const authOnlyLinks = document.querySelectorAll('.authOnly');
    const authStatusItem = document.getElementById('authStatus');

    try {
        const authRes = await fetch('http://localhost:3000/api/patients/details', {
            credentials: 'include'
        });

        if (authRes.ok) {
            const userData = await authRes.json();
            
            // Update Welcome Message
            const welcomeElem = document.getElementById('welcome-message');
            if (welcomeElem) welcomeElem.innerText = `Welcome, ${userData.firstName}`;

            // Show hidden links
            authOnlyLinks.forEach(link => {
                link.classList.add('show-me'); 
            });

            // Update Auth Status to "Sign Out"
            if (authStatusItem) {
                // FIXED: Removed redundant 'const' declaration here
                authStatusItem.innerHTML = `<a href="#" id="logout-link">Sign Out</a>`;
                // Attach the event immediately after injecting the HTML
                document.getElementById('logout-link').onclick = handleLogout;
            }

        } else {
            handleSignedOutUI(authOnlyLinks, authStatusItem);
        }
    } catch (error) {
        console.error("Auth/Fetch error:", error);
        handleSignedOutUI(authOnlyLinks, authStatusItem);
    }
}

//logout process
async function handleLogout(e) {
    if (e) e.preventDefault();
    
    try {
        // call the get api logout route
        await fetch('http://localhost:3000/api/patients/logout', { 
            method: 'GET',
            credentials: 'include' 
        });

        if (response.ok) {
            console.log("Logged out successfully");
            window.location.replace('index.html'); 
        }

        // redirect to home page
        window.location.href = 'index.html';
    } catch (err) {
        console.error("Logout failed:", err);
        window.location.href = 'index.html';
    }
}

function handleSignedOutUI(links, statusItem) {
    links.forEach(link => {
        link.style.setProperty('display', 'none', 'important');
    });

    if (statusItem) {
        statusItem.innerHTML = `<a href="loginCredentials.html">Sign In</a>`;
    }
}

document.addEventListener('DOMContentLoaded', authorizePage);