const form = document.getElementById('form')

form.addEventListener('submit', async(e) => {
    e.preventDefault()

    const formData = new FormData(form)
    const data = Object.fromEntries(formData.entries())
    const submitDiv = document.getElementById('submitStatus');

    try{
        //enter your ip below
        const response = await fetch("http://YOUR_IP:3000/users", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
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