import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity, ArrowUpRight, Bell, Camera, Check, ChevronDown, CircleHelp,
  ClipboardList, Clock3, CreditCard, Gauge, LogOut, Menu, MessageCircle,
  Plus, RefreshCw, Search, Settings, ShieldCheck, Smartphone, Sparkles, Store, Users, Wrench, X, Upload, PhoneCall, QrCode, Package, Sliders, Trash2, CheckSquare, Printer, Star, DollarSign, Send, Calendar, Clock, Lock, UserPlus, AlertTriangle, History, Wallet, MapPin, Copy, FileText, HeartHandshake, Key, CheckCircle2, XCircle, Eraser, ShoppingCart, Truck, UserCheck, CheckCircle, Tv, Maximize2, Minimize2, Calculator
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
  const streamRef = useRef(null);

  useEffect(() => {
    let active = true;
    let detector = null;

    if ('BarcodeDetector' in window) {
      try {
        detector = new window.BarcodeDetector({
          formats: ['ean_13', 'ean_8', 'code_128', 'code_39', 'qr_code', 'upc_a', 'upc_e']
        });
      } catch (err) {
        detector = null;
      }
    }

    navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'environment' } })
      .then(stream => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }

        const scanLoop = async () => {
          if (!active) return;
          if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
            if (detector) {
              try {
                const barcodes = await detector.detect(videoRef.current);
                if (barcodes.length > 0) {
                  onDetected(barcodes[0].rawValue);
                  return;
                }
              } catch (e) {
                // skip frame
              }
            }
          }
          requestAnimationFrame(scanLoop);
        };

        requestAnimationFrame(scanLoop);
      })
      .catch(err => {
        setErrorMsg('Não foi possível abrir a câmera. Conecte o leitor físico USB ou digite o código.');
      });

    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [onDetected]);

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
          <div style={{position: 'relative', width: '100%', height: '260px', overflow: 'hidden', borderRadius: '10px', background: '#000', margin: '15px 0'}}>
            <video ref={videoRef} playsInline muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
            <div style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              width: '80%', height: '100px', border: '2px solid #25D366', borderRadius: '8px',
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.45)', pointerEvents: 'none'
            }}>
              <div style={{position: 'absolute', top: '50%', width: '100%', height: '2px', background: '#ef4444', opacity: 0.8, boxShadow: '0 0 8px #ef4444'}} />
            </div>
          </div>
        )}

        <p className="muted" style={{fontSize: '12px', margin: '8px 0'}}>
          Aponte a câmera para o código de barras ou bipa diretamente com o leitor USB na bancada.
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

      <div style={{
        flex: 1, display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
        gap: '16px', marginTop: '16px', overflow: 'visible'
      }}>
        
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

/* MODAL DA CALCULADORA INTELIGENTE DO CAIXA */
function CalculatorModal({ onUseValue, onClose }) {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');

  const handleNum = (num) => {
    setDisplay(prev => prev === '0' ? String(num) : prev + num);
  };

  const handleOp = (op) => {
    setEquation(display + ' ' + op + ' ');
    setDisplay('0');
  };

  const handleClear = () => {
    setDisplay('0');
    setEquation('');
  };

  const handlePercent = () => {
    try {
      const val = parseFloat(display) / 100;
      setDisplay(String(val));
    } catch {
      setDisplay('Erro');
    }
  };

  const handleCalculate = () => {
    try {
      const fullExpr = equation + display;
      const sanitized = fullExpr.replace(/x/g, '*').replace(/÷/g, '/');
      const result = eval(sanitized);
      setDisplay(String(Number(result.toFixed(2))));
      setEquation('');
    } catch {
      setDisplay('Erro');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{zIndex: 99999}}>
      <div className="modal" onClick={e=>e.stopPropagation()} style={{background: '#0e0e12', border: '1px solid #333', maxWidth: '320px', padding: '20px'}}>
        <div className="modal-head" style={{marginBottom: '12px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            <Calculator size={20} color="#25D366"/>
            <h2 style={{fontSize: '16px', margin: 0}}>Calculadora do Caixa</h2>
          </div>
          <button type="button" className="icon-btn" onClick={onClose}><X size={18}/></button>
        </div>

        <div style={{
          background: '#050508', border: '1px solid #222', borderRadius: '8px',
          padding: '12px 16px', textAlign: 'right', marginBottom: '14px'
        }}>
          <div style={{fontSize: '11px', color: '#666', minHeight: '16px', fontFamily: 'monospace'}}>{equation}</div>
          <div style={{fontSize: '26px', fontWeight: 'bold', color: '#25D366', fontFamily: 'monospace', overflowX: 'auto'}}>{display}</div>
        </div>

        <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px'}}>
          <button type="button" className="secondary-btn" onClick={handleClear} style={{background: '#1f1f2e', color: '#ef4444'}}>C</button>
          <button type="button" className="secondary-btn" onClick={handlePercent} style={{background: '#1f1f2e', color: '#38bdf8'}}>%</button>
          <button type="button" className="secondary-btn" onClick={() => setDisplay(prev => prev.startsWith('-') ? prev.slice(1) : '-' + prev)} style={{background: '#1f1f2e'}}>±</button>
          <button type="button" className="secondary-btn" onClick={() => setOperation(handleOp('÷'))} style={{background: '#181824', color: '#25D366'}} onClick={() => handleOp('÷')}>÷</button>

          <button type="button" className="secondary-btn" onClick={() => handleNum(7)} style={{background: '#14141c'}}>7</button>
          <button type="button" className="secondary-btn" onClick={() => handleNum(8)} style={{background: '#14141c'}}>8</button>
          <button type="button" className="secondary-btn" onClick={() => handleNum(9)} style={{background: '#14141c'}}>9</button>
          <button type="button" className="secondary-btn" onClick={() => handleOp('x')} style={{background: '#181824', color: '#25D366'}}>×</button>

          <button type="button" className="secondary-btn" onClick={() => handleNum(4)} style={{background: '#14141c'}}>4</button>
          <button type="button" className="secondary-btn" onClick={() => handleNum(5)} style={{background: '#14141c'}}>5</button>
          <button type="button" className="secondary-btn" onClick={() => handleNum(6)} style={{background: '#14141c'}}>6</button>
          <button type="button" className="secondary-btn" onClick={() => handleOp('-')} style={{background: '#181824', color: '#25D366'}}>-</button>

          <button type="button" className="secondary-btn" onClick={() => handleNum(1)} style={{background: '#14141c'}}>1</button>
          <button type="button" className="secondary-btn" onClick={() => handleNum(2)} style={{background: '#14141c'}}>2</button>
          <button type="button" className="secondary-btn" onClick={() => handleNum(3)} style={{background: '#14141c'}}>3</button>
          <button type="button" className="secondary-btn" onClick={() => handleOp('+')} style={{background: '#181824', color: '#25D366'}}>+</button>

          <button type="button" className="secondary-btn" onClick={() => handleNum(0)} style={{gridColumn: 'span 2', background: '#14141c'}}>0</button>
          <button type="button" className="secondary-btn" onClick={() => !display.includes('.') && setDisplay(prev => prev + '.')} style={{background: '#14141c'}}>.</button>
          <button type="button" className="primary-btn" onClick={handleCalculate} style={{background: '#25D366', color: '#000', fontWeight: 'bold'}}>=</button>
        </div>

        <button
          type="button"
          onClick={() => {
            const val = parseFloat(display);
            if (!isNaN(val)) {
              onUseValue(val.toFixed(2));
              onClose();
            }
          }}
          className="primary-btn full-btn"
          style={{marginTop: '12px', background: '#3b82f6', color: '#fff', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'}}
        >
          <Check size={16}/> Usar Valor Calculado (R$ {display})
        </button>
      </div>
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
  const [techCommissionRate, setTechCommissionRate] = useState(10);

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
  const [cashRegister, setCashRegister] = useState({
    isOpen: true,
    openingBalance: 0.00,
    entries: []
  });

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
  const [inventory, setInventory] = useState([]);

  const [allStores, setAllStores] = useState([
    { id: '1', name: 'RT MOBILE', phone: '5591989117332', status: 'active', desc: 'Especialista Apple, Xiaomi & Multimarcas', address: 'Santa Izabel do Pará - PA', rating: 5.0, reviewsCount: 1 }
  ]);

  const activeStores = useMemo(() => allStores.filter(s => s.status === 'active'), [allStores]);

  const [search, setSearch] = useState('');
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [showNewProduct, setShowNewProduct] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showChecklistModal, setShowChecklistModal] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(null);
  const [showQuoteModal, setShowQuoteModal] = useState(null);
  const [showCashTransactionModal, setShowCashTransactionModal] = useState(false);
  const [showInviteMemberModal, setShowInviteMemberModal] = useState(false);

  // Modais de Leitura de Código de Barras
  const [showBarcodeScannerForProduct, setShowBarcodeScannerForProduct] = useState(false);
  const [showBarcodeSaleModal, setShowBarcodeSaleModal] = useState(false);
  
  // Estado para exibir o modal da calculadora
  const [showCalculatorModal, setShowCalculatorModal] = useState(false);
  
  const [toast, setToast] = useState('');
  const [mobileNav, setMobileNav] = useState(false);
  const [session, setSession] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
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

  const [cashTx, setCashTx] = useState({ type: 'in', description: '', amount: '' });
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
    if (modules.inventory) list.push({ id: 'inventory', label: 'Estoque de Acessórios', icon: Package });
    if (modules.iphones) list.push({ id: 'store', label: 'Comprar & Upgrade', icon: Smartphone });
    if (modules.finance && userAccessLevel === 'owner') list.push({ id: 'finance', label: 'Financeiro & Comissões', icon: DollarSign });
    list.push({ id: 'payments', label: 'Pagamentos & Pix', icon: CreditCard });
    list.push({ id: 'settings', label: 'Configurações', icon: Settings });
    return list;
  }, [modules, userAccessLevel]);

  const navClient = useMemo(() => {
    const list = [{ id: 'stores_directory', label: 'Buscar Lojas Ativas', icon: Store }];
    if (modules.iphones) list.push({ id: 'store', label: 'Vitrine de Aparelhos', icon: Smartphone });
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

  const fetchData = async () => {
    if (!supabaseConfigured || !session) return;
    const userEmail = session.user?.email?.toLowerCase();
    const isOwnerByEmail = userEmail === ADMIN_EMAIL.toLowerCase();

    const userCreatedAt = session.user?.created_at ? new Date(session.user.created_at) : new Date();
    const now = new Date();
    const hoursElapsed = Math.floor((now - userCreatedAt) / (1000 * 60 * 60));
    const hoursRemaining = Math.max(0, 48 - hoursElapsed);
    setTrialTimeLeft(hoursRemaining);

    let { data: orgData } = await supabase.from('organizations')
      .select('*')
      .eq('owner_user_id', session.user.id)
      .limit(1);

    if ((!orgData || orgData.length === 0) && userRole === 'tech' && !isOwnerByEmail) {
      const defaultName = `Loja ${session.user.email.split('@')[0].toUpperCase()}`;
      const { data: createdOrg } = await supabase.from('organizations').insert({
        owner_user_id: session.user.id,
        Nome: defaultName,
        WhatsApp: '5591989117332',
        pix_key: '91989117332',
        access_state: 'Teste',
        plan_status: 'Teste',
        plan_name: 'Teste 48h'
      }).select();
      if (createdOrg) orgData = createdOrg;
    }

    const org = orgData?.[0];

    if (org || isOwnerByEmail) {
      if (org?.Nome) setStoreName(org.Nome);
      if (org?.WhatsApp) setWhatsappNumber(org.WhatsApp);
      if (org?.pix_key) setPixKey(org.pix_key);

      const isVitalicio = isOwnerByEmail || org?.plan_name === 'Vitalício';
      const isPaidActive = org?.access_state === 'Ativo' || org?.plan_status === 'Ativo';

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
        { id: session.user.id, name: isOwnerByEmail ? 'Robert Haelley (Proprietário)' : (org?.Nome || 'Responsável'), email: session.user.email, role: 'owner', status: 'Ativo' }
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

    const { data: oData } = await supabase.from('repair_orders')
      .select('id, order_number, customer_name, customer_phone, device_brand, device_model, issue_description, status, total_amount, created_at')
      .order('created_at', { ascending: false }).limit(50);
    if (oData) {
      setOrders(oData.map((o) => ({
        rawId: o.id,
        id: o.order_number || `OS-${String(o.id).slice(0, 6)}`,
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
      })));
    }

    const { data: cData } = await supabase.from('customers').select('id, name, phone, email, created_at').order('name', { ascending: true });
    if (cData) setCustomers(cData);
  };

  useEffect(() => { fetchData(); }, [session]);

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
        const { data: memberships } = await supabase.from('organization_members').select('organization_id').eq('user_id', session.user.id).limit(1);
        const orgId = memberships?.[0]?.organization_id;
        const { error } = await supabase.from('repair_orders').insert({
          organization_id: orgId || null,
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
        const { data: memberships } = await supabase.from('organization_members').select('organization_id').eq('user_id', session.user.id).limit(1);
        const orgId = memberships?.[0]?.organization_id;
        const { error } = await supabase.from('customers').insert({
          organization_id: orgId || null,
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
    setInventory(prev => prev.filter(p => p.id !== id));
    notify('Produto removido.');
  };

  const handleSellProductByBarcode = (scannedCode) => {
    const code = String(scannedCode).trim();
    if (!code) {
      notify('Código inválido.');
      return;
    }

    const found = inventory.find(p => p.barcode && p.barcode.trim() === code);
    if (!found) {
      notify(`Nenhum produto cadastrado com o código ${code}.`);
      return;
    }

    if (found.qty <= 0) {
      notify(`Atenção: ${found.name} está esgotado no estoque!`);
      return;
    }

    updateProductQty(found.id, -1);

    const val = parseFloat(found.price);
    const newEntry = {
      id: String(Date.now()),
      type: 'in',
      description: `Venda Balcão: ${found.name} (Bipado)`,
      amount: val,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      user: userAccessLevel === 'owner' ? 'Dono' : 'Técnico'
    };

    setCashRegister(prev => ({ ...prev, entries: [newEntry, ...prev.entries] }));
    addAuditLog(`Vendeu 1x ${found.name} no caixa via código de barras: R$ ${val.toFixed(2)}`);
    setShowBarcodeSaleModal(false);
    notify(`Venda confirmada: ${found.name} (+ R$ ${val.toFixed(2)}) e estoque atualizado!`);
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
      setOrders(prev => prev.map(o => o.rawId === rawId ? { ...o, status: newStatus, color: statusClass(newStatus) } : o));
      if (targetOrder) addAuditLog(`Alterou status da ${targetOrder.id} para "${newStatus}"`);
      notify(`Status alterado para "${newStatus}".`);
    } catch (err) { notify('Erro ao atualizar status.'); }
  }

  const handleCashTransaction = (e) => {
    e.preventDefault();
    if (!cashTx.description || !cashTx.amount) {
      notify('Preencha a descrição e o valor.'); return;
    }
    const val = parseFloat(cashTx.amount.replace(',', '.'));
    const newEntry = {
      id: String(Date.now()),
      type: cashTx.type,
      description: cashTx.description,
      amount: val,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      user: userAccessLevel === 'owner' ? 'Dono' : 'Técnico'
    };
    setCashRegister(prev => ({ ...prev, entries: [newEntry, ...prev.entries] }));
    addAuditLog(`Registrou ${cashTx.type === 'in' ? 'Entrada' : 'Sangria/Saída'} no caixa da loja: R$ ${val.toFixed(2)} (${cashTx.description})`);
    setShowCashTransactionModal(false);
    setCashTx({ type: 'in', description: '', amount: '' });
    notify('Lançamento registrado no caixa da loja!');
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
    const msg = encodeURIComponent(`📜 *TERMO DE GARANTIA & CONDIÇÕES TÉCNICAS* - ${storeName.toUpperCase()}\n\n` +
      `Ordem de Serviço: *${order.id}*\n` +
      `Aparelho: *${order.device}*\n` +
      `Garantia: *${order.warrantyDays} Dias*\n\n` +
      `⚠️ *CONDIÇÕES LEGAIS DE GARANTIA:*\n` +
      `1. A garantia cobre exclusivamente o serviço realizado e a peça substituída.\n` +
      `2. A garantia será *ANULADA* em casos de: Danos físicos, tela trincada/quebrada, contato com líquidos/umidade, selo de garantia violado ou intervenção por terceiros.\n` +
      `3. Aparelhos não retirados em até 90 dias poderão ser vendidos para custeio de peças.\n\n` +
      `Endereço da Loja: ${storeAddress}\n` +
      `Agradecemos a confiança!`);
    
    const targetPhone = order.phone || whatsappNumber;
    window.open(`https://wa.me/${targetPhone}?text=${msg}`, '_blank');
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
        <div style={{display: 'flex', gap: '8px', marginBottom: '20px', background: '#111', padding: '4px', borderRadius: '8px', border: '1px solid #222'}}>
          <button type="button" className={`secondary-btn ${userRole === 'client' ? 'primary-btn' : ''}`} style={{flex: 1, fontSize: '13px'}} onClick={() => setUserRole('client')}>
            Área do Cliente (Portal)
          </button>
          <button type="button" className={`secondary-btn ${userRole === 'tech' ? 'primary-btn' : ''}`} style={{flex: 1, fontSize: '13px'}} onClick={() => setUserRole('tech')}>
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
              <QrCode size={120} color="#25D366" />
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

      <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`} style={{background: '#0a0a0c', borderRight: '1px solid #18181b'}}>
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
        <nav>{activeNav.map(item => <button key={item.id} className={`nav-item ${active===item.id?'active':''}`} onClick={()=>{setActive(item.id);setMobileNav(false)}}><item.icon size={18}/><span>{item.label}</span>{item.id==='orders' && <span className="nav-count">{orders.length}</span>}{item.id==='customers' && <span className="nav-count">{customers.length}</span>}{item.id==='inventory' && <span className="nav-count">{inventory.length}</span>}</button>)}</nav>
        
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
                <QrCode size={130} color="#25D366" style={{margin: '0 auto 12px', display: 'block'}} />
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
            {active==='orders' && userRole === 'tech' && <OrdersPage orders={filteredOrders} search={search} setSearch={setSearch} onNew={()=>setShowNewOrder(true)} onStatus={handleUpdateStatus} onShare={shareOsStatusWhatsapp} onSendWarranty={sendWarrantyTermWhatsapp} onOpenChecklist={(o) => setShowChecklistModal(o)} onPrint={(o) => setShowPrintModal(o)} onPellicleReminder={sendPellicleReminder} />}
            {active==='customers' && userRole === 'tech' && <CustomersPage customers={customers} onNew={()=>setShowNewCustomer(true)} />}
            {active==='crm' && userRole === 'tech' && <CrmPage customers={customers} storeName={storeName} whatsapp={whatsappNumber} />}
            
            {/* CAIXA COM BOTÃO DE CHAMAR A CALCULADORA */}
            {active==='cash' && userRole === 'tech' && (
              <CashPage 
                cashRegister={cashRegister} 
                onNewTransaction={() => setShowCashTransactionModal(true)} 
                onOpenBarcodeSale={() => setShowBarcodeSaleModal(true)} 
                onOpenCalculator={() => setShowCalculatorModal(true)}
              />
            )}

            {active==='inventory' && userRole === 'tech' && <InventoryPage inventory={inventory} onNew={()=>setShowNewProduct(true)} onUpdateQty={updateProductQty} onDelete={deleteProduct} />}
            {active==='client_inventory' && <ClientInventoryPage inventory={inventory} storeName={storeName} cart={cart} addToCart={addToCart} onOpenCart={() => setShowCartModal(true)} />}
            {active==='stores_directory' && <StoresDirectoryPage stores={activeStores} onSelectStore={(s) => { setStoreName(s.name); setWhatsappNumber(s.phone); notify(`Estabelecimento "${s.name}" selecionado!`); setActive('store'); }} onRequestQuote={(s) => setShowQuoteModal(s)} />}
            {active==='store' && <StorePage whatsapp={whatsappNumber} storeName={storeName} onUpgrade={() => setShowUpgradeModal(true)} />}
            {active==='track' && <TrackPage orders={orders} storeName={storeName} pixKey={pixKey} whatsapp={whatsappNumber} storeAddress={storeAddress} mapsUrl={mapsUrl} setOrders={setOrders} notify={notify} />}
            {active==='finance' && userRole === 'tech' && userAccessLevel === 'owner' && <FinancePage orders={orders} commissionRate={techCommissionRate} setCommissionRate={setTechCommissionRate} />}
            {active==='payments' && userRole === 'tech' && <PaymentsPage pixKey={pixKey} setPixKey={setPixKey} onShowPayModal={() => setShowPaymentModal(true)} />}
            {active==='settings' && userRole === 'tech' && <SettingsPage configured={supabaseConfigured} email={session?.user?.email} storeName={storeName} setStoreName={setStoreName} storeLogo={storeLogo} onLogoUpload={handleLogoUpload} whatsapp={whatsappNumber} setWhatsapp={setWhatsappNumber} pixKey={pixKey} setPixKey={setPixKey} storeAddress={storeAddress} setStoreAddress={setStoreAddress} mapsUrl={mapsUrl} setMapsUrl={setMapsUrl} modules={modules} setModules={setModules} onLogout={logout} teamMembers={teamMembers} onInviteMember={() => setShowInviteMemberModal(true)} auditLogs={auditLogs} userAccessLevel={userAccessLevel} isLifetimeAdmin={isLifetimeAdmin} upgradeAssistantEnabled={upgradeAssistantEnabled} setUpgradeAssistantEnabled={setUpgradeAssistantEnabled} upgradeDiscounts={upgradeDiscounts} setUpgradeDiscounts={setUpgradeDiscounts} />}
            
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

      {/* MODAL DA CALCULADORA DO CAIXA */}
      {showCalculatorModal && (
        <CalculatorModal
          onUseValue={(val) => {
            setCashTx(prev => ({ ...prev, amount: val }));
            setShowCashTransactionModal(true);
            notify(`Valor R$ ${val} aplicado no lançamento do caixa!`);
          }}
          onClose={() => setShowCalculatorModal(false)}
        />
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

      {showBarcodeSaleModal && (
        <BarcodeSaleModal
          inventory={inventory}
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
              <button className="primary-btn full-btn" onClick={()=>{ notify('Vistoria salva com sucesso!'); setShowChecklistModal(null); }}>Salvar Relatório de Vistoria</button>
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
}

export default App;