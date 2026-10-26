import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity, ArrowUpRight, Bell, Camera, Check, ChevronDown, CircleHelp,
  ClipboardList, Clock3, CreditCard, Gauge, LogOut, Menu, MessageCircle,
  Plus, RefreshCw, Search, Settings, ShieldCheck, Smartphone, Sparkles, Store, Users, Wrench, X, Upload, PhoneCall, QrCode, Package, Sliders, Trash2, CheckSquare, Printer, Star, DollarSign, Send, Calendar, Clock, Lock, UserPlus, AlertTriangle, History, Wallet, MapPin, Copy, FileText, HeartHandshake, Key, CheckCircle2, XCircle, Eraser, ShoppingCart, Truck, UserCheck, CheckCircle, Tv, Maximize2, Minimize2, Pencil
} from 'lucide-react';
import { supabase, supabaseConfigured } from './lib/supabase';

// Ícone SVG nativo de Código de Barras (evita erro de versão do lucide-react no Render)
function BarcodeIcon({ size = 16, color = "currentColor", style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="M3 5v14M8 5v14M12 5v14M17 5v14M21 5v14M6 5v14M14 5v14M19 5v14" />
    </svg>
  );
}


const ADMIN_EMAIL = 'roberthaelley75@gmail.com';

// Gera o payload Pix estático no padrão EMV/BR Code e o renderiza como QR.
// O QR contém a chave cadastrada; não confirma o recebimento do pagamento.
function pixTlv(id, value) {
  const v = String(value ?? '');
  return `${id}${String(v.length).padStart(2, '0')}${v}`;
}
function pixCrc16(payload) {
  let crc = 0xFFFF;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) : (crc << 1);
    crc &= 0xFFFF;
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}
function buildPixPayload(key, merchantName = 'RT MOBILE', merchantCity = 'CASTANHAL', amount = 50) {
  const pixKey = String(key || '').trim();
  if (!pixKey) return '';
  const name = String(merchantName || 'RT MOBILE').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Za-z0-9 ]/g, '').trim().slice(0, 25) || 'RT MOBILE';
  const city = String(merchantCity || 'CASTANHAL').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Za-z0-9 ]/g, '').trim().slice(0, 15) || 'CASTANHAL';
  const merchantAccount = pixTlv('00', 'BR.GOV.BCB.PIX') + pixTlv('01', pixKey);
  const txid = '***';
  let payload = pixTlv('00', '01') + pixTlv('01', '11') + pixTlv('26', merchantAccount) +
    pixTlv('52', '0000') + pixTlv('53', '986');
  if (Number.isFinite(Number(amount)) && Number(amount) > 0) payload += pixTlv('54', Number(amount).toFixed(2));
  payload += pixTlv('58', 'BR') + pixTlv('59', name) + pixTlv('60', city) + pixTlv('62', pixTlv('05', txid)) + '6304';
  return payload + pixCrc16(payload);
}
function PixQrCode({ pixKey, name = 'RT MOBILE', city = 'CASTANHAL', amount, size = 140 }) {
  const payload = buildPixPayload(pixKey, name, city, amount);
  if (!payload) return <div style={{width:size,height:size,display:'grid',placeItems:'center',color:'#aaa',fontSize:12,textAlign:'center'}}>Cadastre uma chave Pix para gerar o QR Code.</div>;
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(payload)}`;
  return <img src={src} alt="QR Code Pix" width={size} height={size} style={{display:'block',width:size,height:size,objectFit:'contain',background:'#fff',padding:6,borderRadius:8}} />;
}

function createRtOperationId(prefix = 'op') {
  const randomPart = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${randomPart}`;
}

function getOrCreateRtAttemptId(storageKey, prefix = 'op') {
  try {
    const existing = sessionStorage.getItem(storageKey);
    if (existing) return existing;
    const created = createRtOperationId(prefix);
    sessionStorage.setItem(storageKey, created);
    return created;
  } catch {
    return createRtOperationId(prefix);
  }
}

const seminovosList = [
  'iPhone 11', 'iPhone 11 Pro', 'iPhone 11 Pro Max',
  'iPhone 12', 'iPhone 12 Pro', 'iPhone 12 Pro Max',
  'iPhone 13', 'iPhone 13 Pro', 'iPhone 13 Pro Max',
  'iPhone 14', 'iPhone 14 Plus', 'iPhone 14 Pro', 'iPhone 14 Pro Max',
  'iPhone 15', 'iPhone 15 Plus', 'iPhone 15 Pro', 'iPhone 15 Pro Max',
  'iPhone 16', 'iPhone 16 Plus', 'iPhone 16 Pro', 'iPhone 16 Pro Max',
];

const lacradosList = [
  'iPhone 13', 'iPhone 13 Pro', 'iPhone 13 Pro Max',
  'iPhone 14', 'iPhone 14 Pro', 'iPhone 14 Pro Max',
  'iPhone 15', 'iPhone 15 Pro', 'iPhone 15 Pro Max',
  'iPhone 16', 'iPhone 16 Pro', 'iPhone 16 Pro Max',
  'iPhone 17', 'iPhone 17 Pro', 'iPhone 17 Pro Max',
  'iPhone 18', 'iPhone 18 Pro', 'iPhone 18 Pro Max',
];

const xiaomiList = [
  'Redmi A5 4G', 'Redmi 15 4G', 'Redmi 15C 4G',
  'Redmi Note 15 Pro 5G', 'Redmi Note 15 Pro Plus 5G',
  'Redmi 17 4G', 'Redmi Note 17 4G',
  'Poco C71 4G', 'Poco C81 Pro 4G',
  'Poco X7 Pro 5G', 'Poco X8 Pro 5G', 'Poco X8 Pro Max 5G',
  'Poco F9 Pro 5G', 'Xiaomi 14 Ultra', 'Xiaomi 15 Pro'
];

const realmeList = [
  'Realme Note 70 4G', 'Realme C75 5G', 'Realme C85 4G NFC'
];

const imgSeminovo = 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=300&auto=format&fit=crop&q=80';
const imgLacrado = 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&auto=format&fit=crop&q=80';
const imgXiaomi = 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=300&auto=format&fit=crop&q=80';
const imgRealme = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&auto=format&fit=crop&q=80';

const adminWhatsapp = '5591989117332';
const adminPixKey = '91989117332';

const defaultChecklist = {
  screen: 'ok',
  faceId: 'ok',
  cameras: 'ok',
  charging: 'ok',
  audio: 'ok',
  wifi: 'ok',
  housing: 'ok',
};

const statusClass = (status) => ({
  'Em manutenção': 'blue',
  'Aguardando peça': 'amber',
  'Em diagnóstico': 'violet',
  'Pronto para retirada': 'green',
  'Recebido': 'neutral',
  'Aguardando aprovação': 'amber',
  'Entregue': 'green',
}[status] || 'neutral');

const orderSteps = [
  'Recebido',
  'Em diagnóstico',
  'Aguardando peça',
  'Em manutenção',
  'Pronto para retirada',
  'Entregue'
];

/* COMPONENTE DE CÂMERA SCANNER DE CÓDIGO DE BARRAS */
function BarcodeCameraScanner({ onDetected, onClose }) {
  const videoRef = useRef(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [scannerStatus, setScannerStatus] = useState('Preparando câmera e leitor...');
  const streamRef = useRef(null);
  const readerControlsRef = useRef(null);
  const detectedRef = useRef(false);
  const onDetectedRef = useRef(onDetected);
  useEffect(() => { onDetectedRef.current = onDetected; }, [onDetected]);

  useEffect(() => {
    let active = true;
    let detector = null;
    let rafId = null;

    const stopCamera = () => {
      try { readerControlsRef.current?.stop?.(); } catch (e) {}
      readerControlsRef.current = null;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (rafId !== null) cancelAnimationFrame(rafId);
    };

    const reportDetected = (value) => {
      if (!active || detectedRef.current || !value) return;
      detectedRef.current = true;
      setScannerStatus('Código reconhecido!');
      stopCamera();
      onDetectedRef.current?.(String(value).trim());
    };

    const loadZXingFallback = () => new Promise((resolve, reject) => {
      if (window.ZXing?.BrowserMultiFormatReader) return resolve(window.ZXing);
      const existing = document.querySelector('script[data-rt-zxing="true"]');
      if (existing) {
        existing.addEventListener('load', () => resolve(window.ZXing), { once: true });
        existing.addEventListener('error', reject, { once: true });
        if (window.ZXing?.BrowserMultiFormatReader) resolve(window.ZXing);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@zxing/library@0.21.3/umd/index.min.js';
      script.async = true;
      script.dataset.rtZxing = 'true';
      script.onload = () => window.ZXing?.BrowserMultiFormatReader ? resolve(window.ZXing) : reject(new Error('Biblioteca de leitura não carregou.'));
      script.onerror = () => reject(new Error('Não foi possível carregar o leitor automático. Verifique a conexão com a internet.'));
      document.head.appendChild(script);
    });

    const start = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setErrorMsg('Este navegador não permite acessar a câmera. Abra o RT Mobile em um navegador atualizado e usando HTTPS.');
        return;
      }

      // Preferência: leitor nativo do navegador quando disponível.
      if ('BarcodeDetector' in window) {
        try {
          detector = new window.BarcodeDetector({
            formats: ['ean_13', 'ean_8', 'code_128', 'code_39', 'upc_a', 'upc_e', 'itf', 'codabar']
          });
        } catch (e) { detector = null; }
      }

      try {
        if (detector) {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }
          });
          if (!active) { stream.getTracks().forEach(track => track.stop()); return; }
          streamRef.current = stream;
          if (!videoRef.current) throw new Error('A tela da câmera não ficou disponível.');
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setScannerStatus('Aponte para o código de barras e mantenha-o dentro da faixa.');
          const scanLoop = async () => {
            if (!active || detectedRef.current) return;
            const video = videoRef.current;
            if (video && video.readyState >= 2) {
              try {
                const codes = await detector.detect(video);
                if (codes?.length && codes[0]?.rawValue) {
                  reportDetected(codes[0].rawValue);
                  return;
                }
              } catch (e) { /* ignora quadro sem leitura */ }
            }
            if (active && !detectedRef.current) rafId = requestAnimationFrame(scanLoop);
          };
          rafId = requestAnimationFrame(scanLoop);
          return;
        }

        // Fallback: ZXing para navegadores (incluindo celulares) sem BarcodeDetector.
        setScannerStatus('Ativando leitor compatível com este navegador...');
        const ZXing = await loadZXingFallback();
        if (!active) return;
        if (!videoRef.current) throw new Error('A tela da câmera não ficou disponível.');
        const reader = new ZXing.BrowserMultiFormatReader();
        setScannerStatus('Aponte para o código de barras e mantenha-o dentro da faixa.');
        const controls = await reader.decodeFromVideoDevice(
          undefined,
          videoRef.current,
          (result, err) => {
            if (result) reportDetected(result.getText());
          }
        );
        if (active) readerControlsRef.current = controls;
        else controls?.stop?.();
      } catch (err) {
        if (!active) return;
        setErrorMsg(err?.message || 'Não foi possível iniciar a leitura automática. Confira a permissão da câmera e tente novamente.');
      }
    };

    start();
    return () => {
      active = false;
      stopCamera();
    };
  }, []);

  return (
    <div className="modal-backdrop" onClick={onClose} style={{zIndex: 99999}}>
      <div className="modal" onClick={e=>e.stopPropagation()} style={{background: '#0d0d12', border: '1px solid #333', maxWidth: '420px', textAlign: 'center'}}>
        <div className="modal-head">
          <div>
            <div className="eyebrow">LEITOR ÓPTICO</div>
            <h2>Escanear Código de Barras</h2>
          </div>
          <button type="button" className="icon-btn" onClick={onClose}><X size={19}/></button>
        </div>

        {errorMsg ? (
          <div style={{padding: '20px', color: '#ef4444', fontSize: '13px'}}>{errorMsg}</div>
        ) : (
          <>
            <div style={{position: 'relative', width: '100%', height: '260px', overflow: 'hidden', borderRadius: '10px', background: '#000', margin: '15px 0'}}>
              <video ref={videoRef} playsInline muted autoPlay style={{width: '100%', height: '100%', objectFit: 'cover'}} />
              <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: '84%', height: '100px', border: '2px solid #25D366', borderRadius: '8px',
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.35)', pointerEvents: 'none'
              }}>
                <div style={{position: 'absolute', top: '50%', width: '100%', height: '2px', background: '#ef4444', opacity: 0.8, boxShadow: '0 0 8px #ef4444'}} />
              </div>
            </div>
            <p className="muted" style={{fontSize: '12px', margin: '8px 0'}}>{scannerStatus}</p>
          </>
        )}

        <p className="muted" style={{fontSize: '12px', margin: '8px 0'}}>
          A leitura é automática. Mantenha o código inteiro visível, bem iluminado e próximo o suficiente para ficar nítido.
        </p>

        <button type="button" className="secondary-btn full-btn" onClick={onClose} style={{marginTop: '10px'}}>
          Fechar Leitor
        </button>
      </div>
    </div>
  );
}

/* COMPONENTE EXCLUSIVO DO MODO TV / PAINEL DE CLIENTES NA SALA DE ESPERA */
function TvModeScreen({ orders, storeName, onClose }) {
  const [time, setTime] = useState(new Date().toLocaleTimeString('pt-BR'));
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('pt-BR'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  const inMaintenanceOrders = useMemo(() => {
    return orders.filter(o => ['Em manutenção', 'Em diagnóstico', 'Aguardando peça'].includes(o.status));
  }, [orders]);

  const readyOrders = useMemo(() => {
    return orders.filter(o => o.status === 'Pronto para retirada');
  }, [orders]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999999, background: '#050508', color: '#fff',
      display: 'flex', flexDirection: 'column', padding: '16px', fontFamily: 'system-ui, sans-serif',
      overflowY: 'auto'
    }}>
      {/* BOTÃO FIXO DE SEGURANÇA: NUNCA SOME NO MODO RETRATO OU PAISAGEM */}
      <button
        type="button"
        onClick={onClose}
        style={{
          position: 'fixed', top: '12px', right: '12px', zIndex: 1000000,
          background: '#ef4444', color: '#fff', border: '1px solid rgba(255,255,255,0.3)',
          padding: '8px 14px', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px',
          boxShadow: '0 4px 16px rgba(239, 68, 68, 0.45)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '6px'
        }}
      >
        <X size={16}/> Sair do Modo TV
      </button>

      {/* CABEÇALHO DO MODO TV */}
      <header style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '12px', paddingBottom: '16px', paddingRight: '150px',
        borderBottom: '1px solid #1f1f28'
      }}>
        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
          <div style={{
            background: '#000', border: '1.5px solid #25D366', borderRadius: '10px',
            padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <Tv size={22} color="#25D366" />
            <span style={{fontSize: '18px', fontWeight: 900, letterSpacing: '1px'}}>{storeName.toUpperCase()}</span>
          </div>
          <div>
            <div style={{fontSize: '11px', color: '#25D366', fontWeight: 700, letterSpacing: '1px'}}>PAINEL DE ATENDIMENTO</div>
            <div style={{fontSize: '12px', color: '#888'}}>Acompanhe os serviços da bancada</div>
          </div>
        </div>

        <div style={{display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap'}}>
          <div style={{
            fontSize: '18px', fontWeight: 800, fontFamily: 'monospace', color: '#fff',
            background: '#101015', padding: '6px 12px', borderRadius: '8px', border: '1px solid #222'
          }}>
            {time}
          </div>
          <button
            type="button"
            onClick={toggleFullscreen}
            style={{background: '#1a1a24', color: '#fff', border: '1px solid #333', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px'}}
            title="Alternar Tela Cheia"
          >
            {isFullscreen ? <Minimize2 size={16}/> : <Maximize2 size={16}/>}
          </button>
        </div>
      </header>

      {/* GRADE RESPONSIVA: 2 COLUNAS NO COMPUTADOR / 1 COLUNA NA VERTICAL */}
      <div style={{
        flex: 1, display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
        gap: '16px', marginTop: '16px', overflow: 'visible'
      }}>
        
        {/* COLUNA 1: EM MANUTENÇÃO */}
        <section style={{
          background: '#0a0a0f', border: '1px solid #222', borderRadius: '16px',
          display: 'flex', flexDirection: 'column', minHeight: '320px', overflow: 'hidden'
        }}>
          <div style={{
            padding: '14px 16px', background: '#12121c', borderBottom: '1px solid #222',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
              <div style={{width: '10px', height: '10px', borderRadius: '50%', background: '#3b82f6', boxShadow: '0 0 10px #3b82f6'}} />
              <h2 style={{fontSize: '16px', fontWeight: 'bold', margin: 0}}>EM MANUTENÇÃO</h2>
            </div>
            <span style={{fontSize: '12px', background: '#1e293b', color: '#38bdf8', padding: '3px 8px', borderRadius: '20px', fontWeight: 'bold'}}>
              {inMaintenanceOrders.length} Aparelho(s)
            </span>
          </div>

          <div style={{flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px'}}>
            {inMaintenanceOrders.map(item => (
              <div key={item.id} style={{
                background: '#111118', border: '1px solid #1f1f2c', borderRadius: '10px',
                padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div>
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <span style={{background: '#1a1a26', border: '1px solid #333', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', color: '#38bdf8'}}>
                      {item.id}
                    </span>
                    <strong style={{fontSize: '15px', color: '#fff'}}>{item.customer}</strong>
                  </div>
                  <div style={{fontSize: '13px', color: '#aaa', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px'}}>
                    <Smartphone size={14} color="#25D366" /> {item.device}
                  </div>
                </div>
                <div style={{textAlign: 'right'}}>
                  <span style={{
                    fontSize: '11px', padding: '3px 8px', borderRadius: '16px', fontWeight: 'bold',
                    background: item.status === 'Em manutenção' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                    color: item.status === 'Em manutenção' ? '#60a5fa' : '#facc15',
                    border: `1px solid ${item.status === 'Em manutenção' ? '#2563eb' : '#ca8a04'}`
                  }}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}

            {inMaintenanceOrders.length === 0 && (
              <div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', flexDirection: 'column', gap: '6px', padding: '40px 0'}}>
                <Wrench size={28} color="#333" />
                <span style={{fontSize: '13px'}}>Nenhum serviço em manutenção no momento</span>
              </div>
            )}
          </div>
        </section>

        {/* COLUNA 2: PRONTOS PARA RETIRADA */}
        <section style={{
          background: '#0a0a0f', border: '1px solid #182c1e', borderRadius: '16px',
          display: 'flex', flexDirection: 'column', minHeight: '320px', overflow: 'hidden'
        }}>
          <div style={{
            padding: '14px 16px', background: '#0e1c12', borderBottom: '1px solid #1f3b25',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
              <div style={{width: '10px', height: '10px', borderRadius: '50%', background: '#25D366', boxShadow: '0 0 12px #25D366'}} />
              <h2 style={{fontSize: '16px', fontWeight: 'bold', margin: 0, color: '#25D366'}}>PRONTO PARA RETIRADA</h2>
            </div>
            <span style={{fontSize: '12px', background: '#0f381c', color: '#4ade80', padding: '3px 8px', borderRadius: '20px', fontWeight: 'bold'}}>
              {readyOrders.length} Disponível(is)
            </span>
          </div>

          <div style={{flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px'}}>
            {readyOrders.map(item => (
              <div key={item.id} style={{
                background: '#0d1810', border: '1px solid #1c3d25', borderRadius: '10px',
                padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div>
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <span style={{background: '#16331e', border: '1px solid #25D366', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', color: '#25D366'}}>
                      {item.id}
                    </span>
                    <strong style={{fontSize: '15px', color: '#fff'}}>{item.customer}</strong>
                  </div>
                  <div style={{fontSize: '13px', color: '#86efac', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px'}}>
                    <CheckCircle size={14} color="#25D366" /> {item.device}
                  </div>
                </div>
                <div style={{textAlign: 'right'}}>
                  <span style={{
                    fontSize: '11px', padding: '4px 10px', borderRadius: '16px', fontWeight: '900',
                    background: '#25D366', color: '#000', display: 'inline-flex', alignItems: 'center', gap: '4px'
                  }}>
                    ✓ DISPONÍVEL
                  </span>
                </div>
              </div>
            ))}

            {readyOrders.length === 0 && (
              <div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', flexDirection: 'column', gap: '6px', padding: '40px 0'}}>
                <CheckCircle2 size={28} color="#222" />
                <span style={{fontSize: '13px'}}>Nenhum aparelho aguardando retirada</span>
              </div>
            )}
          </div>
        </section>

      </div>

      <footer style={{
        marginTop: '16px', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', fontSize: '11px', color: '#666', flexWrap: 'wrap', gap: '6px'
      }}>
        <span>• Atualização em tempo real</span>
        <span>RT MOBILE SISTEMAS</span>
      </footer>
    </div>
  );
}

function PatternDrawer({ value, onChange }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const drawGrid = (ctx) => {
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, 160, 160);
    ctx.fillStyle = '#444';
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        ctx.beginPath();
        ctx.arc(30 + c * 50, 30 + r * 50, 6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (value) {
      const img = new window.Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = value;
    } else {
      drawGrid(ctx);
    }
  }, [value]);

  const startDraw = (e) => {
    e.preventDefault();
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    ctx.strokeStyle = '#25D366';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const endDraw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    setIsDrawing(false);
    const canvas = canvasRef.current;
    onChange(canvas.toDataURL());
  };

  const clear = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    drawGrid(ctx);
    onChange('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <div style={{ position: 'relative', border: '1px solid #333', borderRadius: '10px', overflow: 'hidden', width: '160px', height: '160px', touchAction: 'none' }}>
        <canvas
          ref={canvasRef}
          width={160}
          height={160}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
          style={{ cursor: 'crosshair', display: 'block' }}
        />
      </div>
      <button type="button" onClick={clear} className="secondary-btn" style={{ fontSize: '11px', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <Eraser size={12}/> Limpar Padrão
      </button>
    </div>
  );
}

function BrandSplash({ onFinish }) {
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    const tFade = setTimeout(() => setFadingOut(true), 1800);
    const tEnd = setTimeout(() => onFinish(), 2200);
    return () => { clearTimeout(tFade); clearTimeout(tEnd); };
  }, [onFinish]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999, background: '#000000',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      opacity: fadingOut ? 0 : 1, transition: 'opacity 0.4s ease-out'
    }}>
      <div style={{
        position: 'absolute', width: '320px', height: '320px', borderRadius: '50%',
        background: 'radial-gradient(circle, #25D366 0%, transparent 70%)',
        opacity: 0.18, filter: 'blur(50px)'
      }} />

      <div style={{
        position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center',
        animation: 'logoEntry 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards'
      }}>
        <div style={{
          width: '84px', height: '84px', borderRadius: '18px', background: '#000000',
          border: '1.5px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 35px rgba(37, 211, 102, 0.25)', marginBottom: '16px'
        }}>
          <span style={{ fontSize: '34px', fontWeight: 900, color: '#ffffff', letterSpacing: '-1px' }}>
            RT
          </span>
        </div>

        <h1 style={{
          fontSize: '26px', fontWeight: 900, color: '#ffffff', letterSpacing: '6px', margin: 0,
          textShadow: '0 4px 15px rgba(0,0,0,0.8)'
        }}>
          RT MOBILE
        </h1>
        <span style={{
          fontSize: '10px', color: '#25D366', letterSpacing: '3px', textTransform: 'uppercase',
          fontWeight: 700, marginTop: '8px'
        }}>
          SISTEMA DE GESTÃO PROFISSIONAL
        </span>
      </div>

      <style>{`
        @keyframes logoEntry {
          0% { opacity: 0; transform: scale(0.85); }
          50% { opacity: 1; }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

function parseMoneyValue(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const raw = String(value ?? '').replace(/R\$\s?/g, '').trim();
  const normalized = raw.includes(',') ? raw.replace(/\./g, '').replace(',', '.') : raw;
  const cleaned = normalized.replace(/[^0-9.-]/g, '');
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function App() {
  const [showSplash, setShowSplash] = useState(() => !sessionStorage.getItem('rt_splash_shown'));
  const [userRole, setUserRole] = useState(() => localStorage.getItem('rt_user_role') || 'client');
  const [userAccessLevel, setUserAccessLevel] = useState('owner');
  const [active, setActive] = useState(() => userRole === 'tech' ? 'overview' : 'stores_directory');
  
  // Estado para abrir e fechar a visualização do Modo TV
  const [showTvMode, setShowTvMode] = useState(false);

  const [modules, setModules] = useState({
    orders: true,     
    iphones: true,    
    inventory: true,  
    finance: true,
    cashRegister: true,
    crm: true,
  });

  const [trialTimeLeft, setTrialTimeLeft] = useState(48);
  const [planDaysLeft, setPlanDaysLeft] = useState(30);
  const [isTrialActive, setIsTrialActive] = useState(false);
  const [isLifetimeAdmin, setIsLifetimeAdmin] = useState(false);
  const [isAccountExpired, setIsAccountExpired] = useState(false);
  const [expiredReason, setExpiredReason] = useState('trial');

  // Configurações da Loja
  const [storeName, setStoreName] = useState('RT MOBILE');
  const [storeLogo, setStoreLogo] = useState(null);
  const [whatsappNumber, setWhatsappNumber] = useState('5591989117332');
  const [pixKey, setPixKey] = useState('91989117332');
  const [storeAddress, setStoreAddress] = useState('Santa Izabel do Pará - PA');
  const [mapsUrl, setMapsUrl] = useState('https://maps.google.com');
  const [techCommissionRate, setTechCommissionRate] = useState(() => Number(localStorage.getItem('rt_phone_commission_fixed') || 50));
  const [techCommissionMode, setTechCommissionMode] = useState(() => localStorage.getItem('rt_commission_mode') || 'fixed');

  // Auxiliar de Upgrade (Configurações com os 10 itens completos)
  const [upgradeAssistantEnabled, setUpgradeAssistantEnabled] = useState(true);
  const [upgradeDiscounts, setUpgradeDiscounts] = useState({
    screenReplaced: 200,
    batteryReplaced: 100,
    faceIdOff: 250,
    cameraFailed: 200,
    cameraLensScratched: 80,
    chargingPortFailed: 120,
    audioSpeakerFailed: 90,
    nfcFailed: 110,
    wifiFailed: 180,
    housingScratched: 90,
  });

  // Carrinho de Acessórios do Cliente
  const [cart, setCart] = useState([]);
  const [showCartModal, setShowCartModal] = useState(false);

  // Caixa da Loja
  const [cashRegister, setCashRegister] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('rt_cash_register_v1') || 'null') || { isOpen: false, openingBalance: 0.00, openedAt: null, openedBy: '', entries: [], closedSessions: [] };
    } catch {
      return { isOpen: false, openingBalance: 0.00, openedAt: null, openedBy: '', entries: [], closedSessions: [] };
    }
  });
  // O caixa e o estoque são sincronizados por organização no Supabase após a leitura inicial.
  const [activeOrganizationId, setActiveOrganizationId] = useState(null);
  const [remotePersistenceReady, setRemotePersistenceReady] = useState(false);

  // Equipe
  const [teamMembers, setTeamMembers] = useState([]);

  // Auditoria
  const [auditLogs, setAuditLogs] = useState([]);

  const addAuditLog = (action) => {
    const logUser = userAccessLevel === 'owner' ? 'Dono (Admin)' : 'Técnico (Bancada)';
    const newLog = {
      id: String(Date.now()),
      action,
      user: logUser,
      time: new Date().toLocaleString('pt-BR')
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [inventory, setInventory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('rt_inventory_v1') || '[]'); } catch { return []; }
  });
  // Estoque de seminovos compartilhado entre o painel da loja e a vitrine do cliente.
  const [usedDevices, setUsedDevices] = useLocalRecords('rt_used_devices_v1');
  const [usedDevicesEnabled, setUsedDevicesEnabled] = useState(() => localStorage.getItem('rt_used_devices_enabled') !== 'false');

  const [allStores, setAllStores] = useState([
    { id: '1', name: 'RT MOBILE', phone: '5591989117332', status: 'active', desc: 'Especialista Apple, Xiaomi & Multimarcas', address: 'Santa Izabel do Pará - PA', rating: 5.0, reviewsCount: 1 }
  ]);

  const activeStores = useMemo(() => allStores.filter(s => s.status === 'active'), [allStores]);

  // A vitrine pública carrega apenas lojas pagas ativas ou ainda dentro das 48h de teste.
  // A função RPC faz o filtro no banco, sem expor dados privados dos estabelecimentos.
  useEffect(() => {
    let cancelled = false;
    const loadPublicStores = async () => {
      if (!supabaseConfigured) return;
      const { data, error } = await supabase.rpc('rt_public_active_stores');
      if (cancelled) return;
      if (error) {
        console.warn('Não foi possível carregar a vitrine de lojas:', error.message);
        return; // preserva a vitrine atual se o RPC ainda não foi instalado
      }
      const stores = (data || []).map((row) => ({
        id: String(row.id),
        name: row.name || 'Estabelecimento',
        phone: row.phone || '',
        status: 'active',
        desc: row.desc || 'Estabelecimento RT Mobile',
        address: row.address || 'Endereço não informado',
        rating: 5.0,
        reviewsCount: 0,
      }));
      if (stores.length) setAllStores(stores);
      else setAllStores([]);
    };
    loadPublicStores();
    return () => { cancelled = true; };
  }, []);

  const [search, setSearch] = useState('');
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [showNewProduct, setShowNewProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showChecklistModal, setShowChecklistModal] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(null);
  const [showQuoteModal, setShowQuoteModal] = useState(null);
  const [showCashTransactionModal, setShowCashTransactionModal] = useState(false);
  const [showOrderPaymentModal, setShowOrderPaymentModal] = useState(null);
  const [orderPayment, setOrderPayment] = useState({ amount: '', method: 'Pix' });
  const [showInviteMemberModal, setShowInviteMemberModal] = useState(false);

  // Modais de Leitura de Código de Barras
  const [showBarcodeScannerForProduct, setShowBarcodeScannerForProduct] = useState(false);
  const [showBarcodeSaleModal, setShowBarcodeSaleModal] = useState(false);
  const [showProductSaleModal, setShowProductSaleModal] = useState(false);
  
  const [toast, setToast] = useState('');
  const [mobileNav, setMobileNav] = useState(false);
  const [session, setSession] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [showFirstLoginTutorial, setShowFirstLoginTutorial] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [saving, setSaving] = useState(false);
  
  // Modal de Upgrade
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeStep, setUpgradeStep] = useState(1);
  const [currentDevice, setCurrentDevice] = useState('');
  const [targetDevice, setTargetDevice] = useState(seminovosList[0]);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  
  const [selectedDefects, setSelectedDefects] = useState({
    screenReplaced: false,
    batteryReplaced: false,
    faceIdOff: false,
    cameraFailed: false,
    cameraLensScratched: false,
    chargingPortFailed: false,
    audioSpeakerFailed: false,
    nfcFailed: false,
    wifiFailed: false,
    housingScratched: false,
  });

  const [cashTx, setCashTx] = useState({ type: 'in', category: 'Acessórios', seller: '', description: '', amount: '', paymentMethod: 'Dinheiro' });
  const [newMember, setNewMember] = useState({ name: '', email: '', role: 'technician' });

  const [passwordType, setPasswordType] = useState('text');
  const [newOrder, setNewOrder] = useState({ 
    customer: '', device: 'iPhone 13', devicePassword: '', patternDrawing: '', issue: '', phone: '', status: 'Recebido', amount: '', partCost: '0.00', warrantyDays: 90,
    checklist: { ...defaultChecklist }
  });
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '' });
  const [newProduct, setNewProduct] = useState({ name: '', category: 'Capas', price: '', qty: '1', barcode: '', photo: null });

  const isSuperAdmin = useMemo(() => {
    return session?.user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  }, [session]);

  const navTech = useMemo(() => {
    const list = [{ id: 'overview', label: 'Visão geral', icon: Gauge }];
    if (modules.orders) list.push({ id: 'orders', label: 'Ordens de serviço', icon: ClipboardList });
    list.push({ id: 'customers', label: 'Clientes', icon: Users });
    if (modules.crm) list.push({ id: 'crm', label: 'Pós-Venda & Cuidado', icon: HeartHandshake });
    if (modules.cashRegister) list.push({ id: 'cash', label: 'Caixa da Loja', icon: Wallet });
    if (modules.inventory) list.push({ id: 'inventory', label: 'Acessórios de Balcão', icon: Package });
    if (modules.iphones) list.push({ id: 'store', label: 'Comprar & Upgrade', icon: Smartphone });
    if (modules.iphones) list.push({ id: 'used_devices', label: 'Seminovos & Usados', icon: Smartphone });
    if (modules.finance && userAccessLevel === 'owner') { list.push({ id: 'finance', label: 'Financeiro & Comissões', icon: DollarSign }); list.push({ id: 'reports', label: 'Relatórios & Indicadores', icon: Activity }); }
    list.push({ id: 'payments', label: 'Pagamentos & Pix', icon: CreditCard });
    list.push({ id: 'settings', label: 'Configurações', icon: Settings });
    return list;
  }, [modules, userAccessLevel]);

  const navClient = useMemo(() => {
    const list = [{ id: 'stores_directory', label: 'Buscar Lojas Ativas', icon: Store }];
    if (modules.iphones) list.push({ id: 'store', label: 'Comprar & Upgrade', icon: Smartphone });
    if (modules.iphones) list.push({ id: 'client_used_devices', label: 'Seminovos & Usados', icon: Smartphone });
    if (modules.inventory) list.push({ id: 'client_inventory', label: 'Acessórios', icon: Package });
    if (modules.orders) list.push({ id: 'track', label: 'Rastreio de OS', icon: Search });
    return list;
  }, [modules]);

  useEffect(() => {
    if (!supabaseConfigured) { setAuthChecked(true); return; }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthChecked(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (!nextSession) {
        setUserRole('client');
        localStorage.setItem('rt_user_role', 'client');
      }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // Garante que o dono tenha organização e vínculo no Supabase. Funcionários precisam ser convidados à loja existente.
  const ensureMyOrganization = async (createIfMissing = false) => {
    if (!supabaseConfigured || !session?.user?.id) throw new Error('Entre novamente na sua conta para continuar.');
    const { data, error } = await supabase.rpc('rt_ensure_my_organization', { p_create_if_missing: Boolean(createIfMissing) });
    if (error) throw error;
    const organizationId = typeof data === 'string' ? data : data?.organization_id;
    if (!organizationId) throw new Error('Sua conta ainda não está vinculada a uma loja. O proprietário precisa concluir o vínculo ou convidar você.');
    return organizationId;
  };

  const fetchData = async () => {
    if (!supabaseConfigured || !session) return;
    setRemotePersistenceReady(false);
    const userEmail = session.user?.email?.toLowerCase();
    const isOwnerByEmail = userEmail === ADMIN_EMAIL.toLowerCase();
    // Cria/recupera automaticamente a organização de quem entra como dono (perfil técnico).
    try { await ensureMyOrganization(userRole === 'tech' && !isOwnerByEmail); }
    catch (bootstrapError) { console.warn('Vínculo da organização:', bootstrapError.message); }

    const userCreatedAt = session.user?.created_at ? new Date(session.user.created_at) : new Date();
    const now = new Date();
    const hoursElapsed = Math.floor((now - userCreatedAt) / (1000 * 60 * 60));
    const hoursRemaining = Math.max(0, 48 - hoursElapsed);
    setTrialTimeLeft(hoursRemaining);

    let { data: orgData } = await supabase.from('organizations')
      .select('*')
      .eq('owner_user_id', session.user.id)
      .limit(1);

    // Se o usuário é membro/funcionário e não dono direto da loja, recupera sua organização vinculada.
    if (!orgData || orgData.length === 0) {
      const { data: memberships } = await supabase.from('organization_members')
        .select('organization_id').eq('user_id', session.user.id).limit(1);
      const memberOrgId = memberships?.[0]?.organization_id;
      if (memberOrgId) {
        const { data: memberOrg, error: memberOrgError } = await supabase.from('organizations')
          .select('*').eq('id', memberOrgId).maybeSingle();
        if (!memberOrgError && memberOrg) orgData = [memberOrg];
      }
    }

    if ((!orgData || orgData.length === 0) && userRole === 'tech' && !isOwnerByEmail) {
      const defaultName = `Loja ${session.user.email.split('@')[0].toUpperCase()}`;
      const { data: createdOrg } = await supabase.from('organizations').insert({
        owner_user_id: session.user.id,
        name: defaultName,
        whatsapp: '5591989117332',
        pix_key: '91989117332',
        access_state: 'pending',
        plan_status: 'Teste',
        plan_name: 'Teste 48h'
      }).select();
      if (createdOrg) orgData = createdOrg;
    }

    const org = orgData?.[0];
    const organizationId = org?.id || null;
    setActiveOrganizationId(organizationId);

    if (organizationId) {
      const [cashStateResult, inventoryStateResult] = await Promise.all([
        supabase.from('rt_cash_register_state').select('state').eq('organization_id', organizationId).maybeSingle(),
        supabase.from('rt_inventory_state').select('items').eq('organization_id', organizationId).maybeSingle()
      ]);
      if (cashStateResult.error || inventoryStateResult.error) {
        console.warn('Persistência remota do caixa/estoque ainda não está disponível. Execute o SQL de integração e recarregue o app.', cashStateResult.error || inventoryStateResult.error);
        setRemotePersistenceReady(false);
      } else {
        // Se a organização ainda não possui registro remoto, mantém os dados locais existentes
        // e o efeito abaixo os envia ao banco na primeira sincronização.
        if (cashStateResult.data?.state && typeof cashStateResult.data.state === 'object') {
          setCashRegister({ isOpen: false, openingBalance: 0, openedAt: null, openedBy: '', entries: [], closedSessions: [], ...cashStateResult.data.state });
        }
        if (Array.isArray(inventoryStateResult.data?.items)) setInventory(inventoryStateResult.data.items);
        setRemotePersistenceReady(true);
      }
    } else {
      setRemotePersistenceReady(false);
    }

    if (org || isOwnerByEmail) {
      if (org?.name) setStoreName(org.name);
      if (org?.whatsapp) setWhatsappNumber(org.whatsapp);
      if (org?.pix_key) setPixKey(org.pix_key);

      const isVitalicio = isOwnerByEmail || org?.plan_name === 'Vitalício';
      const isPaidActive = ['ativo', 'active'].includes(String(org?.access_state || '').toLowerCase()) || ['ativo', 'active'].includes(String(org?.plan_status || '').toLowerCase());

      if (isVitalicio) {
        setIsLifetimeAdmin(true);
        setIsTrialActive(false);
        setIsAccountExpired(false);
      } else if (isPaidActive) {
        if (org?.subscription_expires_at) {
          const expiryDate = new Date(org.subscription_expires_at);
          const diffDays = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
          setPlanDaysLeft(diffDays);

          if (diffDays <= 0) {
            setIsAccountExpired(true);
            setExpiredReason('monthly');
            setIsTrialActive(false);
          } else {
            setIsAccountExpired(false);
            setIsTrialActive(false);
          }
        } else {
          setIsAccountExpired(false);
          setIsTrialActive(false);
        }
      } else {
        if (hoursRemaining > 0) {
          setIsTrialActive(true);
          setIsAccountExpired(false);
        } else {
          setIsTrialActive(false);
          setIsAccountExpired(true);
          setExpiredReason('trial');
        }
      }

      setTeamMembers([
        { id: session.user.id, name: isOwnerByEmail ? 'Robert Haelley (Proprietário)' : (org?.name || 'Responsável'), email: session.user.email, role: 'owner', status: 'Ativo' }
      ]);
    } else {
      if (hoursRemaining > 0) {
        setIsTrialActive(true);
        setIsAccountExpired(false);
      } else {
        setIsAccountExpired(!isOwnerByEmail);
        setExpiredReason('trial');
      }
    }

    // Busca todas as OS em páginas para não limitar o histórico às 50 mais recentes.
    // O RLS do Supabase deve continuar garantindo o isolamento por organização.
    let oData = [];
    const pageSize = 500;
    for (let from = 0; ; from += pageSize) {
      const { data: page, error: ordersError } = await supabase.from('repair_orders')
        .select('id, organization_id, order_number, customer_name, customer_phone, device_brand, device_model, issue_description, status, total_amount, amount_paid, created_at')
        .order('created_at', { ascending: false })
        .range(from, from + pageSize - 1);
      if (ordersError) {
        console.error('Erro ao carregar histórico de OS:', ordersError);
        notify?.('Não foi possível carregar o histórico completo de OS. Confira as permissões do Supabase.');
        break;
      }
      oData = oData.concat(page || []);
      if (!page || page.length < pageSize) break;
    }
    if (oData) {
      // Carrega o histórico real de pagamentos do Supabase, não apenas do navegador.
      const paymentsByOrder = {};
      const orgIds = [...new Set(oData.map(o => o.organization_id).filter(Boolean))];
      for (const orgId of orgIds) {
        const { data: paymentRows, error: paymentRowsError } = await supabase
          .from('payments')
          .select('id, organization_id, repair_order_id, amount, method, state, reference, paid_at, created_at')
          .eq('organization_id', orgId)
          .order('paid_at', { ascending: true });
        if (paymentRowsError) {
          console.warn('Não foi possível carregar o histórico de pagamentos do Supabase:', paymentRowsError);
          continue;
        }
        (paymentRows || []).forEach(payment => {
          if (!paymentsByOrder[payment.repair_order_id]) paymentsByOrder[payment.repair_order_id] = [];
          paymentsByOrder[payment.repair_order_id].push({
            id: payment.id,
            amount: Number(payment.amount || 0),
            method: payment.method || 'Não informado',
            paidAt: payment.paid_at || payment.created_at,
            state: payment.state,
            reference: payment.reference
          });
        });
      }
      setOrders(oData.map((o) => {
        const displayOrderId = o.order_number || `OS-${String(o.id).slice(0, 6)}`;
        const payments = paymentsByOrder[o.id] || [];
        const paidFromPayments = payments.filter(p => !p.state || ['paid', 'received', 'approved', 'completed'].includes(String(p.state).toLowerCase())).reduce((sum, p) => sum + Number(p.amount || 0), 0);
        return ({
        rawId: o.id,
        organizationId: o.organization_id,
        id: displayOrderId,
        paidAmount: payments.length ? paidFromPayments : Number(o.amount_paid ?? 0), payments,
        customer: o.customer_name,
        phone: o.customer_phone || '',
        device: [o.device_brand, o.device_model].filter(Boolean).join(' '),
        devicePassword: 'Sem senha',
        patternDrawing: '',
        issue: o.issue_description || 'Sem descrição',
        status: o.status,
        amount: o.total_amount ? `R$ ${Number(o.total_amount).toFixed(2)}` : 'R$ 0.00',
        partCost: '0.00',
        warrantyDays: 90,
        time: new Date(o.created_at).toLocaleDateString('pt-BR'),
        createdAt: o.created_at,
        color: statusClass(o.status),
        checklist: { ...defaultChecklist }
      });
      }));
    }

    const { data: cData } = await supabase.from('customers').select('id, name, phone, email, created_at').order('name', { ascending: true });
    if (cData) setCustomers(cData);
  };

  useEffect(() => {
    try { localStorage.setItem('rt_cash_register_v1', JSON.stringify(cashRegister)); } catch (err) { console.warn('Não foi possível salvar o caixa neste navegador.', err); }
    if (!remotePersistenceReady || !activeOrganizationId || !session?.user?.id) return;
    supabase.from('rt_cash_register_state').upsert({
      organization_id: activeOrganizationId,
      state: cashRegister,
      updated_by: session.user.id,
      updated_at: new Date().toISOString()
    }, { onConflict: 'organization_id' }).then(({ error }) => {
      if (error) console.warn('Não foi possível sincronizar o caixa com o Supabase:', error.message);
    });
  }, [cashRegister, activeOrganizationId, remotePersistenceReady, session?.user?.id]);

  useEffect(() => {
    try { localStorage.setItem('rt_inventory_v1', JSON.stringify(inventory)); } catch (err) { console.warn('Não foi possível salvar o estoque neste navegador.', err); }
    if (!remotePersistenceReady || !activeOrganizationId || !session?.user?.id) return;
    supabase.from('rt_inventory_state').upsert({
      organization_id: activeOrganizationId,
      items: inventory,
      updated_by: session.user.id,
      updated_at: new Date().toISOString()
    }, { onConflict: 'organization_id' }).then(({ error }) => {
      if (error) console.warn('Não foi possível sincronizar o estoque com o Supabase:', error.message);
    });
  }, [inventory, activeOrganizationId, remotePersistenceReady, session?.user?.id]);

  useEffect(() => { fetchData(); }, [session]);

  // Tutorial inicial: aparece uma vez por conta e perfil, com opção de abrir novamente nas configurações.
  useEffect(() => {
    if (!session?.user?.id) return;
    const key = `rt_tutorial_seen_${session.user.id}_${userRole}`;
    if (localStorage.getItem(key) !== 'true') setShowFirstLoginTutorial(true);
  }, [session?.user?.id, userRole]);

  const closeFirstLoginTutorial = () => {
    if (session?.user?.id) localStorage.setItem(`rt_tutorial_seen_${session.user.id}_${userRole}`, 'true');
    setShowFirstLoginTutorial(false);
  };

  const filteredOrders = useMemo(() => orders.filter((o) =>
    [o.id, o.customer, o.device, o.issue, o.status].join(' ').toLowerCase().includes(search.toLowerCase())
  ), [orders, search]);

  const notify = (message) => { setToast(message); window.setTimeout(() => setToast(''), 3000); };

  async function handleAuth(e) {
    e.preventDefault(); setAuthError(''); setSaving(true);
    try {
      if (!supabaseConfigured) throw new Error('Configure o arquivo .env com as chaves do seu projeto Supabase.');
      const result = authMode === 'login'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });
      if (result.error) throw result.error;

      localStorage.setItem('rt_user_role', userRole);
      // No login, provisiona a loja/vínculo; no cadastro com confirmação de e-mail, isso ocorrerá no primeiro login.
      if (result.data?.session && userRole === 'tech') {
        const { error: bootstrapError } = await supabase.rpc('rt_ensure_my_organization', { p_create_if_missing: true });
        if (bootstrapError) console.warn('A configuração automática será repetida ao entrar:', bootstrapError.message);
      }

      if (userRole === 'tech') {
        setActive('overview');
      } else {
        setActive('stores_directory');
      }
    } catch (err) { setAuthError(err.message || 'Não foi possível autenticar.'); }
    finally { setSaving(false); }
  }

  async function handleCreateOrder(e) {
    e.preventDefault();
    if (!newOrder.customer.trim() || !newOrder.device.trim() || !newOrder.issue.trim()) {
      notify('Preencha cliente, aparelho e defeito.'); return;
    }
    setSaving(true);
    try {
      const generatedId = `OS-${Math.floor(1000 + Math.random() * 9000)}`;
      if (supabaseConfigured && session) {
        const orgId = await ensureMyOrganization(userRole === 'tech');
        const { error } = await supabase.from('repair_orders').insert({
          organization_id: orgId,
          created_by: session.user.id,
          customer_name: newOrder.customer.trim(),
          customer_phone: newOrder.phone.trim() || null,
          device_brand: newOrder.device.toLowerCase().includes('iphone') ? 'Apple' : 'Outro',
          device_model: newOrder.device.trim(),
          issue_description: newOrder.issue.trim(),
          status: newOrder.status,
          total_amount: newOrder.amount ? parseFloat(newOrder.amount.replace(',', '.')) : 0.00
        });
        if (error) throw error;
        await fetchData();
      } else {
        const localOs = {
          rawId: String(Date.now()),
          id: generatedId,
          customer: newOrder.customer.trim(),
          phone: newOrder.phone.trim(),
          device: newOrder.device.trim(),
          devicePassword: passwordType === 'pattern' ? 'Padrão Desenho' : (newOrder.devicePassword.trim() || 'Sem Senha'),
          patternDrawing: passwordType === 'pattern' ? newOrder.patternDrawing : '',
          issue: newOrder.issue.trim(),
          status: newOrder.status,
          amount: newOrder.amount ? `R$ ${parseFloat(newOrder.amount.replace(',', '.')).toFixed(2)}` : 'R$ 0.00',
          partCost: newOrder.partCost ? parseFloat(newOrder.partCost.replace(',', '.')).toFixed(2) : '0.00',
          warrantyDays: parseInt(newOrder.warrantyDays) || 90,
          time: new Date().toLocaleDateString('pt-BR'),
          createdAt: new Date().toISOString(),
          color: statusClass(newOrder.status),
          checklist: newOrder.checklist
        };
        setOrders(prev => [localOs, ...prev]);
      }
      
      // Abre o checklist que já existe no sistema imediatamente após criar a OS.
      setShowChecklistModal({
        rawId: generatedId,
        id: generatedId,
        customer: newOrder.customer.trim(),
        phone: newOrder.phone.trim(),
        device: newOrder.device.trim(),
        devicePassword: passwordType === 'pattern' ? 'Padrão Desenho' : (newOrder.devicePassword.trim() || 'Sem Senha'),
        patternDrawing: passwordType === 'pattern' ? newOrder.patternDrawing : '',
        issue: newOrder.issue.trim(),
        status: newOrder.status,
        amount: newOrder.amount ? `R$ ${parseFloat(newOrder.amount.replace(',', '.')).toFixed(2)}` : 'R$ 0.00',
        partCost: newOrder.partCost ? parseFloat(newOrder.partCost.replace(',', '.')).toFixed(2) : '0.00',
        warrantyDays: parseInt(newOrder.warrantyDays) || 90,
        createdAt: new Date().toISOString(),
        checklist: { ...newOrder.checklist }
      });

      addAuditLog(`Criou a ${generatedId} para o cliente ${newOrder.customer.trim()}`);
      
      setShowNewOrder(false);
      setNewOrder({ customer: '', device: 'iPhone 13', devicePassword: '', patternDrawing: '', issue: '', phone: '', status: 'Recebido', amount: '', partCost: '0.00', warrantyDays: 90, checklist: { ...defaultChecklist } });
      setPasswordType('text');
      notify('Ordem salva com sucesso!');
    } catch (err) { notify(err.message || 'Erro ao salvar ordem.'); }
    finally { setSaving(false); }
  }

  async function handleCreateCustomer(e) {
    e.preventDefault();
    if (!newCustomer.name.trim()) { notify('Informe o nome do cliente.'); return; }
    setSaving(true);
    try {
      if (supabaseConfigured && session) {
        const orgId = await ensureMyOrganization(userRole === 'tech');

const { error } = await supabase.from('customers').insert({
  organization_id: orgId,
  name: newCustomer.name.trim(),
  phone: newCustomer.phone.trim() || null,
  email: newCustomer.email.trim() || null,
});

if (error) throw error;

await fetchData();
      }
      addAuditLog(`Cadastrou o cliente ${newCustomer.name.trim()}`);
      setShowNewCustomer(false);
      setNewCustomer({ name: '', phone: '', email: '' });
      notify('Cliente cadastrado com sucesso.');
    } catch (err) { notify(err.message || 'Erro ao salvar cliente.'); }
    finally { setSaving(false); }
  }

  const handleCreateProduct = (e) => {
    e.preventDefault();
    if (!newProduct.name.trim() || !newProduct.price) {
      notify('Informe nome e preço do produto.'); return;
    }
    const item = {
      id: String(Date.now()),
      name: newProduct.name.trim(),
      category: newProduct.category,
      price: parseFloat(newProduct.price.replace(',', '.')).toFixed(2),
      qty: parseInt(newProduct.qty) || 0,
      barcode: newProduct.barcode.trim(),
      photo: newProduct.photo
    };
    setInventory(prev => [item, ...prev]);
    addAuditLog(`Adicionou ${item.name} ao estoque ${item.barcode ? `(Código: ${item.barcode})` : ''}`);
    setShowNewProduct(false);
    setNewProduct({ name: '', category: 'Capas', price: '', qty: '1', barcode: '', photo: null });
    notify('Produto adicionado ao estoque!');
  };

  const editProduct = (id) => {
    const product = inventory.find(p => String(p.id) === String(id));
    if (!product) return;
    const name = window.prompt('Nome do produto:', product.name);
    if (name === null) return;
    const category = window.prompt('Categoria:', product.category || 'Acessórios');
    if (category === null) return;
    const priceText = window.prompt('Preço de venda (ex.: 29,90):', String(product.price ?? ''));
    if (priceText === null) return;
    const price = Number(String(priceText).replace(',', '.'));
    if (!name.trim() || !Number.isFinite(price) || price < 0) { notify('Nome ou preço inválido.'); return; }
    const qtyText = window.prompt('Quantidade em estoque:', String(product.qty ?? 0));
    if (qtyText === null) return;
    const qty = Number(qtyText);
    if (!Number.isInteger(qty) || qty < 0) { notify('Quantidade inválida.'); return; }
    const barcode = window.prompt('Código de barras (deixe vazio para remover):', product.barcode || '');
    if (barcode === null) return;
    const duplicate = inventory.some(p => String(p.id) !== String(id) && barcode.trim() && String(p.barcode || '').trim() === barcode.trim());
    if (duplicate) { notify('Esse código de barras já está cadastrado em outro produto.'); return; }
    setInventory(prev => prev.map(p => String(p.id) === String(id) ? { ...p, name: name.trim(), category: category.trim(), price: price.toFixed(2), qty, barcode: barcode.trim() } : p));
    addAuditLog(`Editou o produto ${name.trim()}`);
    notify('Produto atualizado.');
  };

  const editCustomer = async (customer) => {
    const name = window.prompt('Nome do cliente:', customer.name || ''); if (name === null) return;
    const phone = window.prompt('Telefone / WhatsApp:', customer.phone || ''); if (phone === null) return;
    const email = window.prompt('E-mail:', customer.email || ''); if (email === null) return;
    if (!name.trim()) { notify('O nome do cliente é obrigatório.'); return; }
    try {
      if (supabaseConfigured && session && customer.id) {
        const { error } = await supabase.from('customers').update({ name: name.trim(), phone: phone.trim() || null, email: email.trim() || null }).eq('id', customer.id);
        if (error) throw error;
        await fetchData();
      } else {
        setCustomers(prev => prev.map(c => String(c.id) === String(customer.id) ? { ...c, name: name.trim(), phone: phone.trim(), email: email.trim() } : c));
      }
      addAuditLog(`Editou o cadastro do cliente ${name.trim()}`); notify('Cliente atualizado.');
    } catch (err) { notify(err.message || 'Não foi possível atualizar o cliente.'); }
  };

  const deleteCustomer = async (customer) => {
    const linked = orders.some(o => String(o.customer || '').trim().toLowerCase() === String(customer.name || '').trim().toLowerCase());
    if (linked) { notify('Este cliente tem OS no histórico. Para preservar o histórico, não é possível excluir o cadastro agora.'); return; }
    if (!window.confirm(`Excluir o cliente ${customer.name}? Esta ação não pode ser desfeita.`)) return;
    try {
      if (supabaseConfigured && session && customer.id) {
        const { error } = await supabase.from('customers').delete().eq('id', customer.id);
        if (error) throw error;
        await fetchData();
      } else setCustomers(prev => prev.filter(c => String(c.id) !== String(customer.id)));
      addAuditLog(`Excluiu o cliente ${customer.name}`); notify('Cliente excluído.');
    } catch (err) { notify(err.message || 'Não foi possível excluir o cliente.'); }
  };

  const editOrder = async (order) => {
    // Edição guiada dos dados da OS; mantém a identificação original e o histórico de pagamentos.
    const customer = window.prompt('Nome do cliente:', order.customer || ''); if (customer === null) return;
    const phone = window.prompt('Telefone / WhatsApp:', order.phone || ''); if (phone === null) return;
    const device = window.prompt('Marca e modelo do aparelho:', order.device || ''); if (device === null) return;
    const devicePassword = window.prompt('Senha / PIN do aparelho:', order.devicePassword || 'Sem senha'); if (devicePassword === null) return;
    const issue = window.prompt('Defeito relatado:', order.issue || ''); if (issue === null) return;
    const statusOptions = ['Recebido', 'Em diagnóstico', 'Aguardando aprovação', 'Aguardando peça', 'Em manutenção', 'Pronto para retirada', 'Entregue'];
    const status = window.prompt(`Status da OS (${statusOptions.join(' / ')}):`, order.status || 'Recebido'); if (status === null) return;
    const amountText = window.prompt('Valor total da OS (ex.: 150,00):', String(parseMoneyValue(order.amount))); if (amountText === null) return;
    const amount = Number(String(amountText).replace(',', '.'));
    const partCostText = window.prompt('Custo das peças (ex.: 35,00):', String(order.partCost ?? '0.00')); if (partCostText === null) return;
    const partCost = Number(String(partCostText).replace(',', '.'));
    const warrantyText = window.prompt('Garantia em dias:', String(order.warrantyDays ?? 90)); if (warrantyText === null) return;
    const warrantyDays = Number(warrantyText);
    if (!customer.trim() || !device.trim() || !issue.trim() || !Number.isFinite(amount) || amount < 0 || !Number.isFinite(partCost) || partCost < 0 || !Number.isInteger(warrantyDays) || warrantyDays < 0) {
      notify('Confira os dados: nome, aparelho, defeito, valores e garantia precisam ser válidos.'); return;
    }
    if (!statusOptions.includes(status)) { notify('Status inválido. Escolha um dos status listados.'); return; }
    if (Number(order.paidAmount || 0) > amount && !window.confirm(`A OS já tem R$ ${Number(order.paidAmount).toFixed(2)} registrado como pago, acima do novo total de R$ ${amount.toFixed(2)}. Deseja salvar mesmo assim?`)) return;
    try {
      if (supabaseConfigured && session && order.rawId) {
        const deviceParts = device.trim().split(/\s+/);
        const { error } = await supabase.from('repair_orders').update({
          customer_name: customer.trim(), customer_phone: phone.trim() || null,
          device_brand: deviceParts[0] || 'Outro', device_model: deviceParts.slice(1).join(' ') || device.trim(),
          issue_description: issue.trim(), status, total_amount: amount
        }).eq('id', order.rawId);
        if (error) throw error;
        await fetchData();
        // Campos sem coluna confirmada no esquema atual ficam atualizados nesta sessão sem arriscar erro no banco.
        setOrders(prev => prev.map(o => String(o.rawId || o.id) === String(order.rawId || order.id) ? { ...o, devicePassword: devicePassword.trim() || 'Sem senha', partCost: partCost.toFixed(2), warrantyDays } : o));
      } else {
        setOrders(prev => prev.map(o => String(o.rawId || o.id) === String(order.rawId || order.id) ? {
          ...o, customer: customer.trim(), phone: phone.trim(), device: device.trim(),
          devicePassword: devicePassword.trim() || 'Sem senha', issue: issue.trim(), status,
          amount: `R$ ${amount.toFixed(2)}`, partCost: partCost.toFixed(2), warrantyDays
        } : o));
      }
      addAuditLog(`Editou os dados da ordem ${order.id}`);
      notify('Dados da ordem atualizados. Confira o total e os pagamentos registrados.');
    } catch (err) { notify(err.message || 'Não foi possível atualizar a OS.'); }
  };

  const deleteOrder = async (order) => {
    if (!window.confirm(`Excluir a ordem ${order.id} de ${order.customer}? Confira antes se existem pagamentos ou garantias vinculados.`)) return;
    try {
      if (supabaseConfigured && session && order.rawId) {
        const { error } = await supabase.from('repair_orders').delete().eq('id', order.rawId);
        if (error) throw error;
        await fetchData();
      } else setOrders(prev => prev.filter(o => String(o.rawId || o.id) !== String(order.rawId || order.id)));
      addAuditLog(`Excluiu a ordem ${order.id}`); notify('Ordem excluída.');
    } catch (err) { notify(err.message || 'Não foi possível excluir a OS. O banco pode bloquear a exclusão por haver registros vinculados.'); }
  };

  const handleProductPhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewProduct(prev => ({ ...prev, photo: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleUpgradePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedPhoto(reader.result);
        notify('Foto do aparelho anexada com sucesso!');
      };
      reader.readAsDataURL(file);
    }
  };

  const updateProductQty = (id, delta) => {
    setInventory(prev => prev.map(p => {
      if (p.id === id) {
        const newQty = Math.max(0, p.qty + delta);
        return { ...p, qty: newQty };
      }
      return p;
    }));
  };

  const deleteProduct = (id) => {
    const product = inventory.find(p => String(p.id) === String(id));
    if (!product) return;
    if (!window.confirm(`Excluir o produto ${product.name}? O histórico de vendas já registradas não será apagado.`)) return;
    setInventory(prev => prev.filter(p => String(p.id) !== String(id)));
    notify('Produto removido.');
  };

  const handleSellProductFromList = async (productId, quantity, paymentMethod = 'Dinheiro', saleAttemptId) => {
    const found = inventory.find(p => String(p.id) === String(productId));
    const qty = Math.floor(Number(quantity));
    if (!found) { notify('Selecione um produto válido.'); return; }
    if (!Number.isFinite(qty) || qty < 1) { notify('Informe uma quantidade válida.'); return; }
    if (!cashRegister.isOpen) { notify('Abra o caixa antes de registrar vendas.'); return; }
    if (Number(found.qty) < qty) { notify(`Estoque insuficiente. Há apenas ${found.qty} unidade(s) de ${found.name}.`); return; }
    if (!supabaseConfigured || !session?.user?.id || !activeOrganizationId) {
      notify('Não foi possível registrar a venda: entre na conta da loja e aguarde a sincronização com o Supabase.'); return;
    }
    const operationId = saleAttemptId || createRtOperationId('sale');
    try {
      const { data, error } = await supabase.rpc('rt_register_inventory_sale', {
        p_organization_id: activeOrganizationId,
        p_sale_id: operationId,
        p_product_id: String(found.id),
        p_quantity: qty,
        p_payment_method: paymentMethod || 'Dinheiro',
        p_user_label: userAccessLevel === 'owner' ? 'Dono' : 'Técnico'
      });
      if (error) throw error;
      const sale = Array.isArray(data) ? data[0] : data;
      if (!sale?.inventory_items || !sale?.cash_state) throw new Error('O Supabase não confirmou a atualização do caixa e do estoque.');
      setInventory(sale.inventory_items);
      setCashRegister(prev => ({ isOpen: false, openingBalance: 0, openedAt: null, openedBy: '', entries: [], closedSessions: [], ...prev, ...sale.cash_state }));
      try { sessionStorage.removeItem(`rt_product_sale_attempt_${activeOrganizationId || session.user.id}`); } catch {}
      addAuditLog(`Vendeu ${qty}x ${sale.product_name || found.name} no caixa: R$ ${Number(sale.total_amount || 0).toFixed(2)}`);
      setShowProductSaleModal(false);
      notify(`Venda confirmada: ${qty}x ${sale.product_name || found.name}. Total R$ ${Number(sale.total_amount || 0).toFixed(2).replace('.', ',')} e estoque atualizado!`);
    } catch (error) {
      console.error('Erro ao registrar venda de produto:', error);
      notify(`Venda não concluída: ${error?.message || 'não foi possível sincronizar o caixa e o estoque.'}`);
    }
  };

  const handleSellProductByBarcode = async (scannedCode, paymentMethod = 'Dinheiro', saleAttemptId) => {
    const code = String(scannedCode).trim();
    if (!code) { notify('Código inválido.'); return; }
    const found = inventory.find(p => p.barcode && p.barcode.trim() === code);
    if (!found) { notify(`Nenhum produto cadastrado com o código ${code}.`); return; }
    if (Number(found.qty) <= 0) { notify(`Atenção: ${found.name} está esgotado no estoque!`); return; }
    if (!cashRegister.isOpen) { notify('Abra o caixa antes de registrar vendas.'); return; }
    if (!supabaseConfigured || !session?.user?.id || !activeOrganizationId) {
      notify('Não foi possível registrar a venda: entre na conta da loja e aguarde a sincronização com o Supabase.'); return;
    }
    const operationId = saleAttemptId || createRtOperationId('sale');
    try {
      const { data, error } = await supabase.rpc('rt_register_inventory_sale', {
        p_organization_id: activeOrganizationId,
        p_sale_id: operationId,
        p_product_id: String(found.id),
        p_quantity: 1,
        p_payment_method: paymentMethod || 'Dinheiro',
        p_user_label: userAccessLevel === 'owner' ? 'Dono' : 'Técnico'
      });
      if (error) throw error;
      const sale = Array.isArray(data) ? data[0] : data;
      if (!sale?.inventory_items || !sale?.cash_state) throw new Error('O Supabase não confirmou a atualização do caixa e do estoque.');
      setInventory(sale.inventory_items);
      setCashRegister(prev => ({ isOpen: false, openingBalance: 0, openedAt: null, openedBy: '', entries: [], closedSessions: [], ...prev, ...sale.cash_state }));
      try { sessionStorage.removeItem(`rt_product_sale_attempt_${activeOrganizationId || session.user.id}`); } catch {}
      addAuditLog(`Vendeu 1x ${sale.product_name || found.name} no caixa via código de barras: R$ ${Number(sale.total_amount || 0).toFixed(2)}`);
      setShowBarcodeSaleModal(false);
      notify(`Venda confirmada: ${sale.product_name || found.name} (+ R$ ${Number(sale.total_amount || 0).toFixed(2).replace('.', ',')}) e estoque atualizado!`);
    } catch (error) {
      console.error('Erro ao registrar venda por código de barras:', error);
      notify(`Venda não concluída: ${error?.message || 'não foi possível sincronizar o caixa e o estoque.'}`);
    }
  };

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, cartQty: item.cartQty + 1 } : item);
      }
      return [...prev, { ...product, cartQty: 1 }];
    });
    notify(`${product.name} adicionado ao carrinho!`);
  };

  const updateCartQty = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.cartQty + delta;
        return newQty > 0 ? { ...item, cartQty: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const clearCart = () => setCart([]);

  async function handleUpdateStatus(rawId, newStatus) {
    try {
      if (supabaseConfigured && session && rawId) {
        const { error } = await supabase.from('repair_orders').update({ status: newStatus }).eq('id', rawId);
        if (error) throw error;
      }
      const targetOrder = orders.find(o => o.rawId === rawId);
      setOrders(prev => prev.map(o => o.rawId === rawId ? { ...o, status: newStatus, color: statusClass(newStatus), deliveredAt: ['Entregue','Entregue ao cliente'].includes(newStatus) ? (o.deliveredAt || new Date().toISOString()) : o.deliveredAt } : o));
      // Ao marcar uma OS como entregue, cria automaticamente um item na fila de pós-venda.
      // O envio automático real exige integração com a API oficial do WhatsApp.
      if (targetOrder && ['Entregue', 'Entregue ao cliente'].includes(newStatus)) {
        try {
          const key = 'rt_post_sale_v1';
          const queue = JSON.parse(localStorage.getItem(key) || '[]');
          if (!queue.some(item => item.orderId === targetOrder.id)) {
            queue.unshift({ id: String(Date.now()), orderId: targetOrder.id, customer: targetOrder.customer || '', phone: targetOrder.phone || '', purchase: targetOrder.device || 'Aparelho/serviço da assistência', amount: targetOrder.amount || '', payment: 'Entrega confirmada', status: 'Pronto para enviar convite', createdAt: new Date().toISOString(), rating: 0, comment: '' });
            localStorage.setItem(key, JSON.stringify(queue));
          }
        } catch (queueError) { console.warn('Não foi possível preparar o pós-venda automático', queueError); }
      }
      if (targetOrder) addAuditLog(`Alterou status da ${targetOrder.id} para "${newStatus}"`);
      notify(`Status alterado para "${newStatus}".`);
    } catch (err) { notify('Erro ao atualizar status.'); }
  }

  const handleCashTransaction = (e) => {
    e.preventDefault();
    if (!cashTx.description || !cashTx.amount) {
      notify('Preencha a descrição e o valor.'); return;
    }
    if (cashTx.type === 'in' && !cashTx.seller.trim()) {
      notify('Selecione o funcionário responsável pela venda para registrar o desempenho e a comissão.'); return;
    }
    if (!cashRegister.isOpen) { notify('Abra o caixa antes de registrar movimentações.'); return; }
    const val = parseMoneyValue(cashTx.amount);
    if (!(val > 0)) { notify('Informe um valor maior que zero.'); return; }
    const newEntry = {
      id: String(Date.now()), type: cashTx.type, description: cashTx.description,
      category: cashTx.type === 'in' ? cashTx.category : 'Saídas/Despesas',
      seller: cashTx.type === 'in' ? cashTx.seller : '', paymentMethod: cashTx.type === 'in' ? (cashTx.paymentMethod || 'Dinheiro') : 'Dinheiro',
      sourceType: 'manual', commissionAmount: cashTx.type === 'in' && cashTx.seller.trim() ? (localStorage.getItem('rt_commission_mode') === 'percent' ? val * (Number(localStorage.getItem('rt_phone_commission_fixed') || techCommissionRate) || 0) / 100 : Number(localStorage.getItem('rt_phone_commission_fixed') || techCommissionRate) || 0) : 0,
      amount: val, createdAt: new Date().toISOString(), time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      user: userAccessLevel === 'owner' ? 'Dono' : 'Técnico'
    };
    setCashRegister(prev => ({ ...prev, entries: [newEntry, ...prev.entries] }));
    addAuditLog(`Registrou ${cashTx.type === 'in' ? 'Entrada' : 'Sangria/Saída'} no caixa da loja: R$ ${val.toFixed(2)} (${cashTx.description})`);
    setShowCashTransactionModal(false);
    setCashTx({ type: 'in', category: 'Acessórios', seller: '', description: '', amount: '', paymentMethod: 'Dinheiro' });
    notify('Lançamento registrado no caixa da loja!');
  };

  const handleReceiveOrderPayment = async (e) => {
    e.preventDefault();
    const order = showOrderPaymentModal;
    if (!order) return;
    if (!cashRegister.isOpen) { notify('Abra o caixa antes de receber pagamentos.'); return; }
    if (!supabaseConfigured || !session?.user?.id) { notify('Entre na sua conta para registrar o pagamento no banco de dados.'); return; }
    if (!order.rawId || !order.organizationId) { notify('Esta OS não possui os identificadores necessários do Supabase. Atualize a página e tente novamente.'); return; }

    const amount = parseMoneyValue(orderPayment.amount);
    if (!(amount > 0)) { notify('Informe um valor recebido maior que zero.'); return; }

    setSaving(true);
    try {
      // Registra o pagamento e atualiza o saldo dentro de uma única transação no banco.
      const { data: paymentRow, error: paymentError } = await supabase.rpc('rt_receive_order_payment', {
        p_organization_id: order.organizationId,
        p_repair_order_id: order.rawId,
        p_amount: amount,
        p_method: orderPayment.method,
        p_reference: orderPayment.reference || `OS-${order.rawId}-${createRtOperationId('payment')}`
      });
      if (paymentError) throw paymentError;

      const payment = Array.isArray(paymentRow) ? paymentRow[0] : paymentRow;
      if (!payment?.payment_id) throw new Error('O banco não retornou a confirmação do pagamento. Atualize a tela antes de tentar novamente.');

      const paidAt = payment.paid_at || new Date().toISOString();
      const nextPaidAmount = Number(payment.amount_paid);
      const paymentId = payment.payment_id;
      const entry = { id: paymentId, type: 'in', description: `Pagamento OS ${order.id} — ${order.customer || 'Cliente'}`, category: 'Assistência técnica', seller: '', amount, paymentMethod: orderPayment.method, sourceType: 'os_payment', orderId: order.id, rawOrderId: order.rawId, createdAt: paidAt, time: new Date(paidAt).toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit'}), user: userAccessLevel === 'owner' ? 'Dono' : 'Técnico' };
      // O RPC já grava a mesma entrada no caixa, na mesma transação do pagamento.
      // Usa o estado retornado pelo banco e deduplica pelo ID para não lançar duas vezes.
      if (payment.cash_state && typeof payment.cash_state === 'object') {
        setCashRegister(prev => ({ isOpen: false, openingBalance: 0, openedAt: null, openedBy: '', entries: [], closedSessions: [], ...prev, ...payment.cash_state }));
      } else {
        setCashRegister(prev => ({ ...prev, entries: [entry, ...(prev.entries || []).filter(existing => String(existing.id) !== String(paymentId))] }));
      }
      const nextPayments = [...(order.payments || []).filter(existing => String(existing.id) !== String(paymentId)), { id: paymentId, amount, method: orderPayment.method, paidAt, reference: orderPayment.reference || '' }];
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, paidAmount: nextPaidAmount, payments: nextPayments } : o));
      addAuditLog(`Recebeu R$ ${amount.toFixed(2)} da OS ${order.id} via ${orderPayment.method}`);
      try { localStorage.removeItem(`rt_order_payment_attempt_${order.rawId}`); } catch {}
      setShowOrderPaymentModal(null);
      setOrderPayment({ amount: '', method: 'Pix', reference: '' });
      notify(`Pagamento de R$ ${amount.toFixed(2).replace('.', ',')} registrado no Supabase.`);
    } catch (error) {
      console.error('Erro ao registrar pagamento da OS:', error);
      notify(`Não foi possível registrar o pagamento: ${error?.message || 'verifique a função rt_receive_order_payment no Supabase'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleOpenCash = () => {
    const raw = window.prompt('Valor inicial em dinheiro (fundo de troco), em R$:', '0,00');
    if (raw === null) return;
    const openingBalance = parseMoneyValue(raw);
    if (openingBalance < 0) { notify('O saldo inicial não pode ser negativo.'); return; }
    setCashRegister(prev => {
      const history = [...(prev.closedSessions || [])];
      if (prev.isOpen === false && prev.closedAt && prev.entries?.length) history.unshift({ openingBalance: prev.openingBalance, openedAt: prev.openedAt, openedBy: prev.openedBy, closedAt: prev.closedAt, closedBy: prev.closedBy, countedCash: prev.countedCash, expectedCash: prev.expectedCash, difference: prev.difference, entries: prev.entries });
      return { ...prev, isOpen: true, openingBalance, openedAt: new Date().toISOString(), openedBy: userAccessLevel === 'owner' ? 'Dono' : 'Técnico', closedAt: null, entries: [], closedSessions: history };
    });
    addAuditLog(`Abriu o caixa com fundo inicial de R$ ${openingBalance.toFixed(2)}`); notify('Caixa aberto.');
  };

  const handleCloseCash = () => {
    if (!cashRegister.isOpen) return;
    const moneyIn = cashRegister.entries.filter(e => e.type === 'in' && (e.paymentMethod || 'Dinheiro') === 'Dinheiro').reduce((sum,e)=>sum+Number(e.amount||0),0);
    const moneyOut = cashRegister.entries.filter(e => e.type === 'out').reduce((sum,e)=>sum+Number(e.amount||0),0);
    const expectedCash = Number(cashRegister.openingBalance || 0) + moneyIn - moneyOut;
    const raw = window.prompt(`Dinheiro contado na gaveta (R$). Saldo esperado: ${expectedCash.toFixed(2).replace('.', ',')}`, expectedCash.toFixed(2).replace('.', ','));
    if (raw === null) return;
    const countedCash = parseMoneyValue(raw); const difference = countedCash - expectedCash;
    setCashRegister(prev => ({ ...prev, isOpen: false, closedAt: new Date().toISOString(), closedBy: userAccessLevel === 'owner' ? 'Dono' : 'Técnico', expectedCash, countedCash, difference }));
    addAuditLog(`Fechou o caixa. Esperado R$ ${expectedCash.toFixed(2)}, contado R$ ${countedCash.toFixed(2)}, diferença R$ ${difference.toFixed(2)}`); notify('Fechamento do caixa registrado.');
  };

  const handleInviteMember = (e) => {
    e.preventDefault();
    if (!newMember.name || !newMember.email) return;
    const member = {
      id: String(Date.now()),
      name: newMember.name,
      email: newMember.email,
      role: newMember.role,
      status: 'Ativo'
    };
    setTeamMembers(prev => [...prev, member]);
    addAuditLog(`Adicionou o membro ${newMember.name} à equipe`);
    setShowInviteMemberModal(false);
    setNewMember({ name: '', email: '', role: 'technician' });
    notify('Membro convidado com sucesso!');
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setStoreLogo(reader.result);
        notify('Logotipo atualizado com sucesso!');
      };
      reader.readAsDataURL(file);
    }
  };

  const calculateTotalUpgradeDiscount = () => {
    let total = 0;
    if (selectedDefects.screenReplaced) total += Number(upgradeDiscounts.screenReplaced || 0);
    if (selectedDefects.batteryReplaced) total += Number(upgradeDiscounts.batteryReplaced || 0);
    if (selectedDefects.faceIdOff) total += Number(upgradeDiscounts.faceIdOff || 0);
    if (selectedDefects.cameraFailed) total += Number(upgradeDiscounts.cameraFailed || 0);
    if (selectedDefects.cameraLensScratched) total += Number(upgradeDiscounts.cameraLensScratched || 0);
    if (selectedDefects.chargingPortFailed) total += Number(upgradeDiscounts.chargingPortFailed || 0);
    if (selectedDefects.audioSpeakerFailed) total += Number(upgradeDiscounts.audioSpeakerFailed || 0);
    if (selectedDefects.nfcFailed) total += Number(upgradeDiscounts.nfcFailed || 0);
    if (selectedDefects.wifiFailed) total += Number(upgradeDiscounts.wifiFailed || 0);
    if (selectedDefects.housingScratched) total += Number(upgradeDiscounts.housingScratched || 0);
    return total;
  };

  const finishUpgradeToWhatsapp = () => {
    let defectDetails = '';
    const totalDiscount = calculateTotalUpgradeDiscount();

    if (upgradeAssistantEnabled) {
      const list = [];
      if (selectedDefects.screenReplaced) list.push(`• Tela Trocada/Trincada (-R$ ${upgradeDiscounts.screenReplaced})`);
      if (selectedDefects.batteryReplaced) list.push(`• Bateria Trocada/Não Original (-R$ ${upgradeDiscounts.batteryReplaced})`);
      if (selectedDefects.faceIdOff) list.push(`• Face ID/Biometria Off (-R$ ${upgradeDiscounts.faceIdOff})`);
      if (selectedDefects.cameraFailed) list.push(`• Câmera com falha/trocada (-R$ ${upgradeDiscounts.cameraFailed})`);
      if (selectedDefects.cameraLensScratched) list.push(`• Lente/Vidro da Câmera arranhado (-R$ ${upgradeDiscounts.cameraLensScratched})`);
      if (selectedDefects.chargingPortFailed) list.push(`• Conector/Dock de Carga ruim (-R$ ${upgradeDiscounts.chargingPortFailed})`);
      if (selectedDefects.audioSpeakerFailed) list.push(`• Alto-falante/Auricular com falha (-R$ ${upgradeDiscounts.audioSpeakerFailed})`);
      if (selectedDefects.nfcFailed) list.push(`• NFC/Aproximação não funciona (-R$ ${upgradeDiscounts.nfcFailed})`);
      if (selectedDefects.wifiFailed) list.push(`• Wi-Fi/Bluetooth inoperante (-R$ ${upgradeDiscounts.wifiFailed})`);
      if (selectedDefects.housingScratched) list.push(`• Carcaça/Vidro Traseiro com marcas (-R$ ${upgradeDiscounts.housingScratched})`);

      if (list.length > 0) {
        defectDetails = `\n\n🔍 *Estado informado do aparelho atual:*\n${list.join('\n')}\n*Abatimento estimado:* -R$ ${totalDiscount.toFixed(2)}`;
      } else {
        defectDetails = `\n\n🔍 *Estado informado do aparelho atual:* 100% Impecável (Sem detalhes/peças trocadas)`;
      }
    }

    const photoNote = capturedPhoto ? '\n📸 *Foto do aparelho:* Capturada pelo cliente no app' : '';

    const text = encodeURIComponent(
      `Olá! Gostaria de fazer uma simulação de *UPGRADE* na ${storeName}.\n\n` +
      `📱 *Aparelho atual:* ${currentDevice || 'Não especificado'}\n` +
      `✨ *Aparelho desejado:* ${targetDevice}` +
      photoNote +
      defectDetails +
      `\n\nPodemos avaliar a diferença de valores final?`
    );
    window.open(`https://wa.me/${whatsappNumber}?text=${text}`, '_blank');
    setShowUpgradeModal(false);
    setUpgradeStep(1);
    setCapturedPhoto(null);
    setCurrentDevice('');
    setSelectedDefects({
      screenReplaced: false,
      batteryReplaced: false,
      faceIdOff: false,
      cameraFailed: false,
      cameraLensScratched: false,
      chargingPortFailed: false,
      audioSpeakerFailed: false,
      nfcFailed: false,
      wifiFailed: false,
      housingScratched: false,
    });
  };

  const shareOsStatusWhatsapp = (order) => {
    let msg = '';
    if (order.status === 'Recebido') msg = `Olá ${order.customer}! Seu ${order.device} foi recebido em nossa assistência (${storeName}). Código para acompanhar: ${order.id}`;
    else if (order.status === 'Em manutenção') msg = `Olá ${order.customer}! Seu ${order.device} (${order.id}) já entrou em bancada de testes e reparo na ${storeName}.`;
    else if (order.status === 'Pronto para retirada') msg = `Oba ${order.customer}! Seu ${order.device} (${order.id}) está PRONTO para retirada na ${storeName}! Valor: ${order.amount}`;
    else if (order.status === 'Aguardando aprovação') msg = `Olá ${order.customer}! O orçamento do seu ${order.device} (${order.id}) foi gerado: ${order.amount}. Podemos iniciar o reparo?`;
    else if (order.status === 'Aguardando peça') msg = `Olá ${order.customer}! O reparo do seu ${order.device} (${order.id}) está aguardando a chegada da peça de reposição. Logo te avisamos!`;
    else msg = `Olá ${order.customer}! Atualização da sua OS ${order.id} (${order.device}): Status atual é ${order.status}.`;

    const text = encodeURIComponent(msg);
    const targetPhone = order.phone || whatsappNumber;
    window.open(`https://wa.me/${targetPhone}?text=${text}`, '_blank');
  };

  const sendWarrantyTermWhatsapp = (order) => {
    const warrantyStart = order.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR');
    const warrantyEnd = new Date(new Date(order.deliveredAt || new Date().toISOString()).getTime() + (Number(order.warrantyDays || 90) * 86400000)).toLocaleDateString('pt-BR');
    const msg = encodeURIComponent(`📜 *TERMO DE GARANTIA & CONDIÇÕES TÉCNICAS* - ${storeName.toUpperCase()}\n\n` +
      `Ordem de Serviço: *${order.id}*\n` +
      `Cliente: *${order.customer || 'Não informado'}*\n` +
      `Aparelho: *${order.device}*\n` +
      `Defeito/serviço registrado: *${order.issue || 'Conforme diagnóstico da OS'}*\n` +
      `Valor registrado: *${order.amount || 'A definir'}*\n` +
      `Data de início da garantia: *${warrantyStart}*\n` +
      `Data estimada de término: *${warrantyEnd}*\n` +
      `Prazo de garantia: *${order.warrantyDays || 90} dias*\n\n` +
      `⚠️ *CONDIÇÕES LEGAIS DE GARANTIA:*\n` +
      `1. A garantia cobre exclusivamente o serviço realizado e a peça substituída.\n` +
      `2. A garantia será *ANULADA* em casos de: Danos físicos, tela trincada/quebrada, contato com líquidos/umidade, selo de garantia violado ou intervenção por terceiros.\n` +
      `3. Aparelhos não retirados em até 90 dias poderão ser vendidos para custeio de peças.\n\n` +
      `Endereço da Loja: ${storeAddress}\n` +
      `Agradecemos a confiança!`);
    
    const targetPhone = order.phone || whatsappNumber;
    window.open(`https://wa.me/${targetPhone}?text=${msg}`, '_blank');
  };

  const sendChecklistReportWhatsapp = (order) => {
    const checklistLabels = { screen: 'Tela / Touchscreen & Display', faceId: 'Face ID / Touch ID', cameras: 'Câmeras', charging: 'Conector de carga & bateria', audio: 'Áudio & microfone', wifi: 'Wi-Fi, Bluetooth & sinal', housing: 'Carcaça & vidro traseiro' };
    const checklistRows = Object.entries(checklistLabels).map(([key,label]) => `<tr><td>${label}</td><td>${order.checklist?.[key] === 'ok' ? 'OK' : order.checklist?.[key] === 'issue' ? 'Avaria registrada' : 'Não verificado'}</td></tr>`).join('');
    const report = window.open('', '_blank');
    if (report) {
      report.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Check-in ${order.id}</title><style>body{font:14px Arial,sans-serif;margin:32px;color:#111}h1{font-size:22px}table{border-collapse:collapse;width:100%;margin-top:16px}td,th{border:1px solid #bbb;padding:8px;text-align:left}.note{margin-top:24px;color:#555;font-size:12px}@media print{button{display:none}}</style></head><body><h1>${storeName} — Comprovante de Check-in</h1><p><b>OS:</b> ${order.id}</p><p><b>Cliente:</b> ${order.customer || ''}</p><p><b>WhatsApp:</b> ${order.phone || ''}</p><p><b>Aparelho:</b> ${order.device || ''}</p><p><b>Defeito informado:</b> ${order.issue || ''}</p><p><b>Data:</b> ${new Date().toLocaleString('pt-BR')}</p><table><thead><tr><th>Item vistoriado</th><th>Condição registrada</th></tr></thead><tbody>${checklistRows}</tbody></table><h2>Fotos do check-in</h2><div>${(order.checkinPhotos||[]).map((src,i)=>`<img src="${src}" alt="Foto ${i+1}" style="width:180px;height:180px;object-fit:contain;margin:6px;border:1px solid #bbb"/>`).join('')}</div><p class="note">Este comprovante registra somente os itens marcados no check-in. Guarde uma cópia junto à ordem de serviço.</p><button onclick="window.print()">Imprimir / Salvar em PDF</button></body></html>`);
      report.document.close();
    }
    const phone = String(order.phone || '').replace(/\D/g, '');
    const message = encodeURIComponent(`Olá ${order.customer || ''}! Seu check-in foi registrado na ${storeName}. Código exclusivo para acompanhar sua OS: ${order.id}. Entre no painel do cliente, abra “Rastreio de OS” e informe esse código. O comprovante do check-in foi aberto para salvar em PDF; anexe o arquivo nesta conversa antes de enviar.`);
    if (phone) window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    else notify(`Código de rastreio: ${order.id}. Não há WhatsApp cadastrado para abrir a conversa.`);
  };

  const sendPellicleReminder = (order) => {
    const msg = encodeURIComponent(`Olá ${order.customer}! Faz alguns meses que realizamos a manutenção do seu ${order.device} na ${storeName}. Que tal passar aqui para fazer uma revisão preventiva da bateria ou trocar sua película de vidro com 20% de desconto especial? 😊`);
    const targetPhone = order.phone || whatsappNumber;
    window.open(`https://wa.me/${targetPhone}?text=${msg}`, '_blank');
  };

  async function logout() {
    if (supabaseConfigured) await supabase.auth.signOut();
    setSession(null);
    setUserRole('client');
    localStorage.setItem('rt_user_role', 'client');
    setActive('stores_directory');
  }

  if (showSplash) {
    return <BrandSplash onFinish={() => {
      setShowSplash(false);
      sessionStorage.setItem('rt_splash_shown', 'true');
    }} />;
  }

  if (!authChecked) return <div className="loading-screen" style={{background: '#050505'}}><div className="brand-mark"><Smartphone size={22}/></div><span>Iniciando ambiente seguro...</span></div>;
  
  if (supabaseConfigured && !session) return (
    <div className="auth-shell" style={{background: '#050505'}}>
      <div className="auth-visual">
        <div className="auth-orb orb-one"></div><div className="auth-orb orb-two"></div>
        <div className="auth-brand"><div className="brand-mark" style={{background: '#000', border: '1px solid #222'}}>{storeLogo ? <img src={storeLogo} alt="Logo" style={{width: '100%', height: '100%', borderRadius: '6px', objectFit: 'cover'}}/> : <span style={{fontWeight: 900, color: '#fff', fontSize: '13px'}}>RT</span>}</div><span>RT MOBILE<span className="brand-light"> / SYSTEMS</span></span></div>
        <div className="auth-hero-copy"><div className="eyebrow"><Sparkles size={14}/> GESTÃO PROFISSIONAL PARA ESTABELECIMENTOS</div><h1>Sistema de Gestão<br/><span>para o seu Negócio.</span></h1><p>Organize ordens de serviço, caixa, estoque e atendimento em um só lugar.</p></div>
        <div className="auth-visual-footer"><span>RT MOBILE PLATFORM</span><span>v1.0</span></div>
      </div>
      
      <form className="auth-card" onSubmit={handleAuth} style={{background: '#0a0a0c', border: '1px solid #1f1f23'}}>
        <div className="auth-role-switch" style={{display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px', background: '#111', padding: '4px', borderRadius: '8px', border: '1px solid #222', minWidth: 0, width: '100%', boxSizing: 'border-box'}}>
          <button type="button" className={`secondary-btn ${userRole === 'client' ? 'primary-btn' : ''}`} style={{flex: '1 1 140px', minWidth: 0, whiteSpace: 'normal', overflowWrap: 'anywhere', lineHeight: 1.25, fontSize: '13px', padding: '10px 8px'}} onClick={() => setUserRole('client')}>
            Área do Cliente (Portal)
          </button>
          <button type="button" className={`secondary-btn ${userRole === 'tech' ? 'primary-btn' : ''}`} style={{flex: '1 1 140px', minWidth: 0, whiteSpace: 'normal', overflowWrap: 'anywhere', lineHeight: 1.25, fontSize: '13px', padding: '10px 8px'}} onClick={() => setUserRole('tech')}>
            Painel do Estabelecimento
          </button>
        </div>

        <div className="auth-card-top"><div className="small-icon"><ShieldCheck size={20}/></div><span className="micro-label">{userRole === 'tech' ? 'ÁREAS DE ACESSO DO LOJISTA' : 'PORTAL DE CONSULTAS'}</span></div>
        <h2>{userRole === 'tech' ? (authMode === 'login' ? 'Entrar no Painel' : 'Cadastrar Estabelecimento (48h Grátis)') : 'Entrar para Consultar OS'}</h2>
        <p className="muted">{userRole === 'tech' ? 'Acesse sua bancada, caixa e fluxo de atendimento.' : 'Consulte o status do seu atendimento e serviços em andamento.'}</p>
        
        <label>E-mail<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="seu@email.com" required/></label>
        <label>Senha<input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Mínimo de 6 caracteres" minLength="6" required/></label>
        {authError && <div className="form-error">{authError}</div>}
        
        <button className="primary-btn full-btn" disabled={saving}>{saving ? 'Aguarde...' : authMode === 'login' ? (userRole === 'tech' ? 'Entrar no Painel' : 'Acessar Portal') : (userRole === 'tech' ? 'Iniciar Teste Grátis de 48 horas' : 'Criar Conta')}<ArrowUpRight size={16}/></button>
        <button type="button" className="text-btn auth-switch" onClick={()=>{setAuthMode(authMode==='login'?'signup':'login');setAuthError('')}}>{authMode==='login'?'Ainda não tem conta? Testar 48h Grátis':'Já tem conta? Entrar'}</button>
        
        {userRole === 'tech' && (
          <button type="button" className="secondary-btn full-btn" style={{marginTop: '15px', border: '1px solid #25D366', color: '#25D366'}} onClick={() => setShowPaymentModal(true)}>
            <QrCode size={16}/> Pagar / Renovar Assinatura (R$ 50,00/mês)
          </button>
        )}

        <div className="auth-note"><ShieldCheck size={14}/> Conexão protegida por RT Mobile</div>
      </form>

      {showPaymentModal && (
        <div className="modal-backdrop" onClick={()=>setShowPaymentModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()} style={{background: '#0f0f12', border: '1px solid #222', maxWidth: '450px', textAlign: 'center'}}>
            <div className="modal-head"><div><div className="eyebrow">ATIVAÇÃO / RENOVAÇÃO</div><h2>Plano Profissional — R$ 50,00/mês</h2></div><button type="button" className="icon-btn" onClick={()=>setShowPaymentModal(false)}><X size={19}/></button></div>
            <p className="muted" style={{fontSize: '13px'}}>Pague o Pix para manter seu estabelecimento ativo e liberar o painel sem limites para você e sua equipe.</p>
            
            <div style={{margin: '20px 0', background: '#000', padding: '15px', borderRadius: '12px', border: '1px solid #333', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px'}}>
              <PixQrCode pixKey={adminPixKey} name="RT MOBILE" city="CASTANHAL" amount={50} size={150} />
              <span style={{fontSize: '12px', color: '#aaa'}}>Chave Pix (PicPay / Telefone):</span>
              <strong style={{fontSize: '16px', color: '#fff', background: '#18181f', padding: '8px 14px', borderRadius: '6px', border: '1px solid #444'}}>{adminPixKey}</strong>
              <button 
                type="button" 
                onClick={() => { navigator.clipboard.writeText(adminPixKey); notify('Chave Pix copiada!'); }}
                className="secondary-btn" 
                style={{fontSize: '11px', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px'}}
              >
                <Copy size={12}/> Copiar Chave Pix
              </button>
              <small style={{color: '#888'}}>Titular: Robert (RT Mobile)</small>
            </div>

            <a href={`https://wa.me/${adminWhatsapp}?text=${encodeURIComponent(`Olá Robert! Efetuei o Pix de R$ 50,00 para renovar/ativar meu estabelecimento (${email}). Pode liberar meu acesso?`)}`} target="_blank" rel="noreferrer" className="primary-btn full-btn" style={{background: '#25D366', color: '#000', fontWeight: 'bold', textDecoration: 'none'}}>
              <MessageCircle size={16}/> Enviar Comprovante no WhatsApp (Desenvolvedor)
            </a>
          </div>
        </div>
      )}
    </div>
  );

  const activeNav = userRole === 'tech' ? navTech : navClient;

  return (
    <div className="app-shell" style={{background: '#08080a', color: '#f0f0f0'}}>
      
      {showTvMode && (
        <TvModeScreen
          orders={orders}
          storeName={storeName}
          onClose={() => setShowTvMode(false)}
        />
      )}

      <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`} style={{background: '#0a0a0c', borderRight: '1px solid #18181b', height: '100dvh', maxHeight: '100dvh', overflowY: 'auto', overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch', touchAction: 'pan-y'}}>
        <div className="brand-lockup">
          <div className="brand-mark" style={{background: '#000', width: '38px', height: '38px', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #222'}}>
            {storeLogo ? (
              <img src={storeLogo} alt="Logo" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
            ) : (
              <span style={{fontWeight: 900, color: '#fff', fontSize: '13px', letterSpacing: '-0.5px'}}>RT</span>
            )}
          </div>
          <div>
            <div className="brand-name" style={{fontSize: '15px', fontWeight: 'bold'}}>{userRole === 'tech' ? storeName : 'RT Mobile'}</div>
            <div className="brand-sub" style={{color: '#666', fontSize: '10px'}}>{userRole === 'tech' ? 'PAINEL DO ESTABELECIMENTO' : 'PORTAL DO CLIENTE'}</div>
          </div>
          <button className="mobile-close icon-btn" onClick={()=>setMobileNav(false)}><X size={18}/></button>
        </div>
        
        {userRole === 'tech' && !isAccountExpired && (
          <div style={{padding: '8px 12px', background: '#111', borderRadius: '8px', margin: '10px 12px', border: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <span style={{fontSize: '11px', color: '#888'}}>Nível de Acesso:</span>
            <select 
              value={userAccessLevel} 
              onChange={e => {
                setUserAccessLevel(e.target.value);
                notify(e.target.value === 'owner' ? 'Modo Administrador (Dono)' : 'Modo Operador / Técnico');
              }}
              style={{background: '#000', color: '#fff', border: '1px solid #333', borderRadius: '4px', padding: '2px 6px', fontSize: '11px'}}
            >
              <option value="owner">👑 Dono (Admin)</option>
              <option value="technician">🛠️ Operador / Técnico</option>
            </select>
          </div>
        )}

        {isSuperAdmin && (
          <div 
            className="workspace-switch" 
            onClick={() => {
              const nextRole = userRole === 'tech' ? 'client' : 'tech';
              setUserRole(nextRole);
              localStorage.setItem('rt_user_role', nextRole);
              setActive(nextRole === 'tech' ? 'overview' : 'stores_directory');
              notify(nextRole === 'tech' ? 'Alternado para MODO ESTABELECIMENTO' : 'Alternado para VISÃO DE CLIENTE');
            }}
            style={{background: '#121215', border: '1px solid #222', cursor: 'pointer'}}
          >
            <div className="workspace-avatar" style={{background: userRole === 'tech' ? '#25D366' : '#3b82f6', color: '#000', fontWeight: 'bold'}}>
              {userRole === 'tech' ? 'E' : 'C'}
            </div>
            <div className="workspace-info">
              <strong>{userRole === 'tech' ? 'Modo Estabelecimento' : 'Visão do Cliente'}</strong>
              <span style={{color: '#25D366'}}>Painel ADM Geral ⚡</span>
            </div>
            <ChevronDown size={15}/>
          </div>
        )}

        {userRole === 'tech' && (
          <div style={{padding: '0 12px', margin: '4px 0 10px'}}>
            <button
              type="button"
              onClick={() => setShowTvMode(true)}
              className="secondary-btn full-btn"
              style={{
                background: 'linear-gradient(135deg, #111827, #0f172a)',
                border: '1px solid #38bdf8', color: '#38bdf8', fontWeight: 'bold',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '8px'
              }}
            >
              <Tv size={16}/> Abrir Modo TV / Recepção
            </button>
          </div>
        )}
        
        <div className="nav-caption">NAVEGAÇÃO</div>
        <nav style={{overflowY: 'visible', touchAction: 'pan-y'}}>{activeNav.map(item => <button key={item.id} className={`nav-item ${active===item.id?'active':''}`} onClick={()=>{setActive(item.id);setMobileNav(false)}}><item.icon size={18}/><span>{item.label}</span>{item.id==='orders' && <span className="nav-count">{orders.length}</span>}{item.id==='customers' && <span className="nav-count">{customers.length}</span>}{item.id==='inventory' && <span className="nav-count">{inventory.length}</span>}</button>)}</nav>
        
        <div className="sidebar-bottom">
          {userRole === 'tech' && !isAccountExpired && (
            <div className="plan-card" style={{background: '#111', border: '1px solid #222'}}>
              <div className="plan-icon"><Sparkles size={16}/></div>
              <strong>RT Mobile OS</strong>
              <p>Seu estabelecimento organizado e produtivo.</p>
              <div className="plan-progress"><span style={{width: '100%', background: '#25D366'}}/></div>
              <small style={{color: '#25D366'}}>• {isLifetimeAdmin ? '👑 Licença Vitalícia Ativa' : (isTrialActive ? `Teste Grátis (${trialTimeLeft}h restantes)` : `Plano Profissional (${planDaysLeft} dias restantes)`)}</small>
            </div>
          )}
          <button className="profile-row" onClick={()=>userRole === 'tech' ? setActive('settings') : logout()} style={{background: '#121215'}}>
            <div className="profile-avatar">{userRole === 'tech' ? storeName.slice(0, 1).toUpperCase() : 'C'}</div>
            <div className="profile-info">
              <strong>{userRole === 'tech' ? (userAccessLevel === 'owner' ? 'Dono (Admin)' : 'Operador') : 'Cliente'}</strong>
              <span>{session?.user?.email || 'Conectado'}</span>
            </div>
            <span style={{letterSpacing: '2px', color: '#666'}}>•••</span>
          </button>
        </div>
      </aside>
      
      {mobileNav && <div className="nav-overlay" onClick={()=>setMobileNav(false)} />}
      
      <main className="main-area" style={{background: '#08080a', position: 'relative'}}>
        {userRole === 'tech' && isAccountExpired && !isLifetimeAdmin ? (
          <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', minHeight: '100vh',
            background: 'radial-gradient(circle at center, #111116 0%, #050507 100%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '24px', textAlign: 'center', zIndex: 99
          }}>
            <div style={{
              background: '#0d0d12', border: '1px solid #27272a', padding: '36px', borderRadius: '16px',
              maxWidth: '480px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
            }}>
              <div style={{width: '64px', height: '64px', background: '#27272a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#f59e0b'}}>
                <Lock size={32}/>
              </div>
              <h2 style={{fontSize: '22px', fontWeight: 'bold', margin: '0 0 10px', color: '#fff'}}>
                {expiredReason === 'monthly' ? 'Assinatura Mensal Vencida' : 'Período de Teste Finalizado'}
              </h2>
              <p style={{fontSize: '14px', color: '#a1a1aa', lineHeight: '1.5', margin: '0 0 24px'}}>
                {expiredReason === 'monthly'
                  ? 'Seu plano mensal de 30 dias na RT Mobile encerrou. Renove sua assinatura para continuar usando o sistema.'
                  : 'Suas 48 horas de teste gratuito na RT Mobile se esgotaram. Seus dados, ordens de serviço, clientes e estoque continuam salvos e seguros.'}
              </p>

              <div style={{background: '#000', border: '1px solid #333', borderRadius: '12px', padding: '20px', margin: '0 0 24px'}}>
                <PixQrCode pixKey={adminPixKey} name="RT MOBILE" city="CASTANHAL" amount={50} size={150} />
                <span style={{fontSize: '12px', color: '#888'}}>Chave Pix (Telefone / PicPay):</span>
                <div style={{fontSize: '16px', fontWeight: 'bold', color: '#fff', background: '#18181f', padding: '8px', borderRadius: '6px', margin: '6px 0', border: '1px solid #444'}}>
                  {adminPixKey}
                </div>
                <button 
                  type="button" 
                  onClick={() => { navigator.clipboard.writeText(adminPixKey); notify('Chave Pix copiada com sucesso!'); }}
                  className="secondary-btn" 
                  style={{fontSize: '11px', padding: '4px 10px', margin: '6px auto 0', display: 'flex', alignItems: 'center', gap: '4px'}}
                >
                  <Copy size={12}/> Copiar Chave Pix
                </button>
                <small style={{color: '#aaa', fontSize: '11px', display: 'block', marginTop: '6px'}}>Valor: R$ 50,00/mês | Titular: Robert (RT Mobile)</small>
              </div>

              <a 
                href={`https://wa.me/${adminWhatsapp}?text=${encodeURIComponent(`Olá Robert! Minha assinatura da loja (${session?.user?.email}) encerrou. Acabei de realizar o Pix de R$ 50,00 para renovar por 30 dias, pode liberar meu acesso?`)}`}
                target="_blank" 
                rel="noreferrer"
                className="primary-btn full-btn"
                style={{background: '#25D366', color: '#000', fontWeight: 'bold', textDecoration: 'none', padding: '12px', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}
              >
                <MessageCircle size={18}/> Enviar Comprovante no WhatsApp
              </a>

              <button 
                onClick={logout}
                className="secondary-btn full-btn"
                style={{marginTop: '12px', padding: '10px', fontSize: '13px'}}
              >
                Sair da conta
              </button>
            </div>
          </div>
        ) : (
          <>
            {userRole === 'tech' && isTrialActive && !isLifetimeAdmin && (
              <div style={{background: 'linear-gradient(90deg, #1e3a8a, #0284c7)', color: '#fff', padding: '8px 16px', fontSize: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '500'}}>
                <span style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                  <Clock size={15}/> ⏳ PERÍODO DE TESTE GRÁTIS ATIVO: Você tem <strong>{trialTimeLeft} horas restantes</strong> para usar todas as funções!
                </span>
                <button onClick={()=>setShowPaymentModal(true)} style={{background: '#fff', color: '#000', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px'}}>
                  Ativar R$ 50/mês
                </button>
              </div>
            )}

            {userRole === 'tech' && !isTrialActive && !isLifetimeAdmin && planDaysLeft <= 5 && (
              <div style={{background: 'linear-gradient(90deg, #b45309, #d97706)', color: '#fff', padding: '8px 16px', fontSize: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '500'}}>
                <span style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                  <AlertTriangle size={15}/> ⚠️ ATENÇÃO: Sua assinatura expira em <strong>{planDaysLeft} dias</strong>! Renove para não perder o acesso ao caixa e ordens.
                </span>
                <button onClick={()=>setShowPaymentModal(true)} style={{background: '#fff', color: '#000', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px'}}>
                  Renovar Pix (R$ 50)
                </button>
              </div>
            )}

            <header className="topbar" style={{background: '#0a0a0c', borderBottom: '1px solid #18181b'}}>
              <div className="topbar-left">
                <button className="icon-btn menu-trigger" onClick={()=>setMobileNav(true)}><Menu size={20}/></button>
                <div className="breadcrumb">{storeName} <span>/</span> <strong>{activeNav.find(n=>n.id===active)?.label || 'Visão geral'}</strong></div>
              </div>
              <div className="topbar-actions">
                {userRole === 'tech' && (
                  <button
                    type="button"
                    onClick={() => setShowTvMode(true)}
                    className="secondary-btn"
                    style={{display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', border: '1px solid #38bdf8', color: '#38bdf8'}}
                  >
                    <Tv size={15}/> Modo TV
                  </button>
                )}
                <div className="system-status"><span className="status-dot" style={{background: '#25D366'}}/> RT Mobile v1.0</div>
                <button className="icon-btn notification-btn" onClick={()=>notify('Você está em dia.')}><Bell size={18}/><i/></button>
                <button className="top-avatar" onClick={()=>userRole === 'tech' ? setActive('settings') : logout()}>
                  {userRole === 'tech' ? storeName.slice(0, 1).toUpperCase() : 'C'}
                </button>
              </div>
            </header>
            
            {active==='overview' && userRole === 'tech' && <Overview orders={orders} storeName={storeName} onNew={()=>setShowNewOrder(true)} onNavigate={setActive} modules={modules} inventory={inventory} onOpenTv={() => setShowTvMode(true)} />}
            {active==='orders' && userRole === 'tech' && <OrdersPage orders={filteredOrders} search={search} setSearch={setSearch} onNew={()=>setShowNewOrder(true)} onEdit={editOrder} onDelete={deleteOrder} onPay={o=>{ const due=Math.max(0,parseMoneyValue(o.amount)-Number(o.paidAmount||0)); if(due<=0){notify('Esta OS já está quitada.');return;} const attemptKey=`rt_order_payment_attempt_${o.rawId}`; let reference=''; try { reference=localStorage.getItem(attemptKey)||''; if(reference && (o.payments||[]).some(p=>String(p.reference||'')===reference)){ localStorage.removeItem(attemptKey); reference=''; } } catch {} if(!reference){ reference=`OS-${o.rawId}-${createRtOperationId('payment')}`; try { localStorage.setItem(attemptKey,reference); } catch {} } setShowOrderPaymentModal(o); setOrderPayment({amount:due.toFixed(2),method:'Pix',reference}); }} onStatus={handleUpdateStatus} onShare={shareOsStatusWhatsapp} onSendWarranty={sendWarrantyTermWhatsapp} onOpenChecklist={(o) => setShowChecklistModal(o)} onPrint={(o) => setShowPrintModal(o)} onPellicleReminder={sendPellicleReminder} />}
            {active==='customers' && userRole === 'tech' && <CustomersPage customers={customers} onNew={()=>setShowNewCustomer(true)} onEdit={editCustomer} onDelete={deleteCustomer} />}
            {active==='crm' && userRole === 'tech' && <><CrmPage customers={customers} storeName={storeName} whatsapp={whatsappNumber} /><div style={{marginTop:24}}><PostSalePage storeName={storeName} whatsapp={whatsappNumber} /></div></>}
            {active==='cash' && userRole === 'tech' && <><CashPage cashRegister={cashRegister} onNewTransaction={() => cashRegister.isOpen ? setShowCashTransactionModal(true) : notify('Abra o caixa antes de lançar movimentações.')} onOpenBarcodeSale={() => cashRegister.isOpen ? setShowBarcodeSaleModal(true) : notify('Abra o caixa antes de registrar vendas.')} onOpenProductSale={() => cashRegister.isOpen ? setShowProductSaleModal(true) : notify('Abra o caixa antes de registrar vendas.')} onOpenCash={handleOpenCash} onCloseCash={handleCloseCash} /><CashCalculator /></>}
            {active==='inventory' && userRole === 'tech' && <InventoryPage inventory={inventory} onNew={()=>setShowNewProduct(true)} onUpdateQty={updateProductQty} onEdit={editProduct} onDelete={deleteProduct} />}
            {active==='used_devices' && userRole === 'tech' && <UsedDevicesPage storeName={storeName} devices={usedDevices.filter(d => d.storeName === storeName || (!d.storeName && storeName === 'RT MOBILE'))} setDevices={setUsedDevices} enabled={usedDevicesEnabled} setEnabled={setUsedDevicesEnabled} />}
            {active==='reports' && userRole === 'tech' && userAccessLevel === 'owner' && <ReportsPage orders={orders} cashRegister={cashRegister} inventory={inventory} />}
            {active==='client_inventory' && <ClientInventoryPage inventory={inventory} storeName={storeName} cart={cart} addToCart={addToCart} onOpenCart={() => setShowCartModal(true)} />}
            {active==='client_used_devices' && <ClientUsedDevicesPage storeName={storeName} whatsapp={whatsappNumber} devices={usedDevices.filter(d => d.storeName === storeName || (!d.storeName && storeName === 'RT MOBILE'))} enabled={usedDevicesEnabled} />}
            {active==='stores_directory' && <StoresDirectoryPage stores={activeStores} onSelectStore={(s) => { setStoreName(s.name); setWhatsappNumber(s.phone); notify(`Estabelecimento "${s.name}" selecionado!`); setActive('store'); }} onRequestQuote={(s) => setShowQuoteModal(s)} />}
            {active==='store' && <StorePage whatsapp={whatsappNumber} storeName={storeName} onUpgrade={() => setShowUpgradeModal(true)} usedDevices={[]} usedDevicesEnabled={false} />}
            {active==='track' && <TrackPage orders={orders} storeName={storeName} pixKey={pixKey} whatsapp={whatsappNumber} storeAddress={storeAddress} mapsUrl={mapsUrl} setOrders={setOrders} notify={notify} />}
            {active==='finance' && userRole === 'tech' && userAccessLevel === 'owner' && <FinancePage orders={orders} teamMembers={teamMembers} cashRegister={cashRegister} commissionRate={techCommissionRate} setCommissionRate={value => { setTechCommissionRate(value); localStorage.setItem('rt_phone_commission_fixed', String(value)); }} commissionMode={techCommissionMode} setCommissionMode={value => { setTechCommissionMode(value); localStorage.setItem('rt_commission_mode', value); }} />}
            {active==='payments' && userRole === 'tech' && <PaymentsPage pixKey={pixKey} setPixKey={setPixKey} onShowPayModal={() => setShowPaymentModal(true)} />}
            {active==='settings' && userRole === 'tech' && <SettingsPage configured={supabaseConfigured} email={session?.user?.email} storeName={storeName} setStoreName={setStoreName} storeLogo={storeLogo} onLogoUpload={handleLogoUpload} whatsapp={whatsappNumber} setWhatsapp={setWhatsappNumber} pixKey={pixKey} setPixKey={setPixKey} storeAddress={storeAddress} setStoreAddress={setStoreAddress} mapsUrl={mapsUrl} setMapsUrl={setMapsUrl} modules={modules} setModules={setModules} onLogout={logout} teamMembers={teamMembers} onInviteMember={() => setShowInviteMemberModal(true)} auditLogs={auditLogs} userAccessLevel={userAccessLevel} isLifetimeAdmin={isLifetimeAdmin} upgradeAssistantEnabled={upgradeAssistantEnabled} setUpgradeAssistantEnabled={setUpgradeAssistantEnabled} upgradeDiscounts={upgradeDiscounts} setUpgradeDiscounts={setUpgradeDiscounts} onShowTutorial={() => setShowFirstLoginTutorial(true)} />}
            
            <footer className="footer" style={{borderTop: '1px solid #18181b', color: '#666', padding: '20px', fontSize: '11px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px'}}>
              <span>{storeName.toUpperCase()} <span className="footer-dot">•</span> GESTÃO PROFISSIONAL</span>
              <span>
                DESENVOLVIDO POR <strong style={{color: '#aaa'}}>RT MOBILE</strong> 
                <span style={{margin: '0 8px', color: '#444'}}>|</span> 
                Quer este sistema no seu estabelecimento?{' '}
                <a 
                  href={`https://wa.me/${adminWhatsapp}?text=${encodeURIComponent('Olá! Vi o sistema RT Mobile rodando em um estabelecimento e gostaria de saber como ter no meu negócio.')}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  style={{color: '#25D366', fontWeight: 'bold', textDecoration: 'none'}}
                >
                  Falar com Desenvolvedor ↗
                </a>
              </span>
            </footer>
          </>
        )}
      </main>

      {showFirstLoginTutorial && session && (
        <div className="modal-backdrop" style={{zIndex:1000000}} onClick={closeFirstLoginTutorial}>
          <div className="modal" onClick={e=>e.stopPropagation()} style={{background:'#0f0f12',border:'1px solid #25D366',maxWidth:620,maxHeight:'85vh',overflowY:'auto'}}>
            <div className="modal-head"><div><div className="eyebrow">PRIMEIRO ACESSO</div><h2>Bem-vindo ao RT Mobile</h2></div><button type="button" className="icon-btn" onClick={closeFirstLoginTutorial}><X size={19}/></button></div>
            {userRole === 'tech' ? <div style={{lineHeight:1.8,color:'#ddd'}}>
              <p>Este guia rápido mostra por onde começar no painel da loja:</p>
              <ul>
                <li><strong>Ordens de serviço:</strong> cadastre cliente, aparelho e defeito. Ao salvar, a vistoria/checklist abre automaticamente.</li>
                <li><strong>Clientes e Pós-Venda & Cuidado:</strong> consulte clientes e prepare mensagens de acompanhamento e avaliação.</li>
                <li><strong>Caixa da Loja:</strong> registre entradas e saídas. Escolha Acessórios, iPhones ou Seminovos/Usados; em vendas de iPhone, selecione quem vendeu.</li>
                <li><strong>Financeiro & Comissões:</strong> configure o valor fixo por iPhone vendido e acompanhe os vendedores registrados.</li>
                <li><strong>Acessórios de Balcão:</strong> controle produtos de venda. <strong>Peças & Insumos:</strong> ajuste rapidamente as quantidades de peças usadas nos reparos.</li>
                <li><strong>Seminovos & Usados:</strong> cadastre foto, modelo, IMEI, bateria, preço e garantia para aparecer na vitrine dos clientes desta loja.</li>
                <li><strong>Relatórios:</strong> acompanhe indicadores. <strong>Configurações:</strong> ajuste os dados da loja e a equipe.</li>
              </ul>
            </div> : <div style={{lineHeight:1.8,color:'#ddd'}}>
              <p>Veja o que você pode fazer no portal do cliente:</p>
              <ul>
                <li><strong>Buscar Lojas Ativas:</strong> escolha a loja que deseja consultar.</li>
                <li><strong>Comprar & Upgrade:</strong> consulte modelos de iPhone e outros aparelhos e fale com a loja pelo WhatsApp.</li>
                <li><strong>Seminovos & Usados:</strong> veja fotos, condições e preços dos aparelhos reais disponíveis na loja selecionada.</li>
                <li><strong>Acessórios:</strong> veja os produtos disponíveis e monte seu pedido.</li>
                <li><strong>Rastreio de OS:</strong> consulte o andamento da sua ordem de serviço usando o código da OS.</li>
              </ul>
            </div>}
            <div className="modal-foot"><button className="primary-btn full-btn" onClick={closeFirstLoginTutorial}>Entendi, começar a usar</button></div>
          </div>
        </div>
      )}

      {showBarcodeScannerForProduct && (
        <BarcodeCameraScanner
          onDetected={(code) => {
            setNewProduct(prev => ({ ...prev, barcode: code }));
            setShowBarcodeScannerForProduct(false);
            notify(`Código detectado: ${code}`);
          }}
          onClose={() => setShowBarcodeScannerForProduct(false)}
        />
      )}

      {showProductSaleModal && (
        <ProductSaleModal inventory={inventory} saleAttemptKey={`rt_product_sale_attempt_${activeOrganizationId || session?.user?.id || 'local'}`} onSell={handleSellProductFromList} onClose={() => setShowProductSaleModal(false)} />
      )}

      {showBarcodeSaleModal && (
        <BarcodeSaleModal
          inventory={inventory}
          saleAttemptKey={`rt_product_sale_attempt_${activeOrganizationId || session?.user?.id || 'local'}`}
          onDetectedBarcode={handleSellProductByBarcode}
          onClose={() => setShowBarcodeSaleModal(false)}
        />
      )}

      {showCartModal && (
        <CartModal
          cart={cart}
          onClose={() => setShowCartModal(false)}
          onUpdateQty={updateCartQty}
          onClear={clearCart}
          pixKey={pixKey}
          storeName={storeName}
          storeAddress={storeAddress}
          whatsappNumber={whatsappNumber}
          notify={notify}
        />
      )}

      {showOrderPaymentModal && <div className="modal-backdrop" onClick={()=>setShowOrderPaymentModal(null)}><form className="modal" onClick={e=>e.stopPropagation()} onSubmit={handleReceiveOrderPayment} style={{background:'#0f0f12',border:'1px solid #222',maxWidth:440}}><div className="modal-head"><div><div className="eyebrow">RECEBIMENTO DE OS</div><h2>Receber pagamento</h2><p className="muted">{showOrderPaymentModal.id} · {showOrderPaymentModal.customer}</p></div><button type="button" className="icon-btn" onClick={()=>setShowOrderPaymentModal(null)}><X size={19}/></button></div><div className="panel" style={{padding:12,marginBottom:12}}><div>Valor da OS: <strong>R$ {parseMoneyValue(showOrderPaymentModal.amount).toFixed(2).replace('.',',')}</strong></div><div>Já recebido: <strong>R$ {Number(showOrderPaymentModal.paidAmount||0).toFixed(2).replace('.',',')}</strong></div><div>Saldo restante: <strong style={{color:'#25D366'}}>R$ {Math.max(0,parseMoneyValue(showOrderPaymentModal.amount)-Number(showOrderPaymentModal.paidAmount||0)).toFixed(2).replace('.',',')}</strong></div></div><label>Valor recebido (R$)<input type="number" min="0.01" step="0.01" max={Math.max(0,parseMoneyValue(showOrderPaymentModal.amount)-Number(showOrderPaymentModal.paidAmount||0))} value={orderPayment.amount} onChange={e=>setOrderPayment({...orderPayment,amount:e.target.value})} required /></label><label style={{marginTop:10}}>Forma de pagamento<select value={orderPayment.method} onChange={e=>setOrderPayment({...orderPayment,method:e.target.value})}><option>Pix</option><option>Dinheiro</option><option>Cartão de débito</option><option>Cartão de crédito</option><option>Transferência</option></select></label><div className="modal-foot" style={{marginTop:18}}><button type="button" className="secondary-btn" onClick={()=>setShowOrderPaymentModal(null)}>Cancelar</button><button className="primary-btn" disabled={saving}>{saving ? 'Registrando...' : 'Confirmar recebimento'}</button></div></form></div>}

      {showCashTransactionModal && (
        <div className="modal-backdrop" onClick={()=>setShowCashTransactionModal(false)}>
          <form className="modal" onClick={e=>e.stopPropagation()} onSubmit={handleCashTransaction} style={{background: '#0f0f12', border: '1px solid #222', maxWidth: '420px'}}>
            <div className="modal-head"><div><div className="eyebrow">FLUXO DE CAIXA</div><h2>Nova Movimentação no Caixa</h2></div><button type="button" className="icon-btn" onClick={()=>setShowCashTransactionModal(false)}><X size={19}/></button></div>
            
            <label>Tipo de Lançamento
              <select value={cashTx.type} onChange={e=>setCashTx({...cashTx, type: e.target.value})}>
                <option value="in">➕ Entrada / Suprimento (Troco/Venda)</option>
                <option value="out">➖ Sangria / Saída (Despesas/Insumos)</option>
              </select>
            </label>

            {cashTx.type === 'in' && <>
              <label style={{marginTop: '10px'}}>Categoria da venda
                <select value={cashTx.category} onChange={e=>setCashTx({...cashTx, category:e.target.value, description: e.target.value === 'iPhones' ? 'Venda de iPhone' : e.target.value === 'Seminovos e usados' ? 'Venda de celular seminovo/usado' : 'Venda de acessórios'})}>
                  <option value="Acessórios">Acessórios</option>
                  <option value="iPhones">iPhones</option>
                  <option value="Seminovos e usados">Celulares seminovos e usados</option>
                </select>
              </label>
              <label style={{marginTop:'10px'}}>Funcionário responsável pela venda?
                <select value={cashTx.seller} onChange={e=>setCashTx({...cashTx,seller:e.target.value})} required>
                  <option value="">Selecione o vendedor</option>
                  {teamMembers.map(m=><option key={m.id} value={m.name}>{m.name}</option>)}
                  {!teamMembers.length && <option value="Dono">Dono</option>}
                </select>
                <small className="muted">O responsável ficará vinculado ao lançamento para acompanhamento de desempenho. A regra atual de comissão é um valor fixo geral por venda.</small>
              </label>
            </>}

            {cashTx.type === 'in' && <label style={{marginTop:'10px'}}>Forma de pagamento
              <select value={cashTx.paymentMethod || 'Dinheiro'} onChange={e=>setCashTx({...cashTx,paymentMethod:e.target.value})}><option>Dinheiro</option><option>Pix</option><option>Cartão de débito</option><option>Cartão de crédito</option><option>Transferência</option></select>
            </label>}
            <label style={{marginTop: '10px'}}>Descrição do Lançamento
              <input value={cashTx.description} onChange={e=>setCashTx({...cashTx, description: e.target.value})} placeholder="Ex: Pagamento Fornecedor / Venda Balcão" required />
            </label>

            <label style={{marginTop: '10px'}}>Valor (R$)
              <input type="number" step="0.01" value={cashTx.amount} onChange={e=>setCashTx({...cashTx, amount: e.target.value})} placeholder="0.00" required />
            </label>

            <div className="modal-foot" style={{marginTop: '20px'}}>
              <button type="button" className="secondary-btn" onClick={()=>setShowCashTransactionModal(false)}>Cancelar</button>
              <button className="primary-btn">Salvar Lançamento <ArrowUpRight size={16}/></button>
            </div>
          </form>
        </div>
      )}

      {showInviteMemberModal && (
        <div className="modal-backdrop" onClick={()=>setShowInviteMemberModal(false)}>
          <form className="modal" onClick={e=>e.stopPropagation()} onSubmit={handleInviteMember} style={{background: '#0f0f12', border: '1px solid #222', maxWidth: '420px'}}>
            <div className="modal-head"><div><div className="eyebrow">EQUIPE DO ESTABELECIMENTO</div><h2>Adicionar Operador / Técnico</h2></div><button type="button" className="icon-btn" onClick={()=>setShowInviteMemberModal(false)}><X size={19}/></button></div>
            
            <p className="muted">O membro convidado usará o e-mail cadastrado para acessar o mesmo estabelecimento sem pagar assinatura extra.</p>

            <label style={{marginTop: '10px'}}>Nome Completo
              <input value={newMember.name} onChange={e=>setNewMember({...newMember, name: e.target.value})} placeholder="Ex: João Silva" required />
            </label>

            <label style={{marginTop: '10px'}}>E-mail do Membro
              <input type="email" value={newMember.email} onChange={e=>setNewMember({...newMember, email: e.target.value})} placeholder="membro@seuestabelecimento.com" required />
            </label>

            <label style={{marginTop: '10px'}}>Função / Cargo
              <select value={newMember.role} onChange={e=>setNewMember({...newMember, role: e.target.value})}>
                <option value="technician">🛠️ Operador / Técnico (Acesso Restrito)</option>
                <option value="owner">👑 Administrador (Acesso Total)</option>
              </select>
            </label>

            <div className="modal-foot" style={{marginTop: '20px'}}>
              <button type="button" className="secondary-btn" onClick={()=>setShowInviteMemberModal(false)}>Cancelar</button>
              <button className="primary-btn">Convidar para Estabelecimento <ArrowUpRight size={16}/></button>
            </div>
          </form>
        </div>
      )}

      {showPrintModal && (
        <div className="modal-backdrop" onClick={()=>setShowPrintModal(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()} style={{background: '#fff', color: '#000', fontFamily: 'monospace', maxWidth: '380px', padding: '15px', borderRadius: '0'}}>
            <div style={{textAlign: 'center', borderBottom: '1px dashed #000', paddingBottom: '10px', marginBottom: '10px'}}>
              <h2 style={{fontSize: '18px', margin: 0}}>{storeName.toUpperCase()}</h2>
              <p style={{fontSize: '10px', margin: '2px 0'}}>{storeAddress}</p>
              <p style={{fontSize: '11px', margin: '4px 0'}}>ORDEM DE SERVIÇO: {showPrintModal.id}</p>
              <small>{new Date().toLocaleString('pt-BR')}</small>
            </div>
            
            <div style={{fontSize: '12px', lineHeight: '1.4'}}>
              <p style={{margin: '4px 0'}}><strong>CLIENTE:</strong> {showPrintModal.customer}</p>
              <p style={{margin: '4px 0'}}><strong>TEL:</strong> {showPrintModal.phone || 'Não informado'}</p>
              <p style={{margin: '4px 0'}}><strong>APARELHO:</strong> {showPrintModal.device}</p>
              
              <div style={{margin: '6px 0', background: '#eee', padding: '6px', borderRadius: '4px'}}>
                <p style={{margin: 0}}><strong>🔑 SENHA:</strong> {showPrintModal.devicePassword || 'Sem Senha'}</p>
                {showPrintModal.patternDrawing && (
                  <div style={{marginTop: '6px', textAlign: 'center'}}>
                    <span style={{fontSize: '10px', display: 'block', color: '#555', marginBottom: '4px'}}>PADRÃO DE DESENHO:</span>
                    <img src={showPrintModal.patternDrawing} alt="Padrão" style={{width: '90px', height: '90px', border: '1px solid #000', background: '#000', borderRadius: '4px'}}/>
                  </div>
                )}
              </div>

              <p style={{margin: '4px 0'}}><strong>DEFEITO:</strong> {showPrintModal.issue}</p>
              <p style={{margin: '4px 0'}}><strong>STATUS:</strong> {showPrintModal.status}</p>
              <p style={{margin: '4px 0'}}><strong>VALOR TOTAL:</strong> {showPrintModal.amount}</p>
              <p style={{margin: '4px 0'}}><strong>GARANTIA:</strong> {showPrintModal.warrantyDays} Dias</p>
            </div>

            <div style={{borderTop: '1px dashed #000', marginTop: '10px', paddingTop: '10px', textAlign: 'center', fontSize: '9px'}}>
              <p style={{margin: 0}}>TERMOS DE GARANTIA: A garantia não cobre danos físicos, líquidos ou selo violado. Aparelhos não retirados em 90 dias serão vendidos.</p>
              <br/>
              <p>___________________________________<br/>Assinatura do Cliente</p>
            </div>

            <div style={{marginTop: '15px', display: 'flex', gap: '8px'}} className="no-print">
              <button className="primary-btn full-btn" onClick={() => window.print()} style={{background: '#000', color: '#fff'}}>
                <Printer size={16}/> Imprimir Cupom Térmico
              </button>
              <button className="secondary-btn" onClick={()=>setShowPrintModal(null)} style={{background: '#eee', color: '#000'}}>Fechar</button>
            </div>
          </div>
        </div>
      )}

      {showQuoteModal && (
        <div className="modal-backdrop" onClick={()=>setShowQuoteModal(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()} style={{background: '#0f0f12', border: '1px solid #222', maxWidth: '420px'}}>
            <div className="modal-head"><div><div className="eyebrow">SOLICITAR ORÇAMENTO</div><h2>{showQuoteModal.name}</h2></div><button type="button" className="icon-btn" onClick={()=>setShowQuoteModal(null)}><X size={19}/></button></div>
            <p className="muted">Descreva sua solicitação para receber um orçamento prévio no WhatsApp do estabelecimento.</p>
            <label style={{marginTop: '10px'}}>Detalhes do pedido / serviço
              <textarea placeholder="Ex: Preciso de orçamento para..." rows="3" id="quoteDesc" style={{background: '#111', color: '#fff', border: '1px solid #333', padding: '10px', borderRadius: '8px', width: '100%', marginTop: '6px'}}/>
            </label>
            <button className="primary-btn full-btn" style={{marginTop: '15px', background: '#25D366', color: '#000', fontWeight: 'bold'}} onClick={() => {
              const val = document.getElementById('quoteDesc').value;
              const text = encodeURIComponent(`Olá ${showQuoteModal.name}! Gostaria de solicitar um orçamento para o seguinte:\n\n"${val}"`);
              window.open(`https://wa.me/${showQuoteModal.phone}?text=${text}`, '_blank');
              setShowQuoteModal(null);
            }}>
              <MessageCircle size={16}/> Enviar Pedido no WhatsApp da Loja
            </button>
          </div>
        </div>
      )}

      {showChecklistModal && (
        <div className="modal-backdrop" onClick={()=>setShowChecklistModal(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()} style={{background: '#0f0f12', border: '1px solid #222', maxWidth: '500px'}}>
            <div className="modal-head">
              <div><div className="eyebrow">RELATÓRIO DE VISTORIA</div><h2>Checklist de Entrada ({showChecklistModal.id})</h2></div>
              <button type="button" className="icon-btn" onClick={()=>setShowChecklistModal(null)}><X size={19}/></button>
            </div>
            
            <p className="muted">Aparelho: <strong>{showChecklistModal.device}</strong> | Senha: <strong style={{color: '#25D366'}}>{showChecklistModal.devicePassword || 'Sem Senha'}</strong></p>
            <section style={{margin:'14px 0',padding:12,background:'#121215',border:'1px solid #292929',borderRadius:8}}><strong>Fotos do check-in</strong><p className="muted" style={{fontSize:12}}>Use a câmera do celular ou selecione fotos para registrar a condição do aparelho.</p><input type="file" accept="image/*" capture="environment" multiple onChange={e=>{const files=Array.from(e.target.files||[]);Promise.all(files.map(file=>new Promise(resolve=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>resolve(null);reader.readAsDataURL(file);}))).then(images=>setShowChecklistModal(prev=>({...prev,checkinPhotos:[...(prev?.checkinPhotos||[]),...images.filter(Boolean)]})));e.target.value='';}}/><div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:10}}>{(showChecklistModal.checkinPhotos||[]).map((src,i)=><div key={i} style={{position:'relative'}}><img src={src} alt={`Foto check-in ${i+1}`} style={{width:82,height:82,objectFit:'cover',borderRadius:6,border:'1px solid #333'}}/><button type="button" className="secondary-btn" onClick={()=>setShowChecklistModal(prev=>({...prev,checkinPhotos:(prev.checkinPhotos||[]).filter((_,idx)=>idx!==i)}))} style={{display:'block',fontSize:10,padding:'3px 5px',marginTop:3}}>Remover</button></div>)}</div></section>

            <div style={{display: 'flex', flexDirection: 'column', gap: '10px', margin: '15px 0'}}>
              {[
                { key: 'screen', label: 'Tela / Touchscreen & Display' },
                { key: 'faceId', label: 'Face ID / Touch ID (Biometria)' },
                { key: 'cameras', label: 'Câmeras Traseira & Frontal' },
                { key: 'charging', label: 'Conector de Carga & Bateria' },
                { key: 'audio', label: 'Alto-falante, Auricular & Microfone' },
                { key: 'wifi', label: 'Wi-Fi, Bluetooth & Sinal de Chip' },
                { key: 'housing', label: 'Carcaça Estética & Vidro Traseiro' },
              ].map(item => (
                <div key={item.key} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#121215', padding: '10px 14px', borderRadius: '8px', border: '1px solid #222'}}>
                  <span style={{fontSize: '13px'}}>{item.label}</span>
                  <div style={{display: 'flex', gap: '6px'}}>
                    <button 
                      type="button"
                      className={`secondary-btn ${showChecklistModal.checklist?.[item.key] === 'ok' ? 'primary-btn' : ''}`}
                      style={{fontSize: '11px', padding: '4px 10px', background: showChecklistModal.checklist?.[item.key] === 'ok' ? '#25D366' : '#222', color: showChecklistModal.checklist?.[item.key] === 'ok' ? '#000' : '#888'}}
                      onClick={() => {
                        const updated = { ...showChecklistModal.checklist, [item.key]: 'ok' };
                        setOrders(prev => prev.map(o => o.id === showChecklistModal.id ? { ...o, checklist: updated } : o));
                        setShowChecklistModal({ ...showChecklistModal, checklist: updated });
                      }}
                    >
                      ✓ 100% OK
                    </button>
                    <button 
                      type="button"
                      className={`secondary-btn ${showChecklistModal.checklist?.[item.key] === 'issue' ? 'primary-btn' : ''}`}
                      style={{fontSize: '11px', padding: '4px 10px', background: showChecklistModal.checklist?.[item.key] === 'issue' ? '#ff4d4d' : '#222', color: '#fff'}}
                      onClick={() => {
                        const updated = { ...showChecklistModal.checklist, [item.key]: 'issue' };
                        setOrders(prev => prev.map(o => o.id === showChecklistModal.id ? { ...o, checklist: updated } : o));
                        setShowChecklistModal({ ...showChecklistModal, checklist: updated });
                      }}
                    >
                      ⚠ Defeito / Danificado
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="modal-foot">
              <button className="primary-btn full-btn" onClick={()=>{ const savedOrder = { ...showChecklistModal, checklist: { ...showChecklistModal.checklist } }; setOrders(prev => prev.map(o => o.id === savedOrder.id ? { ...o, checklist: savedOrder.checklist, checkinCompletedAt: new Date().toISOString() } : o)); sendChecklistReportWhatsapp(savedOrder); notify(`Check-in registrado. Código de rastreio: ${savedOrder.id}. Salve o comprovante em PDF e anexe-o manualmente no WhatsApp.`); setShowChecklistModal(null); }}>Salvar check-in, gerar comprovante e abrir WhatsApp</button>
            </div>
          </div>
        </div>
      )}

      {showNewProduct && (
        <div className="modal-backdrop" onClick={()=>setShowNewProduct(false)}>
          <form className="modal" onClick={e=>e.stopPropagation()} onSubmit={handleCreateProduct} style={{background: '#0f0f12', border: '1px solid #222'}}>
            <div className="modal-head"><div><div className="eyebrow">ESTOQUE & PRODUTOS</div><h2>Cadastrar Produto</h2></div><button type="button" className="icon-btn" onClick={()=>setShowNewProduct(false)}><X size={19}/></button></div>
            
            <label>Nome do Produto / Item
              <input value={newProduct.name} onChange={e=>setNewProduct({...newProduct, name: e.target.value})} placeholder="Ex: Capa MagSafe iPhone 15 Pro" required />
            </label>

            <div style={{marginTop: '10px'}}>
              <label>Código de Barras / EAN
                <div style={{display: 'flex', gap: '8px', marginTop: '4px'}}>
                  <input
                    value={newProduct.barcode}
                    onChange={e=>setNewProduct({...newProduct, barcode: e.target.value})}
                    placeholder="Bipe com o leitor óptico USB ou digite..."
                    style={{flex: 1}}
                  />
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => setShowBarcodeScannerForProduct(true)}
                    style={{display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', border: '1px solid #25D366', color: '#25D366'}}
                  >
                    <BarcodeIcon size={16}/> Ler Câmera
                  </button>
                </div>
              </label>
            </div>

            <div className="form-grid" style={{marginTop: '10px'}}>
              <label>Categoria
                <select value={newProduct.category} onChange={e=>setNewProduct({...newProduct, category: e.target.value})}>
                  {['Capas', 'Películas', 'Carregadores', 'Fones', 'Caixinhas de Som', 'Outros'].map(c => <option key={c}>{c}</option>)}
                </select>
              </label>
              <label>Preço de Venda (R$)
                <input value={newProduct.price} onChange={e=>setNewProduct({...newProduct, price: e.target.value})} placeholder="0,00" required />
              </label>
            </div>

            <div className="form-grid">
              <label>Quantidade em Estoque
                <input type="number" min="0" value={newProduct.qty} onChange={e=>setNewProduct({...newProduct, qty: e.target.value})} required />
              </label>
              <label>Foto do Produto (Opcional)
                <label className="secondary-btn" style={{cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', height: '38px', marginTop: '4px'}}>
                  <Camera size={16}/> {newProduct.photo ? 'Foto Selecionada' : 'Enviar Foto'}
                  <input type="file" accept="image/*" onChange={handleProductPhotoUpload} style={{display: 'none'}} />
                </label>
              </label>
            </div>

            <div className="modal-foot">
              <button type="button" className="secondary-btn" onClick={()=>setShowNewProduct(false)}>Cancelar</button>
              <button className="primary-btn">Salvar no Estoque <ArrowUpRight size={16}/></button>
            </div>
          </form>
        </div>
      )}

      {showUpgradeModal && (
        <div className="modal-backdrop" onClick={()=>setShowUpgradeModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()} style={{background: '#0f0f12', border: '1px solid #222', maxWidth: '520px'}}>
            <div className="modal-head">
              <div><div className="eyebrow">AVALIAÇÃO DE UPGRADE</div><h2>Troque de Aparelho</h2></div>
              <button type="button" className="icon-btn" onClick={()=>setShowUpgradeModal(false)}><X size={19}/></button>
            </div>

            {upgradeStep === 1 ? (
              <div>
                <p className="muted">Informe seu aparelho, anexe/tire foto e marque o estado real para avaliação.</p>
                
                <label style={{marginTop: '10px'}}>Modelo atual que você possui
                  <input value={currentDevice} onChange={e=>setCurrentDevice(e.target.value)} placeholder="Ex: iPhone 13 Pro Max ou Redmi Note 13" required />
                </label>

                <div style={{marginTop: '12px', background: '#121217', padding: '12px', borderRadius: '8px', border: '1px solid #26262e'}}>
                  <span style={{fontSize: '12px', color: '#aaa', display: 'block', marginBottom: '8px'}}>
                    📸 Foto do Aparelho Atual (Câmera ou Galeria):
                  </span>

                  {capturedPhoto ? (
                    <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                      <div style={{width: '70px', height: '70px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #25D366'}}>
                        <img src={capturedPhoto} alt="Foto do aparelho" style={{width: '100%', height: '100%', objectFit: 'cover'}}/>
                      </div>
                      <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                        <span style={{fontSize: '12px', color: '#25D366', fontWeight: 'bold'}}>✓ Foto anexada com sucesso</span>
                        <button
                          type="button"
                          className="secondary-btn"
                          onClick={() => setCapturedPhoto(null)}
                          style={{fontSize: '11px', padding: '3px 8px', width: 'fit-content', color: '#ef4444', borderColor: '#ef4444'}}
                        >
                          <Trash2 size={12}/> Remover / Trocar Foto
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="secondary-btn full-btn" style={{
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      gap: '8px', padding: '10px', background: '#1a1a22', border: '1px dashed #444', borderRadius: '8px'
                    }}>
                      <Camera size={18} color="#25D366"/>
                      <span style={{fontSize: '13px', fontWeight: '500'}}>Tirar Foto ou Escolher da Galeria</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleUpgradePhotoUpload}
                        style={{display: 'none'}}
                      />
                    </label>
                  )}
                </div>

                {upgradeAssistantEnabled && (
                  <div style={{marginTop: '14px', background: '#121217', padding: '14px', borderRadius: '10px', border: '1px solid #26262e'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
                      <span style={{fontSize: '12px', fontWeight: 'bold', color: '#25D366'}}>
                        ⚡ Auxiliar de Avaliação: Marque se o seu aparelho tem:
                      </span>
                    </div>

                    <div style={{display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto', paddingRight: '4px'}}>
                      {[
                        { key: 'screenReplaced', label: 'Tela Trocada ou Trincada', val: upgradeDiscounts.screenReplaced },
                        { key: 'batteryReplaced', label: 'Bateria Trocada / Não Genuína', val: upgradeDiscounts.batteryReplaced },
                        { key: 'faceIdOff', label: 'Face ID ou Biometria inoperante', val: upgradeDiscounts.faceIdOff },
                        { key: 'cameraFailed', label: 'Câmera Principal ou Frontal com falha/trocada', val: upgradeDiscounts.cameraFailed },
                        { key: 'cameraLensScratched', label: 'Lente / Vidrinho da Câmera arranhado', val: upgradeDiscounts.cameraLensScratched },
                        { key: 'chargingPortFailed', label: 'Conector / Dock de Carga com mau contato', val: upgradeDiscounts.chargingPortFailed },
                        { key: 'audioSpeakerFailed', label: 'Alto-falante ou Auricular com falha/chiado', val: upgradeDiscounts.audioSpeakerFailed },
                        { key: 'nfcFailed', label: 'NFC / Pagamento por Aproximação não funciona', val: upgradeDiscounts.nfcFailed },
                        { key: 'wifiFailed', label: 'Wi-Fi ou Bluetooth inoperante', val: upgradeDiscounts.wifiFailed },
                        { key: 'housingScratched', label: 'Carcaça ou Vidro Traseiro com marcas/arranhões', val: upgradeDiscounts.housingScratched },
                      ].map(item => (
                        <label key={item.key} style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '8px 10px', background: selectedDefects[item.key] ? '#1e1414' : '#18181f',
                          border: `1px solid ${selectedDefects[item.key] ? '#ef4444' : '#2a2a35'}`,
                          borderRadius: '6px', cursor: 'pointer', margin: 0
                        }}>
                          <span style={{fontSize: '12px', color: '#ddd', display: 'flex', alignItems: 'center', gap: '8px'}}>
                            <input
                              type="checkbox"
                              checked={selectedDefects[item.key]}
                              onChange={e => setSelectedDefects({...selectedDefects, [item.key]: e.target.checked})}
                              style={{accentColor: '#ef4444', width: '15px', height: '15px'}}
                            />
                            {item.label}
                          </span>
                          <span style={{fontSize: '11px', color: '#ef4444', fontWeight: 'bold'}}>
                            - R$ {Number(item.val).toFixed(2)}
                          </span>
                        </label>
                      ))}
                    </div>

                    {calculateTotalUpgradeDiscount() > 0 && (
                      <div style={{marginTop: '10px', textAlign: 'right', fontSize: '12px', color: '#ef4444', fontWeight: 'bold'}}>
                        Abatimento Estimado: - R$ {calculateTotalUpgradeDiscount().toFixed(2)}
                      </div>
                    )}
                  </div>
                )}

                <div style={{marginTop: '15px', textAlign: 'center'}}>
                  <button className="primary-btn full-btn" onClick={()=>setUpgradeStep(2)}>
                    Avançar e Escolher Novo Aparelho →
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="muted">Qual modelo você gostaria de pegar na troca?</p>
                <label style={{marginTop: '10px'}}>Selecione o novo modelo desejado
                  <select value={targetDevice} onChange={e=>setTargetDevice(e.target.value)}>
                    <optgroup label="Apple (Seminovos)">
                      {seminovosList.map(item => <option key={item} value={`${item} (Seminovo)`}>{item} (Seminovo)</option>)}
                    </optgroup>
                    <optgroup label="Apple (Lacrados)">
                      {lacradosList.map(item => <option key={item} value={`${item} (Lacrado)`}>{item} (Lacrado)</option>)}
                    </optgroup>
                    <optgroup label="Xiaomi & Poco">
                      {xiaomiList.map(item => <option key={item} value={item}>{item}</option>)}
                    </optgroup>
                    <optgroup label="Realme">
                      {realmeList.map(item => <option key={item} value={item}>{item}</option>)}
                    </optgroup>
                  </select>
                </label>

                {upgradeAssistantEnabled && calculateTotalUpgradeDiscount() > 0 && (
                  <div style={{marginTop: '12px', padding: '10px', background: '#1c1414', border: '1px solid #7f1d1d', borderRadius: '8px', fontSize: '12px', color: '#fca5a5'}}>
                    ⚠️ Foi considerado um abatimento prévio de <strong>- R$ {calculateTotalUpgradeDiscount().toFixed(2)}</strong> pelos detalhes informados no seu aparelho atual.
                  </div>
                )}

                <div className="modal-foot" style={{marginTop: '20px'}}>
                  <button type="button" className="secondary-btn" onClick={()=>setUpgradeStep(1)}>Voltar</button>
                  <button type="button" className="primary-btn" onClick={finishUpgradeToWhatsapp} style={{background: '#25D366', color: '#000', fontWeight: 'bold'}}>
                    <MessageCircle size={16}/> Enviar Proposta no WhatsApp da Loja
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showNewOrder && (
        <div className="modal-backdrop" onClick={()=>setShowNewOrder(false)}>
          <form className="modal" onClick={e=>e.stopPropagation()} onSubmit={handleCreateOrder} style={{background: '#0f0f12', border: '1px solid #222'}}>
            <div className="modal-head"><div><div className="eyebrow">NOVA ENTRADA</div><h2>Criar ordem de serviço</h2></div><button type="button" className="icon-btn" onClick={()=>setShowNewOrder(false)}><X size={19}/></button></div><p className="muted">Registre os dados principais e a senha do aparelho para os testes.</p>
            <label>Cliente
              <input list="customers-list" value={newOrder.customer} onChange={e=>{
                  const val = e.target.value;
                  const found = customers.find(c => c.name === val);
                  setNewOrder({...newOrder, customer: val, phone: found?.phone || newOrder.phone});
                }} placeholder="Selecione ou digite o nome do cliente" required/>
              <datalist id="customers-list">
                {customers.map(c => <option key={c.id} value={c.name}>{c.phone ? `(${c.phone})` : ''}</option>)}
              </datalist>
            </label>
            <div className="form-grid">
              <label>Telefone / WhatsApp<input value={newOrder.phone} onChange={e=>setNewOrder({...newOrder,phone:e.target.value})} placeholder="(91) 99999-9999"/></label>
              <label>Modelo do aparelho<input value={newOrder.device} onChange={e=>setNewOrder({...newOrder,device:e.target.value})} placeholder="Ex.: iPhone 15 Pro ou Redmi Note 15" required/></label>
            </div>

            <div style={{background: '#121216', padding: '12px', borderRadius: '10px', border: '1px solid #25252d', margin: '10px 0'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
                <span style={{fontSize: '12px', color: '#f59e0b', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px'}}>
                  <Key size={14}/> Senha de Desbloqueio
                </span>
                <div style={{display: 'flex', gap: '4px'}}>
                  <button
                    type="button"
                    onClick={()=>setPasswordType('text')}
                    className={`secondary-btn ${passwordType === 'text' ? 'primary-btn' : ''}`}
                    style={{fontSize: '11px', padding: '3px 8px'}}
                  >
                    PIN / Texto
                  </button>
                  <button
                    type="button"
                    onClick={()=>setPasswordType('pattern')}
                    className={`secondary-btn ${passwordType === 'pattern' ? 'primary-btn' : ''}`}
                    style={{fontSize: '11px', padding: '3px 8px'}}
                  >
                    Padrão Desenho (Android)
                  </button>
                </div>
              </div>

              {passwordType === 'text' ? (
                <input value={newOrder.devicePassword} onChange={e=>setNewOrder({...newOrder, devicePassword: e.target.value})} placeholder="Ex: 123456 ou Sem Senha" />
              ) : (
                <PatternDrawer value={newOrder.patternDrawing} onChange={(drawing) => setNewOrder({...newOrder, patternDrawing: drawing})} />
              )}
            </div>

            <div className="form-grid">
              <label>Garantia (Dias)
                <select value={newOrder.warrantyDays} onChange={e=>setNewOrder({...newOrder,warrantyDays:e.target.value})}>
                  <option value="30">30 Dias</option>
                  <option value="90">90 Dias (3 Meses)</option>
                  <option value="180">180 Dias (6 Meses)</option>
                  <option value="365">365 Dias (1 Ano)</option>
                </select>
              </label>
              <label>Status inicial
                <select value={newOrder.status} onChange={e=>setNewOrder({...newOrder,status:e.target.value})}>
                  {['Recebido','Em diagnóstico','Aguardando aprovação','Aguardando peça','Em manutenção','Pronto para retirada','Entregue'].map(s=><option key={s}>{s}</option>)}
                </select>
              </label>
            </div>
            <div className="form-grid">
              <label>Valor cobrado (R$)<input type="number" step="0.01" value={newOrder.amount} onChange={e=>setNewOrder({...newOrder,amount:e.target.value})} placeholder="0,00"/></label>
              <label>Custo da Peça (R$)<input type="number" step="0.01" value={newOrder.partCost} onChange={e=>setNewOrder({...newOrder,partCost:e.target.value})} placeholder="0,00"/></label>
            </div>
            <label>Defeito informado<textarea value={newOrder.issue} onChange={e=>setNewOrder({...newOrder,issue:e.target.value})} placeholder="Descreva o problema relatado..." rows="2" required/></label>
            <div className="modal-foot"><button type="button" className="secondary-btn" onClick={()=>setShowNewOrder(false)}>Cancelar</button><button className="primary-btn" disabled={saving}>{saving?'Salvando...':'Salvar OS & Vistoria'}<ArrowUpRight size={16}/></button></div>
          </form>
        </div>
      )}

      {showNewCustomer && <div className="modal-backdrop" onClick={()=>setShowNewCustomer(false)}><form className="modal" onClick={e=>e.stopPropagation()} onSubmit={handleCreateCustomer} style={{background: '#0f0f12', border: '1px solid #222'}}><div className="modal-head"><div><div className="eyebrow">NOVO CADASTRO</div><h2>Cadastrar cliente</h2></div><button type="button" className="icon-btn" onClick={()=>setShowNewCustomer(false)}><X size={19}/></button></div><p className="muted">Adicione os dados de contato do cliente.</p><label>Nome completo<input value={newCustomer.name} onChange={e=>setNewCustomer({...newCustomer,name:e.target.value})} placeholder="Nome do cliente" required/></label><div className="form-grid"><label>Telefone / WhatsApp<input value={newCustomer.phone} onChange={e=>setNewCustomer({...newCustomer,phone:e.target.value})} placeholder="(91) 99999-9999"/></label><label>E-mail<input type="email" value={newCustomer.email} onChange={e=>setNewCustomer({...newCustomer,email:e.target.value})} placeholder="cliente@email.com"/></label></div><div className="modal-foot"><button type="button" className="secondary-btn" onClick={()=>setShowNewCustomer(false)}>Cancelar</button><button className="primary-btn" disabled={saving}>{saving?'Salvando...':'Salvar cliente'}<ArrowUpRight size={16}/></button></div></form></div>}

      {toast && <div className="toast"><Check size={17}/>{toast}</div>}
    </div>
  );
}

function Overview({orders,storeName,onNew,onNavigate,modules,inventory,onOpenTv}) {
  const ready = orders.filter(o=>o.status==='Pronto para retirada').length;
  const waiting = orders.filter(o=>o.status==='Aguardando peça').length;
  const lowStockItems = inventory.filter(p => p.qty < 3);

  return <div className="page-content">
    {lowStockItems.length > 0 && (
      <div style={{background: '#451a03', border: '1px solid #b45309', color: '#fef3c7', padding: '10px 16px', borderRadius: '8px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <span style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px'}}>
          <AlertTriangle size={18} color="#f59e0b"/> ⚠️ <strong>Alerta de Estoque Mínimo:</strong> {lowStockItems.length} produto(s) com menos de 3 unidades no estoque.
        </span>
        <button onClick={()=>onNavigate('inventory')} style={{background: '#b45309', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px'}}>
          Ver Estoque
        </button>
      </div>
    )}

    <div className="page-heading">
      <div>
        <div className="eyebrow"><span className="eyebrow-line"/> PAINEL DE CONTROLE <span className="heading-date">/ HOJE</span></div>
        <h1>Bem-vindo, <span>{storeName}.</span></h1>
        <p>Veja o resumo de atendimentos, estoque e vendas de hoje.</p>
      </div>
      <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
        <button className="secondary-btn" onClick={onOpenTv} style={{display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid #38bdf8', color: '#38bdf8'}}>
          <Tv size={17}/> Abrir Painel TV
        </button>
        {modules.orders && <button className="primary-btn" onClick={onNew}><Plus size={17}/> Nova ordem de serviço</button>}
      </div>
    </div>
    
    <div className="hero-panel" style={{background: '#0c0c0f', border: '1px solid #1a1a20'}}><div className="hero-copy"><div className="hero-kicker"><span className="pulse-dot"/> WORKSHOP OVERVIEW</div><h2>Seu estabelecimento.<br/><span>Sob controle.</span></h2><p>Acompanhe serviços, vendas e estoque em um só lugar.</p>{modules.orders && <button className="hero-link" onClick={()=>onNavigate('orders')}>Ver ordens de serviço <ArrowUpRight size={16}/></button>}</div><div className="hero-device"><div className="device-glow"/><div className="device-ring ring-a"/><div className="device-ring ring-b"/><div className="phone-render"><div className="phone-camera"/><div className="phone-screen"><div className="screen-top"><span>RT MOBILE</span><span>•••</span></div><div className="screen-label">STATUS</div><div className="screen-score">100<span>%</span></div><div className="screen-chart"><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/></div><div className="screen-lines"><i/><i/><i/></div></div><div className="phone-side"/></div><div className="floating-chip chip-top"><Activity size={15}/><span><b>Sistema</b><small>Ativo</small></span></div><div className="floating-chip chip-bottom"><ShieldCheck size={15}/><span><b>RT Protegido</b><small>Segurança total</small></span></div></div><div className="hero-index">01 <span>/ 04</span></div></div>
    
    {modules.orders && <div className="metrics-grid"><Metric icon={ClipboardList} label="Ordens ativas" value={String(orders.length).padStart(2,'0')} trend="Ordens registradas" tone="blue"/><Metric icon={Wrench} label="Em andamento" value={String(orders.filter(o=>o.status==='Em manutenção').length).padStart(2,'0')} trend="Em atendimento agora" tone="violet"/><Metric icon={Clock3} label="Aguardando peça" value={String(waiting).padStart(2,'0')} trend="Dependem de componente" tone="amber"/><Metric icon={Check} label="Prontos para retirada" value={String(ready).padStart(2,'0')} trend="Aguardam o cliente" tone="green"/></div>}
    
    <div className="content-grid">
      <section className="panel orders-panel" style={{background: '#0a0a0d', border: '1px solid #18181b'}}>
        <div className="panel-heading"><div><h3>Ordens recentes</h3><p>Últimos atendimentos recebidos</p></div>{modules.orders && <button className="icon-btn" onClick={()=>onNavigate('orders')}><ArrowUpRight size={17}/></button>}</div>
        <div className="table-wrap"><table><thead><tr><th>ORDEM / CLIENTE</th><th>APARELHO</th><th>STATUS</th><th>VALOR</th></tr></thead><tbody>{orders.slice(0,4).map(o=><tr key={o.id}><td><div className="order-id">{o.id}</div><div className="cell-sub">{o.customer}</div></td><td><div className="device-cell"><div className="device-mini"><Smartphone size={15}/></div><span>{o.device}</span></div><div className="cell-sub">{o.issue}</div></td><td><StatusPill status={o.status}/></td><td className="time-cell"><strong>{o.amount}</strong></td></tr>)}</tbody></table></div>
        {modules.orders && <button className="panel-bottom-link" onClick={()=>onNavigate('orders')}>Abrir todas as ordens <ArrowUpRight size={15}/></button>}
      </section>
      
      <section className="panel quick-panel" style={{background: '#0a0a0d', border: '1px solid #18181b'}}>
        <div className="panel-heading"><div><h3>Acesso rápido</h3><p>Atalhos do dia a dia</p></div><div className="quick-symbol"><Sparkles size={16}/></div></div>
        <QuickAction icon={Tv} title="Modo TV / Sala de Espera" desc="Painel de status para TV ou tablet" onClick={onOpenTv}/>
        {modules.orders && <QuickAction icon={Plus} title="Nova ordem de serviço" desc="Registrar atendimento recebido" onClick={onNew}/>}
        <QuickAction icon={Users} title="Consultar clientes" desc="Ver dados e histórico" onClick={()=>onNavigate('customers')}/>
        {modules.inventory && <QuickAction icon={Package} title="Estoque de produtos" desc="Gerenciar acessórios e itens" onClick={()=>onNavigate('inventory')}/>}
        {modules.iphones && <QuickAction icon={Store} title="Comprar e Upgrade" desc="Aparelhos e trocas" onClick={()=>onNavigate('store')}/>}
        <div className="quick-note"><ShieldCheck size={15}/><span>Os dados do seu estabelecimento ficam isolados e protegidos.</span></div>
      </section>
    </div>
  </div>
}

function Metric({icon:Icon,label,value,trend,tone}) {return <div className="metric-card" style={{background: '#0a0a0d', border: '1px solid #18181b'}}><div className="metric-top"><div className={`metric-icon ${tone}`}><Icon size={17}/></div><span className="metric-period">AGORA</span></div><div className="metric-value">{value}</div><div className="metric-label">{label}</div><div className="metric-trend"><span className={`tiny-dot ${tone}`}/>{trend}</div></div>}
function StatusPill({status}) {return <span className={`status-pill ${statusClass(status)}`}><i/>{status}</span>}
function QuickAction({icon:Icon,title,desc,onClick}) {return <button className="quick-action" onClick={onClick} style={{background: '#111115'}}><div className="quick-action-icon"><Icon size={17}/></div><span><strong>{title}</strong><small>{desc}</small></span><ArrowUpRight size={15} className="quick-arrow"/></button>}

function OrdersPage({orders,search,setSearch,onNew,onEdit,onDelete,onPay,onStatus,onShare,onSendWarranty,onOpenChecklist,onPrint,onPellicleReminder}) {
  return <div className="page-content"><div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-line"/> OPERAÇÃO</div><h1>Ordens de <span>serviço.</span></h1><p>Registre entradas e acompanhe cada atendimento do início à entrega.</p></div><button className="primary-btn" onClick={onNew}><Plus size={17}/> Nova ordem</button></div><div className="list-toolbar"><div className="search-box"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar por cliente, aparelho ou ordem..."/></div><div className="toolbar-count">{orders.length} registros</div></div><div className="panel orders-full" style={{background: '#0a0a0d', border: '1px solid #18181b'}}><div className="table-wrap"><table><thead><tr><th>ORDEM / CLIENTE</th><th>APARELHO / DEFEITO</th><th>SENHA / PADRÃO</th><th>STATUS DO ATENDIMENTO</th><th>VISTORIA</th><th>AÇÕES / DISPAROS</th></tr></thead><tbody>{orders.map(o=><tr key={o.id}><td><div className="order-id">{o.id}</div><div className="cell-sub">{o.customer}</div></td><td><div className="device-cell"><div className="device-mini"><Smartphone size={15}/></div><span>{o.device}</span></div><div className="cell-sub">{o.issue}</div></td><td>
    <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
      {o.patternDrawing ? (
        <div style={{display: 'flex', alignItems: 'center', gap: '6px', background: '#000', padding: '2px 6px', borderRadius: '6px', border: '1px solid #333'}}>
          <img src={o.patternDrawing} alt="Padrão" style={{width: '24px', height: '24px', borderRadius: '3px'}}/>
          <span style={{fontSize: '11px', color: '#25D366'}}>Padrão</span>
        </div>
      ) : (
        <div style={{display: 'flex', alignItems: 'center', gap: '6px', background: '#111', padding: '4px 8px', borderRadius: '6px', border: '1px solid #333', fontSize: '12px', width: 'fit-content'}}>
          <Key size={13} color="#f59e0b"/> <strong style={{color: '#fff'}}>{o.devicePassword || 'Sem Senha'}</strong>
        </div>
      )}
    </div>
  </td><td><select className={`status-select ${statusClass(o.status)}`} value={o.status} onChange={e=>onStatus(o.rawId,e.target.value)}>{['Recebido','Em diagnóstico','Aguardando aprovação','Aguardando peça','Em manutenção','Pronto para retirada','Entregue'].map(s=><option key={s}>{s}</option>)}</select>{o.deliveredAt && (()=>{const remaining=Math.ceil((new Date(o.deliveredAt).getTime()+Number(o.warrantyDays||90)*86400000-Date.now())/86400000);return remaining>=0&&remaining<=7?<div style={{fontSize:10,color:'#f59e0b',marginTop:5}}>Garantia vence em {remaining} dia(s)</div>:null;})()}</td><td><button className="secondary-btn" onClick={()=>onOpenChecklist(o)} style={{display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '12px'}}><CheckSquare size={14} color="#3b82f6"/> Vistoria</button></td><td><div style={{display: 'flex', gap: '6px'}}><button className="secondary-btn" onClick={()=>onShare(o)} title="Disparar Status WhatsApp" style={{padding: '6px 10px'}}><MessageCircle size={14} color="#25D366"/></button><button className="secondary-btn" onClick={()=>onSendWarranty(o)} title="Enviar Termo de Garantia Legal WhatsApp" style={{padding: '6px 10px', color: '#3b82f6'}}><FileText size={14}/></button><button className="secondary-btn" onClick={()=>onPrint(o)} title="Imprimir Cupom Térmico" style={{padding: '6px 10px'}}><Printer size={14}/></button><button className="secondary-btn" onClick={()=>onPellicleReminder(o)} title="Lembrete / Revisão" style={{padding: '6px 10px', color: '#eab308'}}><Calendar size={14}/></button><button className="secondary-btn" onClick={()=>onEdit(o)} title="Editar OS" style={{padding:'6px 10px',color:'#eab308'}}><Pencil size={14}/></button><button className="secondary-btn" onClick={()=>onDelete(o)} title="Excluir OS" style={{padding:'6px 10px',color:'#ff4d4d'}}><Trash2 size={14}/></button><button className="secondary-btn" onClick={()=>onPay(o)} title="Receber pagamento da OS" style={{padding:'6px 10px',color:'#25D366'}}><DollarSign size={14}/></button><div className="cell-sub">Pago: R$ {Number(o.paidAmount||0).toFixed(2).replace('.',',')}</div></div></td></tr>)}</tbody></table>{!orders.length && <div className="empty-state"><ClipboardList size={28}/><strong>Nenhuma ordem encontrada</strong><span>Tente mudar a busca ou registre uma nova ordem.</span></div>}</div></div></div>
}

function CustomersPage({customers, onNew, onEdit, onDelete}) {
  return <div className="page-content">
    <div className="page-heading">
      <div>
        <div className="eyebrow"><span className="eyebrow-line"/> RELACIONAMENTO</div>
        <h1>Base de <span>clientes.</span></h1>
        <p>Centralize os dados e o histórico de atendimento de cada cliente.</p>
      </div>
      <button className="primary-btn" onClick={onNew}><Plus size={17}/> Novo cadastro</button>
    </div>
    <div className="panel orders-full" style={{background: '#0a0a0d', border: '1px solid #18181b'}}>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>NOME</th>
              <th>TELEFONE / WHATSAPP</th>
              <th>E-MAIL</th>
              <th>CADASTRADO EM</th><th>AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(c => (
              <tr key={c.id}>
                <td><strong>{c.name}</strong></td>
                <td>{c.phone || 'Não informado'}</td>
                <td>{c.email || 'Não informado'}</td>
                <td className="time-cell">{c.created_at ? new Date(c.created_at).toLocaleDateString('pt-BR') : '—'}</td><td><div style={{display:'flex',gap:6}}><button className="secondary-btn" title="Editar cliente" onClick={()=>onEdit(c)}><Pencil size={14}/></button><button className="icon-btn" title="Excluir cliente" onClick={()=>onDelete(c)} style={{color:'#ff4d4d'}}><Trash2 size={15}/></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!customers.length && <div className="empty-state"><Users size={28}/><strong>Nenhum cliente cadastrado</strong><span>Clique em "Novo cadastro" para adicionar o primeiro cliente.</span></div>}
      </div>
    </div>
  </div>
}

function CrmPage({customers, storeName, whatsapp}) {
  const sendSupportFollowup = (customer) => {
    const deviceName = customer.device || 'seu aparelho';
    const text = encodeURIComponent(`Olá ${customer.name}! Tudo bem?\n\nPassando aqui da ${storeName} só para saber se deu tudo certo e como está o funcionamento do ${deviceName} depois do serviço realizado com a gente!\n\nSe precisar de qualquer dúvida ou suporte, estamos à disposição por aqui. Abraços!`);
    window.open(`https://wa.me/${customer.phone}?text=${text}`, '_blank');
  };

  return <div className="page-content">
    <div className="page-heading">
      <div>
        <div className="eyebrow"><span className="eyebrow-line"/> PÓS-VENDA & CUIDADO</div>
        <h1>Acompanhamento de <span>Clientes.</span></h1>
        <p>Envie uma mensagem amigável para saber se o cliente ficou satisfeito, sem parecer invasivo.</p>
      </div>
    </div>

    <div className="metrics-grid" style={{gridTemplateColumns: 'repeat(3, 1fr)'}}>
      <div className="metric-card" style={{background: '#0a0a0d', border: '1px solid #18181b'}}>
        <div className="metric-top"><span className="metric-period">TOTAL</span></div>
        <div className="metric-value" style={{color: '#fff'}}>{customers.length}</div>
        <div className="metric-label">Clientes Atendidos</div>
      </div>

      <div className="metric-card" style={{background: '#0a0a0d', border: '1px solid #18181b'}}>
        <div className="metric-top"><span className="metric-period">ATENDIMENTO</span></div>
        <div className="metric-value" style={{color: '#25D366'}}>Receptivo</div>
        <div className="metric-label">Tom Amigável & Profissional</div>
      </div>

      <div className="metric-card" style={{background: '#0a0a0d', border: '1px solid #18181b'}}>
        <div className="metric-top"><span className="metric-period">OBJETIVO</span></div>
        <div className="metric-value" style={{color: '#3b82f6', fontSize: '18px'}}>Fidelização</div>
        <div className="metric-label">Garantir Satisfação</div>
      </div>
    </div>

    <div className="panel orders-full" style={{background: '#0a0a0d', border: '1px solid #18181b', marginTop: '20px'}}>
      <div className="panel-heading">
        <div><h3>Histórico de Clientes Atendidos</h3><p>Envie uma mensagem de acompanhamento amigável em 1 clique</p></div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>NOME DO CLIENTE</th>
              <th>TELEFONE / WHATSAPP</th>
              <th>ITEM / SERVIÇO</th>
              <th>MENSAGEM DE CUIDADO</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(c => (
              <tr key={c.id}>
                <td><strong>{c.name}</strong></td>
                <td>{c.phone}</td>
                <td><span className="status-pill neutral">{c.device || 'Atendimento'}</span></td>
                <td>
                  <button className="primary-btn" onClick={() => sendSupportFollowup(c)} style={{background: '#1a1a24', color: '#25D366', border: '1px solid #25D366', fontSize: '12px', padding: '6px 12px'}}>
                    <MessageCircle size={14}/> Acompanhamento Pós-Venda
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!customers.length && <div className="empty-state"><HeartHandshake size={28}/><strong>Nenhum cliente cadastrado</strong><span>Os clientes cadastrados aparecerão aqui para acompanhamento pós-serviço.</span></div>}
      </div>
    </div>
  </div>
}

function CashPage({cashRegister, onNewTransaction, onOpenBarcodeSale, onOpenProductSale, onOpenCash, onCloseCash}) {
  const entries = cashRegister.entries || [];
  const totalEntries = entries.filter(e => e.type === 'in').reduce((a, b) => a + Number(b.amount || 0), 0);
  const totalExits = entries.filter(e => e.type === 'out').reduce((a, b) => a + Number(b.amount || 0), 0);
  const cashIn = entries.filter(e => e.type === 'in' && (e.paymentMethod || 'Dinheiro') === 'Dinheiro').reduce((a,b)=>a+Number(b.amount||0),0);
  const digitalIn = entries.filter(e => e.type === 'in' && (e.paymentMethod || 'Dinheiro') !== 'Dinheiro').reduce((a,b)=>a+Number(b.amount||0),0);
  const currentBalance = Number(cashRegister.openingBalance || 0) + cashIn - totalExits;
  const money = value => `R$ ${Number(value||0).toFixed(2).replace('.', ',')}`;
  return <div className="page-content">
    <div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-line"/> FLUXO DE CAIXA DO ESTABELECIMENTO</div><h1>Caixa da <span>Loja.</span></h1><p>Controle abertura, recebimentos por OS e vendas, sangrias e fechamento diário.</p><div style={{marginTop:10}}><span className={`status-pill ${cashRegister.isOpen?'green':'amber'}`}><i/>{cashRegister.isOpen?'CAIXA ABERTO':'CAIXA FECHADO'}</span>{cashRegister.openedAt&&<small className="muted" style={{marginLeft:10}}>Abertura: {new Date(cashRegister.openedAt).toLocaleString('pt-BR')}</small>}</div></div>
      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{cashRegister.isOpen ? <><button className="secondary-btn" onClick={onOpenProductSale} style={{background:'#142018',color:'#25D366',border:'1px solid #25D366',fontWeight:'bold',display:'flex',alignItems:'center',gap:6}}><Package size={17}/> Vender Produto</button><button className="secondary-btn" onClick={onOpenBarcodeSale} style={{background:'#1f2937',color:'#25D366',border:'1px solid #25D366',fontWeight:'bold',display:'flex',alignItems:'center',gap:6}}><BarcodeIcon size={17}/> Bipar / Vender Produto</button><button className="primary-btn" onClick={onNewTransaction}><Plus size={17}/> Lançar Manual</button><button className="secondary-btn" onClick={onCloseCash} style={{border:'1px solid #f59e0b',color:'#f59e0b'}}><Lock size={16}/> Fechar caixa</button></> : <button className="primary-btn" onClick={onOpenCash}><CheckCircle2 size={17}/> Abrir caixa do dia</button>}</div>
    </div>
    <div className="metrics-grid" style={{gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))'}}>
      <div className="metric-card" style={{background:'#0a0a0d',border:'1px solid #18181b'}}><div className="metric-top"><span className="metric-period">FUNDO INICIAL</span></div><div className="metric-value" style={{color:'#aaa'}}>{money(cashRegister.openingBalance)}</div><div className="metric-label">Dinheiro na abertura</div></div>
      <div className="metric-card" style={{background:'#0a0a0d',border:'1px solid #18181b'}}><div className="metric-top"><span className="metric-period">RECEBIMENTOS</span></div><div className="metric-value" style={{color:'#25D366'}}>{money(totalEntries)}</div><div className="metric-label">Total de entradas (todas as formas)</div></div>
      <div className="metric-card" style={{background:'#0a0a0d',border:'1px solid #18181b'}}><div className="metric-top"><span className="metric-period">DINHEIRO ESPERADO</span></div><div className="metric-value" style={{color:'#3b82f6'}}>{money(currentBalance)}</div><div className="metric-label">Fundo inicial + dinheiro − saídas</div></div>
      <div className="metric-card" style={{background:'#0a0a0d',border:'1px solid #18181b'}}><div className="metric-top"><span className="metric-period">PIX / CARTÕES</span></div><div className="metric-value" style={{color:'#a78bfa'}}>{money(digitalIn)}</div><div className="metric-label">Entradas não recebidas em espécie</div></div>
      <div className="metric-card" style={{background:'#0a0a0d',border:'1px solid #18181b'}}><div className="metric-top"><span className="metric-period">SAÍDAS</span></div><div className="metric-value" style={{color:'#ff4d4d'}}>{money(totalExits)}</div><div className="metric-label">Sangrias e despesas registradas</div></div>
    </div>
    {!cashRegister.isOpen && cashRegister.closedAt && <div className="panel" style={{background:'#0a0a0d',border:'1px solid #f59e0b',padding:16,marginTop:18}}><h3>Resumo do último fechamento</h3><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:12}}><div>Saldo esperado<br/><strong>{money(cashRegister.expectedCash)}</strong></div><div>Dinheiro contado<br/><strong>{money(cashRegister.countedCash)}</strong></div><div>Diferença<br/><strong style={{color:Number(cashRegister.difference)===0?'#25D366':'#f59e0b'}}>{money(cashRegister.difference)}</strong></div></div><p className="muted">Fechado em {new Date(cashRegister.closedAt).toLocaleString('pt-BR')} por {cashRegister.closedBy||'—'}.</p></div>}
    <div className="panel orders-full" style={{background:'#0a0a0d',border:'1px solid #18181b',marginTop:20}}><div className="panel-heading"><div><h3>Movimentações do caixa</h3><p>Pagamentos de OS, vendas e lançamentos manuais desta sessão</p></div></div><div className="table-wrap"><table><thead><tr><th>HORÁRIO</th><th>DESCRIÇÃO</th><th>CATEGORIA</th><th>FORMA</th><th>OPERADOR</th><th>TIPO</th><th>VALOR</th></tr></thead><tbody>{entries.map(item=><tr key={item.id}><td>{item.time|| (item.createdAt?new Date(item.createdAt).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}):'—')}</td><td><strong>{item.description}</strong>{item.seller&&<div className="muted" style={{fontSize:11}}>Vendedor: {item.seller}</div>}</td><td>{item.category||'—'}</td><td>{item.paymentMethod||'Dinheiro'}</td><td>{item.user||'—'}</td><td><span className={`status-pill ${item.type==='in'?'green':'amber'}`}><i/>{item.type==='in'?'Entrada':'Saída'}</span></td><td><strong style={{color:item.type==='in'?'#25D366':'#ff4d4d'}}>{item.type==='in'?'+':'−'} {money(item.amount)}</strong></td></tr>)}</tbody></table>{!entries.length&&<div className="empty-state"><Wallet size={28}/><strong>Nenhuma movimentação nesta sessão</strong><span>Recebimentos de OS e vendas aparecerão aqui quando registrados.</span></div>}</div></div>
  </div>
}

/* VENDA MANUAL DE PRODUTO: registra entrada no caixa e baixa o estoque */
function ProductSaleModal({ inventory, saleAttemptKey, onSell, onClose }) {
  const [saleAttemptId] = useState(() => getOrCreateRtAttemptId(saleAttemptKey || 'rt_product_sale_attempt_local', 'sale'));
  const available = inventory.filter(p => Number(p.qty) > 0);
  const [productId, setProductId] = useState(available[0]?.id || '');
  const [quantity, setQuantity] = useState('1');
  const [paymentMethod, setPaymentMethod] = useState('Dinheiro');
  const selected = inventory.find(p => String(p.id) === String(productId));
  const qty = Math.max(0, Math.floor(Number(quantity) || 0));
  const total = selected ? parseMoneyValue(selected.price) * qty : 0;
  const money = value => `R$ ${Number(value || 0).toFixed(2).replace('.', ',')}`;
  return <div className="modal-backdrop" onClick={onClose}><div className="modal" onClick={e => e.stopPropagation()} style={{background:'#0f0f12',border:'1px solid #222',maxWidth:480}}>
    <div className="modal-head"><div><div className="eyebrow">CAIXA RÁPIDO</div><h2>Vender produto</h2></div><button type="button" className="icon-btn" onClick={onClose}><X size={19}/></button></div>
    <p className="muted">Selecione o produto cadastrado, informe a quantidade e confirme. O sistema registra a entrada no caixa e desconta as unidades do estoque.</p>
    {!available.length ? <div className="empty-state"><Package size={28}/><strong>Nenhum produto disponível</strong><span>Cadastre um produto ou reponha o estoque antes de vender.</span></div> : <form onSubmit={e => { e.preventDefault(); onSell(productId, quantity, paymentMethod, saleAttemptId); }}>
      <label>Produto<select required value={productId} onChange={e => setProductId(e.target.value)} style={{marginTop:6}}>{available.map(p => <option key={p.id} value={p.id}>{p.name} — estoque: {p.qty} — {money(p.price)}</option>)}</select></label>
      {selected && <div className="panel" style={{padding:12,margin:'12px 0',background:'#09090b'}}><div style={{display:'flex',justifyContent:'space-between',gap:12}}><span>Preço unitário</span><strong>{money(selected.price)}</strong></div><div style={{display:'flex',justifyContent:'space-between',gap:12,marginTop:6}}><span>Disponível</span><strong>{selected.qty} unidade(s)</strong></div></div>}
      <label>Quantidade<input type="number" min="1" max={selected?.qty || 1} step="1" required value={quantity} onChange={e => setQuantity(e.target.value)} style={{marginTop:6}}/></label>
      <label style={{display:'block',marginTop:12}}>Forma de pagamento<select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} style={{marginTop:6}}><option>Dinheiro</option><option>Pix</option><option>Cartão de débito</option><option>Cartão de crédito</option><option>Transferência</option></select></label>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',margin:'18px 0',padding:'14px',background:'#07130b',border:'1px solid #174b2a',borderRadius:8}}><span>Total da venda</span><strong style={{fontSize:22,color:'#25D366'}}>{money(total)}</strong></div>
      <button className="primary-btn full-btn" type="submit" disabled={!selected || qty < 1 || qty > Number(selected?.qty)}><CheckCircle2 size={17}/> Confirmar venda e baixar estoque</button>
    </form>}
  </div></div>;
}

/* MODAL DE VENDA NO CAIXA POR CÓDIGO DE BARRAS */
function BarcodeSaleModal({ inventory, saleAttemptKey, onDetectedBarcode, onClose }) {
  const [saleAttemptId] = useState(() => getOrCreateRtAttemptId(saleAttemptKey || 'rt_product_sale_attempt_local', 'sale'));
  const [manualCode, setManualCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [useCamera, setUseCamera] = useState(false);
  const [message, setMessage] = useState('');
  const inputRef = useRef(null);
  const normalizedCode = String(manualCode || '').trim();
  const selectedProduct = normalizedCode
    ? inventory.find(p => String(p.barcode || '').trim() === normalizedCode)
    : null;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!normalizedCode) return;
    if (!selectedProduct) {
      setMessage(`Nenhum produto cadastrado com o código ${normalizedCode}. Confira o código ou cadastre o produto.`);
      return;
    }
    if (Number(selectedProduct.qty) <= 0) {
      setMessage(`Atenção: ${selectedProduct.name} está esgotado no estoque!`);
      return;
    }
    setMessage('Produto identificado. Confira os dados, escolha a forma de pagamento e confirme a venda.');
    inputRef.current?.blur();
  };

  const confirmSale = () => {
    if (!selectedProduct) {
      setMessage('Bipe ou informe um código de barras válido antes de continuar.');
      return;
    }
    if (!paymentMethod) {
      setMessage('Selecione a forma de pagamento antes de confirmar a venda.');
      return;
    }
    onDetectedBarcode(normalizedCode, paymentMethod, saleAttemptId);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()} style={{background: '#0f0f12', border: '1px solid #222', maxWidth: '440px'}}>
        <div className="modal-head">
          <div>
            <div className="eyebrow">CAIXA RÁPIDO</div>
            <h2>Venda por Código de Barras</h2>
          </div>
          <button type="button" className="icon-btn" onClick={onClose}><X size={19}/></button>
        </div>

        <div className="panel" style={{padding:12, marginBottom:14, border:'1px solid #303039', background:'#14141a'}}>
          <strong style={{display:'block', marginBottom:5}}>Como realizar a venda</strong>
          <p className="muted" style={{fontSize: '13px', margin:0}}>
            1. Bipe o produto. 2. Confira o produto e escolha a forma de pagamento. 3. Aperte “Confirmar venda”. Bipar sozinho não registra a venda nem baixa o estoque.
          </p>
        </div>

        <form onSubmit={handleManualSubmit} style={{margin: '15px 0'}}>
          <label>Código de Barras (Leitor, câmera ou digitação)
            <div style={{display: 'flex', gap: '8px', marginTop: '6px'}}>
              <input
                ref={inputRef}
                value={manualCode}
                onChange={e=>setManualCode(e.target.value)}
                placeholder="Bipe ou digite o código..."
                autoFocus
                style={{flex: 1}}
              />
              <button className="secondary-btn" type="submit" style={{padding: '0 14px'}}>Localizar</button>
            </div>
          </label>
        </form>

        {normalizedCode && (
          <div className="panel" style={{padding:12, marginBottom:14, border:`1px solid ${selectedProduct && Number(selectedProduct.qty)>0 ? '#25D366' : '#f59e0b'}`, background:'#111116'}}>
            {selectedProduct ? <>
              <div className="eyebrow" style={{color:'#25D366'}}>PRODUTO IDENTIFICADO</div>
              <strong style={{display:'block', marginTop:5}}>{selectedProduct.name}</strong>
              <div className="muted" style={{fontSize:13, marginTop:5}}>Código: {normalizedCode}</div>
              <div style={{display:'flex', justifyContent:'space-between', gap:10, marginTop:10}}>
                <span>Preço unitário</span><strong>R$ {parseMoneyValue(selectedProduct.price).toFixed(2).replace('.', ',')}</strong>
              </div>
              <div style={{display:'flex', justifyContent:'space-between', gap:10, marginTop:5}}>
                <span>Estoque disponível</span><strong>{Number(selectedProduct.qty)||0} un.</strong>
              </div>
              {Number(selectedProduct.qty) <= 0 && <p style={{color:'#f59e0b',fontSize:12,margin:'8px 0 0'}}>Produto sem estoque. Não é possível vender.</p>}
            </> : <>
              <strong style={{color:'#f59e0b'}}>Produto não encontrado</strong>
              <p className="muted" style={{fontSize:12,margin:'5px 0 0'}}>Confira o código ou cadastre o produto antes de vender.</p>
            </>}
          </div>
        )}

        {message && <p role="status" style={{fontSize:12,color:'#25D366',margin:'0 0 10px'}}>{message}</p>}

        <label>Forma de pagamento
          <select value={paymentMethod} onChange={e=>setPaymentMethod(e.target.value)} style={{marginTop:6}}>
            <option value="">Selecione antes de confirmar...</option>
            <option>Dinheiro</option><option>Pix</option><option>Cartão de débito</option><option>Cartão de crédito</option><option>Transferência</option>
          </select>
        </label>

        <button
          type="button"
          className="secondary-btn full-btn"
          onClick={() => setUseCamera(true)}
          style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: '1px solid #25D366', color: '#25D366', padding: '10px', marginTop:12}}
        >
          <Camera size={18}/> Abrir câmera para bipar
        </button>

        <div className="modal-foot" style={{marginTop:16, display:'flex', gap:8}}>
          <button type="button" className="secondary-btn" onClick={onClose}>Cancelar</button>
          <button
            type="button"
            className="primary-btn"
            onClick={confirmSale}
            disabled={!selectedProduct || Number(selectedProduct.qty)<=0 || !paymentMethod}
            style={{flex:1, opacity:(!selectedProduct || Number(selectedProduct.qty)<=0 || !paymentMethod)?0.5:1}}
          >Confirmar venda</button>
        </div>

        {useCamera && (
          <BarcodeCameraScanner
            onDetected={(code) => {
              setManualCode(code);
              setUseCamera(false);
              setMessage('Código lido. Confira o produto, escolha a forma de pagamento e confirme a venda.');
            }}
            onClose={() => setUseCamera(false)}
          />
        )}
      </div>
    </div>
  );
}

function InventoryPage({inventory, onNew, onUpdateQty, onEdit, onDelete}) {
  return <div className="page-content">
    <div className="page-heading">
      <div>
        <div className="eyebrow"><span className="eyebrow-line"/> CONTROLE DE ESTOQUE</div>
        <h1>Estoque de <span>Produtos.</span></h1>
        <p>Cadastre itens, acessórios ou produtos com foto, preço, código de barras e controle de quantidade.</p>
      </div>
      <button className="primary-btn" onClick={onNew}><Plus size={17}/> Novo Produto</button>
    </div>

    <div className="panel orders-full" style={{background: '#0a0a0d', border: '1px solid #18181b'}}>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>PRODUTO</th>
              <th>CÓD. BARRAS / EAN</th>
              <th>CATEGORIA</th>
              <th>PREÇO DE VENDA</th>
              <th>EM ESTOQUE</th>
              <th>AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map(item => (
              <tr key={item.id}>
                <td>
                  <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                    <div style={{width: '40px', height: '40px', borderRadius: '6px', background: '#18181f', border: '1px solid #333', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                      {item.photo ? <img src={item.photo} alt={item.name} style={{width: '100%', height: '100%', objectFit: 'cover'}}/> : <Package size={20} color="#888"/>}
                    </div>
                    <div>
                      <strong>{item.name}</strong>
                      {item.qty < 3 && <div style={{fontSize: '10px', color: '#f59e0b', fontWeight: 'bold'}}>⚠️ Estoque Mínimo</div>}
                    </div>
                  </div>
                </td>
                <td>
                  {item.barcode ? (
                    <div style={{display: 'flex', alignItems: 'center', gap: '6px', background: '#111', padding: '4px 8px', borderRadius: '4px', border: '1px solid #333', width: 'fit-content'}}>
                      <BarcodeIcon size={14} color="#25D366" />
                      <span style={{fontSize: '12px', fontFamily: 'monospace', color: '#fff'}}>{item.barcode}</span>
                    </div>
                  ) : (
                    <span style={{fontSize: '11px', color: '#666'}}>Sem código</span>
                  )}
                </td>
                <td><span className="status-pill neutral">{item.category}</span></td>
                <td><strong style={{color: '#25D366'}}>R$ {item.price}</strong></td>
                <td>
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <button className="secondary-btn" style={{padding: '2px 8px'}} onClick={() => onUpdateQty(item.id, -1)}>-</button>
                    <strong style={{minWidth: '20px', textAlign: 'center', color: item.qty < 3 ? '#f59e0b' : '#fff'}}>{item.qty} un</strong>
                    <button className="secondary-btn" style={{padding: '2px 8px'}} onClick={() => onUpdateQty(item.id, 1)}>+</button>
                  </div>
                </td>
                <td>
                  <div style={{display:'flex',gap:6}}><button className="secondary-btn" title="Editar produto" onClick={() => onEdit(item.id)}><Pencil size={14}/></button><button className="icon-btn" title="Excluir produto" onClick={() => onDelete(item.id)} style={{color: '#ff4d4d'}}><Trash2 size={16}/></button></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!inventory.length && <div className="empty-state"><Package size={28}/><strong>Nenhum produto em estoque</strong><span>Clique em "Novo Produto" para cadastrar itens com código de barras.</span></div>}
      </div>
    </div>
  </div>
}

function FinancePage({orders, teamMembers = [], cashRegister, commissionRate, setCommissionRate, commissionMode, setCommissionMode}) {
  const [goals, setGoals] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('rt_monthly_goals_v1') || '{}');
      return { dailyRevenue: saved.dailyRevenue ?? 1000, monthlyRevenue: saved.monthlyRevenue ?? saved.revenue ?? 10000 };
    } catch { return { dailyRevenue: 1000, monthlyRevenue: 10000 }; }
  });
  const saveGoals = (next) => {
    setGoals(next);
    localStorage.setItem('rt_monthly_goals_v1', JSON.stringify(next));
  };
  const now = new Date();
  const sameDay = (value) => { const d = new Date(value || 0); return !Number.isNaN(d.getTime()) && d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); };
  const sameMonth = (value) => { const d = new Date(value || 0); return !Number.isNaN(d.getTime()) && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); };
  const amountOf = (o) => parseFloat(String(o.amount || '0').replace(/[^0-9,.-]/g, '').replace(',', '.')) || 0;
  const todayOrders = orders.filter(o => sameDay(o.createdAt || o.created_at));
  const thisMonthOrders = orders.filter(o => sameMonth(o.createdAt || o.created_at));
  const dailyRevenue = todayOrders.reduce((sum, o) => sum + amountOf(o), 0);
  const monthRevenue = thisMonthOrders.reduce((sum, o) => sum + amountOf(o), 0);
  const totalRevenue = orders.reduce((sum, o) => sum + amountOf(o), 0);
  const totalPartsCost = orders.reduce((sum, o) => sum + (parseFloat(o.partCost) || 0), 0);
  const goalPct = (value, target) => Math.min(100, Math.round(Number(target) > 0 ? Number(value) / Number(target) * 100 : 0));
  const phonesSold = orders.filter(o => (o.phoneSold === true || o.saleType === 'phone_sale') && ['Entregue', 'Concluído', 'Pago'].includes(o.status)).length;
  const saleEntries = (cashRegister?.entries || []).filter(e => e.type === 'in' && ['Acessórios','iPhones','Seminovos e usados'].includes(e.category) && e.seller);
  const phoneSales = saleEntries.filter(e => e.category === 'iPhones');
  const totalPhonesSold = phonesSold + phoneSales.length;
  const techCommissionTotal = saleEntries.reduce((sum, e) => sum + (Number(e.commissionAmount ?? commissionRate) || 0), 0) + phonesSold * (Number(commissionRate) || 0);
  return <div className="page-content"><div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-line"/> BALANÇO FINANCEIRO</div><h1>Financeiro & <span>Comissões.</span></h1><p>Acompanhe o faturamento geral das OS e configure as metas diária e mensal da loja.</p></div></div>
    <div className="metrics-grid" style={{gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))'}}>
      <div className="metric-card" style={{background:'#0a0a0d',border:'1px solid #18181b'}}><div className="metric-top"><span className="metric-period">FATURAMENTO GERAL</span></div><div className="metric-value" style={{color:'#fff'}}>{moneyBR(totalRevenue)}</div><div className="metric-label">Faturamento acumulado nas OS</div></div>
      <div className="metric-card" style={{background:'#0a0a0d',border:'1px solid #18181b'}}><div className="metric-top"><span className="metric-period">ESTE MÊS</span></div><div className="metric-value" style={{color:'#25D366'}}>{moneyBR(monthRevenue)}</div><div className="metric-label">Faturamento das OS neste mês</div></div>
      <div className="metric-card" style={{background:'#0a0a0d',border:'1px solid #18181b'}}><div className="metric-top"><span className="metric-period">APARELHOS</span></div><div className="metric-value" style={{color:'#60a5fa'}}>{totalPhonesSold}</div><div className="metric-label">Celulares vendidos e entregues</div></div>
      <div className="metric-card" style={{background:'#0a0a0d',border:'1px solid #18181b'}}><div className="metric-top"><span className="metric-period">COMISSÃO</span></div><div className="metric-value" style={{color:'#25D366'}}>{moneyBR(techCommissionTotal)}</div><div className="metric-label">Comissões registradas</div></div>
    </div>
    <div className="panel" style={{background:'#0a0a0d',border:'1px solid #18181b',padding:20,marginTop:20}}>
      <h3>Metas de faturamento da loja</h3><p className="muted">Somente duas metas: quanto a loja pretende faturar por dia e por mês. O progresso é calculado pelo valor das ordens de serviço cadastradas.</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:12,marginTop:12}}>
        <label>Meta diária (R$)<input type="number" min="0" step="0.01" value={goals.dailyRevenue} onChange={e=>saveGoals({...goals,dailyRevenue:e.target.value})} style={{display:'block',width:'100%',marginTop:6,background:'#111',color:'#fff',border:'1px solid #333',padding:9,borderRadius:6}}/></label>
        <label>Meta mensal (R$)<input type="number" min="0" step="0.01" value={goals.monthlyRevenue} onChange={e=>saveGoals({...goals,monthlyRevenue:e.target.value})} style={{display:'block',width:'100%',marginTop:6,background:'#111',color:'#fff',border:'1px solid #333',padding:9,borderRadius:6}}/></label>
      </div>
      {[{label:'Faturamento de hoje nas OS',value:dailyRevenue,target:goals.dailyRevenue},{label:'Faturamento deste mês nas OS',value:monthRevenue,target:goals.monthlyRevenue}].map(g=><div key={g.label} style={{marginTop:16}}><div style={{display:'flex',justifyContent:'space-between',gap:8,fontSize:13,marginBottom:6,flexWrap:'wrap'}}><span>{g.label}</span><strong>{moneyBR(g.value)} / {moneyBR(g.target)}</strong></div><div style={{height:8,background:'#222',borderRadius:8,overflow:'hidden'}}><div style={{height:'100%',width:goalPct(g.value,g.target)+'%',background:'#25D366'}}/></div><small className="muted">{goalPct(g.value,g.target)}% da meta</small></div>)}
    </div>
    <div className="panel" style={{background:'#0a0a0d',border:'1px solid #18181b',padding:20,marginTop:20}}><h3>Desempenho individual da equipe</h3><p className="muted">Resumo de vendas, comissões registradas e OS atribuídas. As metas individuais foram removidas; as metas agora são somente da loja.</p>{teamMembers.length ? teamMembers.map(member=>{const memberSales=saleEntries.filter(e=>e.seller===member.name);const memberCommission=memberSales.reduce((sum,e)=>sum+(Number(e.commissionAmount)||0),0);const memberOs=thisMonthOrders.filter(o=>(o.technician||o.assignedTo||o.technician_name)===member.name).length;return <div key={member.id||member.name} style={{borderTop:'1px solid #242424',paddingTop:12,marginTop:12}}><strong>{member.name}</strong><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:10,marginTop:8}}><div className="metric-card"><div className="metric-value" style={{fontSize:20}}>{memberSales.length}</div><div className="metric-label">Vendas registradas</div></div><div className="metric-card"><div className="metric-value" style={{fontSize:20,color:'#25D366'}}>{moneyBR(memberCommission)}</div><div className="metric-label">Comissão registrada</div></div><div className="metric-card"><div className="metric-value" style={{fontSize:20}}>{memberOs}</div><div className="metric-label">OS atribuídas no mês</div></div></div></div>}) : <p className="muted">Cadastre funcionários em Configurações para acompanhar o desempenho individual.</p>}</div>
    <div className="panel" style={{background:'#0a0a0d',border:'1px solid #18181b',padding:20,marginTop:20}}><h3>Configuração da comissão por venda</h3><p className="muted">Esta versão permite uma regra geral para a loja. A comissão é gravada no lançamento no momento da venda.</p><div style={{display:'flex',alignItems:'center',gap:10,marginTop:10,flexWrap:'wrap'}}><label>Tipo de comissão<select value={commissionMode} onChange={e=>setCommissionMode(e.target.value)} style={{display:'block',marginTop:6,background:'#111',color:'#fff',border:'1px solid #333',padding:'8px 12px',borderRadius:6}}><option value="fixed">Valor fixo por venda (R$)</option><option value="percent">Percentual sobre a venda (%)</option></select></label><label>{commissionMode==='percent' ? 'Percentual (%)' : 'Valor fixo (R$)'}<input type="number" min="0" step="0.01" value={commissionRate} onChange={e=>setCommissionRate(e.target.value)} style={{display:'block',marginTop:6,background:'#111',color:'#fff',border:'1px solid #333',padding:'8px 12px',borderRadius:6,width:150}}/></label></div><p className="muted" style={{marginTop:10}}>Limitação atual: a regra ainda é geral, não individual por funcionário, e não calcula comissão por serviço de OS.</p></div>
  </div>;
}

function ClientInventoryPage({inventory, storeName, cart, addToCart, onOpenCart}) {
  const totalCartItems = cart.reduce((acc, item) => acc + item.cartQty, 0);

  return <div className="page-content">
    <div className="page-heading" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
      <div>
        <div className="eyebrow"><span className="eyebrow-line"/> VITRINE DO ESTABELECIMENTO</div>
        <h1>Produtos & <span>Acessórios.</span></h1>
        <p>Confira os itens disponíveis na {storeName} e adicione à sua sacola.</p>
      </div>
      
      {totalCartItems > 0 && (
        <button className="primary-btn" onClick={onOpenCart} style={{background: '#25D366', color: '#000', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px'}}>
          <ShoppingCart size={18}/> Ver Carrinho ({totalCartItems})
        </button>
      )}
    </div>

    <div className="module-cards">
      {inventory.map(prod => (
        <div className="module-card" key={prod.id} style={{background: '#0d0d10', border: '1px solid #1a1a20'}}>
          <div className="module-card-top">
            <span className="status-pill neutral">{prod.category}</span>
            <small style={{color: prod.qty > 0 ? '#25D366' : '#ff4d4d'}}>{prod.qty > 0 ? `${prod.qty} em estoque` : 'Esgotado'}</small>
          </div>
          
          <div style={{
            width: '100%', height: '140px', borderRadius: '10px', overflow: 'hidden', margin: '12px 0', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #222'
          }}>
            {prod.photo ? (
              <img src={prod.photo} alt={prod.name} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
            ) : (
              <Package size={40} color="#444"/>
            )}
          </div>

          <h3 style={{fontSize: '15px'}}>{prod.name}</h3>
          <div style={{fontSize: '18px', fontWeight: 'bold', color: '#25D366', margin: '8px 0'}}>R$ {prod.price}</div>
          
          <button 
            className="primary-btn full-btn" 
            disabled={prod.qty <= 0}
            style={{marginTop: '10px', background: prod.qty > 0 ? '#1f2937' : '#333', color: prod.qty > 0 ? '#fff' : '#888', border: '1px solid #374151'}} 
            onClick={() => addToCart(prod)}
          >
            <ShoppingCart size={16}/> {prod.qty > 0 ? 'Adicionar ao Carrinho' : 'Indisponível'}
          </button>
        </div>
      ))}
      {!inventory.length && (
        <div style={{gridColumn: '1 / -1', textAlign: 'center', color: '#888', padding: '40px'}}>
          Nenhum acessório disponível no momento nesta loja.
        </div>
      )}
    </div>
  </div>
}

function CartModal({cart, onClose, onUpdateQty, onClear, pixKey, storeName, storeAddress, whatsappNumber, notify}) {
  const [deliveryType, setDeliveryType] = useState('pickup');
  const [customerName, setCustomerName] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [isThirdPartyPickup, setIsThirdPartyPickup] = useState(false);
  const [pickupPersonName, setPickupPersonName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('pix');

  const cartTotal = cart.reduce((acc, item) => acc + (Number(item.price) * item.cartQty), 0);

  const copyPix = () => {
    navigator.clipboard.writeText(pixKey);
    notify('Chave Pix copiada com sucesso!');
  };

  const handleFinishOrder = () => {
    if (!customerName.trim()) {
      notify('Por favor, informe seu nome.'); return;
    }
    if (deliveryType === 'delivery' && !deliveryAddress.trim()) {
      notify('Por favor, informe o endereço para entrega.'); return;
    }
    if (deliveryType === 'pickup' && isThirdPartyPickup && !pickupPersonName.trim()) {
      notify('Informe o nome da pessoa autorizada a retirar.'); return;
    }

    const itemsSummary = cart.map(i => `• ${i.cartQty}x ${i.name} (R$ ${(Number(i.price) * i.cartQty).toFixed(2)})`).join('\n');
    
    let logisticsInfo = '';
    if (deliveryType === 'pickup') {
      logisticsInfo = `🏬 *Modalidade:* RETIRADA NO LOCAL\n📍 *Endereço da Loja:* ${storeAddress}`;
      if (isThirdPartyPickup) {
        logisticsInfo += `\n👤 *Pessoa autorizada a retirar:* ${pickupPersonName.trim()}`;
      }
    } else {
      logisticsInfo = `🛵 *Modalidade:* ENTREGA / DELIVERY\n📍 *Endereço de Entrega:* ${deliveryAddress.trim()}`;
    }

    const message = encodeURIComponent(
      `🛍️ *NOVO PEDIDO DE ACESSÓRIOS - ${storeName.toUpperCase()}*\n\n` +
      `👤 *Cliente:* ${customerName.trim()}\n` +
      `💰 *Total do Pedido:* R$ ${cartTotal.toFixed(2)}\n` +
      `💳 *Forma de Pagamento:* ${paymentMethod === 'pix' ? 'Pix (Comprovante em anexo)' : 'Cartão / Na entrega'}\n\n` +
      `📦 *Itens Escolhidos:*\n${itemsSummary}\n\n` +
      `${logisticsInfo}\n\n` +
      `Poderiam confirmar o recebimento do pedido?`
    );

    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
    onClear();
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()} style={{background: '#0f0f12', border: '1px solid #222', maxWidth: '520px'}}>
        <div className="modal-head">
          <div><div className="eyebrow">FINALIZAÇÃO DE PEDIDO</div><h2>Seu Carrinho de Compras</h2></div>
          <button type="button" className="icon-btn" onClick={onClose}><X size={19}/></button>
        </div>

        {cart.length === 0 ? (
          <div style={{textAlign: 'center', padding: '30px 0', color: '#888'}}>
            <ShoppingCart size={40} style={{marginBottom: '10px'}}/>
            <p>Seu carrinho está vazio.</p>
          </div>
        ) : (
          <div>
            <div style={{maxHeight: '160px', overflowY: 'auto', marginBottom: '15px', borderBottom: '1px solid #222', paddingBottom: '10px'}}>
              {cart.map(item => (
                <div key={item.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '6px 0', fontSize: '13px'}}>
                  <span>{item.name}</span>
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <button className="secondary-btn" style={{padding: '2px 6px'}} onClick={()=>onUpdateQty(item.id, -1)}>-</button>
                    <strong>{item.cartQty}</strong>
                    <button className="secondary-btn" style={{padding: '2px 6px'}} onClick={()=>onUpdateQty(item.id, 1)}>+</button>
                    <span style={{minWidth: '65px', textAlign: 'right', color: '#25D366'}}>R$ {(Number(item.price) * item.cartQty).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 'bold', marginBottom: '15px'}}>
              <span>Valor Total:</span>
              <span style={{color: '#25D366'}}>R$ {cartTotal.toFixed(2)}</span>
            </div>

            <label style={{marginBottom: '10px'}}>Seu Nome Completo
              <input value={customerName} onChange={e=>setCustomerName(e.target.value)} placeholder="Ex: Lucas Gabriel" required />
            </label>

            <div style={{display: 'flex', gap: '8px', marginBottom: '12px'}}>
              <button
                type="button"
                className={`secondary-btn ${deliveryType === 'pickup' ? 'primary-btn' : ''}`}
                style={{flex: 1, fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'}}
                onClick={() => setDeliveryType('pickup')}
              >
                <Store size={15}/> Retirada na Loja
              </button>
              <button
                type="button"
                className={`secondary-btn ${deliveryType === 'delivery' ? 'primary-btn' : ''}`}
                style={{flex: 1, fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'}}
                onClick={() => setDeliveryType('delivery')}
              >
                <Truck size={15}/> Entrega / Delivery
              </button>
            </div>

            {deliveryType === 'delivery' ? (
              <label style={{marginBottom: '12px'}}>Endereço de Entrega (Rua, Número, Bairro)
                <input value={deliveryAddress} onChange={e=>setDeliveryAddress(e.target.value)} placeholder="Ex: Travessa das Flores, 142 - Centro" required />
              </label>
            ) : (
              <div style={{background: '#141419', padding: '10px', borderRadius: '8px', border: '1px solid #282830', marginBottom: '12px'}}>
                <span style={{fontSize: '11px', color: '#888', display: 'block', marginBottom: '6px'}}>Retirar no local: {storeAddress}</span>
                <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0, fontSize: '12px'}}>
                  <input
                    type="checkbox"
                    checked={isThirdPartyPickup}
                    onChange={e => setIsThirdPartyPickup(e.target.checked)}
                    style={{accentColor: '#25D366'}}
                  />
                  Outra pessoa vai retirar o pedido por mim?
                </label>
                {isThirdPartyPickup && (
                  <input
                    value={pickupPersonName}
                    onChange={e => setPickupPersonName(e.target.value)}
                    placeholder="Nome de quem vai buscar na loja"
                    style={{marginTop: '8px', fontSize: '12px'}}
                  />
                )}
              </div>
            )}

            <div style={{marginBottom: '15px'}}>
              <span style={{fontSize: '12px', color: '#aaa', display: 'block', marginBottom: '6px'}}>Forma de Pagamento:</span>
              <div style={{display: 'flex', gap: '8px'}}>
                <button
                  type="button"
                  className={`secondary-btn ${paymentMethod === 'pix' ? 'primary-btn' : ''}`}
                  style={{flex: 1, fontSize: '12px'}}
                  onClick={() => setPaymentMethod('pix')}
                >
                  Pix Instantâneo
                </button>
                <button
                  type="button"
                  className={`secondary-btn ${paymentMethod === 'card' ? 'primary-btn' : ''}`}
                  style={{flex: 1, fontSize: '12px'}}
                  onClick={() => setPaymentMethod('card')}
                >
                  Cartão / Na Entrega
                </button>
              </div>
            </div>

            {paymentMethod === 'pix' && (
              <div style={{background: '#000', padding: '12px', borderRadius: '10px', border: '1px solid #333', textAlign: 'center', marginBottom: '16px'}}>
                <PixQrCode pixKey={pixKey} name={storeName || "LOJA"} city="CASTANHAL" size={110} />
                <span style={{fontSize: '11px', color: '#aaa'}}>Chave Pix da Loja:</span>
                <div style={{fontSize: '13px', fontWeight: 'bold', color: '#fff', margin: '4px 0'}}>{pixKey}</div>
                <button type="button" onClick={copyPix} className="secondary-btn" style={{fontSize: '11px', padding: '4px 8px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '4px'}}>
                  <Copy size={12}/> Copiar Chave Pix
                </button>
                <small style={{display: 'block', color: '#888', fontSize: '10px', marginTop: '6px'}}>Pague o Pix e anexe o comprovante na mensagem do WhatsApp.</small>
              </div>
            )}

            <button
              type="button"
              className="primary-btn full-btn"
              onClick={handleFinishOrder}
              style={{background: '#25D366', color: '#000', fontWeight: 'bold', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}
            >
              <MessageCircle size={18}/> Enviar Pedido no WhatsApp da Loja
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function StoresDirectoryPage({stores, onSelectStore, onRequestQuote}) {
  return <div className="page-content">
    <div className="page-heading">
      <div>
        <div className="eyebrow"><span className="eyebrow-line"/> PORTAL DE ESTABELECIMENTOS</div>
        <h1>Estabelecimentos & <span>Lojas Ativas.</span></h1>
        <p>Abaixo estão exibidos os estabelecimentos com plano ativo e suporte garantido.</p>
      </div>
    </div>

    <div className="module-cards">
      {stores.map(store => (
        <div className="module-card" key={store.id} style={{background: '#0d0d10', border: '1px solid #1a1a20'}}>
          <div className="module-card-top">
            <span className="status-pill green">• Plano Ativo</span>
            <span style={{color: '#eab308', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '12px'}}>
              <Star size={13} fill="#eab308"/> {store.rating || '5.0'} ({store.reviewsCount || 10})
            </span>
          </div>
          <div className="module-card-icon"><Store size={22}/></div>
          <h3>{store.name}</h3>
          <p style={{fontSize: '12px', color: '#aaa'}}>{store.address || 'Endereço não informado'}</p>
          <p>{store.desc}</p>
          
          <div style={{display: 'flex', gap: '8px', marginTop: '15px'}}>
            <button className="primary-btn full-btn" style={{flex: 1}} onClick={() => onSelectStore(store)}>
              Entrar no Estabelecimento →
            </button>
            <button className="secondary-btn" onClick={() => onRequestQuote(store)} style={{border: '1px solid #25D366', color: '#25D366'}}>
              Orçamento
            </button>
          </div>
        </div>
      ))}

      {!stores.length && (
        <div style={{textAlign: 'center', color: '#888', gridColumn: '1 / -1', padding: '40px'}}>
          Nenhum estabelecimento com plano ativo encontrado no momento.
        </div>
      )}
    </div>
  </div>
}

function StorePage({whatsapp, storeName, onUpgrade, usedDevices = [], usedDevicesEnabled = true}) {
  const [tab, setTab] = useState('seminovos');

  const buyDirect = (modelName, type) => {
    const text = encodeURIComponent(`Olá ${storeName}! Gostaria de comprar o ${modelName} (${type}). Qual a disponibilidade e valores?`);
    window.open(`https://wa.me/${whatsapp}?text=${text}`, '_blank');
  };

  const getModelImage = (t) => {
    if (t === 'seminovos' || t === 'lacrados') return t === 'seminovos' ? imgSeminovo : imgLacrado;
    if (t === 'xiaomi') return imgXiaomi;
    return imgRealme;
  };

  const currentList = useMemo(() => {
    if (tab === 'seminovos') return seminovosList;
    if (tab === 'lacrados') return lacradosList;
    if (tab === 'xiaomi') return xiaomiList;
    return realmeList;
  }, [tab]);

  return <div className="page-content">
    <div className="page-heading">
      <div>
        <div className="eyebrow"><span className="eyebrow-line"/> CENTRAL DE VENDAS & VITRINE</div>
        <h1>Comprar & <span>Upgrade de Aparelho.</span></h1>
        <p>Negocie diretamente no WhatsApp da {storeName} (pronta entrega ou encomenda).</p>
      </div>
      <button className="primary-btn" onClick={onUpgrade} style={{background: 'linear-gradient(135deg, #25D366, #128C7E)', color: '#000', fontWeight: 'bold'}}>
        <RefreshCw size={17}/> Fazer Upgrade de Aparelho
      </button>
    </div>

    <div className="list-toolbar" style={{gap: '10px', flexWrap: 'wrap'}}>
      <button className={`secondary-btn ${tab === 'seminovos' ? 'primary-btn' : ''}`} onClick={() => setTab('seminovos')} style={{borderRadius: '8px'}}>
        iPhones Seminovos
      </button>
      <button className={`secondary-btn ${tab === 'lacrados' ? 'primary-btn' : ''}`} onClick={() => setTab('lacrados')} style={{borderRadius: '8px'}}>
        iPhones Lacrados
      </button>
      <button className={`secondary-btn ${tab === 'xiaomi' ? 'primary-btn' : ''}`} onClick={() => setTab('xiaomi')} style={{borderRadius: '8px'}}>
        Xiaomi & Poco
      </button>
      <button className={`secondary-btn ${tab === 'realme' ? 'primary-btn' : ''}`} onClick={() => setTab('realme')} style={{borderRadius: '8px'}}>
        Realme
      </button>
    </div>

    <div className="module-cards" style={{marginTop: '20px'}}>
      {currentList.map((model) => (
        <div className="module-card" key={model} style={{background: '#0d0d10', border: '1px solid #1a1a20'}}>
          <div className="module-card-top">
            <span className={`status-pill ${tab === 'seminovos' ? 'blue' : tab === 'lacrados' ? 'green' : 'amber'}`}>
              {tab === 'seminovos' ? 'Seminovo' : tab === 'lacrados' ? 'Lacrado' : tab === 'xiaomi' ? 'Xiaomi / Poco' : 'Realme'}
            </span>
            <small style={{color: '#888'}}>Pronta entrega</small>
          </div>
          
          <div style={{
            width: '100%', height: '140px', borderRadius: '10px', overflow: 'hidden', margin: '12px 0', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #222'
          }}>
            <img 
              src={getModelImage(tab)} 
              alt={model} 
              style={{width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85}}
            />
          </div>

          <h3 style={{fontSize: '16px'}}>{model}</h3>
          <p style={{fontSize: '12px', color: '#888'}}>Disponível para consulta e reserva na {storeName}.</p>
          <button className="primary-btn full-btn" style={{marginTop: '15px', background: '#25D366', color: '#000', fontWeight: 'bold'}} onClick={() => buyDirect(model, tab)}>
            <MessageCircle size={16}/> Comprar no WhatsApp da Loja
          </button>
        </div>
      ))}
    </div>

    {tab === 'seminovos' && usedDevicesEnabled && usedDevices.filter(d => d.available !== false && d.status !== 'Vendido').length > 0 && <section style={{marginTop:28}}>
      <div className="page-heading" style={{marginBottom:14}}><div><div className="eyebrow"><span className="eyebrow-line"/> PRONTA ENTREGA</div><h2>Seminovos <span>em estoque.</span></h2><p>Fotos e informações dos aparelhos cadastrados pela loja.</p></div></div>
      <div className="module-cards">
        {usedDevices.filter(d => d.available !== false && d.status !== 'Vendido').map(d => <div className="module-card" key={d.id} style={{background:'#0d0d10',border:'1px solid #1a1a20'}}>
          <div style={{width:'100%',height:180,borderRadius:10,overflow:'hidden',marginBottom:12,background:'#000',display:'flex',alignItems:'center',justifyContent:'center',border:'1px solid #222'}}>{d.photo ? <img src={d.photo} alt={d.model} style={{width:'100%',height:'100%',objectFit:'cover'}}/> : <Smartphone size={48} color="#555"/>}</div>
          <span className="status-pill blue">Seminovo em estoque</span><h3 style={{marginTop:10}}>{d.model}</h3>
          <p style={{fontSize:13,color:'#aaa',lineHeight:1.7}}>{d.capacity ? `${d.capacity} GB · ` : ''}{d.battery ? `Bateria ${d.battery}% · ` : ''}{d.condition || 'Condição não informada'}{d.warranty ? ` · Garantia ${d.warranty}` : ''}</p>
          <strong style={{fontSize:21,display:'block',margin:'10px 0'}}>{moneyBR(d.price)}</strong>
          <button className="primary-btn full-btn" style={{background:'#25D366',color:'#000',fontWeight:'bold'}} onClick={() => { const text=encodeURIComponent(`Olá ${storeName}! Tenho interesse no seminovo ${d.model}${d.capacity ? ` ${d.capacity} GB` : ''}, anunciado por ${moneyBR(d.price)}. Ainda está disponível?`); window.open(`https://wa.me/${String(whatsapp||'').replace(/\D/g,'')}?text=${text}`,'_blank'); }}><MessageCircle size={16}/> Tenho interesse</button>
        </div>)}
      </div>
    </section>}
  </div>
}

function TrackPage({orders, storeName, pixKey, whatsapp, storeAddress, mapsUrl, setOrders, notify}) {
  const [trackQuery, setTrackQuery] = useState('');
  const [foundOs, setFoundOs] = useState(null);
  const [userRating, setUserRating] = useState(5);
  const [userReviewText, setUserReviewText] = useState('');

  const handleSearchOs = (e) => {
    e.preventDefault();
    const result = orders.find(o => o.id.toLowerCase() === trackQuery.trim().toLowerCase());
    setFoundOs(result || 'NOT_FOUND');
  };

  const submitReview = () => {
    if (foundOs && foundOs !== 'NOT_FOUND') {
      setOrders(prev => prev.map(o => o.id === foundOs.id ? { ...o, rating: userRating, review: userReviewText } : o));
      setFoundOs({ ...foundOs, rating: userRating, review: userReviewText });
      notify('Sua avaliação foi enviada com sucesso! Obrigado.');
    }
  };

  const copyPixToClipboard = () => {
    navigator.clipboard.writeText(pixKey);
    notify('Chave Pix copiada para a área de transferência!');
  };

  const getRemainingWarrantyDays = (order) => {
    if (!order.createdAt || !order.warrantyDays) return order.warrantyDays || 90;
    const start = new Date(order.deliveredAt || order.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, order.warrantyDays - diffDays);
  };

  const approveBudget = (order) => {
    const text = encodeURIComponent(`Olá ${storeName}! Gostaria de *APROVAR* o orçamento da minha OS *${order.id}* (${order.device}) no valor de *${order.amount}*. Pode dar andamento no serviço!`);
    window.open(`https://wa.me/${whatsapp}?text=${text}`, '_blank');
  };

  const rejectBudget = (order) => {
    const text = encodeURIComponent(`Olá ${storeName}! Gostaria de conversar a respeito do orçamento da minha OS *${order.id}* (${order.device}). No momento não tenho interesse no reparo ou gostaria de rever o valor.`);
    window.open(`https://wa.me/${whatsapp}?text=${text}`, '_blank');
  };

  const getStepIndex = (status) => {
    const map = {
      'Recebido': 0,
      'Em diagnóstico': 1,
      'Aguardando aprovação': 2,
      'Aguardando peça': 2,
      'Em manutenção': 3,
      'Pronto para retirada': 4,
      'Entregue': 5
    };
    return map[status] ?? 0;
  };

  return <div className="page-content">
    <div className="page-heading">
      <div>
        <div className="eyebrow"><span className="eyebrow-line"/> ÁREA DO CLIENTE</div>
        <h1>Acompanhar <span>Atendimento.</span></h1>
        <p>Use o código exclusivo enviado pela assistência no WhatsApp. Ele corresponde ao número da sua Ordem de Serviço.</p>
      </div>
    </div>

    <div className="panel" style={{background: '#0a0a0d', border: '1px solid #18181b', padding: '24px', maxWidth: '640px', margin: '0 auto'}}>
      <form onSubmit={handleSearchOs} style={{display: 'flex', gap: '10px'}}>
        <input 
          value={trackQuery} 
          onChange={e=>setTrackQuery(e.target.value)} 
          placeholder="Ex: OS-2048" 
          style={{flex: 1, background: '#111', color: '#fff', border: '1px solid #333', padding: '10px 14px', borderRadius: '8px', fontSize: '15px'}}
          required
        />
        <button className="primary-btn" type="submit"><Search size={18}/> Rastrear OS</button>
      </form>

      {foundOs && foundOs !== 'NOT_FOUND' && (
        <div style={{marginTop: '25px', background: '#121215', border: '1px solid #222', borderRadius: '12px', padding: '20px'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
            <strong>{foundOs.id}</strong>
            <span className={`status-pill ${foundOs.color}`}>{foundOs.status}</span>
          </div>

          <div style={{margin: '20px 0 25px', background: '#0a0a0d', padding: '16px', borderRadius: '10px', border: '1px solid #1f1f23'}}>
            <span style={{fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '12px'}}>
              Progresso do Atendimento
            </span>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative'}}>
              {orderSteps.map((step, idx) => {
                const currentIdx = getStepIndex(foundOs.status);
                const isCompleted = idx <= currentIdx;
                const isCurrent = idx === currentIdx;
                return (
                  <div key={step} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative', zIndex: 1}}>
                    <div style={{
                      width: '24px', height: '24px', borderRadius: '50%',
                      background: isCompleted ? '#25D366' : '#222',
                      color: isCompleted ? '#000' : '#666',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '11px', fontWeight: 'bold',
                      border: isCurrent ? '2px solid #fff' : 'none'
                    }}>
                      {isCompleted ? '✓' : idx + 1}
                    </div>
                    <span style={{fontSize: '10px', color: isCompleted ? '#fff' : '#666', marginTop: '6px', textAlign: 'center'}}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <p style={{margin: '5px 0', fontSize: '14px', color: '#aaa'}}><strong>Cliente:</strong> {foundOs.customer}</p>
          <p style={{margin: '5px 0', fontSize: '14px', color: '#aaa'}}><strong>Item / Aparelho:</strong> {foundOs.device}</p>
          <p style={{margin: '5px 0', fontSize: '14px', color: '#aaa'}}><strong>Defeito informado:</strong> {foundOs.issue || 'Não informado'}</p>
          <p style={{margin: '5px 0', fontSize: '14px', color: '#aaa'}}><strong>Diagnóstico técnico:</strong> {foundOs.diagnosis || 'Aguardando avaliação técnica'}</p>
          <p style={{margin: '5px 0', fontSize: '14px', color: '#aaa'}}><strong>Orçamento:</strong> <span style={{color: '#25D366', fontWeight: 'bold'}}>{foundOs.amount || 'A definir'}</span></p>
          {foundOs.checklist && <div style={{marginTop:12,padding:12,background:'#0a0a0d',border:'1px solid #222',borderRadius:8}}><strong style={{fontSize:13}}>Resumo do check-in</strong>{Object.entries({screen:'Tela / Touchscreen',faceId:'Face ID / Touch ID',cameras:'Câmeras',charging:'Carga / Bateria',audio:'Áudio / Microfone',wifi:'Wi-Fi / Bluetooth / Chip',housing:'Carcaça / Vidro traseiro'}).map(([key,label])=><p key={key} style={{fontSize:12,margin:'6px 0',color:'#aaa'}}>{label}: <strong style={{color:foundOs.checklist[key]==='ok'?'#25D366':foundOs.checklist[key]==='issue'?'#ff6464':'#ddd'}}>{foundOs.checklist[key]==='ok'?'OK':foundOs.checklist[key]==='issue'?'Com avaria':'Não registrado'}</strong></p>)}</div>}
          {!!foundOs.checkinPhotos?.length && <div style={{marginTop:12}}><strong style={{fontSize:13}}>Fotos registradas no check-in</strong><div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:8}}>{foundOs.checkinPhotos.map((src,i)=><img key={i} src={src} alt={`Foto do check-in ${i+1}`} style={{width:100,height:100,objectFit:'cover',borderRadius:8,border:'1px solid #333'}}/>)}</div></div>}
          <p style={{margin: '5px 0', fontSize: '14px', color: '#aaa'}}><strong>Garantia:</strong> {foundOs.warrantyDays || 90} dias a partir da entrega do aparelho, conforme o serviço registrado.</p>

          {foundOs.status === 'Aguardando aprovação' && (
            <div style={{marginTop: '20px', background: '#1c1917', border: '1px solid #78350f', padding: '16px', borderRadius: '10px', textAlign: 'center'}}>
              <span style={{fontSize: '13px', color: '#f59e0b', fontWeight: 'bold', display: 'block', marginBottom: '8px'}}>
                ⚠️ Orçamento aguardando sua resposta: {foundOs.amount}
              </span>
              <p style={{fontSize: '12px', color: '#d6d3d1', margin: '0 0 14px'}}>
                Deseja aprovar a execução do serviço pelo valor informado?
              </p>
              <div style={{display: 'flex', gap: '8px'}}>
                <button
                  type="button"
                  onClick={() => approveBudget(foundOs)}
                  className="primary-btn"
                  style={{flex: 1, background: '#25D366', color: '#000', fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'}}
                >
                  <CheckCircle2 size={16}/> Aprovar no WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => rejectBudget(foundOs)}
                  className="secondary-btn"
                  style={{flex: 1, borderColor: '#ef4444', color: '#ef4444', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'}}
                >
                  <XCircle size={16}/> Recusar / Negociar
                </button>
              </div>
            </div>
          )}

          <div style={{marginTop: '15px', background: '#111827', border: '1px solid #1e3a8a', padding: '12px', borderRadius: '8px'}}>
            <span style={{fontSize: '12px', color: '#3b82f6', fontWeight: 'bold'}}>🛡️ GARANTIA DIGITAL ATIVA</span>
            <p style={{fontSize: '14px', margin: '4px 0', color: '#fff'}}>
              Restam <strong>{getRemainingWarrantyDays(foundOs)} dias</strong> de garantia (Total contratado: {foundOs.warrantyDays} dias).
            </p>
          </div>

          {storeAddress && (
            <div style={{marginTop: '15px', background: '#18181f', padding: '12px', borderRadius: '8px', border: '1px solid #333'}}>
              <span style={{fontSize: '12px', color: '#aaa', display: 'flex', alignItems: 'center', gap: '4px'}}>
                <MapPin size={14} color="#f59e0b"/> LOCALIZAÇÃO PARA RETIRADA:
              </span>
              <p style={{fontSize: '13px', margin: '4px 0', color: '#fff'}}>{storeAddress}</p>
              {mapsUrl && (
                <a href={mapsUrl} target="_blank" rel="noreferrer" style={{color: '#3b82f6', fontSize: '12px', textDecoration: 'none'}}>
                  🗺️ Abrir no Google Maps →
                </a>
              )}
            </div>
          )}

          {pixKey && foundOs.status === 'Pronto para retirada' && (
            <div style={{marginTop: '20px', background: '#18181f', padding: '15px', borderRadius: '8px', border: '1px solid #333'}}>
              <span style={{fontSize: '12px', color: '#25D366', fontWeight: 'bold'}}>✓ SEU PEDIDO ESTÁ PRONTO!</span>
              <p style={{fontSize: '13px', margin: '8px 0'}}>Pagamento via Pix para {storeName}:</p>
              <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                <code style={{background: '#000', padding: '8px 12px', borderRadius: '6px', color: '#fff', fontSize: '13px', flex: 1, border: '1px solid #444'}}>{pixKey}</code>
                <button className="primary-btn" onClick={copyPixToClipboard} style={{background: '#25D366', color: '#000', fontWeight: 'bold', fontSize: '12px', padding: '8px 12px'}}>
                  <Copy size={14}/> Copiar Chave
                </button>
              </div>
            </div>
          )}

          <div style={{marginTop: '20px', background: '#0d0d10', padding: '15px', borderRadius: '8px', border: '1px solid #222'}}>
            <strong style={{fontSize: '13px'}}>Avalie nosso Atendimento:</strong>
            <div style={{display: 'flex', gap: '8px', margin: '10px 0'}}>
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star} onClick={() => setUserRating(star)} style={{background: 'none', border: 'none', cursor: 'pointer'}}>
                  <Star size={22} fill={star <= userRating ? '#eab308' : 'none'} color="#eab308"/>
                </button>
              ))}
            </div>
            <input 
              value={userReviewText} 
              onChange={e=>setUserReviewText(e.target.value)} 
              placeholder="Deixe seu comentário sobre o serviço..." 
              style={{background: '#111', color: '#fff', border: '1px solid #333', padding: '8px', borderRadius: '6px', width: '100%', fontSize: '12px'}}
            />
            <button className="secondary-btn" onClick={submitReview} style={{marginTop: '8px', fontSize: '12px'}}>Enviar Avaliação</button>
          </div>

          <a href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(`Olá ${storeName}! Estou acompanhando meu atendimento ${foundOs.id} (${foundOs.device})`)}`} target="_blank" rel="noreferrer" className="primary-btn full-btn" style={{marginTop: '20px', background: '#25D366', color: '#000', textDecoration: 'none', textAlign: 'center'}}>
            <MessageCircle size={16}/> Falar com o Estabelecimento no WhatsApp
          </a>
        </div>
      )}

      {foundOs === 'NOT_FOUND' && (
        <div style={{marginTop: '20px', textAlign: 'center', color: '#888', padding: '20px'}}>
          Nenhum registro encontrado com o código "{trackQuery}".
        </div>
      )}
    </div>
  </div>
}

function PaymentsPage({pixKey, setPixKey, onShowPayModal}) {
  return <div className="page-content">
    <div className="page-heading">
      <div>
        <div className="eyebrow"><span className="eyebrow-line"/> FINANCEIRO</div>
        <h1>Configuração <span>Pix & Recebimentos.</span></h1>
        <p>Defina a sua chave Pix para receber pagamentos de serviços e vendas.</p>
      </div>
      <button className="primary-btn" onClick={onShowPayModal} style={{background: '#25D366', color: '#000', fontWeight: 'bold'}}>
        <QrCode size={17}/> Renovação da Assinatura (R$ 50,00)
      </button>
    </div>
    
    <div className="settings-grid">
      <section className="panel settings-panel" style={{background: '#0a0a0d', border: '1px solid #18181b'}}>
        <div className="settings-title">
          <div className="settings-icon"><CreditCard size={19}/></div>
          <div><h3>Sua Chave Pix para Recebimento</h3><p>Exibida aos clientes no fechamento</p></div>
        </div>
        <div className="settings-row">
          <span>Chave Pix Cadastrada</span>
          <input 
            value={pixKey} 
            onChange={e=>setPixKey(e.target.value)} 
            placeholder="Ex: CNPJ, E-mail, Telefone ou CPF" 
            style={{background: '#111', color: '#fff', border: '1px solid #333', padding: '8px 12px', borderRadius: '6px', fontSize: '13px', width: '250px'}}
          />
        </div>
        <div className="settings-help">
          <ShieldCheck size={16}/>
          <span>Seus clientes efetuarão os pagamentos diretamente na sua conta bancária sem intermediários.</span>
        </div>
      </section>
    </div>
  </div>
}

function SettingsPage({configured,email,storeName,setStoreName,storeLogo,onLogoUpload,whatsapp,setWhatsapp,pixKey,setPixKey,storeAddress,setStoreAddress,mapsUrl,setMapsUrl,modules,setModules,onLogout,teamMembers,onInviteMember,auditLogs,userAccessLevel,isLifetimeAdmin,upgradeAssistantEnabled,setUpgradeAssistantEnabled,upgradeDiscounts,setUpgradeDiscounts,onShowTutorial}) {
  return <div className="page-content">
    <div className="page-heading">
      <div>
        <div className="eyebrow"><span className="eyebrow-line"/> SISTEMA</div>
        <h1>Configurações do <span>Estabelecimento.</span></h1>
        <p>Ajuste o nome comercial, localização física, equipe e módulos ativos.</p>
      </div>
      <button className="secondary-btn" onClick={onShowTutorial}><CircleHelp size={16}/> Ver tutorial novamente</button>
    </div>

    <div className="settings-grid">
      <section className="panel settings-panel" style={{background: '#0a0a0d', border: '1px solid #18181b', gridColumn: '1 / -1'}}>
        <div className="settings-title">
          <div className="settings-icon"><RefreshCw size={19}/></div>
          <div>
            <h3>Auxiliar de Avaliação de Upgrade</h3>
            <p>Ative para permitir que clientes marquem avarias e peças trocadas, abatendo valores automaticamente.</p>
          </div>
          <button
            className={`secondary-btn ${upgradeAssistantEnabled ? 'primary-btn' : ''}`}
            onClick={() => setUpgradeAssistantEnabled(!upgradeAssistantEnabled)}
            style={{fontSize: '12px', padding: '6px 14px'}}
          >
            {upgradeAssistantEnabled ? '✓ Ativado' : 'Desativado'}
          </button>
        </div>

        {upgradeAssistantEnabled && (
          <div style={{marginTop: '16px', borderTop: '1px solid #222', paddingTop: '16px'}}>
            <span style={{fontSize: '12px', color: '#aaa', display: 'block', marginBottom: '12px'}}>
              Defina o valor em Reais (R$) a ser reduzido do celular do cliente para cada tipo de condição:
            </span>

            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px'}}>
              <div className="settings-row" style={{flexDirection: 'column', alignItems: 'flex-start', background: '#121217', padding: '10px', borderRadius: '8px'}}>
                <span style={{fontSize: '12px'}}>Tela Trocada / Trincada</span>
                <div style={{display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', width: '100%'}}>
                  <span style={{color: '#ef4444', fontWeight: 'bold'}}>- R$</span>
                  <input
                    type="number"
                    value={upgradeDiscounts.screenReplaced}
                    onChange={e => setUpgradeDiscounts({...upgradeDiscounts, screenReplaced: e.target.value})}
                    style={{background: '#000', color: '#fff', border: '1px solid #333', padding: '6px', borderRadius: '6px', width: '100%'}}
                  />
                </div>
              </div>

              <div className="settings-row" style={{flexDirection: 'column', alignItems: 'flex-start', background: '#121217', padding: '10px', borderRadius: '8px'}}>
                <span style={{fontSize: '12px'}}>Bateria Trocada / Não Genuína</span>
                <div style={{display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', width: '100%'}}>
                  <span style={{color: '#ef4444', fontWeight: 'bold'}}>- R$</span>
                  <input
                    type="number"
                    value={upgradeDiscounts.batteryReplaced}
                    onChange={e => setUpgradeDiscounts({...upgradeDiscounts, batteryReplaced: e.target.value})}
                    style={{background: '#000', color: '#fff', border: '1px solid #333', padding: '6px', borderRadius: '6px', width: '100%'}}
                  />
                </div>
              </div>

              <div className="settings-row" style={{flexDirection: 'column', alignItems: 'flex-start', background: '#121217', padding: '10px', borderRadius: '8px'}}>
                <span style={{fontSize: '12px'}}>Face ID / Biometria Inoperante</span>
                <div style={{display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', width: '100%'}}>
                  <span style={{color: '#ef4444', fontWeight: 'bold'}}>- R$</span>
                  <input
                    type="number"
                    value={upgradeDiscounts.faceIdOff}
                    onChange={e => setUpgradeDiscounts({...upgradeDiscounts, faceIdOff: e.target.value})}
                    style={{background: '#000', color: '#fff', border: '1px solid #333', padding: '6px', borderRadius: '6px', width: '100%'}}
                  />
                </div>
              </div>

              <div className="settings-row" style={{flexDirection: 'column', alignItems: 'flex-start', background: '#121217', padding: '10px', borderRadius: '8px'}}>
                <span style={{fontSize: '12px'}}>Câmera com Falha / Trocada</span>
                <div style={{display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', width: '100%'}}>
                  <span style={{color: '#ef4444', fontWeight: 'bold'}}>- R$</span>
                  <input
                    type="number"
                    value={upgradeDiscounts.cameraFailed}
                    onChange={e => setUpgradeDiscounts({...upgradeDiscounts, cameraFailed: e.target.value})}
                    style={{background: '#000', color: '#fff', border: '1px solid #333', padding: '6px', borderRadius: '6px', width: '100%'}}
                  />
                </div>
              </div>

              <div className="settings-row" style={{flexDirection: 'column', alignItems: 'flex-start', background: '#121217', padding: '10px', borderRadius: '8px'}}>
                <span style={{fontSize: '12px'}}>Lente / Vidrinho da Câmera</span>
                <div style={{display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', width: '100%'}}>
                  <span style={{color: '#ef4444', fontWeight: 'bold'}}>- R$</span>
                  <input
                    type="number"
                    value={upgradeDiscounts.cameraLensScratched}
                    onChange={e => setUpgradeDiscounts({...upgradeDiscounts, cameraLensScratched: e.target.value})}
                    style={{background: '#000', color: '#fff', border: '1px solid #333', padding: '6px', borderRadius: '6px', width: '100%'}}
                  />
                </div>
              </div>

              <div className="settings-row" style={{flexDirection: 'column', alignItems: 'flex-start', background: '#121217', padding: '10px', borderRadius: '8px'}}>
                <span style={{fontSize: '12px'}}>Conector / Dock de Carga</span>
                <div style={{display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', width: '100%'}}>
                  <span style={{color: '#ef4444', fontWeight: 'bold'}}>- R$</span>
                  <input
                    type="number"
                    value={upgradeDiscounts.chargingPortFailed}
                    onChange={e => setUpgradeDiscounts({...upgradeDiscounts, chargingPortFailed: e.target.value})}
                    style={{background: '#000', color: '#fff', border: '1px solid #333', padding: '6px', borderRadius: '6px', width: '100%'}}
                  />
                </div>
              </div>

              <div className="settings-row" style={{flexDirection: 'column', alignItems: 'flex-start', background: '#121217', padding: '10px', borderRadius: '8px'}}>
                <span style={{fontSize: '12px'}}>Alto-falante / Auricular</span>
                <div style={{display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', width: '100%'}}>
                  <span style={{color: '#ef4444', fontWeight: 'bold'}}>- R$</span>
                  <input
                    type="number"
                    value={upgradeDiscounts.audioSpeakerFailed}
                    onChange={e => setUpgradeDiscounts({...upgradeDiscounts, audioSpeakerFailed: e.target.value})}
                    style={{background: '#000', color: '#fff', border: '1px solid #333', padding: '6px', borderRadius: '6px', width: '100%'}}
                  />
                </div>
              </div>

              <div className="settings-row" style={{flexDirection: 'column', alignItems: 'flex-start', background: '#121217', padding: '10px', borderRadius: '8px'}}>
                <span style={{fontSize: '12px'}}>NFC / Pagamento por Aproximação</span>
                <div style={{display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', width: '100%'}}>
                  <span style={{color: '#ef4444', fontWeight: 'bold'}}>- R$</span>
                  <input
                    type="number"
                    value={upgradeDiscounts.nfcFailed}
                    onChange={e => setUpgradeDiscounts({...upgradeDiscounts, nfcFailed: e.target.value})}
                    style={{background: '#000', color: '#fff', border: '1px solid #333', padding: '6px', borderRadius: '6px', width: '100%'}}
                  />
                </div>
              </div>

              <div className="settings-row" style={{flexDirection: 'column', alignItems: 'flex-start', background: '#121217', padding: '10px', borderRadius: '8px'}}>
                <span style={{fontSize: '12px'}}>Wi-Fi ou Bluetooth Inoperante</span>
                <div style={{display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', width: '100%'}}>
                  <span style={{color: '#ef4444', fontWeight: 'bold'}}>- R$</span>
                  <input
                    type="number"
                    value={upgradeDiscounts.wifiFailed}
                    onChange={e => setUpgradeDiscounts({...upgradeDiscounts, wifiFailed: e.target.value})}
                    style={{background: '#000', color: '#fff', border: '1px solid #333', padding: '6px', borderRadius: '6px', width: '100%'}}
                  />
                </div>
              </div>

              <div className="settings-row" style={{flexDirection: 'column', alignItems: 'flex-start', background: '#121217', padding: '10px', borderRadius: '8px'}}>
                <span style={{fontSize: '12px'}}>Carcaça / Vidro Traseiro com Marcas</span>
                <div style={{display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', width: '100%'}}>
                  <span style={{color: '#ef4444', fontWeight: 'bold'}}>- R$</span>
                  <input
                    type="number"
                    value={upgradeDiscounts.housingScratched}
                    onChange={e => setUpgradeDiscounts({...upgradeDiscounts, housingScratched: e.target.value})}
                    style={{background: '#000', color: '#fff', border: '1px solid #333', padding: '6px', borderRadius: '6px', width: '100%'}}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {userAccessLevel === 'owner' && (
        <section className="panel settings-panel" style={{background: '#0a0a0d', border: '1px solid #18181b', gridColumn: '1 / -1'}}>
          <div className="settings-title">
            <div className="settings-icon"><Users size={19}/></div>
            <div><h3>Equipe & Operadores Cadastrados</h3><p>1 Assinatura = Toda a sua equipe usando o mesmo estabelecimento</p></div>
            <button className="primary-btn" onClick={onInviteMember} style={{fontSize: '12px', padding: '6px 12px'}}><UserPlus size={15}/> Convidar Membro</button>
          </div>
          
          <div className="table-wrap" style={{marginTop: '15px'}}>
            <table>
              <thead>
                <tr>
                  <th>NOME</th>
                  <th>E-MAIL</th>
                  <th>CARGO / FUNÇÃO</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {teamMembers.map(m => (
                  <tr key={m.id}>
                    <td><strong>{m.name}</strong></td>
                    <td>{m.email}</td>
                    <td><span className={`status-pill ${m.role === 'owner' ? 'green' : 'blue'}`}>{m.role === 'owner' ? 'Administrador (Dono)' : 'Operador / Técnico'}</span></td>
                    <td><span className="status-pill green">• {m.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {userAccessLevel === 'owner' && (
        <section className="panel settings-panel" style={{background: '#0a0a0d', border: '1px solid #18181b', gridColumn: '1 / -1'}}>
          <div className="settings-title">
            <div className="settings-icon"><History size={19}/></div>
            <div><h3>Histórico de Alterações (Audit Log)</h3><p>Registro de segurança ("Quem fez o quê")</p></div>
          </div>
          
          <div className="table-wrap" style={{marginTop: '15px'}}>
            <table>
              <thead>
                <tr>
                  <th>DATA / HORA</th>
                  <th>AÇÃO REALIZADA</th>
                  <th>USUÁRIO / OPERADOR</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.slice(0, 5).map(log => (
                  <tr key={log.id}>
                    <td>{log.time}</td>
                    <td><strong>{log.action}</strong></td>
                    <td>{log.user}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="panel settings-panel" style={{background: '#0a0a0d', border: '1px solid #18181b'}}>
        <div className="settings-title"><div className="settings-icon"><Sliders size={19}/></div><div><h3>Módulos do Estabelecimento</h3><p>Ative ou desative os recursos exibidos no painel</p></div></div>
        
        <div className="settings-row">
          <span>Ordens de Serviço & Atendimento</span>
          <button className={`secondary-btn ${modules.orders ? 'primary-btn' : ''}`} onClick={() => setModules({...modules, orders: !modules.orders})}>
            {modules.orders ? 'Ativado' : 'Desativado'}
          </button>
        </div>

        <div className="settings-row">
          <span>Pós-Venda & Acompanhamento</span>
          <button className={`secondary-btn ${modules.crm ? 'primary-btn' : ''}`} onClick={() => setModules({...modules, crm: !modules.crm})}>
            {modules.crm ? 'Ativado' : 'Desativado'}
          </button>
        </div>

        <div className="settings-row">
          <span>Caixa da Loja / Balcão</span>
          <button className={`secondary-btn ${modules.cashRegister ? 'primary-btn' : ''}`} onClick={() => setModules({...modules, cashRegister: !modules.cashRegister})}>
            {modules.cashRegister ? 'Ativado' : 'Desativado'}
          </button>
        </div>

        <div className="settings-row">
          <span>Venda de Aparelhos & Upgrade</span>
          <button className={`secondary-btn ${modules.iphones ? 'primary-btn' : ''}`} onClick={() => setModules({...modules, iphones: !modules.iphones})}>
            {modules.iphones ? 'Ativado' : 'Desativado'}
          </button>
        </div>

        <div className="settings-row">
          <span>Estoque de Produtos & Itens</span>
          <button className={`secondary-btn ${modules.inventory ? 'primary-btn' : ''}`} onClick={() => setModules({...modules, inventory: !modules.inventory})}>
            {modules.inventory ? 'Ativado' : 'Desativado'}
          </button>
        </div>

        <div className="settings-row">
          <span>Financeiro & Comissões</span>
          <button className={`secondary-btn ${modules.finance ? 'primary-btn' : ''}`} onClick={() => setModules({...modules, finance: !modules.finance})}>
            {modules.finance ? 'Ativado' : 'Desativado'}
          </button>
        </div>
      </section>

      <section className="panel settings-panel" style={{background: '#0a0a0d', border: '1px solid #18181b'}}>
        <div className="settings-title"><div className="settings-icon"><Store size={19}/></div><div><h3>Dados & Endereço do Estabelecimento</h3><p>Identidade exibida no painel, faturas e Google Maps</p></div></div>
        
        <div className="settings-row">
          <span>Logotipo do Estabelecimento</span>
          <label className="secondary-btn" style={{cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', fontSize: '12px'}}>
            <Upload size={14}/> {storeLogo ? 'Alterar Logo' : 'Enviar Logo'}
            <input type="file" accept="image/*" onChange={onLogoUpload} style={{display: 'none'}} />
          </label>
        </div>

        <div className="settings-row">
          <span>Nome Comercial</span>
          <input value={storeName} onChange={e=>setStoreName(e.target.value)} placeholder="Ex: RT Assistência ou Loja X" style={{background: '#111', color: '#fff', border: '1px solid #333', padding: '6px 10px', borderRadius: '6px', fontSize: '13px', width: '220px'}}/>
        </div>

        <div className="settings-row">
          <span>Endereço Físico</span>
          <input value={storeAddress} onChange={e=>setStoreAddress(e.target.value)} placeholder="Av. Principal, 1000 - Centro" style={{background: '#111', color: '#fff', border: '1px solid #333', padding: '6px 10px', borderRadius: '6px', fontSize: '13px', width: '220px'}}/>
        </div>

        <div className="settings-row">
          <span>Link do Google Maps</span>
          <input value={mapsUrl} onChange={e=>setMapsUrl(e.target.value)} placeholder="https://maps.google.com/..." style={{background: '#111', color: '#fff', border: '1px solid #333', padding: '6px 10px', borderRadius: '6px', fontSize: '13px', width: '220px'}}/>
        </div>

        <div className="settings-row">
          <span>WhatsApp da Loja (Vendas & OS)</span>
          <input value={whatsapp} onChange={e=>setWhatsapp(e.target.value)} placeholder="Ex: 5591999999999" style={{background: '#111', color: '#fff', border: '1px solid #333', padding: '6px 10px', borderRadius: '6px', fontSize: '13px', width: '220px'}}/>
        </div>

        <div className="settings-row">
          <span>Chave Pix da Loja (Recebimentos)</span>
          <input value={pixKey} onChange={e=>setPixKey(e.target.value)} placeholder="Sua chave Pix" style={{background: '#111', color: '#fff', border: '1px solid #333', padding: '6px 10px', borderRadius: '6px', fontSize: '13px', width: '220px'}}/>
        </div>
      </section>

      <section className="panel settings-panel" style={{background: '#0a0a0d', border: '1px solid #18181b'}}>
        <div className="settings-title"><div className="settings-icon"><ShieldCheck size={19}/></div><div><h3>Licença & Suporte RT Mobile</h3><p>Administração da plataforma</p></div><span className={`connection-badge ${configured?'connected':''}`}><i/>{configured?'Ativo':'Pendente'}</span></div>
        <div className="settings-row"><span>Status da Licença</span><strong style={{color: '#25D366'}}>{isLifetimeAdmin ? '👑 Licença Vitalícia de Administrador (Sem Cobrança)' : 'Plano Profissional Ativo (R$ 50/mês)'}</strong></div>
        <div className="settings-row"><span>E-mail do Administrador</span><strong>{email || 'Nenhum'}</strong></div>
        
        <a href={`https://wa.me/${adminWhatsapp}?text=${encodeURIComponent('Olá Robert! Preciso de suporte no sistema RT Mobile.')}`} target="_blank" rel="noreferrer" className="secondary-btn full-btn" style={{marginTop: '15px', textDecoration: 'none', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}>
          <PhoneCall size={15}/> Falar com Suporte Técnico (Robert)
        </a>

        {email && <button className="secondary-btn logout-btn" onClick={onLogout} style={{marginTop: '15px'}}><LogOut size={16}/> Sair da conta</button>}
      </section>
    </div>
  </div>
}


// Módulos adicionais RT Mobile. Os cadastros locais usam localStorage; para sincronizar entre
// dispositivos/usuários, conecte as tabelas correspondentes no Supabase.
function useLocalRecords(key) {
  const [items, setItems] = useState(() => { try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; } });
  useEffect(() => { localStorage.setItem(key, JSON.stringify(items)); }, [key, items]);
  return [items, setItems];
}
const moneyBR = n => Number(n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const fieldStyle = { background: '#111', color: '#fff', border: '1px solid #333', padding: '10px', borderRadius: '7px', width: '100%', boxSizing: 'border-box' };
const formGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '10px', marginBottom: '14px' };
function ModuleHeading({eyebrow, title, description}) { return <div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-line"/>{eyebrow}</div><h1>{title}</h1><p>{description}</p></div></div>; }

function ClientUsedDevicesPage({storeName, whatsapp, devices, enabled}) {
  const available = (devices || []).filter(d => d.available !== false && d.status !== 'Vendido');
  return <div className="page-content">
    <ModuleHeading eyebrow="VITRINE DA LOJA" title={<>Seminovos & <span>Usados.</span></>} description={`Aparelhos disponíveis na loja ${storeName}, com fotos e preços atualizados.`}/>
    {!enabled ? <div className="panel" style={{padding:24,background:'#0a0a0d',border:'1px solid #18181b'}}>Esta loja está sem aparelhos seminovos anunciados no momento.</div> :
      <div className="module-cards">{available.map(d=><div className="module-card" key={d.id} style={{background:'#0d0d10',border:'1px solid #1a1a20'}}>
        <div style={{width:'100%',height:190,borderRadius:10,overflow:'hidden',marginBottom:12,background:'#000',display:'flex',alignItems:'center',justifyContent:'center',border:'1px solid #222'}}>{d.photo?<img src={d.photo} alt={d.model} style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<Smartphone size={48} color="#555"/>}</div>
        <span className="status-pill green">Disponível</span><h3 style={{marginTop:10}}>{d.brand ? `${d.brand} ` : ''}{d.model}</h3>
        <p style={{fontSize:13,color:'#aaa',lineHeight:1.7}}>{d.capacity?`${d.capacity} GB · `:''}{d.battery?`Bateria ${d.battery}% · `:''}{d.condition||'Condição não informada'}{d.warranty?` · Garantia ${d.warranty}`:''}</p>
        <strong style={{fontSize:22,display:'block',margin:'10px 0',color:'#25D366'}}>{moneyBR(d.price)}</strong>
        <button className="primary-btn full-btn" onClick={()=>{const msg=encodeURIComponent(`Olá ${storeName}! Tenho interesse no aparelho seminovo ${d.brand ? `${d.brand} ` : ''}${d.model}${d.capacity?` ${d.capacity} GB`:''}, anunciado por ${moneyBR(d.price)}. Ainda está disponível?`);window.open(`https://wa.me/${String(whatsapp||'').replace(/\\D/g,'')}?text=${msg}`,'_blank');}}><MessageCircle size={16}/> Comprar pelo WhatsApp</button>
      </div>)}
      {!available.length&&<div className="empty-state"><Smartphone/><strong>Nenhum seminovo disponível</strong><span>Volte em breve para conferir novos aparelhos.</span></div>}</div>}
    <p className="muted">Por segurança, o IMEI completo fica visível somente no painel da loja e não é exibido publicamente.</p>
  </div>;
}

function UsedDevicesPage({storeName, devices, setDevices, enabled, setEnabled}) { const [f,setF]=useState({brand:'Apple',model:'',imei:'',capacity:'',battery:'',cost:'',price:'',condition:'Bom',warranty:'90 dias',seller:'',notes:'',photo:''});
 const add=e=>{e.preventDefault();setDevices(p=>[{...f,storeName,id:String(Date.now()),createdAt:new Date().toISOString(),status:'Disponível',available:true},...p]);setF({brand:'Apple',model:'',imei:'',capacity:'',battery:'',cost:'',price:'',condition:'Bom',warranty:'90 dias',seller:'',notes:'',photo:''});};
 const handlePhoto=e=>{const file=e.target.files?.[0];if(!file)return;if(!file.type.startsWith('image/'))return alert('Selecione um arquivo de imagem.');const reader=new FileReader();reader.onload=()=>{const img=new Image();img.onload=()=>{const max=1000;const scale=Math.min(1,max/Math.max(img.width,img.height));const canvas=document.createElement('canvas');canvas.width=Math.round(img.width*scale);canvas.height=Math.round(img.height*scale);canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);setF(prev=>({...prev,photo:canvas.toDataURL('image/jpeg',0.76)}));};img.onerror=()=>alert('Não foi possível ler essa foto.');img.src=String(reader.result);};reader.readAsDataURL(file);};
 const val=k=>Number(k)||0;
 return <div className="page-content"><ModuleHeading eyebrow="APARELHOS USADOS" title={<>Seminovos & <span>Usados.</span></>} description="Cadastre os aparelhos reais da loja. O IMEI fica apenas no painel interno."/><section className="panel" style={{padding:18,background:'#0a0a0d',border:'1px solid #18181b'}}><div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center',flexWrap:'wrap'}}><div><h3>Controle do módulo</h3><p className="muted">Vitrine de usados para {storeName}</p></div><button className={enabled?'primary-btn':'secondary-btn'} onClick={()=>{setEnabled(v=>{localStorage.setItem('rt_used_devices_enabled',String(!v));return !v;});}}>{enabled?'Módulo ligado':'Módulo desligado'}</button></div></section>{enabled&&<form className="panel" onSubmit={add} style={{padding:18,marginTop:14,background:'#0a0a0d',border:'1px solid #18181b'}}><h3>Ficha técnica do aparelho</h3><div style={formGrid}><input style={fieldStyle} placeholder="Marca (ex.: Apple, Samsung, Xiaomi)" value={f.brand} onChange={e=>setF({...f,brand:e.target.value})} required/><input style={fieldStyle} placeholder="Modelo / versão" value={f.model} onChange={e=>setF({...f,model:e.target.value})} required/><input style={fieldStyle} placeholder="IMEI / serial" value={f.imei} onChange={e=>setF({...f,imei:e.target.value})}/><input style={fieldStyle} placeholder="Capacidade (GB)" value={f.capacity} onChange={e=>setF({...f,capacity:e.target.value})}/><input style={fieldStyle} placeholder="Saúde da bateria (%)" type="number" min="0" max="100" value={f.battery} onChange={e=>setF({...f,battery:e.target.value})}/><input style={fieldStyle} placeholder="Custo de aquisição" type="number" min="0" step="0.01" value={f.cost} onChange={e=>setF({...f,cost:e.target.value})}/><input style={fieldStyle} placeholder="Preço de revenda" type="number" min="0" step="0.01" value={f.price} onChange={e=>setF({...f,price:e.target.value})}/><select style={fieldStyle} value={f.condition} onChange={e=>setF({...f,condition:e.target.value})}><option>Excelente</option><option>Bom</option><option>Regular</option><option>Com detalhes</option></select><input style={fieldStyle} placeholder="Garantia de troca" value={f.warranty} onChange={e=>setF({...f,warranty:e.target.value})}/><input style={fieldStyle} placeholder="Quem vendeu / procedência" value={f.seller} onChange={e=>setF({...f,seller:e.target.value})}/><input style={fieldStyle} placeholder="Observações" value={f.notes} onChange={e=>setF({...f,notes:e.target.value})}/><label style={{...fieldStyle,display:'block'}}>Foto do aparelho<input type="file" accept="image/*" onChange={handlePhoto} style={{display:'block',marginTop:8}}/>{f.photo&&<img src={f.photo} alt="Prévia do aparelho" style={{width:120,height:100,objectFit:'cover',marginTop:8,borderRadius:8}}/>}</label></div><button className="primary-btn"><Plus size={16}/> Cadastrar aparelho</button></form>}<div className="panel" style={{marginTop:14,background:'#0a0a0d',border:'1px solid #18181b'}}><div className="table-wrap"><table><thead><tr><th>APARELHO / IMEI</th><th>BATERIA</th><th>ESTADO</th><th>CUSTO</th><th>REVENDA</th><th>MARGEM BRUTA</th><th>GARANTIA / PROCEDÊNCIA</th><th>AÇÃO</th></tr></thead><tbody>{devices.map(d=><tr key={d.id}><td>{d.photo&&<img src={d.photo} alt={d.model} style={{width:64,height:64,objectFit:'cover',borderRadius:8,display:'block',marginBottom:6}}/>}<strong>{d.brand ? `${d.brand} ` : ''}{d.model}</strong><br/><small>{d.imei||'IMEI não informado'} · {d.capacity} GB</small></td><td>{d.battery?`${d.battery}%`:'—'}</td><td>{d.condition}</td><td>{moneyBR(d.cost)}</td><td>{moneyBR(d.price)}</td><td style={{color:val(d.price)-val(d.cost)>=0?'#25D366':'#ef4444'}}>{moneyBR(val(d.price)-val(d.cost))}</td><td>{d.warranty}<br/><small>{d.seller||'Procedência não informada'}</small></td><td><button className="secondary-btn" onClick={()=>setDevices(ds=>ds.filter(x=>x.id!==d.id))}>Excluir</button></td></tr>)}</tbody></table>{!devices.length&&<div className="empty-state"><Smartphone/><strong>Nenhum aparelho usado cadastrado</strong></div>}</div></div></div>;
}

function ReportsPage({orders,cashRegister,inventory}) {
 const today = new Date();
 const localDate = (date) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
 const [startDate,setStartDate] = useState(() => localDate(today));
 const [endDate,setEndDate] = useState(() => localDate(today));
 const [periodDays,setPeriodDays] = useState('');
 const applyDays = (raw) => {
   const days = Math.max(1, Math.min(36500, Math.floor(Number(raw)||1)));
   const end = new Date(); const start = new Date(); start.setDate(start.getDate()-(days-1));
   setStartDate(localDate(start)); setEndDate(localDate(end)); setPeriodDays(String(days));
 };
 const moneyValue = (value) => Number(String(value ?? '').replace(/[^0-9,.-]/g,'').replace(',','.')) || 0;
 // Junta lançamentos da sessão atual e dos fechamentos anteriores sem duplicar IDs.
 const allEntries = [...(cashRegister?.entries || []), ...(cashRegister?.closedSessions || []).flatMap(s => s.entries || [])];
 const uniqueEntries = Array.from(new Map(allEntries.map((entry,index) => [entry.id || `${entry.createdAt || 'sem-data'}-${entry.description || ''}-${entry.amount || 0}-${index}`,entry])).values());
 const from = startDate ? new Date(`${startDate}T00:00:00`) : null;
 const through = endDate ? new Date(`${endDate}T23:59:59.999`) : null;
 const inRange = (dateValue) => { if(!dateValue) return false; const d = new Date(dateValue); return !Number.isNaN(d.getTime()) && (!from || d >= from) && (!through || d <= through); };
 const entries = uniqueEntries.filter(e => inRange(e.createdAt));
 const incomeEntries = entries.filter(e => e.type === 'in');
 const expenseEntries = entries.filter(e => e.type === 'out');
 const received = incomeEntries.reduce((sum,e)=>sum+Number(e.amount||0),0);
 const cashReceived = incomeEntries.filter(e => (e.paymentMethod || 'Dinheiro') === 'Dinheiro').reduce((sum,e)=>sum+Number(e.amount||0),0);
 const digitalReceived = received-cashReceived;
 const expenses = expenseEntries.reduce((sum,e)=>sum+Number(e.amount||0),0);
 const osReceived = incomeEntries.filter(e=>e.sourceType==='os_payment').reduce((sum,e)=>sum+Number(e.amount||0),0);
 const productSales = incomeEntries.filter(e=>e.sourceType==='sale').reduce((sum,e)=>sum+Number(e.amount||0),0);
 const manualIncome = incomeEntries.filter(e=>!['os_payment','sale'].includes(e.sourceType)).reduce((sum,e)=>sum+Number(e.amount||0),0);
 const outstanding = orders.reduce((sum,o)=>sum+Math.max(0,moneyValue(o.amount)-Number(o.paidAmount||0)),0);
 const net = received-expenses;
 const bars=[{label:'Total recebido no período',value:received,color:'#25D366'},{label:'Despesas registradas',value:expenses,color:'#f59e0b'},{label:'Resultado de caixa no período',value:net,color:'#60a5fa'}];
 const setPreset = (preset) => {
   const end = new Date(); let start = new Date();
   if(preset==='today') start = new Date();
   else if(preset==='yesterday'){ start.setDate(start.getDate()-1); end.setDate(end.getDate()-1); }
   else if(preset==='month') start = new Date(end.getFullYear(),end.getMonth(),1);
   setStartDate(localDate(start)); setEndDate(localDate(end)); setPeriodDays('');
 };
 return <div className="page-content"><ModuleHeading eyebrow="BUSINESS INTELLIGENCE" title={<>Relatórios & <span>Indicadores.</span></>} description="Consulte recebimentos reais, vendas, pagamentos de OS e despesas por qualquer período."/>
 <section className="panel" style={{padding:18,marginTop:14,background:'#0a0a0d',border:'1px solid #18181b'}}>
  <h3 style={{marginTop:0}}>Período do relatório</h3>
  <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:14}}>
   <button type="button" className="secondary-btn" onClick={()=>setPreset('today')}>Hoje</button>
   <button type="button" className="secondary-btn" onClick={()=>setPreset('yesterday')}>Ontem</button>
   <button type="button" className="secondary-btn" onClick={()=>setPreset('month')}>Este mês</button>
   <div style={{display:'flex',gap:6,alignItems:'center'}}><input aria-label="Quantidade de dias" type="number" min="1" max="36500" value={periodDays} onChange={e=>setPeriodDays(e.target.value)} placeholder="Ex.: 8, 60, 365" style={{...fieldStyle,width:145}}/><button type="button" className="secondary-btn" onClick={()=>applyDays(periodDays)}>Aplicar dias</button></div>
  </div>
  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:12}}><label>Data inicial<input type="date" value={startDate} onChange={e=>{setStartDate(e.target.value);setPeriodDays('');}} style={{...fieldStyle,display:'block',width:'100%',marginTop:6}}/></label><label>Data final<input type="date" value={endDate} min={startDate||undefined} onChange={e=>{setEndDate(e.target.value);setPeriodDays('');}} style={{...fieldStyle,display:'block',width:'100%',marginTop:6}}/></label></div>
  {startDate && endDate && startDate>endDate && <p style={{color:'#ff7777',marginBottom:0}}>A data inicial precisa ser anterior ou igual à data final.</p>}
 </section>
 <div className="metrics-grid" style={{gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',marginTop:16}}>{[{l:'Total recebido no período',v:moneyBR(received)},{l:'Recebido em dinheiro',v:moneyBR(cashReceived)},{l:'Pix/cartão/outros',v:moneyBR(digitalReceived)},{l:'Pagamentos de OS recebidos',v:moneyBR(osReceived)},{l:'Vendas de produtos',v:moneyBR(productSales)},{l:'Entradas manuais',v:moneyBR(manualIncome)},{l:'Despesas no período',v:moneyBR(expenses)},{l:'Resultado do período',v:moneyBR(net)},{l:'A receber nas OS',v:moneyBR(outstanding)},{l:'Acessórios cadastrados',v:String(inventory.length)}].map(x=><div key={x.l} className="metric-card" style={{background:'#0a0a0d',border:'1px solid #18181b'}}><div className="metric-value" style={{fontSize:22}}>{x.v}</div><div className="metric-label">{x.l}</div></div>)}</div>
 <section className="panel" style={{padding:18,marginTop:16,background:'#0a0a0d',border:'1px solid #18181b'}}><h3>Movimentações incluídas no período</h3><p className="muted">O relatório considera a data do lançamento/recebimento, não a data de criação da OS. OS ainda não pagas não entram como dinheiro recebido; o saldo pendente aparece em “A receber nas OS”.</p><div className="table-wrap"><table><thead><tr><th>DATA</th><th>DESCRIÇÃO</th><th>FORMA</th><th>TIPO</th><th>VALOR</th></tr></thead><tbody>{entries.slice().sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0)).map(e=><tr key={e.id}><td>{e.createdAt?new Date(e.createdAt).toLocaleString('pt-BR'):'—'}</td><td>{e.description||'—'}</td><td>{e.paymentMethod||'Dinheiro'}</td><td>{e.type==='in'?'Entrada':'Saída'}</td><td style={{color:e.type==='in'?'#25D366':'#ff7777'}}>{e.type==='in'?'+':'−'} {moneyBR(e.amount)}</td></tr>)}</tbody></table>{!entries.length&&<div className="empty-state"><Wallet size={26}/><strong>Nenhuma movimentação neste período</strong><span>Quando houver pagamentos, vendas ou despesas registradas, eles aparecerão aqui.</span></div>}</div><div style={{marginTop:14}}><button className="secondary-btn" onClick={()=>window.print()}><Printer size={15}/> Imprimir relatório</button></div></section>
 <section className="panel" style={{padding:18,marginTop:16,background:'#0a0a0d',border:'1px solid #18181b'}}><h3>Resumo visual</h3>{bars.map(b=><div key={b.label} style={{margin:'18px 0'}}><div style={{display:'flex',justifyContent:'space-between',gap:10,marginBottom:6}}><span>{b.label}</span><strong>{moneyBR(b.value)}</strong></div><div style={{height:10,background:'#222',borderRadius:8,overflow:'hidden'}}><div style={{height:'100%',width:`${Math.min(100,Math.max(0,received?Math.abs(b.value)/Math.max(received,expenses,1)*100:0))}%`,background:b.color,borderRadius:8}}/></div></div>)}<p className="muted">Atenção: este relatório usa os lançamentos disponíveis no caixa deste navegador/conta. Para sincronização confiável entre dispositivos e isolamento por assistência, os lançamentos precisam estar persistidos no Supabase com organização e permissões verificadas no banco.</p></section></div>;
}

function CashCalculator() {
 const [display,setDisplay]=useState('0'); const [stored,setStored]=useState(null); const [op,setOp]=useState(null); const [fresh,setFresh]=useState(false);
 const input=v=>{if(fresh){setDisplay(v==='.'?'0.':v);setFresh(false);}else setDisplay(d=>d==='0'&&v!=='.'?v:d+v);};
 const choose=o=>{setStored(Number(display.replace(',','.'))||0);setOp(o);setFresh(true);};
 const equal=()=>{if(op===null||stored===null)return;const b=Number(display.replace(',','.'))||0;let r=op==='+'?stored+b:op==='−'?stored-b:op==='×'?stored*b:op==='÷'?(b===0?NaN:stored/b):op==='% '?stored*b/100:stored;setDisplay(Number.isFinite(r)?String(Math.round(r*10000)/10000):'Erro');setStored(null);setOp(null);setFresh(true);};
 const btns=['7','8','9','÷','4','5','6','×','1','2','3','−','0','.','C','+','%','⌫','='];
 const press=b=>{if(b==='C'){setDisplay('0');setStored(null);setOp(null);setFresh(false);}else if(b==='⌫'){setDisplay(d=>d.length>1?d.slice(0,-1):'0');}else if(['+','−','×','÷'].includes(b))choose(b);else if(b==='%'){setDisplay(String((Number(display)||0)/100));setFresh(true);}else if(b==='=')equal();else input(b);};
 return <section className="panel" style={{marginTop:18,padding:18,background:'#0a0a0d',border:'1px solid #18181b',maxWidth:520}}><div className="panel-heading"><div><h3><Gauge size={17} style={{verticalAlign:'middle'}}/> Calculadora do Caixa</h3><p>Operações, porcentagem, descontos e totais durante a venda.</p></div></div><div style={{background:'#030303',border:'1px solid #292929',padding:18,borderRadius:10,textAlign:'right',fontSize:30,fontWeight:800,fontFamily:'monospace',overflow:'hidden'}}>{display}</div><div style={{display:'grid',gridTemplateColumns:'repeat(4,minmax(48px,1fr))',gap:8,marginTop:10}}>{btns.map(b=><button key={b} className={b==='='?'primary-btn':'secondary-btn'} onClick={()=>press(b)} style={{minHeight:44,fontSize:17,gridColumn:b==='='?'span 2':undefined}}>{b}</button>)}</div></section>;
}

function PostSalePage({storeName,whatsapp}) {
 const [items,setItems]=useLocalRecords('rt_post_sale_v1'); const [f,setF]=useState({customer:'',phone:'',purchase:'',amount:'',payment:'Confirmado'}); const [rating,setRating]=useState({});
 const add=e=>{e.preventDefault();setItems(p=>[{...f,id:String(Date.now()),status:'Aguardando avaliação',createdAt:new Date().toISOString(),rating:0,comment:''},...p]);setF({customer:'',phone:'',purchase:'',amount:'',payment:'Confirmado'});};
 const send=x=>{const msg=encodeURIComponent(`Olá ${x.customer}! Obrigado por comprar na ${storeName}. Sua compra de ${x.purchase} (${moneyBR(x.amount)}) foi registrada. Avalie sua experiência neste link: ${window.location.origin}/avaliar/${x.id}`);window.open(`https://wa.me/${(x.phone||whatsapp||'').replace(/\D/g,'')}?text=${msg}`,'_blank');setItems(ps=>ps.map(i=>i.id===x.id?{...i,status:'Convite enviado'}:i));};
 const saveReview=(id)=>{const r=rating[id]||{};setItems(ps=>ps.map(i=>i.id===id?{...i,rating:Number(r.stars)||5,comment:r.comment||'',status:'Avaliação registrada'}:i));};
 const sendFollowup=(x,days)=>{const msg=encodeURIComponent(`Olá ${x.customer}! Aqui é da ${storeName}. Estamos entrando em contato ${days} dias após seu atendimento referente a ${x.purchase}. Está tudo funcionando bem? Se precisar de ajuda, estamos à disposição.`);window.open(`https://wa.me/${String(x.phone||whatsapp||'').replace(/\D/g,'')}?text=${msg}`,'_blank');};
 return <div className="page-content"><ModuleHeading eyebrow="RELACIONAMENTO COM CLIENTES" title={<>Chat de <span>Pós-Venda.</span></>} description="As OS marcadas como Entregue entram automaticamente nesta fila. Envie o convite pelo WhatsApp e acompanhe as avaliações recebidas."/><form className="panel" onSubmit={add} style={{padding:18,background:'#0a0a0d',border:'1px solid #18181b'}}><h3>Registrar compra paga (vendas fora da OS)</h3><div style={formGrid}><input style={fieldStyle} placeholder="Nome do cliente" value={f.customer} onChange={e=>setF({...f,customer:e.target.value})} required/><input style={fieldStyle} placeholder="WhatsApp do cliente" value={f.phone} onChange={e=>setF({...f,phone:e.target.value})} required/><input style={fieldStyle} placeholder="Produto / aparelho comprado" value={f.purchase} onChange={e=>setF({...f,purchase:e.target.value})} required/><input style={fieldStyle} type="number" min="0" step="0.01" placeholder="Valor pago" value={f.amount} onChange={e=>setF({...f,amount:e.target.value})} required/><select style={fieldStyle} value={f.payment} onChange={e=>setF({...f,payment:e.target.value})}><option>Confirmado</option><option>Pix confirmado</option><option>Cartão confirmado</option><option>Dinheiro confirmado</option></select></div><button className="primary-btn"><CheckCircle2 size={16}/> Registrar compra confirmada</button></form><div className="panel" style={{marginTop:16,background:'#0a0a0d',border:'1px solid #18181b'}}><div className="table-wrap"><table><thead><tr><th>CLIENTE / COMPRA</th><th>VALOR</th><th>STATUS</th><th>AVALIAÇÃO</th><th>AÇÕES</th></tr></thead><tbody>{items.map(x=><tr key={x.id}><td><strong>{x.customer}</strong><br/>{x.purchase}<br/><small>{x.phone}</small></td><td>{moneyBR(x.amount)}</td><td>{x.status}<div style={{marginTop:6,display:'flex',gap:4,flexWrap:'wrap'}}>{[30,60,90].map(days=><button key={days} type="button" className="secondary-btn" style={{fontSize:10,padding:'4px 6px'}} onClick={()=>sendFollowup(x,days)}>Contato {days}d</button>)}</div></td><td>{x.rating?`${x.rating}/5 estrelas — ${x.comment||'Sem comentário'}`:<div style={{minWidth:180}}><select style={fieldStyle} value={rating[x.id]?.stars||'5'} onChange={e=>setRating(r=>({...r,[x.id]:{...r[x.id],stars:e.target.value}}))}><option value="5">5 estrelas</option><option value="4">4 estrelas</option><option value="3">3 estrelas</option><option value="2">2 estrelas</option><option value="1">1 estrela</option></select><input style={{...fieldStyle,marginTop:5}} placeholder="Comentário do cliente" value={rating[x.id]?.comment||''} onChange={e=>setRating(r=>({...r,[x.id]:{...r[x.id],comment:e.target.value}}))}/><button className="secondary-btn" style={{marginTop:5}} onClick={()=>saveReview(x.id)}>Salvar avaliação</button></div>}</td><td><button className="primary-btn" onClick={()=>send(x)}><MessageCircle size={14}/> Enviar WhatsApp</button><button className="secondary-btn" style={{marginLeft:5}} onClick={()=>setItems(ps=>ps.filter(i=>i.id!==x.id))}>Excluir</button></td></tr>)}</tbody></table>{!items.length&&<div className="empty-state"><HeartHandshake/><strong>Nenhuma compra no pós-venda</strong></div>}</div></div><p className="muted">As OS marcadas como Entregue entram automaticamente na fila. Os contatos de 30, 60 e 90 dias são preparados para envio manual pelo WhatsApp nesta versão. Para o cliente registrar estrelas e comentário e isso aparecer automaticamente aqui, precisamos publicar uma página pública de avaliação conectada ao Supabase e integrar o envio pela API oficial do WhatsApp; o link demonstrativo atual ainda não recebe avaliações.</p></div>;
}

export default App;