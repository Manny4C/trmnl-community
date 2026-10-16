const palette=document.getElementById('ink'),screen=document.getElementById('screen');
function apply(){screen.dataset.ink=palette.value;}
palette.addEventListener('change',apply);apply();
