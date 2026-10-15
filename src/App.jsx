/* COMPONENTE EXCLUSIVO DO MODO TV / PAINEL DE CLIENTES NA SALA DE ESPERA (CORRIGIDO PARA MODO RETRATO E PAISAGEM) */
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
      {/* CABEÇALHO DO MODO TV COM SUPORTE TOTAL A RETRATO E PAISAGEM */}
      <header style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid #1f1f28'
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

        {/* BOTÕES DE AÇÃO: SEMPRE VISÍVEIS TANTO NO PC QUANTO NO CELULAR/TABLET VERTICAL */}
        <div style={{display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginLeft: 'auto'}}>
          <div style={{
            fontSize: '18px', fontWeight: 800, fontFamily: 'monospace', color: '#fff',
            background: '#101015', padding: '6px 12px', borderRadius: '8px', border: '1px solid #222'
          }}>
            {time}
          </div>
          
          <button
            type="button"
            onClick={toggleFullscreen}
            style={{
              background: '#1a1a24', color: '#fff', border: '1px solid #333',
              padding: '8px 12px', borderRadius: '8px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px'
            }}
            title="Alternar Tela Cheia"
          >
            {isFullscreen ? <Minimize2 size={16}/> : <Maximize2 size={16}/>}
          </button>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#ef4444', color: '#fff', border: 'none',
              padding: '8px 14px', borderRadius: '8px', fontWeight: 'bold',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '13px', zIndex: 10
            }}
          >
            <X size={16}/> Voltar / Fechar
          </button>
        </div>
      </header>

      {/* GRADE QUE SE ADAPTA: 2 COLUNAS NA HORIZONTAL/PC E 1 COLUNA EMPILHADA NA VERTICAL */}
      <div style={{
        flex: 1, display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '16px', marginTop: '16px', overflow: 'visible'
      }}>
        
        {/* COLUNA 1: EM MANUTENÇÃO / BANCADA */}
        <section style={{
          background: '#0a0a0f', border: '1px solid #222', borderRadius: '16px',
          display: 'flex', flexDirection: 'column', minHeight: '300px', overflow: 'hidden'
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
              <div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', flexDirection: 'column', gap: '6px', padding: '30px 0'}}>
                <Wrench size={28} color="#333" />
                <span style={{fontSize: '13px'}}>Nenhum serviço em manutenção no momento</span>
              </div>
            )}
          </div>
        </section>

        {/* COLUNA 2: PRONTOS PARA RETIRADA */}
        <section style={{
          background: '#0a0a0f', border: '1px solid #182c1e', borderRadius: '16px',
          display: 'flex', flexDirection: 'column', minHeight: '300px', overflow: 'hidden'
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
              <div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', flexDirection: 'column', gap: '6px', padding: '30px 0'}}>
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