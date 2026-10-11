import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity, ArrowUpRight, Bell, Camera, Check, ChevronDown, CircleHelp,
  ClipboardList, Clock3, CreditCard, Gauge, LogOut, Menu, MessageCircle,
  Plus, RefreshCw, Search, Settings, ShieldCheck, Smartphone, Sparkles, Store, Users, Wrench, X, Upload, PhoneCall, QrCode, Package, Sliders, Trash2, CheckSquare, Printer, Star, DollarSign, Send, Calendar, Clock, Lock, UserPlus, AlertTriangle, History, Wallet, MapPin, Copy, FileText, HeartHandshake, Key
} from 'lucide-react';
import { supabase, supabaseConfigured } from './lib/supabase';

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

function App() {
  const [userRole, setUserRole] = useState('tech');
  const [userAccessLevel, setUserAccessLevel] = useState('owner');
  const [active, setActive] = useState('overview');
  
  const [modules, setModules] = useState({
    orders: true,     
    iphones: true,    
    inventory: true,  
    finance: true,
    cashRegister: true,
    crm: true,
  });

  const [trialTimeLeft, setTrialTimeLeft] = useState(48);
  const [isTrialActive, setIsTrialActive] = useState(true);

  // Configurações da Loja
  const [storeName, setStoreName] = useState('RT Assistência');
  const [storeLogo, setStoreLogo] = useState(null);
  const [whatsappNumber, setWhatsappNumber] = useState('5591999998888');
  const [pixKey, setPixKey] = useState('91989117332');
  const [storeAddress, setStoreAddress] = useState('Av. Principal, 1000 - Centro, Ananindeua - PA');
  const [mapsUrl, setMapsUrl] = useState('https://maps.google.com');
  const [techCommissionRate, setTechCommissionRate] = useState(10);

  // Caixa da Loja
  const [cashRegister, setCashRegister] = useState({
    isOpen: true,
    openingBalance: 100.00,
    entries: [
      { id: '1', type: 'in', description: 'Troca de Tela - OS-2048', amount: 450.00, time: '14:20', user: 'Atendimento Balcão' },
      { id: '2', type: 'out', description: 'Sangria - Pagamento Motoboy Peças', amount: 30.00, time: '15:10', user: 'Atendimento Balcão' }
    ]
  });

  // Equipa
  const [teamMembers, setTeamMembers] = useState([
    { id: '1', name: 'Robert (Dono)', email: 'robert@sualoja.com', role: 'owner', status: 'Ativo' },
    { id: '2', name: 'João Técnico', email: 'joao.bancada@sualoja.com', role: 'technician', status: 'Ativo' }
  ]);

  // Registos de Auditoria
  const [auditLogs, setAuditLogs] = useState([
    { id: '1', action: 'Criou OS-2048 (iPhone 13)', user: 'João Técnico', time: '10/10/2026 14:15' },
    { id: '2', action: 'Alterou status OS-2048 para "Pronto para retirada"', user: 'João Técnico', time: '10/10/2026 15:30' }
  ]);

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

  const [orders, setOrders] = useState([
    {
      rawId: '1',
      id: 'OS-2048',
      customer: 'Carlos Eduardo',
      phone: '5591999998888',
      device: 'iPhone 13',
      devicePassword: '1234 (Padrão)',
      issue: 'Troca de Tela Frontal',
      status: 'Pronto para retirada',
      amount: 'R$ 450.00',
      partCost: '180.00',
      time: '10/10/2026',
      createdAt: new Date().toISOString(),
      warrantyDays: 90,
      color: 'green',
      checklist: { ...defaultChecklist },
      rating: 5,
      review: 'Ótimo atendimento e serviço rápido!'
    }
  ]);

  const [customers, setCustomers] = useState([
    { id: '1', name: 'Carlos Eduardo', phone: '5591999998888', email: 'carlos@email.com', created_at: '2025-11-10T10:00:00.000Z', lastServiceDate: '2025-11-10', device: 'iPhone 13' },
    { id: '2', name: 'Maria Fernanda', phone: '5591988887777', email: 'maria@email.com', created_at: '2026-01-15T10:00:00.000Z', lastServiceDate: '2026-01-15', device: 'iPhone 12' },
  ]);

  const [inventory, setInventory] = useState([
    { id: '1', name: 'Fonte Carregador 20W Apple', category: 'Carregadores', price: '89.90', qty: 15, photo: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=300&auto=format&fit=crop&q=80' },
    { id: '2', name: 'Cabo USB-C para Lightning 1m', category: 'Carregadores', price: '49.90', qty: 20, photo: null },
    { id: '3', name: 'Capa MagSafe Transparente iPhone 13/14', category: 'Capas', price: '59.90', qty: 2, photo: null },
    { id: '4', name: 'Película 3D Vidro Temperado', category: 'Películas', price: '29.90', qty: 30, photo: null },
  ]);

  const [allStores, setAllStores] = useState([
    { id: '1', name: 'RT Assistência', phone: '5591999998888', status: 'active', desc: 'Especialista Apple, Xiaomi & Multimarcas', address: 'Av. Principal, 1000 - Ananindeua', rating: 4.9, reviewsCount: 18 },
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
  
  const [toast, setToast] = useState('');
  const [mobileNav, setMobileNav] = useState(false);
  const [session, setSession] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [saving, setSaving] = useState(false);
  
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeStep, setUpgradeStep] = useState(1);
  const [currentDevice, setCurrentDevice] = useState('');
  const [targetDevice, setTargetDevice] = useState(seminovosList[0]);
  const [capturedPhoto, setCapturedPhoto] = useState(null);

  const [cashTx, setCashTx] = useState({ type: 'in', description: '', amount: '' });
  const [newMember, setNewMember] = useState({ name: '', email: '', role: 'technician' });

  const [newOrder, setNewOrder] = useState({ 
    customer: '', device: 'iPhone 13', devicePassword: '', issue: '', phone: '', status: 'Recebido', amount: '', partCost: '0.00', warrantyDays: 90,
    checklist: { ...defaultChecklist }
  });
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '' });
  const [newProduct, setNewProduct] = useState({ name: '', category: 'Capas', price: '', qty: '1', photo: null });

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
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => listener.subscription.unsubscribe();
  }, []);

  const fetchData = async () => {
    if (!supabaseConfigured || !session) return;
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
          devicePassword: newOrder.devicePassword.trim() || 'Sem Senha',
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
      setNewOrder({ customer: '', device: 'iPhone 13', devicePassword: '', issue: '', phone: '', status: 'Recebido', amount: '', partCost: '0.00', warrantyDays: 90, checklist: { ...defaultChecklist } });
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
      photo: newProduct.photo
    };
    setInventory(prev => [item, ...prev]);
    addAuditLog(`Adicionou ${item.name} ao estoque`);
    setShowNewProduct(false);
    setNewProduct({ name: '', category: 'Capas', price: '', qty: '1', photo: null });
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
    addAuditLog(`Adicionou o técnico/atendente ${newMember.name} à equipe`);
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

  const handlePhotoCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedPhoto(reader.result);
        setUpgradeStep(2);
      };
      reader.readAsDataURL(file);
    }
  };

  const finishUpgradeToWhatsapp = () => {
    const text = encodeURIComponent(`Olá! Gostaria de fazer um UPGRADE do meu aparelho na ${storeName}.\n\n📱 Meu aparelho atual: ${currentDevice || 'Não especificado'}\n🎯 Desejo pegar o: ${targetDevice}\n\nPodemos avaliar a diferença de valores?`);
    window.open(`https://wa.me/${whatsappNumber}?text=${text}`, '_blank');
    setShowUpgradeModal(false);
    setUpgradeStep(1);
    setCapturedPhoto(null);
    setCurrentDevice('');
  };

  const shareOsStatusWhatsapp = (order) => {
    let msg = '';
    if (order.status === 'Recebido') msg = `Olá ${order.customer}! Seu ${order.device} foi recebido em nossa assistência (${storeName}). Código para acompanhar: ${order.id}`;
    else if (order.status === 'Em manutenção') msg = `Olá ${order.customer}! Seu ${order.device} (${order.id}) já entrou em bancada de testes e reparo na ${storeName}.`;
    else if (order.status === 'Pronto para retirada') msg = `Oba ${order.customer}! Seu ${order.device} (${order.id}) está PRONTO para retirada na ${storeName}! Valor: ${order.amount}`;
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
    setActive('stores_directory');
  }

  if (!authChecked) return <div className="loading-screen" style={{background: '#050505'}}><div className="brand-mark"><Smartphone size={22}/></div><span>Iniciando ambiente seguro...</span></div>;
  
  if (supabaseConfigured && !session) return (
    <div className="auth-shell" style={{background: '#050505'}}>
      <div className="auth-visual">
        <div className="auth-orb orb-one"></div><div className="auth-orb orb-two"></div>
        <div className="auth-brand"><div className="brand-mark">{storeLogo ? <img src={storeLogo} alt="Logo" style={{width: '100%', height: '100%', borderRadius: '6px', objectFit: 'cover'}}/> : <Smartphone size={23}/>}</div><span>RT MOBILE<span className="brand-light"> / SYSTEMS</span></span></div>
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
      <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`} style={{background: '#0a0a0c', borderRight: '1px solid #18181b'}}>
        <div className="brand-lockup">
          <div className="brand-mark" style={{background: '#18181b', width: '38px', height: '38px', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            {storeLogo ? (
              <img src={storeLogo} alt="Logo do estabelecimento" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
            ) : (
              <Smartphone size={22}/>
            )}
          </div>
          <div>
            <div className="brand-name" style={{fontSize: '15px', fontWeight: 'bold'}}>{userRole === 'tech' ? storeName : 'RT Mobile'}</div>
            <div className="brand-sub" style={{color: '#666', fontSize: '10px'}}>{userRole === 'tech' ? 'PAINEL DO ESTABELECIMENTO' : 'PORTAL DO CLIENTE'}</div>
          </div>
          <button className="mobile-close icon-btn" onClick={()=>setMobileNav(false)}><X size={18}/></button>
        </div>
        
        {userRole === 'tech' && (
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

        <div 
          className="workspace-switch" 
          onClick={() => {
            const nextRole = userRole === 'tech' ? 'client' : 'tech';
            setUserRole(nextRole);
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
            <span style={{color: '#25D366'}}>Clique para alternar ⚡</span>
          </div>
          <ChevronDown size={15}/>
        </div>
        
        <div className="nav-caption">NAVEGAÇÃO</div>
        <nav>{activeNav.map(item => <button key={item.id} className={`nav-item ${active===item.id?'active':''}`} onClick={()=>{setActive(item.id);setMobileNav(false)}}><item.icon size={18}/><span>{item.label}</span>{item.id==='orders' && <span className="nav-count">{orders.length}</span>}{item.id==='customers' && <span className="nav-count">{customers.length}</span>}{item.id==='inventory' && <span className="nav-count">{inventory.length}</span>}</button>)}</nav>
        
        <div className="sidebar-bottom">
          <div className="plan-card" style={{background: '#111', border: '1px solid #222'}}>
            <div className="plan-icon"><Sparkles size={16}/></div>
            <strong>RT Mobile OS</strong>
            <p>Seu estabelecimento organizado e produtivo.</p>
            <div className="plan-progress"><span/></div>
            <small style={{color: '#25D366'}}>• {isTrialActive ? `Teste Grátis (${trialTimeLeft}h restantes)` : 'Plano Profissional Ativo'}</small>
          </div>
          <button className="profile-row" onClick={()=>setActive('settings')} style={{background: '#121215'}}>
            <div className="profile-avatar">{storeName.slice(0, 1).toUpperCase()}</div>
            <div className="profile-info">
              <strong>{userAccessLevel === 'owner' ? 'Dono (Admin)' : 'Operador'}</strong>
              <span>{session?.user?.email || 'Modo de demonstração'}</span>
            </div>
            <MoreDots/>
          </button>
        </div>
      </aside>
      
      {mobileNav && <div className="nav-overlay" onClick={()=>setMobileNav(false)} />}
      
      <main className="main-area" style={{background: '#08080a'}}>
        {userRole === 'tech' && isTrialActive && (
          <div style={{background: 'linear-gradient(90deg, #1e3a8a, #0284c7)', color: '#fff', padding: '8px 16px', fontSize: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '500'}}>
            <span style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
              <Clock size={15}/> ⏳ PERÍODO DE TESTE GRÁTIS ATIVO: Você tem <strong>{trialTimeLeft} horas restantes</strong> para usar todas as funções!
            </span>
            <button onClick={()=>setShowPaymentModal(true)} style={{background: '#fff', color: '#000', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px'}}>
              Ativar R$ 50/mês
            </button>
          </div>
        )}

        <header className="topbar" style={{background: '#0a0a0c', borderBottom: '1px solid #18181b'}}>
          <div className="topbar-left">
            <button className="icon-btn menu-trigger" onClick={()=>setMobileNav(true)}><Menu size={20}/></button>
            <div className="breadcrumb">{storeName} <span>/</span> <strong>{activeNav.find(n=>n.id===active)?.label || 'Visão geral'}</strong></div>
          </div>
          <div className="topbar-actions">
            <div className="system-status"><span className="status-dot" style={{background: '#25D366'}}/> RT Mobile v1.0</div>
            <button className="icon-btn notification-btn" onClick={()=>notify('Você está em dia.')}><Bell size={18}/><i/></button>
            <button className="top-avatar" onClick={()=>setActive('settings')}>
              {storeName.slice(0, 1).toUpperCase()}
            </button>
          </div>
        </header>
        
        {active==='overview' && <Overview orders={orders} storeName={storeName} onNew={()=>setShowNewOrder(true)} onNavigate={setActive} modules={modules} inventory={inventory} />}
        {active==='orders' && <OrdersPage orders={filteredOrders} search={search} setSearch={setSearch} onNew={()=>setShowNewOrder(true)} onStatus={handleUpdateStatus} onShare={shareOsStatusWhatsapp} onSendWarranty={sendWarrantyTermWhatsapp} onOpenChecklist={(o) => setShowChecklistModal(o)} onPrint={(o) => setShowPrintModal(o)} onPellicleReminder={sendPellicleReminder} />}
        {active==='customers' && <CustomersPage customers={customers} onNew={()=>setShowNewCustomer(true)} />}
        {active==='crm' && <CrmPage customers={customers} storeName={storeName} whatsapp={whatsappNumber} />}
        {active==='cash' && <CashPage cashRegister={cashRegister} onNewTransaction={() => setShowCashTransactionModal(true)} />}
        {active==='inventory' && <InventoryPage inventory={inventory} onNew={()=>setShowNewProduct(true)} onUpdateQty={updateProductQty} onDelete={deleteProduct} />}
        {active==='client_inventory' && <ClientInventoryPage inventory={inventory} whatsapp={whatsappNumber} storeName={storeName} />}
        {active==='stores_directory' && <StoresDirectoryPage stores={activeStores} onSelectStore={(s) => { setStoreName(s.name); setWhatsappNumber(s.phone); notify(`Estabelecimento "${s.name}" selecionado!`); setActive('store'); }} onRequestQuote={(s) => setShowQuoteModal(s)} />}
        {active==='store' && <StorePage whatsapp={whatsappNumber} storeName={storeName} onUpgrade={() => setShowUpgradeModal(true)} />}
        {active==='track' && <TrackPage orders={orders} storeName={storeName} pixKey={pixKey} whatsapp={whatsappNumber} storeAddress={storeAddress} mapsUrl={mapsUrl} setOrders={setOrders} notify={notify} />}
        {active==='finance' && userAccessLevel === 'owner' && <FinancePage orders={orders} commissionRate={techCommissionRate} setCommissionRate={setTechCommissionRate} />}
        {active==='payments' && <PaymentsPage pixKey={pixKey} setPixKey={setPixKey} onShowPayModal={() => setShowPaymentModal(true)} />}
        {active==='settings' && <SettingsPage configured={supabaseConfigured} email={session?.user?.email} storeName={storeName} setStoreName={setStoreName} storeLogo={storeLogo} onLogoUpload={handleLogoUpload} whatsapp={whatsappNumber} setWhatsapp={setWhatsappNumber} pixKey={pixKey} setPixKey={setPixKey} storeAddress={storeAddress} setStoreAddress={setStoreAddress} mapsUrl={mapsUrl} setMapsUrl={setMapsUrl} modules={modules} setModules={setModules} onLogout={logout} teamMembers={teamMembers} onInviteMember={() => setShowInviteMemberModal(true)} auditLogs={auditLogs} userAccessLevel={userAccessLevel} />}
        
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
      </main>

      {/* MODAL LANÇAMENTO NO CAIXA DA LOJA */}
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

      {/* MODAL CONVIDAR MEMBRO */}
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

      {/* IMPRESSÃO DE COMPROVANTE TÉRMICO */}
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
              <p style={{margin: '4px 0', background: '#eee', padding: '2px 4px', borderRadius: '3px'}}><strong>🔑 SENHA:</strong> {showPrintModal.devicePassword || 'Sem Senha'}</p>
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

      {/* MODAL PEDIR ORÇAMENTO */}
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

      {/* MODAL DE CHECKLIST */}
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

            <div className="form-grid">
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

      {showUpgradeModal && <div className="modal-backdrop" onClick={()=>setShowUpgradeModal(false)}><div className="modal" onClick={e=>e.stopPropagation()} style={{background: '#0f0f12', border: '1px solid #222'}}><div className="modal-head"><div><div className="eyebrow">AVALIAÇÃO DE UPGRADE</div><h2>Troque de Aparelho</h2></div><button type="button" className="icon-btn" onClick={()=>setShowUpgradeModal(false)}><X size={19}/></button></div>
        {upgradeStep === 1 ? (
          <div>
            <p className="muted">Informe o seu modelo atual e tire uma foto do estado do aparelho.</p>
            <label style={{marginTop: '10px'}}>Modelo atual
              <input value={currentDevice} onChange={e=>setCurrentDevice(e.target.value)} placeholder="Ex: iPhone 13 Pro Max ou Xiaomi Note 13" required />
            </label>
            <div style={{marginTop: '15px', textAlign: 'center'}}>
              <label className="primary-btn full-btn" style={{cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', background: '#1a1a20', border: '1px solid #333'}}>
                <Camera size={18}/> Tirar foto do aparelho
              </label>
              <button className="text-btn" style={{marginTop: '10px', color: '#888'}} onClick={()=>setUpgradeStep(2)}>Pular foto e escolher novo modelo →</button>
            </div>
          </div>
        ) : (
          <div>
            {capturedPhoto && <div style={{textAlign: 'center', marginBottom: '15px'}}><img src={capturedPhoto} alt="Aparelho atual" style={{maxHeight: '120px', borderRadius: '8px', border: '1px solid #333'}}/></div>}
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
            <div className="modal-foot" style={{marginTop: '20px'}}>
              <button type="button" className="secondary-btn" onClick={()=>setUpgradeStep(1)}>Voltar</button>
              <button type="button" className="primary-btn" onClick={finishUpgradeToWhatsapp} style={{background: '#25D366', color: '#000', fontWeight: 'bold'}}><MessageCircle size={16}/> Enviar Proposta no WhatsApp da Loja</button>
            </div>
          </div>
        )}
      </div></div>}

      {showNewOrder && <div className="modal-backdrop" onClick={()=>setShowNewOrder(false)}><form className="modal" onClick={e=>e.stopPropagation()} onSubmit={handleCreateOrder} style={{background: '#0f0f12', border: '1px solid #222'}}><div className="modal-head"><div><div className="eyebrow">NOVA ENTRADA</div><h2>Criar ordem de serviço</h2></div><button type="button" className="icon-btn" onClick={()=>setShowNewOrder(false)}><X size={19}/></button></div><p className="muted">Registre os dados principais e a senha do aparelho para os testes.</p>
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
      <div className="form-grid">
        <label style={{color: '#f59e0b', fontWeight: 'bold'}}>🔑 Senha do Aparelho / Padrão
          <input value={newOrder.devicePassword} onChange={e=>setNewOrder({...newOrder,devicePassword:e.target.value})} placeholder="Ex: 123456 ou L (Desenho)" />
        </label>
        <label>Garantia (Dias)
          <select value={newOrder.warrantyDays} onChange={e=>setNewOrder({...newOrder,warrantyDays:e.target.value})}>
            <option value="30">30 Dias</option>
            <option value="90">90 Dias (3 Meses)</option>
            <option value="180">180 Dias (6 Meses)</option>
            <option value="365">365 Dias (1 Ano)</option>
          </select>
        </label>
      </div>
      <div className="form-grid">
        <label>Valor cobrado (R$)<input type="number" step="0.01" value={newOrder.amount} onChange={e=>setNewOrder({...newOrder,amount:e.target.value})} placeholder="0,00"/></label>
        <label>Custo da Peça (R$)<input type="number" step="0.01" value={newOrder.partCost} onChange={e=>setNewOrder({...newOrder,partCost:e.target.value})} placeholder="0,00"/></label>
      </div>
      <div className="form-grid">
        <label>Status inicial
          <select value={newOrder.status} onChange={e=>setNewOrder({...newOrder,status:e.target.value})}>
            {['Recebido','Em diagnóstico','Aguardando aprovação','Aguardando peça','Em manutenção','Pronto para retirada','Entregue'].map(s=><option key={s}>{s}</option>)}
          </select>
        </label>
      </div>
      <label>Defeito informado<textarea value={newOrder.issue} onChange={e=>setNewOrder({...newOrder,issue:e.target.value})} placeholder="Descreva o problema relatado..." rows="2" required/></label>
      <div className="modal-foot"><button type="button" className="secondary-btn" onClick={()=>setShowNewOrder(false)}>Cancelar</button><button className="primary-btn" disabled={saving}>{saving?'Salvando...':'Salvar OS & Vistoria'}<ArrowUpRight size={16}/></button></div></form></div>}

      {showNewCustomer && <div className="modal-backdrop" onClick={()=>setShowNewCustomer(false)}><form className="modal" onClick={e=>e.stopPropagation()} onSubmit={handleCreateCustomer} style={{background: '#0f0f12', border: '1px solid #222'}}><div className="modal-head"><div><div className="eyebrow">NOVO CADASTRO</div><h2>Cadastrar cliente</h2></div><button type="button" className="icon-btn" onClick={()=>setShowNewCustomer(false)}><X size={19}/></button></div><p className="muted">Adicione os dados de contato do cliente.</p><label>Nome completo<input value={newCustomer.name} onChange={e=>setNewCustomer({...newCustomer,name:e.target.value})} placeholder="Nome do cliente" required/></label><div className="form-grid"><label>Telefone / WhatsApp<input value={newCustomer.phone} onChange={e=>setNewCustomer({...newCustomer,phone:e.target.value})} placeholder="(91) 99999-9999"/></label><label>E-mail<input type="email" value={newCustomer.email} onChange={e=>setNewCustomer({...newCustomer,email:e.target.value})} placeholder="cliente@email.com"/></label></div><div className="modal-foot"><button type="button" className="secondary-btn" onClick={()=>setShowNewCustomer(false)}>Cancelar</button><button className="primary-btn" disabled={saving}>{saving?'Salvando...':'Salvar cliente'}<ArrowUpRight size={16}/></button></div></form></div>}

      {toast && <div className="toast"><Check size={17}/>{toast}</div>}
    </div>
  );
}

function MoreDots(){return <span className="more-dots">•••</span>}

function Overview({orders,storeName,onNew,onNavigate,modules,inventory}) {
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

    <div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-line"/> PAINEL DE CONTROLE <span className="heading-date">/ HOJE</span></div><h1>Bem-vindo, <span>{storeName}.</span></h1><p>Veja o resumo de atendimentos, estoque e vendas de hoje.</p></div>{modules.orders && <button className="primary-btn" onClick={onNew}><Plus size={17}/> Nova ordem de serviço</button>}</div>
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

function OrdersPage({orders,search,setSearch,onNew,onStatus,onShare,onSendWarranty,onOpenChecklist,onPrint,onPellicleReminder}) {
  return <div className="page-content"><div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-line"/> OPERAÇÃO</div><h1>Ordens de <span>serviço.</span></h1><p>Registre entradas e acompanhe cada atendimento do início à entrega.</p></div><button className="primary-btn" onClick={onNew}><Plus size={17}/> Nova ordem</button></div><div className="list-toolbar"><div className="search-box"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar por cliente, aparelho ou ordem..."/></div><div className="toolbar-count">{orders.length} registros</div></div><div className="panel orders-full" style={{background: '#0a0a0d', border: '1px solid #18181b'}}><div className="table-wrap"><table><thead><tr><th>ORDEM / CLIENTE</th><th>APARELHO / DEFEITO</th><th>SENHA DO APARELHO</th><th>STATUS DO ATENDIMENTO</th><th>VISTORIA</th><th>AÇÕES / DISPAROS</th></tr></thead><tbody>{orders.map(o=><tr key={o.id}><td><div className="order-id">{o.id}</div><div className="cell-sub">{o.customer}</div></td><td><div className="device-cell"><div className="device-mini"><Smartphone size={15}/></div><span>{o.device}</span></div><div className="cell-sub">{o.issue}</div></td><td><div style={{display: 'flex', alignItems: 'center', gap: '6px', background: '#111', padding: '4px 8px', borderRadius: '6px', border: '1px solid #333', fontSize: '12px', width: 'fit-content'}}><Key size={13} color="#f59e0b"/> <strong style={{color: '#fff'}}>{o.devicePassword || 'Sem Senha'}</strong></div></td><td><select className={`status-select ${statusClass(o.status)}`} value={o.status} onChange={e=>onStatus(o.rawId,e.target.value)}>{['Recebido','Em diagnóstico','Aguardando aprovação','Aguardando peça','Em manutenção','Pronto para retirada','Entregue'].map(s=><option key={s}>{s}</option>)}</select></td><td><button className="secondary-btn" onClick={()=>onOpenChecklist(o)} style={{display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '12px'}}><CheckSquare size={14} color="#3b82f6"/> Vistoria</button></td><td><div style={{display: 'flex', gap: '6px'}}><button className="secondary-btn" onClick={()=>onShare(o)} title="Disparar Status WhatsApp" style={{padding: '6px 10px'}}><MessageCircle size={14} color="#25D366"/></button><button className="secondary-btn" onClick={()=>onSendWarranty(o)} title="Enviar Termo de Garantia Legal WhatsApp" style={{padding: '6px 10px', color: '#3b82f6'}}><FileText size={14}/></button><button className="secondary-btn" onClick={()=>onPrint(o)} title="Imprimir Cupom Térmico" style={{padding: '6px 10px'}}><Printer size={14}/></button><button className="secondary-btn" onClick={()=>onPellicleReminder(o)} title="Lembrete / Revisão" style={{padding: '6px 10px', color: '#eab308'}}><Calendar size={14}/></button></div></td></tr>)}</tbody></table>{!orders.length && <div className="empty-state"><ClipboardList size={28}/><strong>Nenhuma ordem encontrada</strong><span>Tente mudar a busca ou registre uma nova ordem.</span></div>}</div></div></div>
}

function CustomersPage({customers, onNew}) {
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

function CashPage({cashRegister, onNewTransaction}) {
  const totalEntries = cashRegister.entries.filter(e => e.type === 'in').reduce((a, b) => a + b.amount, 0);
  const totalExits = cashRegister.entries.filter(e => e.type === 'out').reduce((a, b) => a + b.amount, 0);
  const currentBalance = cashRegister.openingBalance + totalEntries - totalExits;

  return <div className="page-content">
    <div className="page-heading">
      <div>
        <div className="eyebrow"><span className="eyebrow-line"/> FLUXO DE CAIXA DO ESTABELECIMENTO</div>
        <h1>Caixa da <span>Loja.</span></h1>
        <p>Controle entradas, suprimentos de troco, sangrias e despesas do dia a dia.</p>
      </div>
      <button className="primary-btn" onClick={onNewTransaction} style={{background: '#25D366', color: '#000', fontWeight: 'bold'}}>
        <Plus size={17}/> Lançar no Caixa
      </button>
    </div>

    <div className="metrics-grid" style={{gridTemplateColumns: 'repeat(4, 1fr)'}}>
      <div className="metric-card" style={{background: '#0a0a0d', border: '1px solid #18181b'}}>
        <div className="metric-top"><span className="metric-period">ABERTURA</span></div>
        <div className="metric-value" style={{color: '#aaa'}}>R$ {cashRegister.openingBalance.toFixed(2)}</div>
        <div className="metric-label">Fundo de Troco Inicial</div>
      </div>

      <div className="metric-card" style={{background: '#0a0a0d', border: '1px solid #18181b'}}>
        <div className="metric-top"><span className="metric-period">ENTRADAS</span></div>
        <div className="metric-value" style={{color: '#25D366'}}>+ R$ {totalEntries.toFixed(2)}</div>
        <div className="metric-label">Serviços & Vendas</div>
      </div>

      <div className="metric-card" style={{background: '#0a0a0d', border: '1px solid #18181b'}}>
        <div className="metric-top"><span className="metric-period">SANGRIA / SAÍDAS</span></div>
        <div className="metric-value" style={{color: '#ff4d4d'}}>- R$ {totalExits.toFixed(2)}</div>
        <div className="metric-label">Despesas & Insumos</div>
      </div>

      <div className="metric-card" style={{background: '#0a0a0d', border: '1px solid #18181b'}}>
        <div className="metric-top"><span className="metric-period">SALDO EM GAVETA</span></div>
        <div className="metric-value" style={{color: '#3b82f6'}}>R$ {currentBalance.toFixed(2)}</div>
        <div className="metric-label">Saldo Atual Estimado</div>
      </div>
    </div>

    <div className="panel orders-full" style={{background: '#0a0a0d', border: '1px solid #18181b', marginTop: '20px'}}>
      <div className="panel-heading">
        <div><h3>Histórico de Lançamentos do Dia</h3><p>Registro das movimentações</p></div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>HORÁRIO</th>
              <th>DESCRIÇÃO DO LANÇAMENTO</th>
              <th>OPERADOR</th>
              <th>TIPO</th>
              <th>VALOR</th>
            </tr>
          </thead>
          <tbody>
            {cashRegister.entries.map(item => (
              <tr key={item.id}>
                <td>{item.time}</td>
                <td><strong>{item.description}</strong></td>
                <td>{item.user}</td>
                <td>
                  <span className={`status-pill ${item.type === 'in' ? 'green' : 'amber'}`}>
                    {item.type === 'in' ? 'Entrada / Suprimento' : 'Sangria / Saída'}
                  </span>
                </td>
                <td>
                  <strong style={{color: item.type === 'in' ? '#25D366' : '#ff4d4d'}}>
                    {item.type === 'in' ? '+' : '-'} R$ {item.amount.toFixed(2)}
                  </strong>
                </td>
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
        <div className="eyebrow"><span className="eyebrow-line"/> CONTROLE DE ESTOQUE</div>
        <h1>Estoque de <span>Produtos.</span></h1>
        <p>Cadastre itens, acessórios ou produtos com foto, preço e controle de quantidade.</p>
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
                  <button className="icon-btn" onClick={() => onDelete(item.id)} style={{color: '#ff4d4d'}}><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!inventory.length && <div className="empty-state"><Package size={28}/><strong>Nenhum produto em estoque</strong><span>Clique em "Novo Produto" para cadastrar itens.</span></div>}
      </div>
    </div>
  </div>
}

function FinancePage({orders, commissionRate, setCommissionRate}) {
  const totalRevenue = orders.reduce((acc, o) => {
    const val = parseFloat(o.amount.replace('R$', '').trim()) || 0;
    return acc + val;
  }, 0);

  const totalPartsCost = orders.reduce((acc, o) => {
    const val = parseFloat(o.partCost) || 0;
    return acc + val;
  }, 0);

  const netProfit = totalRevenue - totalPartsCost;
  const techCommissionTotal = (netProfit * (commissionRate / 100));

  return <div className="page-content">
    <div className="page-heading">
      <div>
        <div className="eyebrow"><span className="eyebrow-line"/> BALANÇO FINANCEIRO</div>
        <h1>Financeiro & <span>Comissões.</span></h1>
        <p>Acompanhe faturamento bruto, custos, lucro líquido e comissões da equipe.</p>
      </div>
    </div>

    <div className="metrics-grid" style={{gridTemplateColumns: 'repeat(4, 1fr)'}}>
      <div className="metric-card" style={{background: '#0a0a0d', border: '1px solid #18181b'}}>
        <div className="metric-top"><span className="metric-period">BRUTO</span></div>
        <div className="metric-value" style={{color: '#fff'}}>R$ {totalRevenue.toFixed(2)}</div>
        <div className="metric-label">Faturamento Total</div>
      </div>

      <div className="metric-card" style={{background: '#0a0a0d', border: '1px solid #18181b'}}>
        <div className="metric-top"><span className="metric-period">CUSTOS</span></div>
        <div className="metric-value" style={{color: '#ff4d4d'}}>R$ {totalPartsCost.toFixed(2)}</div>
        <div className="metric-label">Custo com Insumos/Peças</div>
      </div>

      <div className="metric-card" style={{background: '#0a0a0d', border: '1px solid #18181b'}}>
        <div className="metric-top"><span className="metric-period">LÍQUIDO</span></div>
        <div className="metric-value" style={{color: '#25D366'}}>R$ {netProfit.toFixed(2)}</div>
        <div className="metric-label">Lucro Líquido</div>
      </div>

      <div className="metric-card" style={{background: '#0a0a0d', border: '1px solid #18181b'}}>
        <div className="metric-top"><span className="metric-period">COMISSÃO</span></div>
        <div className="metric-value" style={{color: '#3b82f6'}}>R$ {techCommissionTotal.toFixed(2)}</div>
        <div className="metric-label">Comissão da Equipe ({commissionRate}%)</div>
      </div>
    </div>

    <div className="panel" style={{background: '#0a0a0d', border: '1px solid #18181b', padding: '20px', marginTop: '20px'}}>
      <h3>Configuração da Comissão</h3>
      <p className="muted">Porcentagem calculada sobre o lucro líquido de cada serviço executado.</p>
      <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px'}}>
        <input 
          type="number" 
          value={commissionRate} 
          onChange={e=>setCommissionRate(e.target.value)} 
          style={{background: '#111', color: '#fff', border: '1px solid #333', padding: '8px 12px', borderRadius: '6px', width: '100px'}}
        />
        <span>% do lucro líquido por OS</span>
      </div>
    </div>
  </div>
}

function ClientInventoryPage({inventory, whatsapp, storeName}) {
  const buyAccessory = (prod) => {
    const text = encodeURIComponent(`Olá ${storeName}! Gostaria de comprar o produto: ${prod.name} (R$ ${prod.price}). Teria disponível para retirada/envio?`);
    window.open(`https://wa.me/${whatsapp}?text=${text}`, '_blank');
  };

  return <div className="page-content">
    <div className="page-heading">
      <div>
        <div className="eyebrow"><span className="eyebrow-line"/> VITRINE DO ESTABELECIMENTO</div>
        <h1>Produtos & <span>Acessórios.</span></h1>
        <p>Confira os itens disponíveis na {storeName}.</p>
      </div>
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
            style={{marginTop: '10px', background: prod.qty > 0 ? '#25D366' : '#333', color: prod.qty > 0 ? '#000' : '#888', fontWeight: 'bold'}} 
            onClick={() => buyAccessory(prod)}
          >
            <MessageCircle size={16}/> {prod.qty > 0 ? 'Comprar no WhatsApp' : 'Indisponível'}
          </button>
        </div>
      ))}
    </div>
  </div>
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

function StorePage({whatsapp, storeName, onUpgrade}) {
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
        🍎 iPhones Seminovos
      </button>
      <button className={`secondary-btn ${tab === 'lacrados' ? 'primary-btn' : ''}`} onClick={() => setTab('lacrados')} style={{borderRadius: '8px'}}>
        🍎 iPhones Lacrados
      </button>
      <button className={`secondary-btn ${tab === 'xiaomi' ? 'primary-btn' : ''}`} onClick={() => setTab('xiaomi')} style={{borderRadius: '8px'}}>
        ⚡ Xiaomi & Poco
      </button>
      <button className={`secondary-btn ${tab === 'realme' ? 'primary-btn' : ''}`} onClick={() => setTab('realme')} style={{borderRadius: '8px'}}>
        📱 Realme
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
    const start = new Date(order.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, order.warrantyDays - diffDays);
  };

  return <div className="page-content">
    <div className="page-heading">
      <div>
        <div className="eyebrow"><span className="eyebrow-line"/> ÁREA DO CLIENTE</div>
        <h1>Acompanhar <span>Atendimento.</span></h1>
        <p>Digite o número da sua Ordem de Serviço para ver o status em tempo real.</p>
      </div>
    </div>

    <div className="panel" style={{background: '#0a0a0d', border: '1px solid #18181b', padding: '24px', maxWidth: '600px', margin: '0 auto'}}>
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
          <p style={{margin: '5px 0', fontSize: '14px', color: '#aaa'}}><strong>Cliente:</strong> {foundOs.customer}</p>
          <p style={{margin: '5px 0', fontSize: '14px', color: '#aaa'}}><strong>Item / Aparelho:</strong> {foundOs.device}</p>
          <p style={{margin: '5px 0', fontSize: '14px', color: '#aaa'}}><strong>Descrição:</strong> {foundOs.issue}</p>
          <p style={{margin: '5px 0', fontSize: '14px', color: '#aaa'}}><strong>Valor do Serviço:</strong> <span style={{color: '#25D366', fontWeight: 'bold'}}>{foundOs.amount}</span></p>

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

function SettingsPage({configured,email,storeName,setStoreName,storeLogo,onLogoUpload,whatsapp,setWhatsapp,pixKey,setPixKey,storeAddress,setStoreAddress,mapsUrl,setMapsUrl,modules,setModules,onLogout,teamMembers,onInviteMember,auditLogs,userAccessLevel}) {
  return <div className="page-content">
    <div className="page-heading">
      <div>
        <div className="eyebrow"><span className="eyebrow-line"/> SISTEMA</div>
        <h1>Configurações do <span>Estabelecimento.</span></h1>
        <p>Ajuste o nome comercial, localização física, equipe e módulos ativos.</p>
      </div>
    </div>

    <div className="settings-grid">
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
        <div className="settings-row"><span>Status da Licença</span><strong style={{color: '#25D366'}}>Plano Profissional Ativo (R$ 50/mês)</strong></div>
        <div className="settings-row"><span>E-mail do Administrador</span><strong>{email || 'Nenhum'}</strong></div>
        
        <a href={`https://wa.me/${adminWhatsapp}?text=${encodeURIComponent('Olá Robert! Preciso de suporte no sistema RT Mobile.')}`} target="_blank" rel="noreferrer" className="secondary-btn full-btn" style={{marginTop: '15px', textDecoration: 'none', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}>
          <PhoneCall size={15}/> Falar com Suporte Técnico (Robert)
        </a>

        {email && <button className="secondary-btn logout-btn" onClick={onLogout} style={{marginTop: '15px'}}><LogOut size={16}/> Sair da conta</button>}
      </section>
    </div>
  </div>
}

export default App;