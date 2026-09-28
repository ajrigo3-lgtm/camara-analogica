/**
 * ANALOG VAULT — Heritage Simulation Engine v2.0
 * Advanced GLSL Shaders: Chromatic Aberration, Film S-Curves, Grain, Vignetting & Light Leaks.
 * Camera-Exclusive Film Stock Architecture.
 */

(() => {
  'use strict';

  // =========================================================================
  // 1. CATÁLOGO DE EMULSIONES EXCLUSIVAS POR CÁMARA
  // =========================================================================
  const FILM_DATABASE = {
    // LEICA M3 / MONOCHROM
    leica_ccd_m9: {
      id: 'leica_ccd_m9',
      brand: 'LEICA',
      name: 'M9 CCD KODAK',
      iso: 160,
      maxExposures: 36,
      shaderId: 10,
      desc: 'El mítico sensor CCD de Kodak: colores primarios densos, rojos vibrantes y microcontraste tridimensional.'
    },
    kodak_trix_push: {
      id: 'kodak_trix_push',
      brand: 'KODAK',
      name: 'TRI-X PUSH +2',
      iso: 1600,
      maxExposures: 36,
      shaderId: 11,
      desc: 'Blanco y negro forzado a ISO 1600 en revelador Rodinal. Grano de carbón grueso y negros absolutos.'
    },
    ilford_hp5: {
      id: 'ilford_hp5',
      brand: 'ILFORD',
      name: 'HP5 PLUS 400',
      iso: 400,
      maxExposures: 36,
      shaderId: 12,
      desc: 'Emulsión clásica británica. Rango tonal infinito, sombras transparentes y grano medio uniforme.'
    },

    // LOMOGRAPHY DIANA F+
    lomo_purple: {
      id: 'lomo_purple',
      brand: 'LOMOGRAPHY',
      name: 'LOMOCHROME PURPLE',
      iso: 400,
      maxExposures: 16,
      shaderId: 20,
      desc: 'Mutación infrarroja psicodélica: los verdes de la vegetación viran al púrpura intenso y los azules al turquesa.'
    },
    lomo_92_leaks: {
      id: 'lomo_92_leaks',
      brand: 'LOMOGRAPHY',
      name: 'COLOR 92 (LEAKS)',
      iso: 400,
      maxExposures: 16,
      shaderId: 21,
      desc: 'Colores noventeros nostálgicos, lente de plástico blanda con aberración cromática y fugas de luz accidentales.'
    },
    lomo_turquoise: {
      id: 'lomo_turquoise',
      brand: 'LOMOGRAPHY',
      name: 'LOMOCHROME TURQ.',
      iso: 200,
      maxExposures: 16,
      shaderId: 22,
      desc: 'Proceso cruzado experimental: cielos ámbar-dorados y tonos piel en cobalto brillante.'
    },

    // FUJIFILM X100 SERIES
    fuji_classic_chrome: {
      id: 'fuji_classic_chrome',
      brand: 'FUJIFILM',
      name: 'CLASSIC CHROME',
      iso: 200,
      maxExposures: 36,
      shaderId: 30,
      desc: 'Emulación documental Kodachrome: tonos de cielo apagados, sombras duras y altísimo dramatismo neutro.'
    },
    fuji_classic_neg: {
      id: 'fuji_classic_neg',
      brand: 'FUJIFILM',
      name: 'CLASSIC NEGATIVE',
      iso: 400,
      maxExposures: 36,
      shaderId: 31,
      desc: 'Inspirado en Fujicolor Superia: verdes esmeralda apagados, calidez en luces y fuerte contraste nostálgico.'
    },
    fuji_acros_red: {
      id: 'fuji_acros_red',
      brand: 'FUJIFILM',
      name: 'ACROS + FILTRO R',
      iso: 100,
      maxExposures: 36,
      shaderId: 32,
      desc: 'Blanco y negro con filtro físico rojo incorporado: cielos casi negros, texturas rocosas y piel suave.'
    },

    // HASSELBLAD 500 C/M (120 MEDIO FORMATO)
    kodak_portra_120: {
      id: 'kodak_portra_120',
      brand: 'KODAK',
      name: 'PORTRA 400 (120)',
      iso: 400,
      maxExposures: 12,
      shaderId: 40,
      desc: 'El estándar de oro del medio formato: grano microscópico, tonos de piel aterciopelados y sombras pastel.'
    },
    fuji_velvia_120: {
      id: 'fuji_velvia_120',
      brand: 'FUJIFILM',
      name: 'VELVIA 50 (120)',
      iso: 50,
      maxExposures: 12,
      shaderId: 41,
      desc: 'Diapositiva reversible de paisaje: saturación desbordante en puestas de sol, aguas turquesas y cero grano.'
    },
    kodak_ektar_100: {
      id: 'kodak_ektar_100',
      brand: 'KODAK',
      name: 'EKTAR 100 (120)',
      iso: 100,
      maxExposures: 12,
      shaderId: 42,
      desc: 'El negativo de color con el grano más fino del mundo: nitidez extrema y tonos vivos naturales.'
    },

    // INSTANTÁNEAS QUÍMICAS (INSTAX & POLAROID)
    instax_daylight: {
      id: 'instax_daylight',
      brand: 'FUJIFILM',
      name: 'INSTAX DAYLIGHT',
      iso: 800,
      maxExposures: 10,
      shaderId: 50,
      desc: 'Película química instantánea moderna: colores vivos, sombras con velo blanquecino y grano químico suave.'
    },
    polaroid_sx70_film: {
      id: 'polaroid_sx70_film',
      brand: 'POLAROID',
      name: 'SX-70 TIME-ZERO',
      iso: 160,
      maxExposures: 8,
      shaderId: 51,
      desc: 'La legendaria emulsión vintage de 1977: calidez general marrón/crema y dispersión de tintes suave.'
    },

    // PROCESOS HISTÓRICOS SIGLO XIX
    cyanotype_herschel: {
      id: 'cyanotype_herschel',
      brand: 'HISTORICAL',
      name: 'CYANOTYPE 1842',
      iso: 12,
      maxExposures: 6,
      shaderId: 60,
      desc: 'Monocromo férrico Azul de Prusia. Pérdida periférica y grano basado en fibras de papel de algodón.'
    },
    wet_plate_collodion: {
      id: 'wet_plate_collodion',
      brand: 'HISTORICAL',
      name: 'COLODIÓN HÚMEDO',
      iso: 5,
      maxExposures: 4,
      shaderId: 61,
      desc: 'Proceso fotográfico de 1851: sombras de plata metálica, aberración esférica de borde y manchas químicas.'
    }
  };

  // =========================================================================
  // 2. CONFIGURACIÓN DE CUERPOS DE CÁMARA Y SUS CARRETES EXCLUSIVOS
  // =========================================================================
  const CAMERA_PROFILES = {
    leica_m3: {
      name: 'Leica M3 / M-System',
      brand: 'LEITZ',
      model: 'M3 · WETZLAR',
      themeClass: 'theme-leica-m',
      mechanicalAdvance: true,
      reticleId: 'rangefinder-overlay',
      supportedFilms: ['leica_ccd_m9', 'kodak_trix_push', 'ilford_hp5']
    },
    lomo_diana: {
      name: 'Lomography Diana F+',
      brand: 'LOMOGRAPHY',
      model: 'DIANA F+ · TOY LENS',
      themeClass: 'theme-lomo-diana',
      mechanicalAdvance: true,
      reticleId: 'instant-view-overlay',
      supportedFilms: ['lomo_purple', 'lomo_92_leaks', 'lomo_turquoise']
    },
    fuji_x100: {
      name: 'Fujifilm X100 Series',
      brand: 'FUJIFILM',
      model: 'X100 VI · HYBRID OVF',
      themeClass: 'theme-fuji-x100',
      mechanicalAdvance: false,
      reticleId: 'rangefinder-overlay',
      supportedFilms: ['fuji_classic_chrome', 'fuji_classic_neg', 'fuji_acros_red']
    },
    hasselblad_500: {
      name: 'Hasselblad 500 C/M',
      brand: 'HASSELBLAD',
      model: '500 C/M · 6x6 SWEDEN',
      themeClass: 'theme-hasselblad',
      mechanicalAdvance: true,
      reticleId: 'waist-level-overlay',
      supportedFilms: ['kodak_portra_120', 'fuji_velvia_120', 'kodak_ektar_100']
    },
    instax_retro: {
      name: 'Instant Box 100',
      brand: 'INSTAX',
      model: 'INSTANT NEO 100',
      themeClass: 'theme-instax',
      mechanicalAdvance: false,
      reticleId: 'instant-view-overlay',
      isInstant: true,
      supportedFilms: ['instax_daylight']
    },
    polaroid_sx70: {
      name: 'Polaroid SX-70 Land Camera',
      brand: 'POLAROID',
      model: 'SX-70 FOLDING SLR',
      themeClass: 'theme-polaroid-sx70',
      mechanicalAdvance: false,
      reticleId: 'instant-view-overlay',
      isInstant: true,
      supportedFilms: ['polaroid_sx70_film']
    },
    cyanotype_box: {
      name: 'Cámara de Fuelle John Herschel',
      brand: 'HERSCHEL',
      model: '1842 EXPERIMENTAL BOX',
      themeClass: 'theme-cyanotype',
      mechanicalAdvance: true,
      reticleId: 'cyanotype-overlay',
      supportedFilms: ['cyanotype_herschel', 'wet_plate_collodion']
    }
  };

  // =========================================================================
  // 3. ESTADO GLOBAL
  // =========================================================================
  const state = {
    currentCamera: 'leica_m3',
    currentFilm: 'leica_ccd_m9',
    shutterArmed: true,
    exposuresTaken: 0,
    latentRoll: [],
    developedRolls: [],
    shutterSpeeds: ['1/1000', '1/500', '1/250', '1/125', '1/60', '1/30', 'B'],
    currentSpeedIndex: 2,
    stream: null
  };

  // =========================================================================
  // 4. SHADERS GLSL AVANZADOS (RESPUESTAS QUÍMICAS REALISTAS)
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
    precision highp float;
    varying vec2 v_uv;
    uniform sampler2D u_image;
    uniform int u_shaderId;
    uniform float u_time;
    uniform float u_grainAmount;

    // Ruido pseudo-aleatorio de haluros de plata
    float hash(vec2 p) {
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
      return fract(p.x * p.y);
    }

    // Curva S analógica para simular respuesta densitrométrica (Curva Hurter & Driffield)
    vec3 filmCurve(vec3 x) {
      return x * x * (3.0 - 2.0 * x);
    }

    void main() {
      vec2 uv = v_uv;
      float distFromCenter = distance(uv, vec2(0.5));
      
      // Aberración cromática periférica para lentes de plástico (Lomography y Colodión)
      vec3 color;
      if (u_shaderId >= 20 && u_shaderId <= 22 || u_shaderId == 61) {
        float ca = distFromCenter * 0.015;
        color.r = texture2D(u_image, uv + vec2(ca, 0.0)).r;
        color.g = texture2D(u_image, uv).g;
        color.b = texture2D(u_image, uv - vec2(ca, 0.0)).b;
      } else {
        color = texture2D(u_image, uv).rgb;
      }

      // Grano físico orgánico (mayor en zonas de sombra y medios tonos)
      float luminance = dot(color, vec3(0.299, 0.587, 0.114));
      float grainDistribution = 1.0 - abs(luminance - 0.5) * 1.8;
      float noise = (hash(uv * 900.0 + fract(u_time * 10.0)) - 0.5) * u_grainAmount * max(grainDistribution, 0.15);

      // -----------------------------------------------------------------------
      // LEICA M-SYSTEM
      // -----------------------------------------------------------------------
      if (u_shaderId == 10) {
        // Leica M9 CCD: Contraste lineal puro, saturación selectiva en rojos/amarillos
        color = pow(color, vec3(1.05));
        color.r *= 1.14;
        color.g *= 0.98;
        color += noise * 0.4;
      }
      else if (u_shaderId == 11) {
        // Kodak Tri-X 400 Push +2: Blanco y negro contrastado y grano duro
        float lum = dot(color, vec3(0.3, 0.59, 0.11));
        lum = smoothstep(0.12, 0.95, lum);
        color = vec3(lum) + (noise * 2.2);
      }
      else if (u_shaderId == 12) {
        // Ilford HP5 Plus: Rango de grises suave y homogéneo
        float lum = dot(color, vec3(0.28, 0.60, 0.12));
        color = vec3(lum * 0.96 + 0.02) + (noise * 0.9);
      }

      // -----------------------------------------------------------------------
      // LOMOGRAPHY DIANA F+ (Efectos de lente plástica, virados y fugas de luz)
      // -----------------------------------------------------------------------
      else if (u_shaderId == 20) {
        // LomoChrome Purple: Verdes a morado, amarillos a rosa, azules a turquesa
        vec3 pColor = color;
        pColor.r = color.g * 1.25 + color.r * 0.3;
        pColor.g = color.b * 0.65;
        pColor.b = color.g * 1.1 + color.b * 0.4;
        color = mix(color, pColor, 0.85);
        color = filmCurve(color);
        // Viñeteo agresivo de túnel
        color *= smoothstep(0.72, 0.18, distFromCenter);
        color += noise * 1.3;
      }
      else if (u_shaderId == 21) {
        // LomoColor 92 con Fugas de Luz laterales (Light Leaks)
        color = pow(color, vec3(0.95));
        color.r *= 1.15;
        color.b *= 0.88;
        // Fuga de luz naranja/roja accidental entrando por el lateral derecho
        float leak = smoothstep(0.2, 1.0, uv.x) * (0.35 + 0.1 * sin(u_time * 2.0));
        color += vec3(leak * 0.8, leak * 0.25, leak * 0.05);
        color *= smoothstep(0.75, 0.25, distFromCenter); // Viñeta
        color += noise * 1.2;
      }
      else if (u_shaderId == 22) {
        // LomoChrome Turquoise: Virado cian cruzado
        vec3 tColor = color;
        tColor.r = color.b * 0.3;
        tColor.g = color.r * 0.9 + color.g * 0.3;
        tColor.b = color.g * 1.3;
        color = mix(color, tColor, 0.85);
        color *= smoothstep(0.70, 0.20, distFromCenter);
        color += noise * 1.2;
      }

      // -----------------------------------------------------------------------
      // FUJIFILM X100 SERIES
      // -----------------------------------------------------------------------
      else if (u_shaderId == 30) {
        // Classic Chrome: Sombras duras, saturación de azul cian apagada
        color = filmCurve(color);
        color.b = mix(color.b, color.g, 0.18);
        color = mix(vec3(luminance), color, 0.78);
        color += noise * 0.35;
      }
      else if (u_shaderId == 31) {
        // Classic Negative: Verdes oscuros cálidos y sombras magenta
        color.g *= 0.92;
        color.r = pow(color.r, 0.95) * 1.06;
        color = filmCurve(color);
        color += noise * 0.45;
      }
      else if (u_shaderId == 32) {
        // Acros + Filtro Rojo: Monocromo rico con supresión de tonos azules
        float redFilterLum = color.r * 0.65 + color.g * 0.30 + color.b * 0.05;
        redFilterLum = smoothstep(0.08, 0.96, redFilterLum);
        color = vec3(redFilterLum) + (noise * 0.5);
      }

      // -----------------------------------------------------------------------
      // HASSELBLAD 500 C/M (120 MEDIO FORMATO)
      // -----------------------------------------------------------------------
      else if (u_shaderId == 40) {
        // Kodak Portra 400 (120): Máxima riqueza tonal, sombras lavadas
        color.r = pow(color.r, 0.92) * 1.04;
        color.g = pow(color.g, 0.95);
        color.b = pow(color.b, 1.05) * 0.96;
        color += vec3(0.02, 0.015, 0.01); // Sombras levantadas
        color += noise * 0.3; // Micrograno finísimo de 120mm
      }
      else if (u_shaderId == 41) {
        // Fujichrome Velvia 50 (120): Saturación desbordante
        color = pow(color, vec3(1.22));
        color.g *= 1.20;
        color.b *= 1.18;
        color.r *= 1.08;
      }
      else if (u_shaderId == 42) {
        // Kodak Ektar 100: Nitidez analógica pura y contraste saturado
        color = filmCurve(color);
        color.r *= 1.08;
        color.b *= 1.04;
        color += noise * 0.2;
      }

      // -----------------------------------------------------------------------
      // INSTANTÁNEAS (INSTAX & POLAROID)
      // -----------------------------------------------------------------------
      else if (u_shaderId == 50) {
        // Instax Daylight: Tonalidad pastel y sombras con velo blanquecino
        color = mix(color, vec3(luminance), 0.15);
        color += vec3(0.04, 0.035, 0.03); // Velo químico
        color = filmCurve(color);
        color += noise * 0.6;
      }
      else if (u_shaderId == 51) {
        // Polaroid SX-70 Time-Zero: Virado cálido vintage y caída de bordes
        color.r *= 1.18;
        color.g *= 1.04;
        color.b *= 0.82;
        color = mix(color, vec3(0.85, 0.75, 0.60), 0.12);
        color *= smoothstep(0.85, 0.35, distFromCenter);
        color += noise * 0.7;
      }

      // -----------------------------------------------------------------------
      // TÉCNICAS HISTÓRICAS DEL SIGLO XIX
      // -----------------------------------------------------------------------
      else if (u_shaderId == 60) {
        // Cianotipia John Herschel 1842: Azul de Prusia
        vec3 prussianBlue = vec3(0.03, 0.21, 0.44);
        vec3 paperHighlight = vec3(0.93, 0.95, 0.97);
        color = mix(prussianBlue, paperHighlight, luminance);
        color *= smoothstep(0.80, 0.30, distFromCenter);
        color += noise * 0.8;
      }
      else if (u_shaderId == 61) {
        // Colodión Húmedo 1851: Contraste áspero y bordes manchados de plata
        float lum = smoothstep(0.15, 0.92, luminance);
        vec3 collodionTone = mix(vec3(0.05, 0.04, 0.03), vec3(0.92, 0.88, 0.82), lum);
        // Mancha física de colodión en los bordes
        float edgeDamage = smoothstep(0.35, 0.75, distFromCenter);
        collodionTone = mix(collodionTone, vec3(0.1, 0.08, 0.05), edgeDamage * 0.7);
        color = collodionTone + (noise * 1.5);
      }

      gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
    }
  `;

  // =========================================================================
  // 5. MOTOR WEBGL
  // =========================================================================
  let gl, glProgram, glTexture;
  let uShaderIdLoc, uTimeLoc, uGrainLoc;

  function initWebGL(canvas) {
    gl = canvas.getContext('webgl', { preserveDrawingBuffer: true });
    if (!gl) return console.error('WebGL no soportado.');

    const createShader = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error('Error compilando shader:', gl.getShaderInfoLog(s));
      }
      return s;
    };

    const vs = createShader(gl.VERTEX_SHADER, VS_SOURCE);
    const fs = createShader(gl.FRAGMENT_SHADER, FS_SOURCE);
    glProgram = gl.createProgram();
    gl.attachShader(glProgram, vs);
    gl.attachShader(glProgram, fs);
    gl.linkProgram(glProgram);
    gl.useProgram(glProgram);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,  1, -1, -1,  1,
      -1,  1,  1, -1,  1,  1
    ]), gl.STATIC_DRAW);

    const aPosLoc = gl.getAttribLocation(glProgram, 'a_position');
    gl.enableVertexAttribArray(aPosLoc);
    gl.vertexAttribPointer(aPosLoc, 2, gl.FLOAT, false, 0, 0);

    glTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, glTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    uShaderIdLoc = gl.getUniformLocation(glProgram, 'u_shaderId');
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

      const film = FILM_DATABASE[state.currentFilm];
      gl.uniform1i(uShaderIdLoc, film.shaderId);
      gl.uniform1f(uTimeLoc, performance.now() * 0.001);
      gl.uniform1f(uGrainLoc, film.iso >= 800 ? 0.16 : (film.iso >= 400 ? 0.09 : 0.035));

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    requestAnimationFrame(renderLoop);
  }

  // =========================================================================
  // 6. CONTROLADORES DE CÁMARA Y DISPOSITIVO
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
      console.warn('Fallback a sensor por defecto');
      const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      video.srcObject = fallbackStream;
      await video.play();
    }
  }

  // =========================================================================
  // 7. MECÁNICA DE DISPARO Y RESTRICCIÓN DE PELÍCULA
  // =========================================================================
  function triggerShutter() {
    const cam = CAMERA_PROFILES[state.currentCamera];
    const film = FILM_DATABASE[state.currentFilm];

    if (cam.mechanicalAdvance && !state.shutterArmed) {
      flashMechanicalFeedback('¡ARRASTRA LA PELÍCULA CON LA PALANCA!');
      return;
    }

    if (state.exposuresTaken >= film.maxExposures) {
      flashMechanicalFeedback('¡CARRETE TERMINADO! VE AL LABORATORIO.');
      return;
    }

    if (navigator.vibrate) navigator.vibrate([20, 40, 20]);

    const canvas = document.getElementById('viewfinder-gl-surface');
    const capturedDataUrl = canvas.toDataURL('image/jpeg', 0.95);

    if (cam.isInstant) {
      state.exposuresTaken++;
      updateCounterDisplay();
      ejectInstantPrint(capturedDataUrl);
    } else {
      state.latentRoll.push({
        frameNumber: state.exposuresTaken + 1,
        filmName: film.name,
        filmBrand: film.brand,
        cameraName: cam.name,
        timestamp: new Date().toLocaleTimeString(),
        dataUrl: capturedDataUrl
      });

      state.exposuresTaken++;
      state.shutterArmed = !cam.mechanicalAdvance;
      updateCounterDisplay();
      updateAdvanceLeverState();
      saveStateToDisk();
    }

    flashShutterBlades();
  }

  function advanceFilmManually() {
    if (state.shutterArmed) return;
    const lever = document.getElementById('film-advance-lever');
    
    lever.classList.add('lever-wound');
    if (navigator.vibrate) navigator.vibrate(35);

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
      lever.style.opacity = '0.25';
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
    flash.style.transition = 'opacity 0.08s ease-out';
    housing.appendChild(flash);
    setTimeout(() => {
      flash.style.opacity = '0';
      setTimeout(() => flash.remove(), 90);
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
    const film = FILM_DATABASE[state.currentFilm];
    counter.innerText = state.exposuresTaken === 0 ? 'S' : String(state.exposuresTaken).padStart(2, '0');

    const labLed = document.getElementById('darkroom-alert-led');
    if (state.exposuresTaken >= film.maxExposures) {
      labLed.classList.add('ready-to-develop');
      document.getElementById('lab-roll-status').innerText = 'ROLLO TERMINADO';
    } else {
      labLed.classList.remove('ready-to-develop');
      document.getElementById('lab-roll-status').innerText = 'CARGADO';
    }
  }

  // =========================================================================
  // 8. SELECTOR DINÁMICO DE CARRETES EXCLUSIVOS POR CÁMARA
  // =========================================================================
  function renderDynamicFilmSelector() {
    const container = document.getElementById('dynamic-film-container');
    const cam = CAMERA_PROFILES[state.currentCamera];
    container.innerHTML = '';

    document.getElementById('film-modal-title').innerText = `CARRETES PARA ${cam.brand}`;

    cam.supportedFilms.forEach(filmKey => {
      const film = FILM_DATABASE[filmKey];
      const isSelected = state.currentFilm === filmKey;

      const card = document.createElement('div');
      card.className = `film-pack-card ${isSelected ? 'active-film-item' : ''}`;
      card.innerHTML = `
        <div class="film-cartridge-visual">
          <span class="canister-ridge"></span>
        </div>
        <div class="film-details">
          <div class="film-title">${film.brand} ${film.name}</div>
          <div class="spec-pills">
            <span>ISO ${film.iso}</span>
            <span>${film.maxExposures} DISPAROS</span>
          </div>
          <p class="film-desc">${film.desc}</p>
        </div>
      `;

      card.onclick = () => {
        loadFilmStock(filmKey);
        document.getElementById('modal-film-catalog').close();
      };

      container.appendChild(card);
    });
  }

  function switchCameraSystem(cameraId) {
    const cam = CAMERA_PROFILES[cameraId];
    if (!cam) return;

    state.currentCamera = cameraId;
    const body = document.getElementById('camera-runtime');

    Object.values(CAMERA_PROFILES).forEach(c => body.classList.remove(c.themeClass));
    body.classList.add(cam.themeClass);

    document.getElementById('label-camera-brand').innerText = cam.brand;
    document.getElementById('label-camera-model').innerText = cam.model;

    document.querySelectorAll('.optical-mask').forEach(m => m.classList.add('optical-mask-hidden'));
    const activeReticle = document.getElementById(cam.reticleId);
    if (activeReticle) activeReticle.classList.remove('optical-mask-hidden');

    // Asignar automáticamente el primer carrete compatible si el actual no lo es
    if (!cam.supportedFilms.includes(state.currentFilm)) {
      loadFilmStock(cam.supportedFilms[0]);
    }

    updateAdvanceLeverState();
    saveStateToDisk();
  }

  function loadFilmStock(filmId) {
    const film = FILM_DATABASE[filmId];
    if (!film) return;

    state.currentFilm = filmId;
    state.exposuresTaken = 0;
    state.latentRoll = [];
    state.shutterArmed = true;

    document.getElementById('film-tab-brand').innerText = film.brand;
    document.getElementById('film-tab-name').innerText = film.name;
    document.getElementById('film-tab-iso').innerText = `ISO ${film.iso} · ${film.maxExposures} EXP`;

    updateCounterDisplay();
    saveStateToDisk();
  }

  // =========================================================================
  // 9. INSTANTÁNEAS Y LABORATORIO DE REVELADO
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

      setTimeout(() => {
        sheet.classList.add('film-sheet-ejected');
        setTimeout(() => canvas.classList.add('developed'), 1000);
      }, 50);
    };
    img.src = dataUrl;

    sheet.onclick = () => {
      sheet.classList.remove('film-sheet-ejected');
      setTimeout(() => slot.classList.add('ejection-slot-hidden'), 800);
    };
  }

  function enterDarkroom() {
    const vault = document.getElementById('darkroom-vault');
    vault.classList.remove('darkroom-hidden');

    const devBay = document.getElementById('chemical-processing-bay');
    const lightBoxBay = document.getElementById('lightbox-inspection-bay');

    if (state.latentRoll.length > 0) {
      devBay.classList.remove('processing-bay-hidden');
      lightBoxBay.classList.add('lightbox-bay-hidden');
      document.getElementById('darkroom-status-readout').innerText = 'BAÑO QUÍMICO PREPARADO';
    } else {
      devBay.classList.add('processing-bay-hidden');
      lightBoxBay.classList.remove('lightbox-bay-hidden');
      document.getElementById('darkroom-status-readout').innerText = 'MESA DE LUZ & NEGATIVOS';
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
      { name: '1. BAÑO DE REVELADOR (D-76 / C-41)', time: 3 },
      { name: '2. BAÑO DE PARO ÁCIDO', time: 2 },
      { name: '3. FIJADOR RÁPIDO DE HALUROS', time: 3 }
    ];

    let currentStep = 0;

    function runStep() {
      if (currentStep >= steps.length) {
        instruction.innerText = '¡REVELADO COMPLETADO! Positivando negativos en mesa de luz...';
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
      instruction.innerText = `Procesando: ${s.name}`;
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
      container.innerHTML = '<p style="color:#333; font-size:12px; padding:20px;">No hay negativos archivados en el laboratorio.</p>';
      return;
    }

    allFrames.forEach((frame, idx) => {
      const node = document.createElement('div');
      node.className = 'film-frame-node';
      node.innerHTML = `
        <div class="sprocket-holes-top"></div>
        <img src="${frame.dataUrl}" class="film-negative-img" alt="Fotograma ${idx + 1}">
        <div class="sprocket-holes-bottom"></div>
        <div style="font-size:7px; color:#555; text-align:center; margin-top:2px;">#${String(idx + 1).padStart(2, '0')} · ${frame.filmName}</div>
      `;

      node.onclick = () => openEnlarger(frame.dataUrl, idx + 1, frame.filmName);
      container.appendChild(node);
    });
  }

  function openEnlarger(dataUrl, frameNum, filmName) {
    const modal = document.getElementById('modal-enlarger-preview');
    document.getElementById('enlarger-frame-title').innerText = `POSITIVO #${frameNum} · ${filmName}`;
    document.getElementById('enlarger-image-target').src = dataUrl;
    document.getElementById('btn-download-highres').href = dataUrl;
    modal.showModal();
  }

  // =========================================================================
  // 10. PERSISTENCIA
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
      console.warn('Almacenamiento local lleno.');
    }
  }

  function loadStateFromDisk() {
    try {
      const raw = localStorage.getItem('analog_vault_state');
      if (raw) {
        const parsed = JSON.parse(raw);
        state.currentCamera = parsed.currentCamera || 'leica_m3';
        state.currentFilm = parsed.currentFilm || 'leica_ccd_m9';
        state.exposuresTaken = parsed.exposuresTaken || 0;
        state.shutterArmed = parsed.shutterArmed ?? true;
        state.latentRoll = parsed.latentRoll || [];
        state.developedRolls = parsed.developedRolls || [];
      }
    } catch (e) {}
  }

  // =========================================================================
  // 11. BINDING DE EVENTOS
  // =========================================================================
  function bindUIEvents() {
    document.getElementById('shutter-trigger').addEventListener('click', triggerShutter);
    document.getElementById('film-advance-lever').addEventListener('click', advanceFilmManually);

    const cameraModal = document.getElementById('modal-camera-catalog');
    const filmModal = document.getElementById('modal-film-catalog');
    const enlargerModal = document.getElementById('modal-enlarger-preview');

    document.getElementById('btn-camera-system').addEventListener('click', () => cameraModal.showModal());
    document.getElementById('btn-close-camera-catalog').addEventListener('click', () => cameraModal.close());

    document.getElementById('btn-open-film-drawer').addEventListener('click', () => {
      renderDynamicFilmSelector();
      filmModal.showModal();
    });
    document.getElementById('btn-close-film-catalog').addEventListener('click', () => filmModal.close());
    document.getElementById('btn-close-enlarger').addEventListener('click', () => enlargerModal.close());

    // Selección de Cámara
    document.querySelectorAll('.camera-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.camera-card').forEach(c => c.classList.remove('active-card'));
        card.classList.add('active-card');
        const camId = card.getAttribute('data-camera-system');
        switchCameraSystem(camId);
        cameraModal.close();
      });
    });

    // Dial de Velocidades
    document.getElementById('shutter-speed-knob').addEventListener('click', () => {
      state.currentSpeedIndex = (state.currentSpeedIndex + 1) % state.shutterSpeeds.length;
      document.getElementById('readout-shutter-speed').innerText = state.shutterSpeeds[state.currentSpeedIndex];
      if (navigator.vibrate) navigator.vibrate(10);
    });

    // Laboratorio Químico
    document.getElementById('btn-enter-darkroom').addEventListener('click', enterDarkroom);
    document.getElementById('btn-return-camera').addEventListener('click', exitDarkroom);
    document.getElementById('btn-trigger-development').addEventListener('click', startChemicalDevelopment);
  }

  // =========================================================================
  // 12. ARRANQUE
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
