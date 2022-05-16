const btnPassReset = document.getElementById('btn-pass-submit');
const userId = document.getElementById('user-id');
const newPass = document.getElementById('password');
if (btnPassReset) {
  btnPassReset.addEventListener('click', async (e) => {
    e.preventDefault();
    fetch(
      `https://chat-box-app-server.herokuapp.com/api/v1/user/auth/resetPassword/${userId.value}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPass.value }),
      }
    ).then((res) => {
      if (res.status === 200)
        window.location.replace('https://chit-chat-client.herokuapp.com/login');
    });
  });
}
