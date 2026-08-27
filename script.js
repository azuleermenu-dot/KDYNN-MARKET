const TARGET_EMAIL = "azuleermenu@gmail.com";

const track = document.getElementById('track');
const buttons = document.querySelectorAll('.nav-btn');
const dots = document.querySelectorAll('.dot');
const totalSlides = 5;
let currentSlide = 0;

function goToSlide(index) {
  if (index < 0) index = 0;
  if (index >= totalSlides) index = totalSlides - 1;

  currentSlide = index;
  track.style.transform = `translateX(-${currentSlide * 100}vw)`;
  
  buttons.forEach((btn, idx) => {
    btn.classList.toggle('active', idx === currentSlide);
  });

  dots.forEach((dot, idx) => {
    dot.classList.toggle('active', idx === currentSlide);
  });
}

function nextSlide() {
  if (currentSlide < totalSlides - 1) goToSlide(currentSlide + 1);
}

function prevSlide() {
  if (currentSlide > 0) goToSlide(currentSlide - 1);
}

// FormSubmit AJAX Handler
async function handleFormSubmit(event) {
  event.preventDefault();

  const form = document.getElementById('inquiryForm');
  const status = document.getElementById('formStatus');
  const submitBtn = document.getElementById('submitBtn');
  const btnText = document.getElementById('btnText');

  const senderName = document.getElementById('fullName').value;
  const senderEmail = document.getElementById('userEmail').value;
  const senderPhone = document.getElementById('userPhone').value;
  const inquiryType = document.getElementById('inquiryType').value;
  const messageContent = document.getElementById('message').value;

  submitBtn.disabled = true;
  btnText.textContent = 'Sending...';
  status.className = 'form-status';
  status.style.display = 'none';

  const payload = {
    Name: senderName,
    Email: senderEmail,
    Phone: senderPhone,
    Inquiry_Type: inquiryType,
    Message: messageContent,
    _replyto: senderEmail,
    _subject: `[Muslim Traders] ${inquiryType} - ${senderName}`
  };

  try {
    const response = await fetch(`https://formsubmit.co/ajax/${TARGET_EMAIL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      status.textContent = "✅ Message sent! We will contact you back shortly.";
      status.className = 'form-status success';
      form.reset();
    } else {
      throw new Error('Form submission failed.');
    }
  } catch (error) {
    status.textContent = "❌ Error sending message. Please make sure FormSubmit is activated on azuleermenu@gmail.com.";
    status.className = 'form-status error';
  } finally {
    submitBtn.disabled = false;
    btnText.textContent = 'Send Email Inquiry';
  }
}

// Touch Gestures
let startX = 0;
let endX = 0;
const viewport = document.getElementById('viewport');

viewport.addEventListener('touchstart', (e) => {
  startX = e.touches[0].clientX;
}, { passive: true });

viewport.addEventListener('touchend', (e) => {
  endX = e.changedTouches[0].clientX;
  handleSwipe();
}, { passive: true });

function handleSwipe() {
  const threshold = 40;
  if (startX - endX > threshold) nextSlide();
  else if (endX - startX > threshold) prevSlide();
}

// Keyboard Nav
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') nextSlide();
  if (e.key === 'ArrowLeft') prevSlide();
});
