/**
 * ANALOG VAULT — Core Camera & Darkroom Engine
 * WebGL-powered historical camera simulation, real-time GLSL grain shaders,
 * tactile mechanical locks, and latent emulsion development.
 */

(() => {
  'use strict';

  // =========================================================================
  // 1. CONFIGURACIÓN Y BASES DE DATOS DE HARDWARE & EMULSIONES
  // =========================================================================
  const CAMERA_PROFILES = {
    leica_m3: {
      name: 'Leica M3 (1954)',
      brand: 'LEITZ',
      model: 'M3 · WETZLAR',
      themeClass: 'theme-leica-m',
      aspectRatio: 3 / 2,
      mechanicalAdvance: true,
      hasEvComp: false,
      reticleId: 'rangefinder-overlay'
    },
    hasselblad_500: {
      name: 'Hasselblad 500 C/M',
      brand: 'HASSELBLAD',
      model: '500 C/M · SWEDEN',
      themeClass: 'theme-hasselblad',
      aspectRatio: 1.0,
      mechanicalAdvance: true,
      hasEvComp: false,
      reticleId: 'waist-level-overlay'
    },
    fuji_x100: {
      name: 'Fujifilm X100 Series',
      brand: 'FUJIFILM',
      model: 'X100 HYBRID OVF',
      themeClass: 'theme-fuji-x100',
      aspectRatio: 3 / 2,
      mechanicalAdvance: false, // Digital: rearme automático
      hasEvComp: true,
      reticleId: 'rangefinder-overlay'
    },
    instax_retro: {
      name: 'Instant Box 100',
      brand: 'INSTAX',
      model: 'INSTANT NEO 100',
      themeClass: 'theme-instax',
      aspectRatio: 3 / 4,
      mechanicalAdvance: false,
      hasEvComp: false,
      reticleId: 'instant-view-overlay',
      isInstant: true
    },
    polaroid_sx70: {
      name: 'Polaroid SX-70',
      brand: 'POLAROID',
      model: 'SX-70 LAND CAMERA',
      themeClass: 'theme-polaroid-sx70',
      aspectRatio: 1.0,
      mechanicalAdvance: false,
      hasEvComp: false,
      reticleId: 'instant-view-overlay',
      isInstant: true
    },
    cyanotype_box: {
      name: 'Cámara John Herschel (1842)',
      brand: 'HERSCHEL',
      model: 'CYANOTYPE PROCESS',
      themeClass: 'theme-cyanotype',
      aspectRatio: 4 / 5,
      mechanicalAdvance: true,
      hasEvComp: false,
      reticleId: 'cyanotype-overlay'
    }
  };

  const FILM_STOCKS = {
    kodak_portra_400: {
      brand: 'KODAK',
      name: 'PORTRA 400',
      iso: 400,
      maxExposures: 36,
      shaderType: 1 // Portra
    },
    kodak_tri_x: {
      brand: 'KODAK',
      name: 'TRI-X 400',
      iso: 400,
      maxExposures: 36,
      shaderType: 2 // Tri-X B&W
    },
    fuji_velvia_50: {
      brand: 'FUJI',
      name: 'VELVIA 50',
      iso: 50,
      maxExposures: 36,
      shaderType: 3 // Velvia Slide
    },
    instax_color: {
      brand: 'FUJIFILM',
      name: 'INSTAX COLOR',
      iso: 800,
      maxExposures: 10,
      shaderType: 4 // Instant print
    },
    cyanotype_iron: {
      brand: 'HERSCHEL',
      name: 'CYANOTYPE',
      iso: 12,
      maxExposures: 12,
      shaderType: 5 // Prussian Blue
    }
  };

  // =========================================================================
  // 2. ESTADO GLOBAL DE LA MÁQUINA
  // =========================================================================
  const state = {
    currentCamera: 'leica_m3',
    currentFilm: 'kodak_portra_400',
    shutterArmed: true, // Si el obturador está cargado listo para disparar
    exposuresTaken: 0,
    maxExposures: 36,
    latentRoll: [], // Fotos tomadas sin revelar
    developedRolls: [],
    shutterSpeeds: ['1/1000', '1/500', '1/250', '1/125', '1/60', '1/30', 'B'],
    currentSpeedIndex: 2, // 1/250
    evComp: 0,
    stream: null
  };

  // =========================================================================
  // 3. SHADERS GLSL (RENDERIZADO Y EMULACIÓN DE HALUROS)
  // =========================================================================
  const VS_SOURCE = `
    attribute vec2 a_position;
    varying vec2 v_uv;
    void main() {
      v_uv = vec2((a_position.x + 1.0) * 0.5, 1.0 - (a_position.y + 1.0) * 0.5);
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

  const FS_SOURCE = `
    precision mediump float;
    varying vec2 v_uv;
    uniform sampler2D u_image;
    uniform int u_shaderType;
    uniform float u_time;
    uniform float u_grainAmount;

    // Generador pseudo-aleatorio de grano de haluros de plata
    float rand(vec2 co) {
      return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      vec4 texColor = texture2D(u_image, v_uv);
      vec3 color = texColor.rgb;
      float noise = (rand(v_uv + fract(u_time)) - 0.5) * u_grainAmount;

      if (u_shaderType == 1) {
        // Kodak Portra 400: Calidez, sombras levantadas y compresión de altas luces
        color.r = pow(color.r, 0.92) * 1.05;
        color.g = pow(color.g, 0.96) * 1.01;
        color.b = pow(color.b, 1.08) * 0.95;
        color += noise * 0.8;
      }
      else if (u_shaderType == 2) {
        // Kodak Tri-X 400: Pancromático, microcontraste y grano marcado
        float lum = dot(color, vec3(0.299, 0.587, 0.114));
        lum = smoothstep(0.08, 0.92, lum);
        color = vec3(lum) + (noise * 1.6);
      }
      else if (u_shaderType == 3) {
        // Fujichrome Velvia 50: Alta saturación y contraste diapositiva
        color = pow(color, vec3(1.15));
        color.g *= 1.12;
        color.b *= 1.15;
        color += noise * 0.4;
      }
      else if (u_shaderType == 4) {
        // Instantáneo (Instax / Polaroid): Calidez en sombras, luces atenuadas
        color.r = mix(color.r, 1.0, 0.05);
        color.b = mix(color.b, 0.2, 0.08);
        color = mix(color, vec3(dot(color, vec3(0.333))), 0.12);
        color += noise * 0.6;
      }
      else if (u_shaderType == 5) {
        // Cianotipia 1842: Monocromo Azul de Prusia
        float lum = dot(color, vec3(0.299, 0.587, 0.114));
        vec3 prussianBlue = vec3(0.04, 0.24, 0.48);
        vec3 paperWhite = vec3(0.92, 0.94, 0.96);
        color = mix(prussianBlue, paperWhite, lum);
        // Viñeteo de placa húmeda
        float dist = distance(v_uv, vec2(0.5));
        color *= smoothstep(0.75, 0.25, dist);
        color += noise * 0.5;
      }

      gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
    }
  `;

  // =========================================================================
  // 4. MOTOR WEBGL
  // =========================================================================
  let gl, glProgram, glTexture;
  let uShaderTypeLoc, uTimeLoc, uGrainLoc;

  function initWebGL(canvas) {
    gl = canvas.getContext('webgl', { preserveDrawingBuffer: true });
    if (!gl) return console.error('WebGL no soportado.');

    const createShader = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    };

    const vs = createShader(gl.VERTEX_SHADER, VS_SOURCE);
    const fs = createShader(gl.FRAGMENT_SHADER, FS_SOURCE);
    glProgram = gl.createProgram();
    gl.attachShader(glProgram, vs);
    gl.attachShader(glProgram, fs);
    gl.linkProgram(glProgram);
    gl.useProgram(glProgram);

    // Quad de pantalla completa
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,  1, -1, -1,  1,
      -1,  1,  1, -1,  1,  1
    ]), gl.STATIC_DRAW);

    const aPosLoc = gl.getAttribLocation(glProgram, 'a_position');
    gl.enableVertexAttribArray(aPosLoc);
    gl.vertexAttribPointer(aPosLoc, 2, gl.FLOAT, false, 0, 0);

    // Textura para el feed de la cámara
    glTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, glTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    uShaderTypeLoc = gl.getUniformLocation(glProgram, 'u_shaderType');
    uTimeLoc = gl.getUniformLocation(glProgram, 'u_time');
    uGrainLoc = gl.getUniformLocation(glProgram, 'u_grainAmount');
  }

  function renderLoop() {
    const video = document.getElementById('webcam-sensor-feed');
    const canvas = document.getElementById('viewfinder-gl-surface');

    if (gl && video.readyState >= video.HAVE_CURRENT_DATA) {
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        gl.viewport(0, 0, canvas.width, canvas.height);
      }

      gl.bindTexture(gl.TEXTURE_2D, glTexture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);

      const film = FILM_STOCKS[state.currentFilm];
      gl.uniform1i(uShaderTypeLoc, film.shaderType);
      gl.uniform1f(uTimeLoc, performance.now() * 0.002);
      gl.uniform1f(uGrainLoc, film.iso >= 800 ? 0.12 : (film.iso >= 400 ? 0.07 : 0.03));

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    requestAnimationFrame(renderLoop);
  }

  // =========================================================================
  // 5. NÚCLEO DE CÁMARA (STREAM Y CAPTURA)
  // =========================================================================
  async function initCameraStream() {
    const video = document.getElementById('webcam-sensor-feed');
    try {
      state.stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      video.srcObject = state.stream;
      await video.play();
    } catch (err) {
      console.warn('Sensor trasero inaccesible, usando frontal/fallback:', err);
      try {
        state.stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        video.srcObject = state.stream;
        await video.play();
      } catch (e) {
        alert('Se requiere acceso a la cámara para el visor de Analog Vault.');
      }
    }
  }

  // =========================================================================
  // 6. MECÁNICA ANALÓGICA: ARRASTRE, OBTURADOR Y DISPARO
  // =========================================================================
  function triggerShutter() {
    const cam = CAMERA_PROFILES[state.currentCamera];
    const film = FILM_STOCKS[state.currentFilm];

    // Comprobación de trinquete de película
    if (cam.mechanicalAdvance && !state.shutterArmed) {
      flashMechanicalFeedback('¡ARRASTRA LA PELÍCULA CON LA PALANCA!');
      return;
    }

    if (state.exposuresTaken >= film.maxExposures) {
      flashMechanicalFeedback('¡CARRETE TERMINADO! LLÉVALO AL LABORATORIO.');
      return;
    }

    // Sonido táctil / vibración de obturador
    if (navigator.vibrate) navigator.vibrate([15, 30, 20]);

    // Renderizar fotograma en el canvas WebGL y guardarlo
    const canvas = document.getElementById('viewfinder-gl-surface');
    const capturedDataUrl = canvas.toDataURL('image/jpeg', 0.95);

    if (cam.isInstant) {
      // Modo Instantáneo (Instax / SX-70)
      state.exposuresTaken++;
      updateCounterDisplay();
      ejectInstantPrint(capturedDataUrl);
    } else {
      // Carrete Convencional (Negativo latente ciego)
      state.latentRoll.push({
        frameNumber: state.exposuresTaken + 1,
        filmId: state.currentFilm,
        cameraId: state.currentCamera,
        timestamp: new Date().toLocaleTimeString(),
        dataUrl: capturedDataUrl
      });

      state.exposuresTaken++;
      state.shutterArmed = !cam.mechanicalAdvance; // Si es mecánica, queda desarmada
      updateCounterDisplay();
      updateAdvanceLeverState();
      saveStateToDisk();
    }

    // Guiño visual del obturador (obturación de plano focal)
    flashShutterBlades();
  }

  function advanceFilmManually() {
    if (state.shutterArmed) return;
    const lever = document.getElementById('film-advance-lever');
    
    lever.classList.add('lever-wound');
    if (navigator.vibrate) navigator.vibrate(30);

    setTimeout(() => {
      state.shutterArmed = true;
      lever.classList.remove('lever-wound');
      updateAdvanceLeverState();
      flashMechanicalFeedback('OBTURADOR ARMADO · LISTO');
    }, 350);
  }

  function updateAdvanceLeverState() {
    const lever = document.getElementById('film-advance-lever');
    const cam = CAMERA_PROFILES[state.currentCamera];

    if (!cam.mechanicalAdvance) {
      lever.style.opacity = '0.3';
      lever.style.pointerEvents = 'none';
    } else {
      lever.style.opacity = '1';
      lever.style.pointerEvents = 'auto';
    }
  }

  function flashShutterBlades() {
    const housing = document.getElementById('optical-deck');
    const flash = document.createElement('div');
    flash.style.position = 'absolute';
    flash.style.inset = '0';
    flash.style.backgroundColor = '#000';
    flash.style.zIndex = '30';
    flash.style.opacity = '1';
    flash.style.transition = 'opacity 0.09s ease-out';
    housing.appendChild(flash);
    setTimeout(() => {
      flash.style.opacity = '0';
      setTimeout(() => flash.remove(), 100);
    }, 40);
  }

  function flashMechanicalFeedback(text) {
    const label = document.getElementById('film-sprocket-info');
    if (label) {
      const original = label.innerText;
      label.innerText = text;
      label.style.color = '#ffaa00';
      setTimeout(() => {
        label.innerText = original;
        label.style.color = '#777';
      }, 2000);
    }
  }

  function updateCounterDisplay() {
    const counter = document.getElementById('counter-value');
    const film = FILM_STOCKS[state.currentFilm];
    if (state.exposuresTaken === 0) {
      counter.innerText = 'S'; // Start
    } else {
      counter.innerText = String(state.exposuresTaken).padStart(2, '0');
    }

    // Alerta lumínica en el botón del laboratorio cuando el rollo está lleno
    const labLed = document.getElementById('darkroom-alert-led');
    if (state.exposuresTaken >= film.maxExposures) {
      labLed.classList.add('ready-to-develop');
      document.getElementById('lab-roll-status').innerText = 'ROLLO COMPLETO';
    } else {
      labLed.classList.remove('ready-to-develop');
      document.getElementById('lab-roll-status').innerText = 'EN USO';
    }
  }

  // =========================================================================
  // 7. EXPULSIÓN DE COPIA INSTANTÁNEA (INSTAX / SX-70)
  // =========================================================================
  function ejectInstantPrint(dataUrl) {
    const slot = document.getElementById('instax-ejection-slot');
    const sheet = document.getElementById('instax-film-sheet');
    const canvas = document.getElementById('instant-latent-canvas');
    const ctx = canvas.getContext('2d');

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      slot.classList.remove('ejection-slot-hidden');
      canvas.classList.remove('developed');
      sheet.classList.remove('film-sheet-ejected');

      // Animación de salida mecánica motorizada
      setTimeout(() => {
        sheet.classList.add('film-sheet-ejected');
        // Revelado químico gradual de haluros a plena luz
        setTimeout(() => {
          canvas.classList.add('developed');
        }, 1200);
      }, 50);
    };
    img.src = dataUrl;

    // Permitir retirar la foto tocándola
    sheet.onclick = () => {
      sheet.classList.remove('film-sheet-ejected');
      setTimeout(() => slot.classList.add('ejection-slot-hidden'), 800);
    };
  }

  // =========================================================================
  // 8. INTERFAZ ADAPTATIVA POR CÁMARA (SKINS Y RETÍCULAS)
  // =========================================================================
  function switchCameraSystem(cameraId) {
    const cam = CAMERA_PROFILES[cameraId];
    if (!cam) return;

    state.currentCamera = cameraId;
    const body = document.getElementById('camera-runtime');

    // Limpiar clases anteriores
    Object.values(CAMERA_PROFILES).forEach(c => body.classList.remove(c.themeClass));
    body.classList.add(cam.themeClass);

    // Actualizar logotipos y grabados
    document.getElementById('label-camera-brand').innerText = cam.brand;
    document.getElementById('label-camera-model').innerText = cam.model;

    // Conmutar visores y retículas
    document.querySelectorAll('.optical-mask').forEach(m => m.classList.add('optical-mask-hidden'));
    const activeReticle = document.getElementById(cam.reticleId);
    if (activeReticle) activeReticle.classList.remove('optical-mask-hidden');

    updateAdvanceLeverState();
    saveStateToDisk();
  }

  function loadFilmStock(filmId) {
    const film = FILM_STOCKS[filmId];
    if (!film) return;

    state.currentFilm = filmId;
    state.exposuresTaken = 0;
    state.latentRoll = [];
    state.shutterArmed = true;

    // Actualizar lengüeta trasera (Memo Clip)
    document.getElementById('film-tab-brand').innerText = film.brand;
    document.getElementById('film-tab-name').innerText = film.name;
    document.getElementById('film-tab-iso').innerText = `ISO ${film.iso} · ${film.maxExposures} EXP`;

    updateCounterDisplay();
    saveStateToDisk();
  }

  // =========================================================================
  // 9. CUARTO OSCURO Y LABORATORIO DE REVELADO QUÍMICO
  // =========================================================================
  function enterDarkroom() {
    const vault = document.getElementById('darkroom-vault');
    vault.classList.remove('darkroom-hidden');

    const devBay = document.getElementById('chemical-processing-bay');
    const lightBoxBay = document.getElementById('lightbox-inspection-bay');

    if (state.latentRoll.length > 0) {
      // Hay fotos latentes esperando baño químico
      devBay.classList.remove('processing-bay-hidden');
      lightBoxBay.classList.add('lightbox-bay-hidden');
      document.getElementById('darkroom-status-readout').innerText = 'ROLLO PENDIENTE DE REVELADO';
    } else {
      // No hay rollo pendiente, mostrar mesa de luz si hay negativos previos
      devBay.classList.add('processing-bay-hidden');
      lightBoxBay.classList.remove('lightbox-bay-hidden');
      document.getElementById('darkroom-status-readout').innerText = 'MESA DE LUZ & INSPECCIÓN';
      renderLightboxStrip();
    }
  }

  function exitDarkroom() {
    document.getElementById('darkroom-vault').classList.add('darkroom-hidden');
  }

  function startChemicalDevelopment() {
    const btn = document.getElementById('btn-trigger-development');
    const clock = document.getElementById('darkroom-clock');
    const instruction = document.getElementById('chemical-step-instruction');
    btn.disabled = true;

    const steps = [
      { name: '1. BAÑO DE REVELADOR (D-76)', time: 3, trayId: 'tray-dev' },
      { name: '2. BAÑO DE PARO ÁCIDO', time: 2, trayId: 'tray-stop' },
      { name: '3. FIJADOR RÁPIDO DE HALUROS', time: 3, trayId: 'tray-fixer' }
    ];

    let currentStep = 0;

    function runStep() {
      if (currentStep >= steps.length) {
        // Proceso terminado
        instruction.innerText = '¡REVELADO COMPLETADO! Trasladando a mesa de luz...';
        state.developedRolls.push([...state.latentRoll]);
        state.latentRoll = [];
        state.exposuresTaken = 0;
        updateCounterDisplay();
        saveStateToDisk();

        setTimeout(() => {
          document.getElementById('chemical-processing-bay').classList.add('processing-bay-hidden');
          document.getElementById('lightbox-inspection-bay').classList.remove('lightbox-bay-hidden');
          btn.disabled = false;
          renderLightboxStrip();
        }, 1200);
        return;
      }

      const s = steps[currentStep];
      instruction.innerText = `Agitando espiral en: ${s.name}`;
      let remaining = s.time;
      clock.innerText = `00:0${remaining}`;

      const interval = setInterval(() => {
        remaining--;
        clock.innerText = `00:0${remaining}`;
        if (remaining <= 0) {
          clearInterval(interval);
          currentStep++;
          runStep();
        }
      }, 1000);
    }

    runStep();
  }

  function renderLightboxStrip() {
    const container = document.getElementById('lightbox-contact-sheet');
    container.innerHTML = '';

    const allFrames = state.developedRolls.flat();
    if (allFrames.length === 0) {
      container.innerHTML = '<p style="color:#222; font-size:12px; padding:20px;">No hay negativos revelados en el archivo.</p>';
      return;
    }

    allFrames.forEach((frame, idx) => {
      const node = document.createElement('div');
      node.className = 'film-frame-node';
      node.innerHTML = `
        <div class="sprocket-holes-top"></div>
        <img src="${frame.dataUrl}" class="film-negative-img" alt="Fotograma ${idx + 1}">
        <div class="sprocket-holes-bottom"></div>
        <div style="font-size:7px; color:#555; text-align:center; margin-top:2px;">#${String(idx + 1).padStart(2, '0')} · ${frame.filmId}</div>
      `;

      // Positivar imagen / abrir ampliadora al tocar
      node.onclick = () => openEnlarger(frame.dataUrl, idx + 1, frame.filmId);
      container.appendChild(node);
    });
  }

  function openEnlarger(dataUrl, frameNum, filmId) {
    const modal = document.getElementById('modal-enlarger-preview');
    document.getElementById('enlarger-frame-title').innerText = `FOTOGRAMA #${frameNum} · ${filmId.toUpperCase()}`;
    document.getElementById('enlarger-image-target').src = dataUrl;
    document.getElementById('btn-download-highres').href = dataUrl;
    modal.showModal();
  }

  // =========================================================================
  // 10. PERSISTENCIA EN STORAGE
  // =========================================================================
  function saveStateToDisk() {
    try {
      localStorage.setItem('analog_vault_state', JSON.stringify({
        currentCamera: state.currentCamera,
        currentFilm: state.currentFilm,
        exposuresTaken: state.exposuresTaken,
        shutterArmed: state.shutterArmed,
        latentRoll: state.latentRoll,
        developedRolls: state.developedRolls
      }));
    } catch (e) {
      console.warn('Almacenamiento local lleno o restringido');
    }
  }

  function loadStateFromDisk() {
    try {
      const raw = localStorage.getItem('analog_vault_state');
      if (raw) {
        const parsed = JSON.parse(raw);
        state.currentCamera = parsed.currentCamera || 'leica_m3';
        state.currentFilm = parsed.currentFilm || 'kodak_portra_400';
        state.exposuresTaken = parsed.exposuresTaken || 0;
        state.shutterArmed = parsed.shutterArmed ?? true;
        state.latentRoll = parsed.latentRoll || [];
        state.developedRolls = parsed.developedRolls || [];
      }
    } catch (e) {
      console.warn('Error recuperando estado');
    }
  }

  // =========================================================================
  // 11. BINDING DE EVENTOS DEL DOM
  // =========================================================================
  function bindUIEvents() {
    // Disparador
    document.getElementById('shutter-trigger').addEventListener('click', triggerShutter);

    // Palanca de arrastre
    document.getElementById('film-advance-lever').addEventListener('click', advanceFilmManually);

    // Diálogos modales
    const cameraModal = document.getElementById('modal-camera-catalog');
    const filmModal = document.getElementById('modal-film-catalog');
    const enlargerModal = document.getElementById('modal-enlarger-preview');

    document.getElementById('btn-camera-system').addEventListener('click', () => cameraModal.showModal());
    document.getElementById('btn-close-camera-catalog').addEventListener('click', () => cameraModal.close());

    document.getElementById('btn-open-film-drawer').addEventListener('click', () => filmModal.showModal());
    document.getElementById('btn-close-film-catalog').addEventListener('click', () => filmModal.close());

    document.getElementById('btn-close-enlarger').addEventListener('click', () => enlargerModal.close());

    // Selección de cuerpo de cámara
    document.querySelectorAll('.camera-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.camera-card').forEach(c => c.classList.remove('active-card'));
        card.classList.add('active-card');
        const camId = card.getAttribute('data-camera-system');
        switchCameraSystem(camId);
        cameraModal.close();
      });
    });

    // Selección de carrete
    document.querySelectorAll('.film-pack-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.film-pack-card').forEach(c => c.classList.remove('active-film-item'));
        card.classList.add('active-film-item');
        const filmId = card.getAttribute('data-film-profile');
        loadFilmStock(filmId);
        filmModal.close();
      });
    });

    // Dial de velocidades
    document.getElementById('shutter-speed-knob').addEventListener('click', () => {
      state.currentSpeedIndex = (state.currentSpeedIndex + 1) % state.shutterSpeeds.length;
      document.getElementById('readout-shutter-speed').innerText = state.shutterSpeeds[state.currentSpeedIndex];
      if (navigator.vibrate) navigator.vibrate(10);
    });

    // Cuarto Oscuro / Laboratorio
    document.getElementById('btn-enter-darkroom').addEventListener('click', enterDarkroom);
    document.getElementById('btn-return-camera').addEventListener('click', exitDarkroom);
    document.getElementById('btn-trigger-development').addEventListener('click', startChemicalDevelopment);
  }

  // =========================================================================
  // 12. ARRANQUE DEL SISTEMA
  // =========================================================================
  window.addEventListener('DOMContentLoaded', async () => {
    loadStateFromDisk();
    bindUIEvents();

    const canvas = document.getElementById('viewfinder-gl-surface');
    initWebGL(canvas);
    await initCameraStream();

    switchCameraSystem(state.currentCamera);
    loadFilmStock(state.currentFilm);
    updateCounterDisplay();

    renderLoop();
  });

})();
