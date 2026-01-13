// email auto verfication to be added later
async function run() {
    // ... existing code ...
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    await fetch(`http://localhost:5000/verify_email?code=${JSON.parse(code)}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(res => res.json())
    .then(data => {
        console.log(data)
        if(data.status && data.status === 400){
            const errorMsg = document.getElementById('error_msg');
            errorMsg.classList.remove('hidden');
            errorMsg.classList.add('text-red-500', 'font-bold', 'mb-4');
            errorMsg.innerText = data.message;
        }
    })
}

run().catch(console.dir);