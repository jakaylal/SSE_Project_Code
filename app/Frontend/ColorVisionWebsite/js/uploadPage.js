
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
    
    if (!fileInput.files[0]) {
        alert('Please select an image');
        return;
    }

    spinner.style.display = 'inline-block';
    analyzeBtn.disabled = true;

    try {
        const authRes = await fetch('http://localhost:3000/api/patients/details', { 
            credentials: 'include' 
        });
        
        if (!authRes.ok) throw new Error('You must be logged in to upload');
        const userData = await authRes.json();
        const userId = userData.userId || userData._id || userData.id;

        if (!userId) {
            alert("Error: User session expired. Please log in again.");
            window.location.href = 'loginCredentials.html';
            return;
        }   

        const formData = new FormData(form);
        // append the prediction here using the ML server api

        const response = await fetch(`http://localhost:3000/api/results/${userId}`, {
            method: 'POST',
            body: formData,
            credentials: 'include' 
        });

        if (!response.ok) throw new Error('Upload failed');

        const resultData = await response.json();
        window.location.href = 'results.html';

    } catch (err) {
        console.error('Error:', err);
        alert('Upload Error: ' + err.message);
        spinner.style.display = 'none';
        analyzeBtn.disabled = false;
    }
});
