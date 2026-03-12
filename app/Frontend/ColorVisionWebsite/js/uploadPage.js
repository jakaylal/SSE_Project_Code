const form = document.getElementById('uploadForm');
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('medicalImage');
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

    
analyzeBtn.addEventListener('click', function(e) {
    console.log('Analyze button clicked');

    
    const patientName = document.getElementById('patientName').value;
    const dateOfBirth = document.getElementById('dateOfBirth').value;
    const age = document.getElementById('age').value;
    const gender = document.getElementById('gender').value;
    const weight = document.getElementById('weight').value;
    const height = document.getElementById('height').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;

    if (!patientName || !dateOfBirth || !age || !gender || !weight || !height || !phone || !email || !previewImg.src) {
        alert('Please fill in all fields and select an image');
        return;
    }

    console.log('All validation passed');

    spinner.style.display = 'inline-block';
    analyzeBtn.disabled = true;
    resultBadge.style.display = 'none';

    sessionStorage.setItem('patientName', patientName);
    sessionStorage.setItem('patientDateOfBirth', dateOfBirth);
    sessionStorage.setItem('patientAge', age);
    sessionStorage.setItem('patientGender', gender);
    sessionStorage.setItem('patientWeight', weight);
    sessionStorage.setItem('patientHeight', height);
    sessionStorage.setItem('patientPhone', phone);
    sessionStorage.setItem('patientEmail', email);
    sessionStorage.setItem('uploadImage', previewImg.src);

    console.log('Patient data stored in sessionStorage');

            
    setTimeout(() => {
        const predictions = ['Normal', 'Pneumonia'];
        const prediction = predictions[Math.floor(Math.random() * predictions.length)];
        const confidence = Math.floor(Math.random() * (95 - 60) + 60);

        sessionStorage.setItem('prediction', prediction);
        sessionStorage.setItem('confidence', confidence);

        const patientsKey = 'patients';
        const existing = localStorage.getItem(patientsKey);
        let patients = [];
        try {
            patients = existing ? JSON.parse(existing) : [];
        } catch (err) {
            console.warn('Failed to parse existing patients, resetting', err);
            patients = [];
        }

        const newPatient = {
            id: Date.now().toString(),
            name: patientName,
            dateOfBirth: dateOfBirth,
            age: age,
            gender: gender,
            weight: weight,
            height: height,
            phone: phone,
            email: email,
            image: previewImg.src,
            prediction: prediction,
            confidence: confidence,
            uploadDate: new Date().toISOString()
        };

        patients.unshift(newPatient);
        try {
            localStorage.setItem(patientsKey, JSON.stringify(patients));
            console.log('Saved patient to localStorage, total=', patients.length);
        } catch (err) {
            console.error('Failed to save patients to localStorage', err);
        }

        console.log('Redirecting to results.html with prediction:', prediction);
        window.location.href = 'results.html';
    }, 1500);
});