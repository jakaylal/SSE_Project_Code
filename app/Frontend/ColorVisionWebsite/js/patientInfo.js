async function authorizePage() {
    try {
        const authRes = await fetch('http://localhost:3000/api/patients/details', {
            credentials: 'include'
        });
        const userData = await authRes.json();
        
        const welcomeElem = document.getElementById('welcome-message');
        //get rid of "user" when we have successsfully updated the renderPatients function
        if (welcomeElem) welcomeElem.innerText = "Welcome, " + (userData.userId || "User");

        const patientsRes = await fetch('http://localhost:3000/api/patients', {
            credentials: 'include'
        });
        const patientsList = await patientsRes.json();
        renderPatients(patientsList);

    } catch (error) {
        console.error("Auth/Fetch error:", error);
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