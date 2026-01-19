const fs = require('fs');
const key = 'AIzaSyAO98DMrf3tJ_e9oyT67537PfeMhCe7w_k';
fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + key)
    .then(r => r.json())
    .then(d => {
        if (d.models) {
            const gems = d.models.filter(m => m.name.includes('gemini'));
            const out = gems.map(m => m.name).join('\n');
            fs.writeFileSync('available_models.txt', out);
            console.log('Done writing');
        } else {
            fs.writeFileSync('available_models.txt', JSON.stringify(d));
        }
    })
    .catch(e => {
        fs.writeFileSync('available_models.txt', 'Error: ' + e.message);
    });
