const key = 'AIzaSyAO98DMrf3tJ_e9oyT67537PfeMhCe7w_k';
// Explicitly testing gemini-1.5-flash
const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-8b:generateContent?key=' + key;

fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        contents: [{ parts: [{ text: 'Test' }] }]
    })
})
    .then(async r => {
        console.log('Status:', r.status);
        const t = await r.text();
        console.log('Response:', t.substring(0, 200)); // Print first 200 chars
    })
    .catch(e => console.error('Fetch Error:', e));
