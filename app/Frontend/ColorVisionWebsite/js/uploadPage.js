
// there should be a better way of doing this
const form = document.getElementById('uploadForm');
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('image');
const previewImg = document.getElementById('previewImg');
const resultBadge = document.getElementById('resultBadge');
const spinner = document.getElementById('spinner');
const analyzeBtn = document.getElementById('analyzeBtn');

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#764ba2';
    uploadArea.style.boxShadow = '0 8px 30px rgba(102,126,234,0.2)';
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.borderColor = '#667eea';
    uploadArea.style.boxShadow = 'none';
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#667eea';
    uploadArea.style.boxShadow = 'none';
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        fileInput.files = files;
        handleFileSelect();
    }
});

uploadArea.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', handleFileSelect);

function handleFileSelect() {
    const file = fileInput.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            previewImg.style.display = 'block';
            resultBadge.textContent = 'Image selected: ' + file.name;
            resultBadge.style.display = 'inline-block';
            analyzeBtn.disabled = false;
        };
        reader.readAsDataURL(file);
    } else {
        resultBadge.textContent = 'Please select a valid image file';
        resultBadge.style.display = 'inline-block';
        analyzeBtn.disabled = true;
    }
}

analyzeBtn.addEventListener('click', async function(e) {

    e.preventDefault();
    console.log("Fetching...");
    
    const formData = new FormData(form);

    if (!fileInput.files[0]) {
        alert('Please select an image');
        return;
    }

    // UI Feedback
    spinner.style.display = 'inline-block';
    analyzeBtn.disabled = true;

    try {
        const response = await fetch('http://localhost:3000/api/patients', {
            method: 'POST', // or PATCH if updating an existing record
            body: formData
        });

        if (!response.ok) throw new Error('Upload failed');

        const savedPatient = await response.json();
        
        // storing the whole image in sessionStorage, 
        // just store the ID of the new patient so the results page can fetch them
        sessionStorage.setItem('lastPatientId', savedPatient._id);

        console.log('Redirecting to results.html');
        window.location.href = 'results.html';

    } catch (err) {
        console.error('Error:', err);
        alert('Failed to save patient data: ' + err.message);
        spinner.style.display = 'none';
        analyzeBtn.disabled = false;
    }
});
