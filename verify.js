// verification script

    // Function to get query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    function setReferenceCode() {
        console.log("Verification code received:", JSON.parse(code));

        const referenceCodeInput = document.getElementById('reference_code');
        referenceCodeInput.value = JSON.parse(code);
    }

    // Call the function to set the reference code on page load
    setReferenceCode();


    // onsubmit event handler
    async function handleSubmitForm(event) {
        event.preventDefault(); // Prevent default form submission

        const form = event.target;
        const name = form.name.value;
        const email = form.email.value;
        console.log("Frontend: ", name, email, code)

        await fetch(`http://localhost:5000/verify?code=${JSON.parse(code)}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email })
        })
        .then(res => res.json())
        .then(data => {
            if(data.status && data.status === 400){
                const errorMsg = document.getElementById('error_msg');
                errorMsg.classList.remove('hidden');
                errorMsg.classList.add('text-red-500', 'font-bold', 'mb-4');
                errorMsg.innerText = data.message;

                setTimeout(() => {
                    window.location.href = "index.html";
                }, 3000);
                return;
            }
            if(data.status && data.status === 401){
                const errorMsg = document.getElementById('error_msg');
                errorMsg.classList.remove('hidden');
                errorMsg.classList.add('text-red-500', 'font-bold', 'mb-4');
                errorMsg.innerText = data.message;  

                setTimeout(() => {
                    window.location.href = "index.html";
                }, 3000);
                return;
            }

            const htmlForm = document.getElementById('form');
            htmlForm.classList.add('hidden'); 
            const successMessageDiv = document.getElementById('success_message');
            successMessageDiv.classList.remove('hidden')
            successMessageDiv.innerText = 'Account created! Please check your email to verify your account.';

            console.log(data)
            // alert(data.message);
        })
    }