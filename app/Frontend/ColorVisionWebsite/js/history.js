let patients = [];
try { patients = JSON.parse(localStorage.getItem('patients') || '[]'); } catch(e) { patients = []; }

const historyData = (patients || []).map(p => ({
    patientName: p.name || '-',
    result: p.prediction || '-',
    confidenceScore: p.confidence || 0,
    imageUrl: p.image || '',
    uploadDate: p.uploadDate || ''
}));

function loadHistory() {
    const container = document.getElementById('historyContainer');
    if (!historyData || historyData.length === 0) {
        container.innerHTML = '<div class="no-history">No patient history available</div>';
        return;
    }

    container.innerHTML = historyData.map(record => `
        <div class="history-card">
            <div class="image-container">
                <img src="${record.imageUrl || 'https://via.placeholder.com/350x250?text=No+Image'}" alt="Chest X-Ray for ${escapeHtml(record.patientName)}">
            </div>
            <div class="card-content">
                <div class="patient-name">${escapeHtml(record.patientName)}</div>
                <div class="result-item">
                    <div class="result-label">Result</div>
                    <div class="result-value">${escapeHtml(record.result)}</div>
                </div>
                <div class="confidence-score">
                    <div class="result-label">Confidence Score</div>
                    <div class="result-value">${escapeHtml(record.confidenceScore + '%')}</div>
                </div>
                <div style="margin-top:10px;color:#666;font-size:0.9rem">${record.uploadDate ? 'Uploaded: ' + new Date(record.uploadDate).toLocaleString() : ''}</div>
            </div>
        </div>
    `).join('');
}

function escapeHtml(str){ if (!str) return ''; return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }

document.addEventListener('DOMContentLoaded', loadHistory);