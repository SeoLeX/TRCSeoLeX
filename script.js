// 1. Firebase Yapılandırması
const firebaseConfig = {
  apiKey: "AIzaSyAxUbaAXt7d-MM3R3YprBZkQDtp0vlIxVU",
  authDomain: "trcssite.firebaseapp.com",
  projectId: "trcssite",
  storageBucket: "trcssite.firebasestorage.app",
  messagingSenderId: "267307094050",
  appId: "1:267307094050:web:a57417cca00209677aba7b",
  measurementId: "G-KXGYPPLSLC"
};

// Firebase Başlatma
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// NOT: Otomatik yönlendirme engelini kaldırmak için buradaki onAuthStateChanged dinleyicisini sildik.

document.addEventListener('DOMContentLoaded', () => {
  let isSignUpMode = true;

  const formTitle = document.getElementById('form-title');
  const formToggleBtn = document.getElementById('form-toggle-btn');
  const submitBtn = document.getElementById('submit-btn');
  const authForm = document.getElementById('auth-form');
  const alertBox = document.getElementById('alert-box');
  const navAuthLink = document.getElementById('nav-auth-link');

  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');

  const emailError = document.getElementById('email-error');
  const passwordError = document.getElementById('password-error');

  // Geçiş Butonu
  formToggleBtn.addEventListener('click', (e) => {
    e.preventDefault();
    isSignUpMode = !isSignUpMode;
    resetFormErrors();
    alertBox.classList.add('hidden');

    if (isSignUpMode) {
      formTitle.textContent = 'Hemen Kayıt Ol';
      formToggleBtn.textContent = 'veya Giriş Yap';
      submitBtn.textContent = 'KAYIT OL';
      navAuthLink.textContent = 'Kayıt Ol';
      passwordInput.placeholder = 'En az 6 karakter';
    } else {
      formTitle.textContent = 'Giriş Yap';
      formToggleBtn.textContent = 'veya Kayıt Ol';
      submitBtn.textContent = 'GİRİŞ YAP';
      navAuthLink.textContent = 'Giriş Yap';
      passwordInput.placeholder = 'Şifrenizi girin';
    }
  });

  function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  }

  function resetFormErrors() {
    emailError.textContent = '';
    passwordError.textContent = '';
    emailInput.classList.remove('input-error');
    passwordInput.classList.remove('input-error');
  }

  // Form Gönderim
  authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    resetFormErrors();
    alertBox.classList.add('hidden');

    let isValid = true;
    const emailVal = emailInput.value.trim();
    const passwordVal = passwordInput.value.trim();

    if (!emailVal) {
      emailError.textContent = 'E-posta adresi boş bırakılamaz.';
      emailInput.classList.add('input-error');
      isValid = false;
    } else if (!isValidEmail(emailVal)) {
      emailError.textContent = 'Geçerli bir e-posta adresi girin.';
      emailInput.classList.add('input-error');
      isValid = false;
    }

    if (!passwordVal) {
      passwordError.textContent = 'Şifre alanı boş bırakılamaz.';
      passwordInput.classList.add('input-error');
      isValid = false;
    } else if (isSignUpMode && passwordVal.length < 6) {
      passwordError.textContent = 'Şifre en az 6 karakter olmalıdır.';
      passwordInput.classList.add('input-error');
      isValid = false;
    }

    if (!isValid) return;

    submitBtn.disabled = true;
    submitBtn.textContent = 'İşleniyor...';

    try {
      if (isSignUpMode) {
        const userCredential = await auth.createUserWithEmailAndPassword(emailVal, passwordVal);
        const user = userCredential.user;

        await db.collection('users').doc(user.uid).set({
          uid: user.uid,
          email: emailVal,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        showAlert('Hesabınız başarıyla oluşturuldu! Yönlendiriliyorsunuz...', 'success');
      } else {
        await auth.signInWithEmailAndPassword(emailVal, passwordVal);
        showAlert('Giriş başarılı! Yönlendiriliyorsunuz...', 'success');
      }

      emailInput.value = '';
      passwordInput.value = '';

      // Yalnızca form başarıyla gönderilince yönlendirir
      setTimeout(() => {
        window.location.href = 'main.html';
      }, 1000);

    } catch (error) {
      let message = 'Bir hata oluştu.';
      if (error.code === 'auth/email-already-in-use') message = 'Bu e-posta adresi zaten kullanımda.';
      if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        message = 'E-posta veya şifre hatalı.';
      }
      
      showAlert(message, 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = isSignUpMode ? 'KAYIT OL' : 'GİRİŞ YAP';
    }
  });

  function showAlert(msg, type) {
    alertBox.textContent = msg;
    alertBox.className = `alert-message ${type}`;
    alertBox.classList.remove('hidden');
  }
});