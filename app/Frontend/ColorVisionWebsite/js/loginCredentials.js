const form = document.getElementById('form');
const loginDiv = document.getElementById('loginStatus');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
        //enter your ip below
        //try localhost
        const response = await fetch('http://localhost:3000/api/patients/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            credentials: 'include'
        });

        const result = await response.json();

        if (response.ok) {
            loginDiv.className = "login-success";
            loginDiv.innerText = "Success: Redirecting...";

            setTimeout(() => {
                // This forces the browser to look at your Live Server port, not the Express port
                const frontendPort = "5500"; 
                const host = window.location.hostname; // '127.0.0.1' or your IP
                window.location.href = `patientInformation.html`;
            }, 1000);
        } else {
            loginDiv.className = "login-failure";
            loginDiv.innerText = "Error: " + result.message;
        }
    } catch (error) {
        console.error("Fetch error:", error);
        loginDiv.className = "login-failure";
        loginDiv.innerText = "Error: Server is unreachable.";
    }
});