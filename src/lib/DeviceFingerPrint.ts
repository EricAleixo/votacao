// Gera um fingerprint único do dispositivo do usuário
export async function getDeviceFingerprint(): Promise<string> {
  const components: string[] = [];

  // 1. User Agent
  components.push(navigator.userAgent);

  // 2. Idioma
  components.push(navigator.language);

  // 3. Timezone
  components.push(Intl.DateTimeFormat().resolvedOptions().timeZone);

  // 4. Resolução da tela
  components.push(`${screen.width}x${screen.height}x${screen.colorDepth}`);

  // 5. Platform
  components.push(navigator.platform);

  // 6. Hardware Concurrency (núcleos do processador)
  components.push(String(navigator.hardwareConcurrency || 0));

  // 7. Device Memory (se disponível)
  components.push(String((navigator as any).deviceMemory || 0));

  // 8. Canvas Fingerprint (mais único)
  const canvasFingerprint = getCanvasFingerprint();
  components.push(canvasFingerprint);

  // 9. WebGL Fingerprint
  const webglFingerprint = getWebGLFingerprint();
  components.push(webglFingerprint);

  // Combina tudo e gera um hash
  const fingerprint = components.join('|');
  return await hashString(fingerprint);
}

// Gera fingerprint do Canvas
function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'no-canvas';

    const text = 'fingerprint123';
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText(text, 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText(text, 4, 17);

    return canvas.toDataURL();
  } catch {
    return 'canvas-error';
  }
}

// Gera fingerprint do WebGL
function getWebGLFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext;
    if (!gl) return 'no-webgl';

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return 'no-debug-info';

    const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);

    return `${vendor}~${renderer}`;
  } catch {
    return 'webgl-error';
  }
}

// Gera hash SHA-256 de uma string
async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}