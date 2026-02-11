document.addEventListener('DOMContentLoaded',()=>{
  const audio = document.getElementById('audio');
  const playBtn = document.getElementById('playBtn');
  const progress = document.getElementById('progress');
  const progressBar = document.getElementById('progressBar');
  const progressWrap = document.querySelector('.progress-wrap');
  const time = document.getElementById('time');
  const songTitle = document.getElementById('songTitle');
  const visualizer = document.getElementById('visualizer');
  const overlay = document.getElementById('overlay');
  const snowContainer = document.getElementById('snowContainer');

  // Playlist of songs
  const playlist = [
    { src: 'resources/vivienne%20-%20jaydes.mp3', name: 'vivienne - jaydes' },
    { src: 'resources/Smirnoff%20Ice%20-%20Yung%20Lean.mp3', name: 'Smirnoff Ice - Yung Lean' },
    { src: 'resources/Bored%20-%20Joeyy.mp3', name: 'Bored - Joeyy' }
  ];
  
  let currentSongIndex = 0;

  // Snow functionality
  function createSnowflake() {
    const snowflake = document.createElement('div');
    snowflake.className = 'snowflake';
    snowflake.textContent = '*'; // Using asterisk for snowflake
    snowflake.style.left = Math.random() * 100 + '%';
    snowflake.style.animationDuration = Math.random() * 3 + 7 + 's'; // 7-10 seconds
    snowflake.style.opacity = Math.random() * 0.6 + 0.4; // 0.4-1.0 opacity
    snowflake.style.fontSize = Math.random() * 4 + 8 + 'px'; // 8-12px
    snowContainer.appendChild(snowflake);
    
    // Remove snowflake after it falls (but don't stop the interval)
    setTimeout(() => {
      if (snowflake.parentNode) {
        snowflake.remove();
      }
    }, 10000);
  }

  let snowInterval;

  function startSnow() {
    // Clear any existing interval
    if (snowInterval) {
      clearInterval(snowInterval);
    }
    
    // Create initial batch of snowflakes
    for (let i = 0; i < 20; i++) {
      setTimeout(() => createSnowflake(), Math.random() * 2000);
    }
    
    // Continue creating snowflakes continuously
    snowInterval = setInterval(createSnowflake, 300);
  }

  function stopSnow() {
    if (snowInterval) {
      clearInterval(snowInterval);
      snowInterval = null;
    }
    snowContainer.innerHTML = '';
  }

  // Animated typing title
  function typeTitle() {
    const titles = ['IM EVIL ', 'IM EVIL ', 'IM EVIL '];
    let titleIndex = 0;
    let charIndex = 0;
    let currentTitle = '';
    let isDeleting = false;
    
    function type() {
      const fullTitle = titles[titleIndex];
      
      if (!isDeleting) {
        currentTitle = fullTitle.substring(0, charIndex + 1);
        charIndex++;
        
        if (charIndex === fullTitle.length) {
          isDeleting = true;
          setTimeout(type, 2000); // Pause at end
          return;
        }
      } else {
        currentTitle = fullTitle.substring(0, charIndex - 1);
        charIndex--;
        
        if (charIndex === 0) {
          isDeleting = false;
          titleIndex = (titleIndex + 1) % titles.length;
        }
      }
      
      document.title = currentTitle;
      const typingSpeed = isDeleting ? 50 : 100;
      setTimeout(type, typingSpeed);
    }
    
    type();
  }

  typeTitle();

  function loadSong(index) {
    const song = playlist[index];
    audio.src = song.src;
    songTitle.textContent = song.name;
    currentSongIndex = index;
    audio.load();
  }

  function nextSong() {
    currentSongIndex = (currentSongIndex + 1) % playlist.length;
    loadSong(currentSongIndex);
    audio.play();
    playBtn.classList.add('playing');
    visualizerInterval = setInterval(animateVisualizer, 100);
  }

  function formatTime(s){
    if(!isFinite(s)) return '0:00';
    const m = Math.floor(s/60);
    const sec = Math.floor(s%60).toString().padStart(2,'0');
    return m+':'+sec;
  }

  function extractNameFromSrc(src){
    try{
      const p = src.split('/').pop().split('?')[0];
      return decodeURIComponent(p).replace(/\.[^/.]+$/,'');
    }catch(e){return 'Unknown Song'}
  }
  if(songTitle) songTitle.textContent = extractNameFromSrc(audio.src || '');

  // Create visualizer bars
  function createVisualizerBars(){
    const barCount = 20;
    for(let i = 0; i < barCount; i++){
      const bar = document.createElement('div');
      bar.className = 'bar';
      visualizer.appendChild(bar);
    }
  }

  // Animate visualizer
  function animateVisualizer(){
    const bars = visualizer.querySelectorAll('.bar');
    bars.forEach(bar => {
      const height = Math.random() * 80 + 20; // Random height between 20-100%
      bar.style.height = height + '%';
    });
  }

  // Initialize visualizer
  createVisualizerBars();
  let visualizerInterval;

  // Audio ended event - play next song
  audio.addEventListener('ended', () => {
    nextSong();
  });

  // Initialize with first song
  loadSong(0);

  // Overlay click handler
  overlay.addEventListener('click',()=>{
    // Start fade animation
    overlay.style.animation = 'fadeOut 0.8s ease-out forwards';
    
    // Start music and snow immediately
    audio.play();
    playBtn.classList.add('playing');
    visualizerInterval = setInterval(animateVisualizer, 100);
    startSnow();
    
    // Remove overlay after animation completes
    setTimeout(() => {
      overlay.classList.add('hidden');
      overlay.style.animation = ''; // Reset animation
    }, 800);
  });

  playBtn.addEventListener('click',()=>{
    if(audio.paused){
      audio.play();
      playBtn.classList.add('playing');
      visualizerInterval = setInterval(animateVisualizer, 100);
    } else {
      audio.pause();
      playBtn.classList.remove('playing');
      clearInterval(visualizerInterval);
      // Reset bars to minimum height
      const bars = visualizer.querySelectorAll('.bar');
      bars.forEach(bar => {
        bar.style.height = '3px';
      });
    }
  });

  audio.addEventListener('loadedmetadata',()=>{
    progress.value = 0;
    progressBar.style.width = '0%';
  });

  audio.addEventListener('timeupdate',()=>{
    if(isFinite(audio.duration) && audio.duration>0){
      const pct = (audio.currentTime/audio.duration)*100;
      progress.value = pct;
      progressBar.style.width = pct + '%';
      time.textContent = formatTime(audio.currentTime);
    }
  });

  audio.addEventListener('ended',()=>{
    playBtn.classList.remove('playing');
    progress.value = 0;
    progressBar.style.width = '0%';
    clearInterval(visualizerInterval);
    // Reset bars
    const bars = visualizer.querySelectorAll('.bar');
    bars.forEach(bar => {
      bar.style.height = '3px';
    });
  });

  // Click to seek on progress bar
  progressWrap.addEventListener('click',(e)=>{
    if(isFinite(audio.duration)){
      const rect = progressWrap.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const width = rect.width;
      const pct = Math.max(0, Math.min(100, (x / width) * 100));
      progress.value = pct;
      progressBar.style.width = pct + '%';
      audio.currentTime = (pct / 100) * audio.duration;
    }
  });

  // Seek when user interacts with range (fallback)
  let seeking = false;
  progress.addEventListener('input',(e)=>{
    seeking = true;
    const pct = Number(e.target.value)/100;
    if(isFinite(audio.duration)){
      time.textContent = formatTime(pct*audio.duration);
      progressBar.style.width = (pct * 100) + '%';
    }
  });
  progress.addEventListener('change',(e)=>{
    const pct = Number(e.target.value)/100;
    if(isFinite(audio.duration)) audio.currentTime = pct*audio.duration;
    seeking = false;
  });

  // space toggles play/pause when focused on body (only after overlay is hidden)
  document.body.addEventListener('keydown',(e)=>{
    if(e.code==='Space' && document.activeElement.tagName!=='INPUT' && overlay.classList.contains('hidden')){
      e.preventDefault();
      playBtn.click();
    }
  });
});
