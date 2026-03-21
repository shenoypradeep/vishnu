const totalSlides = 108;

let currentIndex = 1;
let isPlaying = false;

const slide = document.getElementById("slide");
const audio = document.getElementById("audio");

const centerBtn = document.getElementById("center-btn");
const nextBtn = document.getElementById("next");
const prevBtn = document.getElementById("prev");
const fullscreenBtn = document.getElementById("fullscreen");

const currentDisplay = document.getElementById("current");

function pad(num) {
  return num.toString().padStart(3, "0");
}

function loadSlide(index) {
  slide.src = `slides/${pad(index)}.jpg`;
  audio.src = `audio/${pad(index)}.mp3`;
  currentDisplay.textContent = index;
}

function playAudio() {
  audio.play();
  isPlaying = true;
  centerBtn.textContent = "⏸";
}

function pauseAudio() {
  audio.pause();
  isPlaying = false;
  centerBtn.textContent = "▶";
}

function togglePlay() {
  isPlaying ? pauseAudio() : playAudio();
}

function nextSlide() {
  if (currentIndex < totalSlides) {
    currentIndex++;
    loadSlide(currentIndex);
    playAudio();
  }
}

function prevSlide() {
  if (currentIndex > 1) {
    currentIndex--;
    loadSlide(currentIndex);
    playAudio();
  }
}

audio.addEventListener("ended", nextSlide);

centerBtn.addEventListener("click", togglePlay);
nextBtn.addEventListener("click", nextSlide);
prevBtn.addEventListener("click", prevSlide);

fullscreenBtn.addEventListener("click", () => {
  document.documentElement.requestFullscreen();
});

loadSlide(currentIndex);