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
            console.log(data)
        })
    }