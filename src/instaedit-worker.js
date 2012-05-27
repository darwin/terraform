editor = window.open('../src/editor.html');
editor.getElementById('editor').innerHTML = 'window.parent.document.body.innerHTML';
editor.focus();

// Chamges receiving here