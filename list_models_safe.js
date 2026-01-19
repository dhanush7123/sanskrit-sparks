const key = 'AIzaSyAO98DMrf3tJ_e9oyT67537PfeMhCe7w_k';
fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + key)
    .then(r => r.json())
    .then(d => {
        if (d.models) {
            const gems = d.models.filter(m => m.name.includes('gemini'));
            if (gems.length > 0) {
                console.log('Available Gemini Models:');
                gems.forEach(m => console.log(m.name));
            } else {
                console.log('No Gemini models found. All models:', d.models.map(m => m.name));
            }
        } else {
            console.log('Error/No models:', JSON.stringify(d));
        }
    })
    .catch(e => console.error(e));
