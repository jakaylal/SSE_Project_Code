window.addEventListener('load', async function() {
    try {
        // 1. Get User Session
        const authRes = await fetch('http://localhost:3000/api/patients/details', { 
            credentials: 'include' 
        });
        
        if (!authRes.ok) {
            window.location.href = 'loginCredentials.html';
            return;
        }

        const userData = await authRes.json();
        const userId = userData.userId || userData._id;

        // get results for specific user
        const resultsRes = await fetch(`http://localhost:3000/api/results/${userId}`, {
            credentials: 'include'
        });
        const results = await resultsRes.json();

        if (!results || results.length === 0) {
            console.warn("No scan history found.");
            return;
        }

        // gets most recent scan
        const latestResult = results[results.length - 1];

        // TODO: ML server API goes here
        // send 'latestResult.image' to FastAPI server.
        // after image is analyzed, 
        // set: document.getElementById('analysisImage').src = aiImageUri;

        // update text fields 
        // add ML model prediction results are here need to make sure its correct
        document.getElementById('uploadDate').textContent = new Date(latestResult.date).toLocaleDateString();
        document.getElementById('predictionResult').textContent = latestResult.prediction;

        // renders the original image for its card
        if (latestResult.image && latestResult.image.data) {
            const rawBuffer = latestResult.image.data.data || latestResult.image.data;
            
            // fix for "Maximum call stack size exceeded"
            const blob = new Blob([new Uint8Array(rawBuffer)], { 
                type: latestResult.image.contentType || 'image/png' 
            });

            const imageUrl = URL.createObjectURL(blob);

            const originalImg = document.getElementById('originalImage');
            if (originalImg) originalImg.src = imageUrl;
            
            // analysis image is blank need to add back once i get the ML server api
            console.log("Original image loaded. Analysis visualization pending ML integration.");
        }

    } catch (err) {
        console.error("Results Logic Error:", err);
    }
});

// keep this helper for use in other parts of the app
function formatDate(dateStr) {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString();
}