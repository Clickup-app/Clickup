let usuarioActual = null;

const signupBtn = document.getElementById('signup-btn');
const loginBtn = document.getElementById('login-btn');
const postBtn = document.getElementById('post-btn');

signupBtn.addEventListener('click', () => {
  const username = document.getElementById('username').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const photoFile = document.getElementById('photoFile').files[0];

  if(username && email && password && photoFile){
    const reader = new FileReader();
    reader.onload = function(e) {
      const photoData = e.target.result;

      // Crear usuario en Firebase Authentication
      createUserWithEmailAndPassword(window.auth, email, password)
        .then((userCredential) => {
          usuarioActual = {
            uid: userCredential.user.uid,
            username,
            email,
            photoData
          };
          alert('Usuario registrado! Ahora inicia sesión.');
        })
        .catch((error) => {
          alert(error.message);
        });
    };
    reader.readAsDataURL(photoFile);
  } else {
    alert('Completa todos los campos y sube tu foto');
  }
});

loginBtn.addEventListener('click', () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  signInWithEmailAndPassword(window.auth, email, password)
    .then((userCredential) => {
      usuarioActual = {
        uid: userCredential.user.uid,
        email
      };
      alert('Bienvenido a Clickup!');
      document.getElementById('post-section').style.display = 'block';
      document.getElementById('auth-section').style.display = 'none';
      document.getElementById('user-info').innerText = email;

      mostrarFeed();
    })
    .catch((error) => {
      alert(error.message);
    });
});

postBtn.addEventListener('click', async () => {
  const texto = document.getElementById('post-text').value;
  const emoji = document.getElementById('post-emoji').value;

  if(usuarioActual && texto && emoji){
    await addDoc(collection(window.db, 'posts'), {
      uid: usuarioActual.uid,
      username: usuarioActual.username,
      photoData: usuarioActual.photoData,
      texto,
      emoji,
      timestamp: new Date()
    });

    document.getElementById('post-text').value = '';
    document.getElementById('post-emoji').value = '';
    mostrarFeed();
  } else {
    alert('Completa el estado y emoji');
  }
});

async function mostrarFeed(){
  const feed = document.getElementById('feed');
  feed.innerHTML = '';

  const q = query(collection(window.db, 'posts'), orderBy('timestamp', 'desc'));
  const querySnapshot = await getDocs(q);

  querySnapshot.forEach((doc) => {
    const post = doc.data();
    const div = document.createElement('div');
    div.className = 'post-card';
    div.innerHTML = `
      <div style="display:flex; align-items:center; gap:10px; margin-bottom:5px;">
        <img src="${post.photoData}" alt="${post.username}">
        <strong>${post.username}</strong>
      </div>
      <div>${post.texto}</div>
      <div>Estado: <span class="emoji">${post.emoji}</span></div>
    `;
    feed.appendChild(div);
  });
}