const btnPassReset = document.getElementById('btn-pass-submit');
const userId = document.getElementById('user-id');
const newPass = document.getElementById('password');
if (btnPassReset) {
  btnPassReset.addEventListener('click', async (e) => {
    e.preventDefault();
    fetch(
      `https://chat-server-kb.onrender.com/api/v1/user/auth/resetPassword/${userId.value}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPass.value }),
      }
    ).then((res) => {
      if (res.status === 200)
        window.location.replace('https://chat-client-kb.vercel.app/login');
    });
  });
}
