import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity, ArrowUpRight, Bell, Camera, Check, ChevronDown, CircleHelp,
  ClipboardList, Clock3, CreditCard, Gauge, LogOut, Menu, MessageCircle,
  Plus, RefreshCw, Search, Settings, ShieldCheck, Sparkles, Store, Users, Wrench, X, Upload, PhoneCall, QrCode, Package, Sliders, Trash2, CheckSquare, Printer, Star, DollarSign, Send, Calendar, Clock, Lock, UserPlus, AlertTriangle, History, Wallet, MapPin, Copy, FileText, HeartHandshake, Key, CheckCircle2, XCircle, ShoppingCart, Truck, UserCheck, CheckCircle, Scissors
} from 'lucide-react';
import { supabase, supabaseConfigured } from './lib/supabase';

const ADMIN_EMAIL = 'roberthaelley75@gmail.com';

const servicesList = [
  { name: 'Corte Degradê / Fade', defaultPrice: '35.00', duration: '40 min' },
  { name: 'Corte Social / Clássico', defaultPrice: '30.00', duration: '30 min' },
  { name: 'Barba Completa / Modelada', defaultPrice: '25.00', duration: '30 min' },
  { name: 'Combo Cabelo + Barba', defaultPrice: '55.00', duration: '60 min' },
  { name: 'Barboterapia com Toalha Quente', defaultPrice: '35.00', duration: '40 min' },
  { name: 'Design de Sobrancelha na Navalha', defaultPrice: '15.00', duration: '15 min' },
  { name: 'Pigmentação Cabelo / Barba', defaultPrice: '25.00', duration: '30 min' },
  { name: 'Platinado / Nevou', defaultPrice: '120.00', duration: '120 min' },
  { name: 'Selagem / Alinhamento Capilar', defaultPrice: '80.00', duration: '60 min' },
  { name: 'Pezinho / Acabamento', defaultPrice: '15.00', duration: '15 min' },
];

const adminWhatsapp = '5591989117332';
const adminPixKey = '91989117332';

const statusClass = (status) => ({
  'Em atendimento': 'blue',
  'Aguardando pagamento': 'amber',
  'Agendado': 'violet',
  'Finalizado': 'green',
  'Cancelado': 'neutral',
}[status] || 'neutral');

const appointmentSteps = [
  'Agendado',
  'Em atendimento',
  'Aguardando pagamento',
  'Finalizado'
];

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
          <Scissors size={38} color="#25D366" />
        </div>

        <h1 style={{
          fontSize: '26px', fontWeight: 900, color: '#ffffff', letterSpacing: '6px', margin: 0,
          textShadow: '0 4px 15px rgba(0,0,0,0.8)'
        }}>
          RT BARBER
        </h1>
        <span style={{
          fontSize: '10px', color: '#25D366', letterSpacing: '3px', textTransform: 'uppercase',
          fontWeight: 700, marginTop: '8px'
        }}>
          SISTEMA DE GESTÃO PARA BARBEARIAS
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
  const [showSplash, setShowSplash] = useState(() => !sessionStorage.getItem('rt_barber_splash'));
  const [userRole, setUserRole] = useState(() => localStorage.getItem('rt_barber_role') || 'client');
  const [userAccessLevel, setUserAccessLevel] = useState('owner');
  const [active, setActive] = useState(() => userRole === 'barber' ? 'overview' : 'stores_directory');

  const [modules, setModules] = useState({
    appointments: true,
    services: true,
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

  // Configurações da Barbearia
  const [storeName, setStoreName] = useState('BARBEARIA RT');
  const [storeLogo, setStoreLogo] = useState(null);
  const [whatsappNumber, setWhatsappNumber] = useState('5591989117332');
  const [pixKey, setPixKey] = useState('91989117332');
  const [storeAddress, setStoreAddress] = useState('Santa Izabel do Pará - PA');
  const [mapsUrl, setMapsUrl] = useState('https://maps.google.com');
  const [barberCommissionRate, setBarberCommissionRate] = useState(50); // 50% padrão de barbearia

  // Carrinho de Produtos do Cliente (Pomadas, Shampoos, Cervejas, etc.)
  const [cart, setCart] = useState([]);
  const [showCartModal, setShowCartModal] = useState(false);

  // Caixa da Barbearia
  const [cashRegister, setCashRegister] = useState({
    isOpen: true,
    openingBalance: 0.00,
    entries: []
  });

  // Equipe de Barbeiros
  const [teamMembers, setTeamMembers] = useState([]);

  // Auditoria
  const [auditLogs, setAuditLogs] = useState([]);

  const addAuditLog = (action) => {
    const logUser = userAccessLevel === 'owner' ? 'Dono (Admin)' : 'Barbeiro (Equipe)';
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
  const [inventory, setInventory] = useState([
    { id: '1', name: 'Pomada Modeladora Efeito Matte', category: 'Finalizadores', price: '35.00', qty: 12, photo: null },
    { id: '2', name: 'Óleo para Barba Hidratante 30ml', category: 'Cuidados com a Barba', price: '40.00', qty: 8, photo: null },
    { id: '3', name: 'Balm Modelador de Barba', category: 'Cuidados com a Barba', price: '38.00', qty: 6, photo: null },
    { id: '4', name: 'Shampoo Anticaspa Mentolado', category: 'Cabelo', price: '45.00', qty: 5, photo: null },
    { id: '5', name: 'Cerveja Artesanal Long Neck', category: 'Bebidas & Bar', price: '12.00', qty: 24, photo: null }
  ]);

  const [allStores, setAllStores] = useState([
    { id: '1', name: 'BARBEARIA RT', phone: '5591989117332', status: 'active', desc: 'Cortes Clássicos, Degradê, Barboterapia & Bar', address: 'Santa Izabel do Pará - PA', rating: 5.0, reviewsCount: 38 }
  ]);

  const activeStores = useMemo(() => allStores.filter(s => s.status === 'active'), [allStores]);

  const [search, setSearch] = useState('');
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [showNewProduct, setShowNewProduct] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(null);
  const [showQuoteModal, setShowQuoteModal] = useState(null);
  const [showCashTransactionModal, setShowCashTransactionModal] = useState(false);
  const [showInviteMemberModal, setShowInviteMemberModal] = useState(false);

  const [toast, setToast] = useState('');
  const [mobileNav, setMobileNav] = useState(false);
  const [session, setSession] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [saving, setSaving] = useState(false);

  const [cashTx, setCashTx] = useState({ type: 'in', description: '', amount: '' });
  const [newMember, setNewMember] = useState({ name: '', email: '', role: 'barber' });

  // Novo Agendamento / Comanda
  const [newOrder, setNewOrder] = useState({
    customer: '', service: servicesList[0].name, barberName: 'Qualquer Barbeiro', scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '14:00', phone: '', status: 'Agendado', amount: servicesList[0].defaultPrice, costProduct: '0.00', notes: ''
  });
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '' });
  const [newProduct, setNewProduct] = useState({ name: '', category: 'Finalizadores', price: '', qty: '1', photo: null });

  const isSuperAdmin = useMemo(() => {
    return session?.user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  }, [session]);

  const navBarber = useMemo(() => {
    const list = [{ id: 'overview', label: 'Visão Geral', icon: Gauge }];
    if (modules.appointments) list.push({ id: 'appointments', label: 'Agendamentos & Comandas', icon: Calendar });
    list.push({ id: 'customers', label: 'Clientes', icon: Users });
    if (modules.crm) list.push({ id: 'crm', label: 'Pós-Atendimento & Retorno', icon: HeartHandshake });
    if (modules.cashRegister) list.push({ id: 'cash', label: 'Caixa do Balcão', icon: Wallet });
    if (modules.inventory) list.push({ id: 'inventory', label: 'Estoque de Produtos', icon: Package });
    if (modules.services) list.push({ id: 'services_menu', label: 'Cardápio de Serviços', icon: Scissors });
    if (modules.finance && userAccessLevel === 'owner') list.push({ id: 'finance', label: 'Financeiro & Comissões', icon: DollarSign });
    list.push({ id: 'payments', label: 'Pix & Pagamentos', icon: CreditCard });
    list.push({ id: 'settings', label: 'Configurações', icon: Settings });
    return list;
  }, [modules, userAccessLevel]);

  const navClient = useMemo(() => {
    const list = [{ id: 'stores_directory', label: 'Barbearias Disponíveis', icon: Store }];
    if (modules.services) list.push({ id: 'client_services', label: 'Serviços & Preços', icon: Scissors });
    if (modules.inventory) list.push({ id: 'client_inventory', label: 'Produtos da Barbearia', icon: Package });
    if (modules.appointments) list.push({ id: 'track', label: 'Consultar Agendamento', icon: Search });
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
        localStorage.setItem('rt_barber_role', 'client');
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

    if ((!orgData || orgData.length === 0) && userRole === 'barber' && !isOwnerByEmail) {
      const defaultName = `Barbearia ${session.user.email.split('@')[0].toUpperCase()}`;
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
      .select('*')
      .order('created_at', { ascending: false }).limit(50);
    if (oData) {
      setOrders(oData.map((o) => ({
        rawId: o.id,
        id: o.order_number || `CMD-${String(o.id).slice(0, 5)}`,
        customer: o.customer_name,
        phone: o.customer_phone || '',
        service: o.device_model || 'Corte Degradê',
        barberName: o.device_brand || 'Barbeiro da Casa',
        notes: o.issue_description || '',
        status: o.status === 'Recebido' ? 'Agendado' : (o.status === 'Pronto para retirada' ? 'Aguardando pagamento' : o.status),
        amount: o.total_amount ? `R$ ${Number(o.total_amount).toFixed(2)}` : 'R$ 35.00',
        costProduct: '0.00',
        time: new Date(o.created_at).toLocaleDateString('pt-BR'),
        color: statusClass(o.status)
      })));
    }

    const { data: cData } = await supabase.from('customers').select('*').order('name', { ascending: true });
    if (cData) setCustomers(cData);
  };

  useEffect(() => { fetchData(); }, [session]);

  const filteredOrders = useMemo(() => orders.filter((o) =>
    [o.id, o.customer, o.service, o.barberName, o.status].join(' ').toLowerCase().includes(search.toLowerCase())
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

      localStorage.setItem('rt_barber_role', userRole);

      if (userRole === 'barber') {
        setActive('overview');
      } else {
        setActive('stores_directory');
      }
    } catch (err) { setAuthError(err.message || 'Não foi possível autenticar.'); }
    finally { setSaving(false); }
  }

  async function handleCreateOrder(e) {
    e.preventDefault();
    if (!newOrder.customer.trim() || !newOrder.service.trim()) {
      notify('Preencha o cliente e o serviço.'); return;
    }
    setSaving(true);
    try {
      const generatedId = `CMD-${Math.floor(1000 + Math.random() * 9000)}`;
      if (supabaseConfigured && session) {
        const { data: memberships } = await supabase.from('organization_members').select('organization_id').eq('user_id', session.user.id).limit(1);
        const orgId = memberships?.[0]?.organization_id;
        const { error } = await supabase.from('repair_orders').insert({
          organization_id: orgId || null,
          created_by: session.user.id,
          customer_name: newOrder.customer.trim(),
          customer_phone: newOrder.phone.trim() || null,
          device_brand: newOrder.barberName.trim(),
          device_model: newOrder.service.trim(),
          issue_description: `${newOrder.scheduledDate} às ${newOrder.scheduledTime} - ${newOrder.notes}`,
          status: newOrder.status,
          total_amount: newOrder.amount ? parseFloat(String(newOrder.amount).replace(',', '.')) : 35.00
        });
        if (error) throw error;
        await fetchData();
      } else {
        const localOs = {
          rawId: String(Date.now()),
          id: generatedId,
          customer: newOrder.customer.trim(),
          phone: newOrder.phone.trim(),
          service: newOrder.service.trim(),
          barberName: newOrder.barberName.trim(),
          notes: `${newOrder.scheduledDate} às ${newOrder.scheduledTime} - ${newOrder.notes}`,
          status: newOrder.status,
          amount: newOrder.amount ? `R$ ${parseFloat(String(newOrder.amount).replace(',', '.')).toFixed(2)}` : 'R$ 35.00',
          costProduct: newOrder.costProduct ? parseFloat(String(newOrder.costProduct).replace(',', '.')).toFixed(2) : '0.00',
          time: new Date().toLocaleDateString('pt-BR'),
          createdAt: new Date().toISOString(),
          color: statusClass(newOrder.status)
        };
        setOrders(prev => [localOs, ...prev]);
      }

      addAuditLog(`Agendou comanda ${generatedId} para ${newOrder.customer.trim()}`);
      setShowNewOrder(false);
      setNewOrder({
        customer: '', service: servicesList[0].name, barberName: 'Qualquer Barbeiro', scheduledDate: new Date().toISOString().split('T')[0],
        scheduledTime: '14:00', phone: '', status: 'Agendado', amount: servicesList[0].defaultPrice, costProduct: '0.00', notes: ''
      });
      notify('Agendamento registrado com sucesso!');
    } catch (err) { notify(err.message || 'Erro ao registrar.'); }
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
      photo: newProduct.photo
    };
    setInventory(prev => [item, ...prev]);
    addAuditLog(`Adicionou ${item.name} ao estoque`);
    setShowNewProduct(false);
    setNewProduct({ name: '', category: 'Finalizadores', price: '', qty: '1', photo: null });
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
      if (targetOrder) addAuditLog(`Alterou status da comanda ${targetOrder.id} para "${newStatus}"`);
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
      user: userAccessLevel === 'owner' ? 'Dono' : 'Barbeiro'
    };
    setCashRegister(prev => ({ ...prev, entries: [newEntry, ...prev.entries] }));
    addAuditLog(`Lançamento no Caixa: R$ ${val.toFixed(2)} (${cashTx.description})`);
    setShowCashTransactionModal(false);
    setCashTx({ type: 'in', description: '', amount: '' });
    notify('Lançamento registrado no caixa!');
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
    addAuditLog(`Adicionou ${newMember.name} à equipe de barbeiros`);
    setShowInviteMemberModal(false);
    setNewMember({ name: '', email: '', role: 'barber' });
    notify('Barbeiro adicionado à equipe com sucesso!');
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

  const shareAppointmentWhatsapp = (order) => {
    let msg = '';
    if (order.status === 'Agendado') {
      msg = `Fala ${order.customer}! Seu agendamento para *${order.service}* na ${storeName} está confirmado!\n\n💈 Código da Comanda: *${order.id}*\nValor: *${order.amount}*\n\nTe esperamos na cadeira!`;
    } else if (order.status === 'Em atendimento') {
      msg = `Fala ${order.customer}! Seu atendimento de *${order.service}* acabou de iniciar na ${storeName}.`;
    } else if (order.status === 'Aguardando pagamento') {
      msg = `Fala ${order.customer}! Serviço finalizado! O valor total da sua comanda (${order.id}) é *${order.amount}*. Chave Pix para pagamento: ${pixKey}`;
    } else if (order.status === 'Finalizado') {
      msg = `Obrigado pela preferência na ${storeName}, ${order.customer}! Esperamos que tenha curtido o resultado do *${order.service}*. Até a próxima! ✂️`;
    } else {
      msg = `Olá ${order.customer}! Atualização do seu agendamento ${order.id}: Status atual é ${order.status}.`;
    }

    const text = encodeURIComponent(msg);
    const targetPhone = order.phone || whatsappNumber;
    window.open(`https://wa.me/${targetPhone}?text=${text}`, '_blank');
  };

  const sendHaircutReminder = (order) => {
    const msg = encodeURIComponent(`Fala ${order.customer}, tudo certo? Passando para avisar que já faz quase 20 dias desde o seu último corte na ${storeName}! Que tal renovar o degradê e alinhar a barba essa semana? Manda aqui o melhor horário pra você! 💈✂️`);
    const targetPhone = order.phone || whatsappNumber;
    window.open(`https://wa.me/${targetPhone}?text=${msg}`, '_blank');
  };

  async function logout() {
    if (supabaseConfigured) await supabase.auth.signOut();
    setSession(null);
    setUserRole('client');
    localStorage.setItem('rt_barber_role', 'client');
    setActive('stores_directory');
  }

  if (showSplash) {
    return <BrandSplash onFinish={() => {
      setShowSplash(false);
      sessionStorage.setItem('rt_barber_splash', 'true');
    }} />;
  }

  if (!authChecked) return <div className="loading-screen" style={{background: '#050505'}}><div className="brand-mark"><Scissors size={22} color="#25D366"/></div><span>Iniciando ambiente da Barbearia...</span></div>;

  if (supabaseConfigured && !session) return (
    <div className="auth-shell" style={{background: '#050505'}}>
      <div className="auth-visual">
        <div className="auth-orb orb-one"></div><div className="auth-orb orb-two"></div>
        <div className="auth-brand"><div className="brand-mark" style={{background: '#000', border: '1px solid #222'}}>{storeLogo ? <img src={storeLogo} alt="Logo" style={{width: '100%', height: '100%', borderRadius: '6px', objectFit: 'cover'}}/> : <Scissors size={18} color="#25D366"/>}</div><span>RT BARBER<span className="brand-light"> / SYSTEMS</span></span></div>
        <div className="auth-hero-copy"><div className="eyebrow"><Sparkles size={14}/> GESTÃO PROFISSIONAL PARA BARBEARIAS</div><h1>O Sistema Completo<br/><span>para a sua Barbearia.</span></h1><p>Agendamentos, comandas, caixa diário, comissão dos barbeiros e venda de produtos em um só lugar.</p></div>
        <div className="auth-visual-footer"><span>RT BARBER PLATFORM</span><span>v1.0</span></div>
      </div>

      <form className="auth-card" onSubmit={handleAuth} style={{background: '#0a0a0c', border: '1px solid #1f1f23'}}>
        <div style={{display: 'flex', gap: '8px', marginBottom: '20px', background: '#111', padding: '4px', borderRadius: '8px', border: '1px solid #222'}}>
          <button type="button" className={`secondary-btn ${userRole === 'client' ? 'primary-btn' : ''}`} style={{flex: 1, fontSize: '13px'}} onClick={() => setUserRole('client')}>
            Portal do Cliente
          </button>
          <button type="button" className={`secondary-btn ${userRole === 'barber' ? 'primary-btn' : ''}`} style={{flex: 1, fontSize: '13px'}} onClick={() => setUserRole('barber')}>
            Painel da Barbearia
          </button>
        </div>

        <div className="auth-card-top"><div className="small-icon"><ShieldCheck size={20}/></div><span className="micro-label">{userRole === 'barber' ? 'ÁREA RESTRITA DA BARBEARIA' : 'PORTAL DE AGENDAMENTO'}</span></div>
        <h2>{userRole === 'barber' ? (authMode === 'login' ? 'Entrar no Painel' : 'Cadastrar Barbearia (48h Grátis)') : 'Acessar Barbearia'}</h2>
        <p className="muted">{userRole === 'barber' ? 'Acesse sua agenda, comissões e fluxo de caixa.' : 'Consulte seus horários agendados e produtos da barbearia.'}</p>

        <label>E-mail<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="seu@email.com" required/></label>
        <label>Senha<input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Mínimo de 6 caracteres" minLength="6" required/></label>
        {authError && <div className="form-error">{authError}</div>}

        <button className="primary-btn full-btn" disabled={saving}>{saving ? 'Aguarde...' : authMode === 'login' ? (userRole === 'barber' ? 'Entrar no Painel' : 'Acessar Portal') : (userRole === 'barber' ? 'Iniciar Teste Grátis de 48 horas' : 'Criar Conta')}<ArrowUpRight size={16}/></button>
        <button type="button" className="text-btn auth-switch" onClick={()=>{setAuthMode(authMode==='login'?'signup':'login');setAuthError('')}}>{authMode==='login'?'Ainda não tem conta? Testar 48h Grátis':'Já tem conta? Entrar'}</button>

        {userRole === 'barber' && (
          <button type="button" className="secondary-btn full-btn" style={{marginTop: '15px', border: '1px solid #25D366', color: '#25D366'}} onClick={() => setShowPaymentModal(true)}>
            <QrCode size={16}/> Pagar / Renovar Assinatura (R$ 50,00/mês)
          </button>
        )}

        <div className="auth-note"><ShieldCheck size={14}/> Plataforma protegida por RT Systems</div>
      </form>

      {showPaymentModal && (
        <div className="modal-backdrop" onClick={()=>setShowPaymentModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()} style={{background: '#0f0f12', border: '1px solid #222', maxWidth: '450px', textAlign: 'center'}}>
            <div className="modal-head"><div><div className="eyebrow">ASSINATURA DA PLATAFORMA</div><h2>Plano Barbearia — R$ 50,00/mês</h2></div><button type="button" className="icon-btn" onClick={()=>setShowPaymentModal(false)}><X size={19}/></button></div>
            <p className="muted" style={{fontSize: '13px'}}>Pague o Pix para manter sua barbearia ativa e liberar o painel sem limites para você e todos os seus barbeiros.</p>

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
              <small style={{color: '#888'}}>Titular: Robert (RT Systems)</small>
            </div>

            <a href={`https://wa.me/${adminWhatsapp}?text=${encodeURIComponent(`Olá Robert! Efetuei o Pix de R$ 50,00 para ativar/renovar a assinatura da minha Barbearia (${email}). Pode liberar meu acesso?`)}`} target="_blank" rel="noreferrer" className="primary-btn full-btn" style={{background: '#25D366', color: '#000', fontWeight: 'bold', textDecoration: 'none'}}>
              <MessageCircle size={16}/> Enviar Comprovante no WhatsApp (Desenvolvedor)
            </a>
          </div>
        </div>
      )}
    </div>
  );

  const activeNav = userRole === 'barber' ? navBarber : navClient;

  return (
    <div className="app-shell" style={{background: '#08080a', color: '#f0f0f0'}}>
      <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`} style={{background: '#0a0a0c', borderRight: '1px solid #18181b'}}>
        <div className="brand-lockup">
          <div className="brand-mark" style={{background: '#000', width: '38px', height: '38px', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #222'}}>
            {storeLogo ? (
              <img src={storeLogo} alt="Logo" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
            ) : (
              <Scissors size={20} color="#25D366"/>
            )}
          </div>
          <div>
            <div className="brand-name" style={{fontSize: '15px', fontWeight: 'bold'}}>{userRole === 'barber' ? storeName : 'RT Barber'}</div>
            <div className="brand-sub" style={{color: '#666', fontSize: '10px'}}>{userRole === 'barber' ? 'PAINEL DA BARBEARIA' : 'PORTAL DO CLIENTE'}</div>
          </div>
          <button className="mobile-close icon-btn" onClick={()=>setMobileNav(false)}><X size={18}/></button>
        </div>

        {userRole === 'barber' && !isAccountExpired && (
          <div style={{padding: '8px 12px', background: '#111', borderRadius: '8px', margin: '10px 12px', border: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <span style={{fontSize: '11px', color: '#888'}}>Nível de Acesso:</span>
            <select 
              value={userAccessLevel} 
              onChange={e => {
                setUserAccessLevel(e.target.value);
                notify(e.target.value === 'owner' ? 'Modo Proprietário (Acesso Total)' : 'Modo Barbeiro (Acesso Restrito)');
              }}
              style={{background: '#000', color: '#fff', border: '1px solid #333', borderRadius: '4px', padding: '2px 6px', fontSize: '11px'}}
            >
              <option value="owner">👑 Dono (Admin)</option>
              <option value="barber">✂️ Barbeiro (Equipe)</option>
            </select>
          </div>
        )}

        {isSuperAdmin && (
          <div 
            className="workspace-switch" 
            onClick={() => {
              const nextRole = userRole === 'barber' ? 'client' : 'barber';
              setUserRole(nextRole);
              localStorage.setItem('rt_barber_role', nextRole);
              setActive(nextRole === 'barber' ? 'overview' : 'stores_directory');
              notify(nextRole === 'barber' ? 'Alternado para MODO BARBEARIA' : 'Alternado para VISÃO DO CLIENTE');
            }}
            style={{background: '#121215', border: '1px solid #222', cursor: 'pointer'}}
          >
            <div className="workspace-avatar" style={{background: userRole === 'barber' ? '#25D366' : '#3b82f6', color: '#000', fontWeight: 'bold'}}>
              {userRole === 'barber' ? 'B' : 'C'}
            </div>
            <div className="workspace-info">
              <strong>{userRole === 'barber' ? 'Painel Barbearia' : 'Visão do Cliente'}</strong>
              <span style={{color: '#25D366'}}>Super Admin ⚡</span>
            </div>
            <ChevronDown size={15}/>
          </div>
        )}

        <div className="nav-caption">NAVEGAÇÃO</div>
        <nav>{activeNav.map(item => <button key={item.id} className={`nav-item ${active===item.id?'active':''}`} onClick={()=>{setActive(item.id);setMobileNav(false)}}><item.icon size={18}/><span>{item.label}</span>{item.id==='appointments' && <span className="nav-count">{orders.length}</span>}{item.id==='customers' && <span className="nav-count">{customers.length}</span>}{item.id==='inventory' && <span className="nav-count">{inventory.length}</span>}</button>)}</nav>

        <div className="sidebar-bottom">
          {userRole === 'barber' && !isAccountExpired && (
            <div className="plan-card" style={{background: '#111', border: '1px solid #222'}}>
              <div className="plan-icon"><Sparkles size={16}/></div>
              <strong>RT Barber PRO</strong>
              <p>Sua barbearia organizada e produtiva.</p>
              <div className="plan-progress"><span style={{width: '100%', background: '#25D366'}}/></div>
              <small style={{color: '#25D366'}}>• {isLifetimeAdmin ? '👑 Licença Vitalícia Ativa' : (isTrialActive ? `Teste Grátis (${trialTimeLeft}h restantes)` : `Plano Barbearia (${planDaysLeft} dias restantes)`)}</small>
            </div>
          )}
          <button className="profile-row" onClick={()=>userRole === 'barber' ? setActive('settings') : logout()} style={{background: '#121215'}}>
            <div className="profile-avatar">{userRole === 'barber' ? storeName.slice(0, 1).toUpperCase() : 'C'}</div>
            <div className="profile-info">
              <strong>{userRole === 'barber' ? (userAccessLevel === 'owner' ? 'Dono (Admin)' : 'Barbeiro') : 'Cliente'}</strong>
              <span>{session?.user?.email || 'Conectado'}</span>
            </div>
            <span style={{letterSpacing: '2px', color: '#666'}}>•••</span>
          </button>
        </div>
      </aside>

      {mobileNav && <div className="nav-overlay" onClick={()=>setMobileNav(false)} />}

      <main className="main-area" style={{background: '#08080a', position: 'relative'}}>
        {userRole === 'barber' && isAccountExpired && !isLifetimeAdmin ? (
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
                  ? 'Seu plano mensal de 30 dias na RT Barber encerrou. Renove sua assinatura para continuar usando o sistema.'
                  : 'Suas 48 horas de teste gratuito na RT Barber se esgotaram. Seus agendamentos, clientes, comissões e estoque continuam salvos com segurança.'}
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
                <small style={{color: '#aaa', fontSize: '11px', display: 'block', marginTop: '6px'}}>Valor: R$ 50,00/mês | Titular: Robert (RT Systems)</small>
              </div>

              <a 
                href={`https://wa.me/${adminWhatsapp}?text=${encodeURIComponent(`Olá Robert! A assinatura da minha Barbearia (${session?.user?.email}) encerrou. Acabei de realizar o Pix de R$ 50,00 para renovar por 30 dias, pode liberar meu acesso?`)}`}
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
            {userRole === 'barber' && isTrialActive && !isLifetimeAdmin && (
              <div style={{background: 'linear-gradient(90deg, #1e3a8a, #0284c7)', color: '#fff', padding: '8px 16px', fontSize: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '500'}}>
                <span style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                  <Clock size={15}/> ⏳ PERÍODO DE TESTE GRÁTIS ATIVO: Você tem <strong>{trialTimeLeft} horas restantes</strong> para usar todas as funções da barbearia!
                </span>
                <button onClick={()=>setShowPaymentModal(true)} style={{background: '#fff', color: '#000', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px'}}>
                  Ativar R$ 50/mês
                </button>
              </div>
            )}

            {userRole === 'barber' && !isTrialActive && !isLifetimeAdmin && planDaysLeft <= 5 && (
              <div style={{background: 'linear-gradient(90deg, #b45309, #d97706)', color: '#fff', padding: '8px 16px', fontSize: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '500'}}>
                <span style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                  <AlertTriangle size={15}/> ⚠️ ATENÇÃO: Sua assinatura expira em <strong>{planDaysLeft} dias</strong>! Renove para não perder o acesso ao caixa e comandas.
                </span>
                <button onClick={()=>setShowPaymentModal(true)} style={{background: '#fff', color: '#000', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px'}}>
                  Renovar Pix (R$ 50)
                </button>
              </div>
            )}

            <header className="topbar" style={{background: '#0a0a0c', borderBottom: '1px solid #18181b'}}>
              <div className="topbar-left">
                <button className="icon-btn menu-trigger" onClick={()=>setMobileNav(true)}><Menu size={20}/></button>
                <div className="breadcrumb">{storeName} <span>/</span> <strong>{activeNav.find(n=>n.id===active)?.label || 'Visão Geral'}</strong></div>
              </div>
              <div className="topbar-actions">
                <div className="system-status"><span className="status-dot" style={{background: '#25D366'}}/> RT Barber v1.0</div>
                <button className="icon-btn notification-btn" onClick={()=>notify('Sua barbearia está em dia!')}><Bell size={18}/><i/></button>
                <button className="top-avatar" onClick={()=>userRole === 'barber' ? setActive('settings') : logout()}>
                  {userRole === 'barber' ? storeName.slice(0, 1).toUpperCase() : 'C'}
                </button>
              </div>
            </header>

            {active==='overview' && userRole === 'barber' && <Overview orders={orders} storeName={storeName} onNew={()=>setShowNewOrder(true)} onNavigate={setActive} modules={modules} inventory={inventory} />}
            {active==='appointments' && userRole === 'barber' && <AppointmentsPage orders={filteredOrders} search={search} setSearch={setSearch} onNew={()=>setShowNewOrder(true)} onStatus={handleUpdateStatus} onShare={shareAppointmentWhatsapp} onPrint={(o) => setShowPrintModal(o)} onHaircutReminder={sendHaircutReminder} />}
            {active==='customers' && userRole === 'barber' && <CustomersPage customers={customers} onNew={()=>setShowNewCustomer(true)} />}
            {active==='crm' && userRole === 'barber' && <CrmPage customers={customers} storeName={storeName} whatsapp={whatsappNumber} />}
            {active==='cash' && userRole === 'barber' && <CashPage cashRegister={cashRegister} onNewTransaction={() => setShowCashTransactionModal(true)} />}
            {active==='inventory' && userRole === 'barber' && <InventoryPage inventory={inventory} onNew={()=>setShowNewProduct(true)} onUpdateQty={updateProductQty} onDelete={deleteProduct} />}
            {active==='services_menu' && userRole === 'barber' && <ServicesMenuPage services={servicesList} onNewAppointment={() => setShowNewOrder(true)} />}
            {active==='client_services' && <ClientServicesPage services={servicesList} whatsapp={whatsappNumber} storeName={storeName} />}
            {active==='client_inventory' && <ClientInventoryPage inventory={inventory} storeName={storeName} cart={cart} addToCart={addToCart} onOpenCart={() => setShowCartModal(true)} />}
            {active==='stores_directory' && <StoresDirectoryPage stores={activeStores} onSelectStore={(s) => { setStoreName(s.name); setWhatsappNumber(s.phone); notify(`Barbearia "${s.name}" selecionada!`); setActive('client_services'); }} onRequestQuote={(s) => setShowQuoteModal(s)} />}
            {active==='track' && <TrackPage orders={orders} storeName={storeName} pixKey={pixKey} whatsapp={whatsappNumber} storeAddress={storeAddress} mapsUrl={mapsUrl} notify={notify} />}
            {active==='finance' && userRole === 'barber' && userAccessLevel === 'owner' && <FinancePage orders={orders} commissionRate={barberCommissionRate} setCommissionRate={setBarberCommissionRate} />}
            {active==='payments' && userRole === 'barber' && <PaymentsPage pixKey={pixKey} setPixKey={setPixKey} onShowPayModal={() => setShowPaymentModal(true)} />}
            {active==='settings' && userRole === 'barber' && <SettingsPage configured={supabaseConfigured} email={session?.user?.email} storeName={storeName} setStoreName={setStoreName} storeLogo={storeLogo} onLogoUpload={handleLogoUpload} whatsapp={whatsappNumber} setWhatsapp={setWhatsappNumber} pixKey={pixKey} setPixKey={setPixKey} storeAddress={storeAddress} setStoreAddress={setStoreAddress} mapsUrl={mapsUrl} setMapsUrl={setMapsUrl} modules={modules} setModules={setModules} onLogout={logout} teamMembers={teamMembers} onInviteMember={() => setShowInviteMemberModal(true)} auditLogs={auditLogs} userAccessLevel={userAccessLevel} isLifetimeAdmin={isLifetimeAdmin} />}

            <footer className="footer" style={{borderTop: '1px solid #18181b', color: '#666', padding: '20px', fontSize: '11px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px'}}>
              <span>{storeName.toUpperCase()} <span className="footer-dot">•</span> GESTÃO PROFISSIONAL DE BARBEARIA</span>
              <span>
                DESENVOLVIDO POR <strong style={{color: '#aaa'}}>RT SYSTEMS</strong> 
                <span style={{margin: '0 8px', color: '#444'}}>|</span> 
                Quer este sistema na sua barbearia?{' '}
                <a 
                  href={`https://wa.me/${adminWhatsapp}?text=${encodeURIComponent('Olá! Vi o sistema RT Barber e gostaria de saber como ter na minha barbearia.')}`} 
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

      {/* MODAL DO CARRINHO DE PRODUTOS DA BARBEARIA */}
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

      {/* MODAL LANÇAMENTO NO CAIXA */}
      {showCashTransactionModal && (
        <div className="modal-backdrop" onClick={()=>setShowCashTransactionModal(false)}>
          <form className="modal" onClick={e=>e.stopPropagation()} onSubmit={handleCashTransaction} style={{background: '#0f0f12', border: '1px solid #222', maxWidth: '420px'}}>
            <div className="modal-head"><div><div className="eyebrow">FLUXO DE CAIXA</div><h2>Novo Lançamento no Balcão</h2></div><button type="button" className="icon-btn" onClick={()=>setShowCashTransactionModal(false)}><X size={19}/></button></div>

            <label>Tipo de Lançamento
              <select value={cashTx.type} onChange={e=>setCashTx({...cashTx, type: e.target.value})}>
                <option value="in">➕ Entrada / Recebimento de Serviço</option>
                <option value="out">➖ Sangria / Saída (Despesa / Insumos)</option>
              </select>
            </label>

            <label style={{marginTop: '10px'}}>Descrição do Lançamento
              <input value={cashTx.description} onChange={e=>setCashTx({...cashTx, description: e.target.value})} placeholder="Ex: Pagamento Fornecedor Lâminas / Venda Pomada" required />
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

      {/* MODAL CONVIDAR BARBEIRO / MEMBRO */}
      {showInviteMemberModal && (
        <div className="modal-backdrop" onClick={()=>setShowInviteMemberModal(false)}>
          <form className="modal" onClick={e=>e.stopPropagation()} onSubmit={handleInviteMember} style={{background: '#0f0f12', border: '1px solid #222', maxWidth: '420px'}}>
            <div className="modal-head"><div><div className="eyebrow">EQUIPE DA BARBEARIA</div><h2>Adicionar Barbeiro à Equipe</h2></div><button type="button" className="icon-btn" onClick={()=>setShowInviteMemberModal(false)}><X size={19}/></button></div>

            <p className="muted">O barbeiro cadastrado terá acesso com a conta dele para atender clientes e ver sua produção.</p>

            <label style={{marginTop: '10px'}}>Nome do Barbeiro
              <input value={newMember.name} onChange={e=>setNewMember({...newMember, name: e.target.value})} placeholder="Ex: Felipe Navalha" required />
            </label>

            <label style={{marginTop: '10px'}}>E-mail do Barbeiro
              <input type="email" value={newMember.email} onChange={e=>setNewMember({...newMember, email: e.target.value})} placeholder="barbeiro@seuestabelecimento.com" required />
            </label>

            <label style={{marginTop: '10px'}}>Função / Cargo
              <select value={newMember.role} onChange={e=>setNewMember({...newMember, role: e.target.value})}>
                <option value="barber">✂️ Barbeiro (Acesso à Cadeira & Agenda)</option>
                <option value="owner">👑 Administrador / Dono (Acesso Total)</option>
              </select>
            </label>

            <div className="modal-foot" style={{marginTop: '20px'}}>
              <button type="button" className="secondary-btn" onClick={()=>setShowInviteMemberModal(false)}>Cancelar</button>
              <button className="primary-btn">Adicionar à Barbearia <ArrowUpRight size={16}/></button>
            </div>
          </form>
        </div>
      )}

      {/* IMPRESSÃO DE COMANDA TÉRMICA */}
      {showPrintModal && (
        <div className="modal-backdrop" onClick={()=>setShowPrintModal(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()} style={{background: '#fff', color: '#000', fontFamily: 'monospace', maxWidth: '380px', padding: '15px', borderRadius: '0'}}>
            <div style={{textAlign: 'center', borderBottom: '1px dashed #000', paddingBottom: '10px', marginBottom: '10px'}}>
              <h2 style={{fontSize: '18px', margin: 0}}>{storeName.toUpperCase()}</h2>
              <p style={{fontSize: '10px', margin: '2px 0'}}>{storeAddress}</p>
              <p style={{fontSize: '11px', margin: '4px 0'}}>COMANDA: {showPrintModal.id}</p>
              <small>{new Date().toLocaleString('pt-BR')}</small>
            </div>

            <div style={{fontSize: '12px', lineHeight: '1.4'}}>
              <p style={{margin: '4px 0'}}><strong>CLIENTE:</strong> {showPrintModal.customer}</p>
              <p style={{margin: '4px 0'}}><strong>TEL:</strong> {showPrintModal.phone || 'Não informado'}</p>
              <p style={{margin: '4px 0'}}><strong>SERVIÇO:</strong> {showPrintModal.service}</p>
              <p style={{margin: '4px 0'}}><strong>PROFISSIONAL:</strong> {showPrintModal.barberName}</p>
              <p style={{margin: '4px 0'}}><strong>STATUS:</strong> {showPrintModal.status}</p>
              <p style={{margin: '4px 0'}}><strong>VALOR TOTAL:</strong> {showPrintModal.amount}</p>
            </div>

            <div style={{borderTop: '1px dashed #000', marginTop: '10px', paddingTop: '10px', textAlign: 'center', fontSize: '9px'}}>
              <p style={{margin: 0}}>Obrigado pela preferência! Volte sempre.</p>
              <br/>
              <p>___________________________________<br/>Assinatura</p>
            </div>

            <div style={{marginTop: '15px', display: 'flex', gap: '8px'}} className="no-print">
              <button className="primary-btn full-btn" onClick={() => window.print()} style={{background: '#000', color: '#fff'}}>
                <Printer size={16}/> Imprimir Comanda Térmica
              </button>
              <button className="secondary-btn" onClick={()=>setShowPrintModal(null)} style={{background: '#eee', color: '#000'}}>Fechar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NOVO AGENDAMENTO / COMANDA */}
      {showNewOrder && (
        <div className="modal-backdrop" onClick={()=>setShowNewOrder(false)}>
          <form className="modal" onClick={e=>e.stopPropagation()} onSubmit={handleCreateOrder} style={{background: '#0f0f12', border: '1px solid #222'}}>
            <div className="modal-head"><div><div className="eyebrow">NOVA COMANDA</div><h2>Novo Agendamento / Atendimento</h2></div><button type="button" className="icon-btn" onClick={()=>setShowNewOrder(false)}><X size={19}/></button></div>
            <p className="muted">Registre o cliente, o serviço escolhido e o profissional responsável.</p>

            <label>Cliente
              <input list="customers-list" value={newOrder.customer} onChange={e=>{
                  const val = e.target.value;
                  const found = customers.find(c => c.name === val);
                  setNewOrder({...newOrder, customer: val, phone: found?.phone || newOrder.phone});
                }} placeholder="Nome do cliente" required/>
              <datalist id="customers-list">
                {customers.map(c => <option key={c.id} value={c.name}>{c.phone ? `(${c.phone})` : ''}</option>)}
              </datalist>
            </label>

            <div className="form-grid">
              <label>Telefone / WhatsApp<input value={newOrder.phone} onChange={e=>setNewOrder({...newOrder, phone: e.target.value})} placeholder="(91) 99999-9999"/></label>
              <label>Barbeiro Responsável
                <input value={newOrder.barberName} onChange={e=>setNewOrder({...newOrder, barberName: e.target.value})} placeholder="Nome do barbeiro"/>
              </label>
            </div>

            <div className="form-grid">
              <label>Serviço Principal
                <select value={newOrder.service} onChange={e=>{
                  const selected = servicesList.find(s => s.name === e.target.value);
                  setNewOrder({...newOrder, service: e.target.value, amount: selected?.defaultPrice || newOrder.amount});
                }}>
                  {servicesList.map(s => <option key={s.name} value={s.name}>{s.name} (R$ {s.defaultPrice})</option>)}
                </select>
              </label>
              <label>Valor Total (R$)
                <input type="number" step="0.01" value={newOrder.amount} onChange={e=>setNewOrder({...newOrder, amount: e.target.value})} placeholder="0.00" required/>
              </label>
            </div>

            <div className="form-grid">
              <label>Data do Agendamento
                <input type="date" value={newOrder.scheduledDate} onChange={e=>setNewOrder({...newOrder, scheduledDate: e.target.value})} required/>
              </label>
              <label>Horário
                <input type="time" value={newOrder.scheduledTime} onChange={e=>setNewOrder({...newOrder, scheduledTime: e.target.value})} required/>
              </label>
            </div>

            <div className="form-grid">
              <label>Status Inicial
                <select value={newOrder.status} onChange={e=>setNewOrder({...newOrder, status: e.target.value})}>
                  {['Agendado', 'Em atendimento', 'Aguardando pagamento', 'Finalizado'].map(s=><option key={s}>{s}</option>)}
                </select>
              </label>
              <label>Custo de Insumos/Produtos (R$)
                <input type="number" step="0.01" value={newOrder.costProduct} onChange={e=>setNewOrder({...newOrder, costProduct: e.target.value})} placeholder="0.00"/>
              </label>
            </div>

            <label>Observações / Estilo do Corte
              <input value={newOrder.notes} onChange={e=>setNewOrder({...newOrder, notes: e.target.value})} placeholder="Ex: Degradê navalhado alto, barba com pigmentação"/>
            </label>

            <div className="modal-foot">
              <button type="button" className="secondary-btn" onClick={()=>setShowNewOrder(false)}>Cancelar</button>
              <button className="primary-btn" disabled={saving}>{saving ? 'Salvando...' : 'Confirmar Comanda'}<ArrowUpRight size={16}/></button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL NOVO CLIENTE */}
      {showNewCustomer && (
        <div className="modal-backdrop" onClick={()=>setShowNewCustomer(false)}>
          <form className="modal" onClick={e=>e.stopPropagation()} onSubmit={handleCreateCustomer} style={{background: '#0f0f12', border: '1px solid #222'}}>
            <div className="modal-head"><div><div className="eyebrow">BASE DE CLIENTES</div><h2>Cadastrar Cliente</h2></div><button type="button" className="icon-btn" onClick={()=>setShowNewCustomer(false)}><X size={19}/></button></div>
            <label>Nome Completo<input value={newCustomer.name} onChange={e=>setNewCustomer({...newCustomer, name: e.target.value})} placeholder="Nome do cliente" required/></label>
            <div className="form-grid">
              <label>Telefone / WhatsApp<input value={newCustomer.phone} onChange={e=>setNewCustomer({...newCustomer, phone: e.target.value})} placeholder="(91) 99999-9999"/></label>
              <label>E-mail<input type="email" value={newCustomer.email} onChange={e=>setNewCustomer({...newCustomer, email: e.target.value})} placeholder="cliente@email.com"/></label>
            </div>
            <div className="modal-foot"><button type="button" className="secondary-btn" onClick={()=>setShowNewCustomer(false)}>Cancelar</button><button className="primary-btn" disabled={saving}>{saving ? 'Salvando...' : 'Salvar Cliente'}<ArrowUpRight size={16}/></button></div>
          </form>
        </div>
      )}

      {/* MODAL NOVO PRODUTO NO ESTOQUE */}
      {showNewProduct && (
        <div className="modal-backdrop" onClick={()=>setShowNewProduct(false)}>
          <form className="modal" onClick={e=>e.stopPropagation()} onSubmit={handleCreateProduct} style={{background: '#0f0f12', border: '1px solid #222'}}>
            <div className="modal-head"><div><div className="eyebrow">PRODUTOS DA BARBEARIA</div><h2>Cadastrar Produto</h2></div><button type="button" className="icon-btn" onClick={()=>setShowNewProduct(false)}><X size={19}/></button></div>

            <label>Nome do Produto
              <input value={newProduct.name} onChange={e=>setNewProduct({...newProduct, name: e.target.value})} placeholder="Ex: Pomada Efeito Matte 150g" required />
            </label>

            <div className="form-grid">
              <label>Categoria
                <select value={newProduct.category} onChange={e=>setNewProduct({...newProduct, category: e.target.value})}>
                  {['Finalizadores', 'Cuidados com a Barba', 'Cabelo', 'Bebidas & Bar', 'Outros'].map(c => <option key={c}>{c}</option>)}
                </select>
              </label>
              <label>Preço de Venda (R$)
                <input value={newProduct.price} onChange={e=>setNewProduct({...newProduct, price: e.target.value})} placeholder="0.00" required />
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
              <button className="primary-btn">Salvar Produto <ArrowUpRight size={16}/></button>
            </div>
          </form>
        </div>
      )}

      {toast && <div className="toast"><Check size={17}/>{toast}</div>}
    </div>
  );
}

function Overview({orders, storeName, onNew, onNavigate, modules, inventory}) {
  const ready = orders.filter(o=>o.status==='Aguardando pagamento').length;
  const inProgress = orders.filter(o=>o.status==='Em atendimento').length;
  const lowStockItems = inventory.filter(p => p.qty < 3);

  return <div className="page-content">
    {lowStockItems.length > 0 && (
      <div style={{background: '#451a03', border: '1px solid #b45309', color: '#fef3c7', padding: '10px 16px', borderRadius: '8px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <span style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px'}}>
          <AlertTriangle size={18} color="#f59e0b"/> ⚠️ <strong>Alerta de Estoque:</strong> {lowStockItems.length} produto(s) com menos de 3 unidades (pomadas, cervejas ou insumos).
        </span>
        <button onClick={()=>onNavigate('inventory')} style={{background: '#b45309', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px'}}>
          Ver Estoque
        </button>
      </div>
    )}

    <div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-line"/> PAINEL DE CONTROLE <span className="heading-date">/ HOJE</span></div><h1>Bem-vindo, <span>{storeName}.</span></h1><p>Acompanhe os clientes na cadeira, faturamento e vendas de hoje.</p></div>{modules.appointments && <button className="primary-btn" onClick={onNew}><Plus size={17}/> Nova Comanda / Horário</button>}</div>

    {modules.appointments && (
      <div className="metrics-grid">
        <Metric icon={Calendar} label="Comandas Hoje" value={String(orders.length).padStart(2,'0')} trend="Agendamentos e cortes" tone="blue"/>
        <Metric icon={Scissors} label="Na Cadeira Agora" value={String(inProgress).padStart(2,'0')} trend="Em atendimento" tone="violet"/>
        <Metric icon={Clock3} label="Aguardando Pagamento" value={String(ready).padStart(2,'0')} trend="Serviço finalizado" tone="amber"/>
        <Metric icon={Check} label="Finalizados" value={String(orders.filter(o=>o.status==='Finalizado').length).padStart(2,'0')} trend="Cortes concluídos" tone="green"/>
      </div>
    )}

    <div className="content-grid" style={{marginTop: '20px'}}>
      <section className="panel orders-panel" style={{background: '#0a0a0d', border: '1px solid #18181b'}}>
        <div className="panel-heading"><div><h3>Atendimentos Recentes</h3><p>Últimos clientes agendados e atendidos</p></div>{modules.appointments && <button className="icon-btn" onClick={()=>onNavigate('appointments')}><ArrowUpRight size={17}/></button>}</div>
        <div className="table-wrap"><table><thead><tr><th>COMANDA / CLIENTE</th><th>SERVIÇO / BARBEIRO</th><th>STATUS</th><th>VALOR</th></tr></thead><tbody>{orders.slice(0,4).map(o=><tr key={o.id}><td><div className="order-id">{o.id}</div><div className="cell-sub">{o.customer}</div></td><td><div className="device-cell"><div className="device-mini"><Scissors size={15}/></div><span>{o.service}</span></div><div className="cell-sub">{o.barberName}</div></td><td><StatusPill status={o.status}/></td><td className="time-cell"><strong>{o.amount}</strong></td></tr>)}</tbody></table></div>
        {modules.appointments && <button className="panel-bottom-link" onClick={()=>onNavigate('appointments')}>Abrir todas as comandas <ArrowUpRight size={15}/></button>}
      </section>

      <section className="panel quick-panel" style={{background: '#0a0a0d', border: '1px solid #18181b'}}>
        <div className="panel-heading"><div><h3>Acesso Rápido</h3><p>Atalhos do dia a dia na barbearia</p></div><div className="quick-symbol"><Sparkles size={16}/></div></div>
        {modules.appointments && <QuickAction icon={Plus} title="Novo Atendimento" desc="Abrir comanda ou agendar" onClick={onNew}/>}
        <QuickAction icon={Users} title="Consultar Clientes" desc="Histórico e contatos" onClick={()=>onNavigate('customers')}/>
        {modules.inventory && <QuickAction icon={Package} title="Estoque de Pomadas & Bar" desc="Gerenciar produtos" onClick={()=>onNavigate('inventory')}/>}
        {modules.cashRegister && <QuickAction icon={Wallet} title="Caixa do Balcão" desc="Lançar entradas e sangrias" onClick={()=>onNavigate('cash')}/>}
      </section>
    </div>
  </div>
}

function Metric({icon:Icon,label,value,trend,tone}) {return <div className="metric-card" style={{background: '#0a0a0d', border: '1px solid #18181b'}}><div className="metric-top"><div className={`metric-icon ${tone}`}><Icon size={17}/></div><span className="metric-period">HOJE</span></div><div className="metric-value">{value}</div><div className="metric-label">{label}</div><div className="metric-trend"><span className={`tiny-dot ${tone}`}/>{trend}</div></div>}
function StatusPill({status}) {return <span className={`status-pill ${statusClass(status)}`}><i/>{status}</span>}
function QuickAction({icon:Icon,title,desc,onClick}) {return <button className="quick-action" onClick={onClick} style={{background: '#111115'}}><div className="quick-action-icon"><Icon size={17}/></div><span><strong>{title}</strong><small>{desc}</small></span><ArrowUpRight size={15} className="quick-arrow"/></button>}

function AppointmentsPage({orders,search,setSearch,onNew,onStatus,onShare,onPrint,onHaircutReminder}) {
  return <div className="page-content">
    <div className="page-heading">
      <div>
        <div className="eyebrow"><span className="eyebrow-line"/> OPERAÇÃO NA CADEIRA</div>
        <h1>Agendamentos & <span>Comandas.</span></h1>
        <p>Controle a fila de espera, serviços na cadeira e recebimentos.</p>
      </div>
      <button className="primary-btn" onClick={onNew}><Plus size={17}/> Nova Comanda</button>
    </div>

    <div className="list-toolbar"><div className="search-box"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar por cliente, serviço ou barbeiro..."/></div><div className="toolbar-count">{orders.length} registros</div></div>

    <div className="panel orders-full" style={{background: '#0a0a0d', border: '1px solid #18181b'}}>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>COMANDA / CLIENTE</th>
              <th>SERVIÇO / PROFISSIONAL</th>
              <th>STATUS</th>
              <th>VALOR</th>
              <th>AÇÕES / WHATSAPP</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o=><tr key={o.id}>
              <td><div className="order-id">{o.id}</div><div className="cell-sub">{o.customer}</div></td>
              <td><div className="device-cell"><div className="device-mini"><Scissors size={15}/></div><span>{o.service}</span></div><div className="cell-sub">{o.barberName}</div></td>
              <td><select className={`status-select ${statusClass(o.status)}`} value={o.status} onChange={e=>onStatus(o.rawId,e.target.value)}>{['Agendado', 'Em atendimento', 'Aguardando pagamento', 'Finalizado', 'Cancelado'].map(s=><option key={s}>{s}</option>)}</select></td>
              <td className="time-cell"><strong>{o.amount}</strong></td>
              <td>
                <div style={{display: 'flex', gap: '6px'}}>
                  <button className="secondary-btn" onClick={()=>onShare(o)} title="Avisar no WhatsApp" style={{padding: '6px 10px'}}><MessageCircle size={14} color="#25D366"/></button>
                  <button className="secondary-btn" onClick={()=>onPrint(o)} title="Imprimir Comanda Térmica" style={{padding: '6px 10px'}}><Printer size={14}/></button>
                  <button className="secondary-btn" onClick={()=>onHaircutReminder(o)} title="Lembrete de Retorno (20 dias)" style={{padding: '6px 10px', color: '#eab308'}}><Calendar size={14}/></button>
                </div>
              </td>
            </tr>)}
          </tbody>
        </table>
        {!orders.length && <div className="empty-state"><Scissors size={28}/><strong>Nenhum agendamento encontrado</strong><span>Registre uma nova comanda de corte ou barba.</span></div>}
      </div>
    </div>
  </div>
}

function CustomersPage({customers, onNew}) {
  return <div className="page-content">
    <div className="page-heading">
      <div>
        <div className="eyebrow"><span className="eyebrow-line"/> FIDELIZAÇÃO</div>
        <h1>Base de <span>Clientes.</span></h1>
        <p>Cadastre seus clientes para disparos de lembretes e pós-atendimento.</p>
      </div>
      <button className="primary-btn" onClick={onNew}><Plus size={17}/> Novo Cliente</button>
    </div>
    <div className="panel orders-full" style={{background: '#0a0a0d', border: '1px solid #18181b'}}>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>NOME</th>
              <th>WHATSAPP / TELEFONE</th>
              <th>E-MAIL</th>
              <th>CADASTRADO EM</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(c => (
              <tr key={c.id}>
                <td><strong>{c.name}</strong></td>
                <td>{c.phone || 'Não informado'}</td>
                <td>{c.email || 'Não informado'}</td>
                <td className="time-cell">{new Date(c.created_at).toLocaleDateString('pt-BR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!customers.length && <div className="empty-state"><Users size={28}/><strong>Nenhum cliente cadastrado</strong></div>}
      </div>
    </div>
  </div>
}

function CrmPage({customers, storeName, whatsapp}) {
  const sendSupportFollowup = (customer) => {
    const text = encodeURIComponent(`Fala ${customer.name}! Tudo bem?\n\nPassando aqui da ${storeName} só para saber se você curtiu o corte/barba e se o resultado ficou do seu agrado!\n\nQualquer ajuste, estamos à disposição por aqui. Grande abraço! 💈✂️`);
    window.open(`https://wa.me/${customer.phone}?text=${text}`, '_blank');
  };

  return <div className="page-content">
    <div className="page-heading">
      <div>
        <div className="eyebrow"><span className="eyebrow-line"/> PÓS-ATENDIMENTO</div>
        <h1>Cuidado & <span>Retorno de Clientes.</span></h1>
        <p>Mantenha contato e garanta que o cliente volte a cada 15 a 20 dias.</p>
      </div>
    </div>

    <div className="panel orders-full" style={{background: '#0a0a0d', border: '1px solid #18181b'}}>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>NOME DO CLIENTE</th>
              <th>TELEFONE</th>
              <th>MENSAGEM DE PÓS-CORTE</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(c => (
              <tr key={c.id}>
                <td><strong>{c.name}</strong></td>
                <td>{c.phone}</td>
                <td>
                  <button className="primary-btn" onClick={() => sendSupportFollowup(c)} style={{background: '#1a1a24', color: '#25D366', border: '1px solid #25D366', fontSize: '12px', padding: '6px 12px'}}>
                    <MessageCircle size={14}/> Perguntar Satisfação (WhatsApp)
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
}

function CashPage({cashRegister, onNewTransaction}) {
  const totalEntries = cashRegister.entries.filter(e => e.type === 'in').reduce((a, b) => a + b.amount, 0);
  const totalExits = cashRegister.entries.filter(e => e.type === 'out').reduce((a, b) => a + b.amount, 0);
  const currentBalance = cashRegister.openingBalance + totalEntries - totalExits;

  return <div className="page-content">
    <div className="page-heading">
      <div>
        <div className="eyebrow"><span className="eyebrow-line"/> FLUXO DO BALCÃO</div>
        <h1>Caixa da <span>Barbearia.</span></h1>
        <p>Controle entradas de cortes, produtos, bebidas e despesas do dia.</p>
      </div>
      <button className="primary-btn" onClick={onNewTransaction} style={{background: '#25D366', color: '#000', fontWeight: 'bold'}}>
        <Plus size={17}/> Lançar no Caixa
      </button>
    </div>

    <div className="metrics-grid" style={{gridTemplateColumns: 'repeat(4, 1fr)'}}>
      <div className="metric-card" style={{background: '#0a0a0d', border: '1px solid #18181b'}}>
        <div className="metric-top"><span className="metric-period">ABERTURA</span></div>
        <div className="metric-value" style={{color: '#aaa'}}>R$ {cashRegister.openingBalance.toFixed(2)}</div>
        <div className="metric-label">Fundo de Troco</div>
      </div>
      <div className="metric-card" style={{background: '#0a0a0d', border: '1px solid #18181b'}}>
        <div className="metric-top"><span className="metric-period">ENTRADAS</span></div>
        <div className="metric-value" style={{color: '#25D366'}}>+ R$ {totalEntries.toFixed(2)}</div>
        <div className="metric-label">Cortes & Produtos</div>
      </div>
      <div className="metric-card" style={{background: '#0a0a0d', border: '1px solid #18181b'}}>
        <div className="metric-top"><span className="metric-period">SAÍDAS</span></div>
        <div className="metric-value" style={{color: '#ff4d4d'}}>- R$ {totalExits.toFixed(2)}</div>
        <div className="metric-label">Insumos & Despesas</div>
      </div>
      <div className="metric-card" style={{background: '#0a0a0d', border: '1px solid #18181b'}}>
        <div className="metric-top"><span className="metric-period">GAVETA</span></div>
        <div className="metric-value" style={{color: '#3b82f6'}}>R$ {currentBalance.toFixed(2)}</div>
        <div className="metric-label">Saldo em Dinheiro</div>
      </div>
    </div>

    <div className="panel orders-full" style={{background: '#0a0a0d', border: '1px solid #18181b', marginTop: '20px'}}>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>HORÁRIO</th>
              <th>DESCRIÇÃO</th>
              <th>RESPONSÁVEL</th>
              <th>VALOR</th>
            </tr>
          </thead>
          <tbody>
            {cashRegister.entries.map(item => (
              <tr key={item.id}>
                <td>{item.time}</td>
                <td><strong>{item.description}</strong></td>
                <td>{item.user}</td>
                <td><strong style={{color: item.type === 'in' ? '#25D366' : '#ff4d4d'}}>{item.type === 'in' ? '+' : '-'} R$ {item.amount.toFixed(2)}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
}

function InventoryPage({inventory, onNew, onUpdateQty, onDelete}) {
  return <div className="page-content">
    <div className="page-heading">
      <div>
        <div className="eyebrow"><span className="eyebrow-line"/> ESTOQUE & BAR</div>
        <h1>Produtos da <span>Barbearia.</span></h1>
        <p>Gerencie pomadas, óleos, lâminas, cervejas e itens de revenda.</p>
      </div>
      <button className="primary-btn" onClick={onNew}><Plus size={17}/> Novo Produto</button>
    </div>

    <div className="panel orders-full" style={{background: '#0a0a0d', border: '1px solid #18181b'}}>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>PRODUTO</th>
              <th>CATEGORIA</th>
              <th>PREÇO DE VENDA</th>
              <th>ESTOQUE</th>
              <th>AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map(item => (
              <tr key={item.id}>
                <td><strong>{item.name}</strong></td>
                <td><span className="status-pill neutral">{item.category}</span></td>
                <td><strong style={{color: '#25D366'}}>R$ {item.price}</strong></td>
                <td>
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <button className="secondary-btn" style={{padding: '2px 8px'}} onClick={() => onUpdateQty(item.id, -1)}>-</button>
                    <strong>{item.qty} un</strong>
                    <button className="secondary-btn" style={{padding: '2px 8px'}} onClick={() => onUpdateQty(item.id, 1)}>+</button>
                  </div>
                </td>
                <td><button className="icon-btn" onClick={() => onDelete(item.id)} style={{color: '#ff4d4d'}}><Trash2 size={16}/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
}

function ServicesMenuPage({services, onNewAppointment}) {
  return <div className="page-content">
    <div className="page-heading">
      <div>
        <div className="eyebrow"><span className="eyebrow-line"/> TABELA DE PREÇOS</div>
        <h1>Cardápio de <span>Serviços.</span></h1>
        <p>Serviços disponíveis na barbearia com duração e valores cadastrados.</p>
      </div>
      <button className="primary-btn" onClick={onNewAppointment}><Plus size={17}/> Agendar Cliente</button>
    </div>

    <div className="module-cards">
      {services.map(s => (
        <div className="module-card" key={s.name} style={{background: '#0d0d10', border: '1px solid #1a1a20'}}>
          <div className="module-card-top">
            <span className="status-pill green">• Ativo</span>
            <span style={{fontSize: '12px', color: '#888'}}>{s.duration}</span>
          </div>
          <div className="module-card-icon"><Scissors size={22} color="#25D366"/></div>
          <h3>{s.name}</h3>
          <div style={{fontSize: '20px', fontWeight: 'bold', color: '#25D366', margin: '10px 0'}}>R$ {s.defaultPrice}</div>
          <button className="primary-btn full-btn" onClick={onNewAppointment}>Agendar Horário →</button>
        </div>
      ))}
    </div>
  </div>
}

function ClientServicesPage({services, whatsapp, storeName}) {
  const bookViaWhatsapp = (s) => {
    const text = encodeURIComponent(`Olá ${storeName}! Gostaria de agendar um horário para o serviço: *${s.name}* (R$ ${s.defaultPrice}). Quais horários estão livres hoje?`);
    window.open(`https://wa.me/${whatsapp}?text=${text}`, '_blank');
  };

  return <div className="page-content">
    <div className="page-heading">
      <div>
        <div className="eyebrow"><span className="eyebrow-line"/> SERVIÇOS & PREÇOS</div>
        <h1>Tabela da <span>Barbearia.</span></h1>
        <p>Escolha o serviço desejado e reserve seu horário no WhatsApp.</p>
      </div>
    </div>

    <div className="module-cards">
      {services.map(s => (
        <div className="module-card" key={s.name} style={{background: '#0d0d10', border: '1px solid #1a1a20'}}>
          <div className="module-card-top">
            <span className="status-pill blue">{s.duration}</span>
          </div>
          <h3 style={{fontSize: '16px', marginTop: '10px'}}>{s.name}</h3>
          <div style={{fontSize: '22px', fontWeight: 'bold', color: '#25D366', margin: '10px 0'}}>R$ {s.defaultPrice}</div>
          <button className="primary-btn full-btn" onClick={() => bookViaWhatsapp(s)} style={{background: '#25D366', color: '#000', fontWeight: 'bold'}}>
            <MessageCircle size={16}/> Agendar no WhatsApp
          </button>
        </div>
      ))}
    </div>
  </div>
}

function FinancePage({orders, commissionRate, setCommissionRate}) {
  const totalRevenue = orders.reduce((acc, o) => acc + (parseFloat(o.amount.replace('R$', '').trim()) || 0), 0);
  const totalCosts = orders.reduce((acc, o) => acc + (parseFloat(o.costProduct) || 0), 0);
  const netProfit = totalRevenue - totalCosts;
  const barberCommissionTotal = (netProfit * (commissionRate / 100));

  return <div className="page-content">
    <div className="page-heading">
      <div>
        <div className="eyebrow"><span className="eyebrow-line"/> BALANÇO FINANCEIRO</div>
        <h1>Financeiro & <span>Comissão dos Barbeiros.</span></h1>
        <p>Acompanhe o faturamento bruto, custos de produtos e rateio das comissões.</p>
      </div>
    </div>

    <div className="metrics-grid" style={{gridTemplateColumns: 'repeat(4, 1fr)'}}>
      <div className="metric-card" style={{background: '#0a0a0d', border: '1px solid #18181b'}}>
        <div className="metric-top"><span className="metric-period">BRUTO</span></div>
        <div className="metric-value">R$ {totalRevenue.toFixed(2)}</div>
        <div className="metric-label">Faturamento Total</div>
      </div>
      <div className="metric-card" style={{background: '#0a0a0d', border: '1px solid #18181b'}}>
        <div className="metric-top"><span className="metric-period">CUSTOS</span></div>
        <div className="metric-value" style={{color: '#ff4d4d'}}>R$ {totalCosts.toFixed(2)}</div>
        <div className="metric-label">Insumos / Produtos</div>
      </div>
      <div className="metric-card" style={{background: '#0a0a0d', border: '1px solid #18181b'}}>
        <div className="metric-top"><span className="metric-period">LÍQUIDO</span></div>
        <div className="metric-value" style={{color: '#25D366'}}>R$ {netProfit.toFixed(2)}</div>
        <div className="metric-label">Lucro Líquido</div>
      </div>
      <div className="metric-card" style={{background: '#0a0a0d', border: '1px solid #18181b'}}>
        <div className="metric-top"><span className="metric-period">COMISSÃO</span></div>
        <div className="metric-value" style={{color: '#3b82f6'}}>R$ {barberCommissionTotal.toFixed(2)}</div>
        <div className="metric-label">Comissão Barbeiros ({commissionRate}%)</div>
      </div>
    </div>

    <div className="panel" style={{background: '#0a0a0d', border: '1px solid #18181b', padding: '20px', marginTop: '20px'}}>
      <h3>Porcentagem de Comissão dos Barbeiros</h3>
      <p className="muted">Calculada sobre o lucro líquido dos atendimentos da equipe.</p>
      <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px'}}>
        <input 
          type="number" 
          value={commissionRate} 
          onChange={e=>setCommissionRate(e.target.value)} 
          style={{background: '#111', color: '#fff', border: '1px solid #333', padding: '8px 12px', borderRadius: '6px', width: '100px'}}
        />
        <span>% de comissão por corte/serviço</span>
      </div>
    </div>
  </div>
}

function ClientInventoryPage({inventory, storeName, cart, addToCart, onOpenCart}) {
  const totalCartItems = cart.reduce((acc, item) => acc + item.cartQty, 0);

  return <div className="page-content">
    <div className="page-heading" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
      <div>
        <div className="eyebrow"><span className="eyebrow-line"/> PRODUTOS & BEBIDAS</div>
        <h1>Vitrine da <span>Barbearia.</span></h1>
        <p>Pomadas, óleos, balms e cervejas disponíveis na {storeName}.</p>
      </div>
      {totalCartItems > 0 && (
        <button className="primary-btn" onClick={onOpenCart} style={{background: '#25D366', color: '#000', fontWeight: 'bold'}}>
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
          <h3 style={{fontSize: '15px', marginTop: '10px'}}>{prod.name}</h3>
          <div style={{fontSize: '18px', fontWeight: 'bold', color: '#25D366', margin: '8px 0'}}>R$ {prod.price}</div>
          <button className="primary-btn full-btn" disabled={prod.qty <= 0} onClick={() => addToCart(prod)}>
            <ShoppingCart size={16}/> {prod.qty > 0 ? 'Adicionar ao Carrinho' : 'Indisponível'}
          </button>
        </div>
      ))}
    </div>
  </div>
}

function CartModal({cart, onClose, onUpdateQty, onClear, pixKey, storeName, storeAddress, whatsappNumber, notify}) {
  const [deliveryType, setDeliveryType] = useState('pickup');
  const [customerName, setCustomerName] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('pix');

  const cartTotal = cart.reduce((acc, item) => acc + (Number(item.price) * item.cartQty), 0);

  const copyPix = () => {
    navigator.clipboard.writeText(pixKey);
    notify('Chave Pix copiada com sucesso!');
  };

  const handleFinishOrder = () => {
    if (!customerName.trim()) { notify('Informe seu nome.'); return; }
    if (deliveryType === 'delivery' && !deliveryAddress.trim()) { notify('Informe o endereço de entrega.'); return; }

    const itemsSummary = cart.map(i => `• ${i.cartQty}x ${i.name} (R$ ${(Number(i.price) * i.cartQty).toFixed(2)})`).join('\n');
    const logistics = deliveryType === 'pickup' ? `📍 Retirada no balcão da barbearia (${storeAddress})` : `🛵 Entrega em: ${deliveryAddress}`;

    const message = encodeURIComponent(
      `🛍️ *PEDIDO DE PRODUTOS - ${storeName.toUpperCase()}*\n\n` +
      `👤 *Cliente:* ${customerName.trim()}\n` +
      `💰 *Total:* R$ ${cartTotal.toFixed(2)}\n` +
      `💳 *Pagamento:* ${paymentMethod === 'pix' ? 'Pix (Comprovante em anexo)' : 'Na retirada'}\n\n` +
      `📦 *Itens:*\n${itemsSummary}\n\n` +
      `${logistics}`
    );

    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
    onClear();
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()} style={{background: '#0f0f12', border: '1px solid #222', maxWidth: '480px'}}>
        <div className="modal-head"><div><div className="eyebrow">CARRINHO</div><h2>Finalizar Pedido</h2></div><button type="button" className="icon-btn" onClick={onClose}><X size={19}/></button></div>

        {cart.length === 0 ? <p className="muted">Carrinho vazio.</p> : (
          <div>
            <div style={{maxHeight: '160px', overflowY: 'auto', marginBottom: '15px'}}>
              {cart.map(item => (
                <div key={item.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '6px 0'}}>
                  <span>{item.name}</span>
                  <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                    <button className="secondary-btn" style={{padding: '2px 6px'}} onClick={()=>onUpdateQty(item.id, -1)}>-</button>
                    <strong>{item.cartQty}</strong>
                    <button className="secondary-btn" style={{padding: '2px 6px'}} onClick={()=>onUpdateQty(item.id, 1)}>+</button>
                    <span style={{color: '#25D366'}}>R$ {(Number(item.price) * item.cartQty).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 'bold', margin: '10px 0'}}>
              <span>Total:</span><span style={{color: '#25D366'}}>R$ {cartTotal.toFixed(2)}</span>
            </div>

            <label>Seu Nome<input value={customerName} onChange={e=>setCustomerName(e.target.value)} placeholder="Ex: Felipe Silva" required/></label>

            <div style={{display: 'flex', gap: '8px', margin: '10px 0'}}>
              <button type="button" className={`secondary-btn ${deliveryType==='pickup'?'primary-btn':''}`} style={{flex: 1}} onClick={()=>setDeliveryType('pickup')}><Store size={14}/> Retirar na Barbearia</button>
              <button type="button" className={`secondary-btn ${deliveryType==='delivery'?'primary-btn':''}`} style={{flex: 1}} onClick={()=>setDeliveryType('delivery')}><Truck size={14}/> Delivery</button>
            </div>

            {deliveryType === 'delivery' && <label>Endereço de Entrega<input value={deliveryAddress} onChange={e=>setDeliveryAddress(e.target.value)} placeholder="Rua, Número, Bairro"/></label>}

            {paymentMethod === 'pix' && (
              <div style={{background: '#000', padding: '12px', borderRadius: '10px', border: '1px solid #333', textAlign: 'center', margin: '10px 0'}}>
                <QrCode size={80} color="#25D366" style={{margin: '0 auto 6px', display: 'block'}} />
                <span style={{fontSize: '11px', color: '#aaa'}}>Chave Pix da Barbearia:</span>
                <div style={{fontSize: '13px', fontWeight: 'bold', color: '#fff'}}>{pixKey}</div>
                <button type="button" onClick={copyPix} className="secondary-btn" style={{fontSize: '11px', margin: '6px auto 0'}}><Copy size={12}/> Copiar Pix</button>
              </div>
            )}

            <button type="button" className="primary-btn full-btn" onClick={handleFinishOrder} style={{background: '#25D366', color: '#000', fontWeight: 'bold'}}>
              <MessageCircle size={18}/> Enviar Pedido no WhatsApp da Barbearia
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
        <div className="eyebrow"><span className="eyebrow-line"/> PORTAL DE BARBEARIAS</div>
        <h1>Barbearias <span>Ativas.</span></h1>
        <p>Agende seu horário com os melhores barbeiros da sua região.</p>
      </div>
    </div>

    <div className="module-cards">
      {stores.map(store => (
        <div className="module-card" key={store.id} style={{background: '#0d0d10', border: '1px solid #1a1a20'}}>
          <div className="module-card-top">
            <span className="status-pill green">• Barbearia Aberta</span>
            <span style={{color: '#eab308', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '12px'}}>
              <Star size={13} fill="#eab308"/> {store.rating} ({store.reviewsCount})
            </span>
          </div>
          <div className="module-card-icon"><Scissors size={22} color="#25D366"/></div>
          <h3>{store.name}</h3>
          <p style={{fontSize: '12px', color: '#aaa'}}>{store.address}</p>
          <p>{store.desc}</p>
          <div style={{display: 'flex', gap: '8px', marginTop: '15px'}}>
            <button className="primary-btn full-btn" onClick={() => onSelectStore(store)}>Ver Serviços & Agendar →</button>
          </div>
        </div>
      ))}
    </div>
  </div>
}

function TrackPage({orders, storeName, pixKey, whatsapp, storeAddress, mapsUrl, notify}) {
  const [trackQuery, setTrackQuery] = useState('');
  const [foundOs, setFoundOs] = useState(null);

  const handleSearchOs = (e) => {
    e.preventDefault();
    const result = orders.find(o => o.id.toLowerCase() === trackQuery.trim().toLowerCase());
    setFoundOs(result || 'NOT_FOUND');
  };

  return <div className="page-content">
    <div className="page-heading">
      <div>
        <div className="eyebrow"><span className="eyebrow-line"/> CONSULTA DE AGENDAMENTO</div>
        <h1>Consultar <span>Horário.</span></h1>
        <p>Digite o código da comanda para verificar o status do seu corte.</p>
      </div>
    </div>

    <div className="panel" style={{background: '#0a0a0d', border: '1px solid #18181b', padding: '24px', maxWidth: '540px', margin: '0 auto'}}>
      <form onSubmit={handleSearchOs} style={{display: 'flex', gap: '10px'}}>
        <input value={trackQuery} onChange={e=>setTrackQuery(e.target.value)} placeholder="Ex: CMD-1048" required style={{flex: 1, background: '#111', color: '#fff', border: '1px solid #333', padding: '10px', borderRadius: '8px'}}/>
        <button className="primary-btn" type="submit"><Search size={18}/> Buscar</button>
      </form>

      {foundOs && foundOs !== 'NOT_FOUND' && (
        <div style={{marginTop: '20px', background: '#121215', padding: '16px', borderRadius: '10px', border: '1px solid #222'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <strong>{foundOs.id}</strong>
            <span className={`status-pill ${foundOs.color}`}>{foundOs.status}</span>
          </div>
          <p style={{margin: '6px 0'}}><strong>Cliente:</strong> {foundOs.customer}</p>
          <p style={{margin: '6px 0'}}><strong>Serviço:</strong> {foundOs.service}</p>
          <p style={{margin: '6px 0'}}><strong>Barbeiro:</strong> {foundOs.barberName}</p>
          <p style={{margin: '6px 0'}}><strong>Valor:</strong> <span style={{color: '#25D366'}}>{foundOs.amount}</span></p>

          <a href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(`Olá! Gostaria de confirmar meu horário da comanda ${foundOs.id} (${foundOs.service}) na${storeName}`)}`} target="_blank" rel="noreferrer" className="primary-btn full-btn" style={{marginTop: '15px', background: '#25D366', color: '#000', textDecoration: 'none', textAlign: 'center'}}>
            <MessageCircle size={16}/> Falar com a Barbearia no WhatsApp
          </a>
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
        <h1>Configuração <span>Pix da Barbearia.</span></h1>
        <p>Defina a sua chave Pix para receber pagamentos de cortes e cervejas.</p>
      </div>
      <button className="primary-btn" onClick={onShowPayModal} style={{background: '#25D366', color: '#000', fontWeight: 'bold'}}>
        <QrCode size={17}/> Renovação da Assinatura (R$ 50,00)
      </button>
    </div>

    <section className="panel settings-panel" style={{background: '#0a0a0d', border: '1px solid #18181b'}}>
      <div className="settings-row">
        <span>Sua Chave Pix para Receber dos Clientes</span>
        <input value={pixKey} onChange={e=>setPixKey(e.target.value)} placeholder="CNPJ, Telefone, E-mail ou CPF" style={{background: '#111', color: '#fff', border: '1px solid #333', padding: '8px 12px', borderRadius: '6px', width: '250px'}}/>
      </div>
    </section>
  </div>
}

function SettingsPage({configured,email,storeName,setStoreName,storeLogo,onLogoUpload,whatsapp,setWhatsapp,pixKey,setPixKey,storeAddress,setStoreAddress,mapsUrl,setMapsUrl,modules,setModules,onLogout,teamMembers,onInviteMember,auditLogs,userAccessLevel,isLifetimeAdmin}) {
  return <div className="page-content">
    <div className="page-heading">
      <div>
        <div className="eyebrow"><span className="eyebrow-line"/> SISTEMA</div>
        <h1>Configurações da <span>Barbearia.</span></h1>
        <p>Ajuste dados comerciais, localização, equipe de barbeiros e módulos ativos.</p>
      </div>
    </div>

    <div className="settings-grid">
      {userAccessLevel === 'owner' && (
        <section className="panel settings-panel" style={{background: '#0a0a0d', border: '1px solid #18181b', gridColumn: '1 / -1'}}>
          <div className="settings-title">
            <div className="settings-icon"><Users size={19}/></div>
            <div><h3>Equipe de Barbeiros</h3><p>Toda a sua equipe usando a mesma barbearia sem pagar nada a mais</p></div>
            <button className="primary-btn" onClick={onInviteMember} style={{fontSize: '12px', padding: '6px 12px'}}><UserPlus size={15}/> Adicionar Barbeiro</button>
          </div>
          <div className="table-wrap" style={{marginTop: '15px'}}>
            <table>
              <thead>
                <tr><th>NOME</th><th>E-MAIL</th><th>CARGO</th><th>STATUS</th></tr>
              </thead>
              <tbody>
                {teamMembers.map(m => (
                  <tr key={m.id}>
                    <td><strong>{m.name}</strong></td>
                    <td>{m.email}</td>
                    <td><span className={`status-pill ${m.role==='owner'?'green':'blue'}`}>{m.role==='owner'?'Proprietário':'Barbeiro'}</span></td>
                    <td><span className="status-pill green">• {m.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="panel settings-panel" style={{background: '#0a0a0d', border: '1px solid #18181b'}}>
        <div className="settings-title"><div className="settings-icon"><Store size={19}/></div><div><h3>Dados da Barbearia</h3><p>Informações exibidas aos clientes</p></div></div>
        <div className="settings-row"><span>Nome da Barbearia</span><input value={storeName} onChange={e=>setStoreName(e.target.value)} style={{background: '#111', color: '#fff', border: '1px solid #333', padding: '6px 10px', borderRadius: '6px'}}/></div>
        <div className="settings-row"><span>Endereço Físico</span><input value={storeAddress} onChange={e=>setStoreAddress(e.target.value)} style={{background: '#111', color: '#fff', border: '1px solid #333', padding: '6px 10px', borderRadius: '6px'}}/></div>
        <div className="settings-row"><span>WhatsApp da Barbearia</span><input value={whatsapp} onChange={e=>setWhatsapp(e.target.value)} style={{background: '#111', color: '#fff', border: '1px solid #333', padding: '6px 10px', borderRadius: '6px'}}/></div>
      </section>

      <section className="panel settings-panel" style={{background: '#0a0a0d', border: '1px solid #18181b'}}>
        <div className="settings-title"><div className="settings-icon"><ShieldCheck size={19}/></div><div><h3>Licença da Barbearia</h3><p>Gestão do plano RT Systems</p></div></div>
        <div className="settings-row"><span>Status</span><strong style={{color: '#25D366'}}>{isLifetimeAdmin ? '👑 Licença Vitalícia' : 'Plano Barbearia (R$ 50/mês)'}</strong></div>
        <div className="settings-row"><span>E-mail</span><strong>{email || 'Conectado'}</strong></div>
        {email && <button className="secondary-btn logout-btn" onClick={onLogout} style={{marginTop: '15px'}}><LogOut size={16}/> Sair da conta</button>}
      </section>
    </div>
  </div>
}

export default App;