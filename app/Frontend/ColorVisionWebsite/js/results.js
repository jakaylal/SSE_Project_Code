window.addEventListener('load', function() {
    const patientName = sessionStorage.getItem('patientName') || '-';
    const patientDateOfBirth = sessionStorage.getItem('patientDateOfBirth') || '-';
    const patientAge = sessionStorage.getItem('patientAge') || '-';
    const patientGender = sessionStorage.getItem('patientGender') || '-';
    const patientWeight = sessionStorage.getItem('patientWeight') || '-';
    const patientHeight = sessionStorage.getItem('patientHeight') || '-';
    const uploadImage = sessionStorage.getItem('uploadImage');
    const prediction = sessionStorage.getItem('prediction') || 'Pending';
    const confidence = sessionStorage.getItem('confidence') || '0';

    document.getElementById('patientName').textContent = patientName;
    document.getElementById('patientDateOfBirth').textContent = formatDate(patientDateOfBirth);
    document.getElementById('patientAge').textContent = patientAge;
    document.getElementById('patientGender').textContent = capitalizeFirst(patientGender);
    document.getElementById('patientWeight').textContent = patientWeight ? patientWeight + ' kg' : '-';
    document.getElementById('patientHeight').textContent = patientHeight ? patientHeight + ' cm' : '-';
    document.getElementById('uploadDate').textContent = new Date().toLocaleDateString();
    document.getElementById('predictionResult').textContent = prediction;
    document.getElementById('confidenceScore').textContent = confidence;
    document.getElementById('confidenceFill').style.width = confidence + '%';

    if (uploadImage) {
        document.getElementById('originalImage').src = uploadImage;
        document.getElementById('analysisImage').src = uploadImage;
    }
});

function formatDate(dateStr) {
    if (!dateStr || dateStr === '-') return '-';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString();
}

function capitalizeFirst(str) {
    if (!str || str === '-') return '-';
    return str.charAt(0).toUpperCase() + str.slice(1);
}