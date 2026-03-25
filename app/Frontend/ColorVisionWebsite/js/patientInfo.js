function renderPatients() {
    const container = document.getElementById('patientsContainer');
    const stored = localStorage.getItem('patients');
    let patients = [];
    try {
        patients = stored ? JSON.parse(stored) : [];
    } catch (err) {
        console.warn('Could not parse patients from localStorage', err);
        patients = [];
    }

    if (!patients || patients.length === 0) {
        container.innerHTML = '<p>No patients found. Use the upload page to add patients.</p>';
        return;
    }

    container.innerHTML = '';
    patients.forEach(p => {
        const card = document.createElement('div');
        card.className = 'patient-card';
        card.innerHTML = `
            <h2>${escapeHtml(p.name || '-')}</h2>
            <p><strong>Age:</strong> ${escapeHtml(p.age || '-')}</p>
            <p><strong>Gender:</strong> ${escapeHtml(capitalize(p.gender) || '-')}</p>
            <p><strong>Weight:</strong> ${escapeHtml(p.weight ? p.weight + ' kg' : '-')}</p>
            <p><strong>Height:</strong> ${escapeHtml(p.height ? p.height + ' cm' : '-')}</p>
            <p><strong>Phone:</strong> ${escapeHtml(p.phone || '-')}</p>
            <p><strong>Email:</strong> ${escapeHtml(p.email || '-')}</p>
            
            <p><strong>Diagnosis:</strong> ${escapeHtml(p.prediction || '-') } (${escapeHtml(p.confidence ? p.confidence + '%' : '-')})</p>
            <p><strong>Upload Date:</strong> ${formatDate(p.uploadDate)}</p>
            ${p.image ? '<div style="margin-top:10px;text-align:center"><img src="' + p.image + '" alt="thumb" style="max-width:100%;max-height:160px;border-radius:6px;box-shadow:0 6px 12px rgba(0,0,0,0.06)"></div>' : ''}
        `;
        container.appendChild(card);
    });

    function formatDate(d) {
        if (!d) return '-';
        try { return new Date(d).toLocaleString(); } catch(e) { return d; }
    }
    function capitalize(s){ return s ? s.charAt(0).toUpperCase()+s.slice(1) : s }
    function escapeHtml(str){
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}