async function authorizePage() {
    const authOnlyLinks = document.querySelectorAll('.authOnly');
    const authStatusItem = document.getElementById('authStatus');
    const welcomeElem = document.getElementById('welcome-message');
    const container = document.getElementById('patientsContainer');

    try {
        const authRes = await fetch('http://localhost:3000/api/patients/details', {
            credentials: 'include'
        });

        if (authRes.ok) {
            const userData = await authRes.json();
            
            //updates navBar at the top
            authOnlyLinks.forEach(link => {
                link.style.setProperty('display', 'list-item', 'important');
            });

            if (authStatusItem) {
                authStatusItem.innerHTML = `<a href="#" id="logout-link">Sign Out</a>`;
                // IMPORTANT this will re-enable the event listener
                document.getElementById('logout-link').onclick = handleLogout;
            }

            if (welcomeElem) welcomeElem.innerText = `Welcome, ${userData.firstName || "User"}`;

            // render the user's data
            if (container) {
                renderPatients([userData]); 
            }

        } else {
            //redirects if user is not logged in
            window.location.replace('index.html');
        }
    } catch (error) {
        console.error("Auth Error:", error);
        window.location.replace('index.html');
    }
}

window.onload = authorizePage;

//take the patients account as a parameter most likely to fix nothing showing up
//with the account id we can get the data in order to display it, otherwise nothing appears despite passing authroization
function renderPatients(data) {
    const container = document.getElementById('patientsContainer');
    let patients = data || [];

    //TODO: change this to check the api for patient info and the message is irrelevant since this page is only accessed
    //after account creation
    if (!patients || patients.length === 0) {
        container.innerHTML = '<p>No patients found. Use the upload page to add patients.</p>';
        return;
    }

    container.innerHTML = '';
    patients.forEach(p => {
        const card = document.createElement('div');
        card.className = 'patient-card';
        card.innerHTML = `
            <h2>${escapeHtml(p.firstName || p.firstName || '-')}</h2>
            <p><strong>Email:</strong> ${escapeHtml(p.email || '-')}</p>
            <p><strong>Phone:</strong> ${escapeHtml(p.phone || '-')}</p>
            <p><strong>Diagnosis:</strong> ${escapeHtml(p.prediction || 'Pending')}</p>
        `;
        container.appendChild(card);
    });
}

function handleSignedOutUI(links, statusItem) {
    links.forEach(link => {
        link.style.setProperty('display', 'none', 'important');
    });

    if (statusItem) {
        statusItem.innerHTML = `<a href="loginCredentials.html">Sign In</a>`;
    }
}

async function handleLogout(e) {
    if (e) e.preventDefault();
    
    try {
        // double checks if the cookie is cleared
        const res = await fetch('http://localhost:3000/api/patients/logout', { 
            credentials: 'include' 
        });

        if (res.ok) {
            //this is here so you can't just press the back button to go back to the unauthorized page
            window.location.replace('index.html'); 
        }
    } catch (err) {
        console.error("Logout failed:", err);
        window.location.href = 'index.html';
    }
}

function escapeHtml(text) {
    if (!text) return "";
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.toString().replace(/[&<>"']/g, (m) => map[m]);
}

