const form = document.getElementById('form');
const loginDiv = document.getElementById('loginStatus');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
        //enter your ip below
        const response = await fetch('http://YOUR_IP:3000/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            loginDiv.className = "login-success";
            loginDiv.innerText = "Success: " + result.message;
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