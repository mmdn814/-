class AudioEngine {
  context: AudioContext | null = null;
  isEnabled: boolean = false;

  init() {
    if (!this.context) {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.context.state === 'suspended') {
      this.context.resume();
    }
    this.isEnabled = true;
  }

  playTypewriter() {
    if (!this.isEnabled || !this.context) return;
    
    // Very short, high-frequency "click" for typing
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    
    // Use square wave for a more mechanical, retro feel
    osc.type = 'square';
    
    // Randomize frequency slightly for variety
    const baseFreq = 800;
    osc.frequency.setValueAtTime(baseFreq + Math.random() * 200, this.context.currentTime);
    
    // Very quick decay
    gain.gain.setValueAtTime(0.015, this.context.currentTime); // Low volume
    gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.03);
    
    osc.connect(gain);
    gain.connect(this.context.destination);
    
    osc.start();
    osc.stop(this.context.currentTime + 0.03);
  }

  playHover() {
    if (!this.isEnabled || !this.context) return;
    
    // Digital UI "blip"
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    
    osc.type = 'sine';
    
    // Slide up slightly
    osc.frequency.setValueAtTime(400, this.context.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, this.context.currentTime + 0.05);
    
    gain.gain.setValueAtTime(0.05, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.05);
    
    osc.connect(gain);
    gain.connect(this.context.destination);
    
    osc.start();
    osc.stop(this.context.currentTime + 0.05);
  }

  playClick() {
    if (!this.isEnabled || !this.context) return;
    
    // Softer OS button click
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    
    osc.type = 'sine';
    
    // Quick pop
    osc.frequency.setValueAtTime(600, this.context.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.context.currentTime + 0.05);
    
    gain.gain.setValueAtTime(0.2, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.05);
    
    osc.connect(gain);
    gain.connect(this.context.destination);
    
    osc.start();
    osc.stop(this.context.currentTime + 0.05);
  }

  playTick() {
    if (!this.isEnabled || !this.context) return;
    
    // Mechanical clock tick using short burst of noise
    const bufferSize = this.context.sampleRate * 0.05; // 50ms buffer
    const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Fill with white noise
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noiseSource = this.context.createBufferSource();
    noiseSource.buffer = buffer;
    
    // Create a bandpass filter to make it sound mechanical/metallic
    const filter = this.context.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 4000; // High frequency for the "click"
    filter.Q.value = 1.0;
    
    const gain = this.context.createGain();
    
    // Very sharp envelope
    gain.gain.setValueAtTime(0.5, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.02);
    
    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(this.context.destination);
    
    noiseSource.start();
  }

  playUrgentTick() {
    if (!this.isEnabled || !this.context) return;
    
    // Higher pitched, faster ticking sound
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    
    osc.type = 'triangle';
    
    osc.frequency.setValueAtTime(800, this.context.currentTime); // High pitch
    osc.frequency.exponentialRampToValueAtTime(100, this.context.currentTime + 0.05);
    
    gain.gain.setValueAtTime(0.3, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.05);
    
    osc.connect(gain);
    gain.connect(this.context.destination);
    
    osc.start();
    osc.stop(this.context.currentTime + 0.05);
  }

  playChord() {
    if (!this.isEnabled || !this.context) return;
    
    // Classic Windows 95 "Chord" sound (A, C#, E)
    const frequencies = [440, 554.37, 659.25]; // A4, C#5, E5
    
    frequencies.forEach(freq => {
      const osc = this.context!.createOscillator();
      const gain = this.context!.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.context!.currentTime);
      
      // Envelopes for a bell-like chord
      gain.gain.setValueAtTime(0, this.context!.currentTime);
      gain.gain.linearRampToValueAtTime(0.1, this.context!.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, this.context!.currentTime + 1.5);
      
      osc.connect(gain);
      gain.connect(this.context!.destination);
      
      osc.start();
      osc.stop(this.context!.currentTime + 1.5);
    });
  }

  playTada() {
    if (!this.isEnabled || !this.context) return;
    
    // Classic Windows 95 "Tada" sound approximation
    // First chord (short)
    const chord1 = [392.00, 493.88, 587.33]; // G4, B4, D5 (G Major)
    // Second chord (long)
    const chord2 = [523.25, 659.25, 783.99]; // C5, E5, G5 (C Major)
    
    const time = this.context.currentTime;
    
    chord1.forEach(freq => {
      const osc = this.context!.createOscillator();
      const gain = this.context!.createGain();
      
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, time);
      
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.08, time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
      
      osc.connect(gain);
      gain.connect(this.context!.destination);
      
      osc.start(time);
      osc.stop(time + 0.15);
    });
    
    chord2.forEach(freq => {
      const osc = this.context!.createOscillator();
      const gain = this.context!.createGain();
      
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, time + 0.15);
      
      gain.gain.setValueAtTime(0, time + 0.15);
      gain.gain.linearRampToValueAtTime(0.1, time + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 1.5);
      
      osc.connect(gain);
      gain.connect(this.context!.destination);
      
      osc.start(time + 0.15);
      osc.stop(time + 1.5);
    });
  }
}

// Export a singleton instance
export const audio = new AudioEngine();
