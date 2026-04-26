const form = document.getElementById('form')

form.addEventListener('submit', async(e) => {
    e.preventDefault()

    const formData = new FormData(form)
    //keep this for now might need this later
    const data = Object.fromEntries(formData.entries())
    const submitDiv = document.getElementById('submitStatus');

    try{
        const response = await fetch("http://localhost:3000/api/patients/", {
            method: 'POST',
            body: formData
        })

        if(response.ok){
            const result = await response.json()
            console.log('Success', result)
            submitDiv.className = "status-success"; 
            submitDiv.innerText = "Successfully submitted!"
            form.reset();
        }else{
            const rawError = await response.text(); 
            console.error('Server Raw Response:', rawError)
            submitDiv.className = "status-error";
            submitDiv.innerText = "Error with submission!"
        }
    }catch(error){
            console.error('Network Error: ', error)
            submitDiv.style.color = "red";
            submitDiv.innerText = "Server is down or unreachable."
    }
})