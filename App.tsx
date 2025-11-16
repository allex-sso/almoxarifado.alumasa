

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, Link, useParams } from 'react-router-dom';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Painel from './components/Dashboard';
// FIX: Changed import to use named exports for both components from ItemListPage.
import { EstoquePage, InventoryPage } from './components/ItemListPage';
import RelatoriosPage from './components/PlaceholderPage';
import AuditPage from './components/AuditPage';
import { mockUsers, mockSuppliers, mockStockItems, mockAuditLogs, mockHistoryData } from './constants';
import { User, Supplier, StockItem, AuditLog, ItemHistory, EntryItemHistory, ExitItemHistory } from './types';


// ============================================================================
// Movimentacoes Page Component
// ============================================================================
interface MovimentacoesPageProps {
  stockItems: StockItem[];
  suppliers: Supplier[];
  onRegisterEntry: (data: { itemId: string; quantity: number; supplier: string; nf: string; observations: string; }) => void;
  onRegisterExit: (data: { itemId: string; quantity: number; requester: string; responsible: string; }) => void;
  showToast: (message: string) => void;
}

const MovimentacoesPage: React.FC<MovimentacoesPageProps> = ({ stockItems, suppliers, onRegisterEntry, onRegisterExit, showToast }) => {
    const { tab = 'nova-entrada' } = useParams<{ tab: string }>();
    const [search, setSearch] = useState('');
    const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
    const [quantity, setQuantity] = useState('');
    const [selectedSupplier, setSelectedSupplier] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (selectedItem) {
            const firstSupplier = Array.isArray(selectedItem.supplier) ? selectedItem.supplier[0] : selectedItem.supplier;
            setSelectedSupplier(firstSupplier || '');
        } else {
            setSelectedSupplier('');
        }
    }, [selectedItem]);


    const filteredItems = search && !selectedItem
        ? stockItems.filter(item =>
            item.code.toLowerCase().includes(search.toLowerCase()) ||
            item.description.toLowerCase().includes(search.toLowerCase())
          ).slice(0, 5)
        : [];
        
    const resetForm = () => {
      setSearch('');
      setSelectedItem(null);
      setQuantity('');
      setSelectedSupplier('');
    };

    const handleSelect = (item: StockItem) => {
        setSelectedItem(item);
        setSearch(`${item.code} - ${item.description}`);
    };

    const handleRegisterExitSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setIsSubmitting(true);
      const formData = new FormData(e.currentTarget);
      if (selectedItem && quantity) {
          setTimeout(() => { // Simulate API call
            onRegisterExit({
                itemId: selectedItem.id,
                quantity: parseInt(quantity, 10),
                requester: formData.get('requester') as string,
                responsible: formData.get('responsible') as string,
            });
            showToast('Saída registrada com sucesso!');
            resetForm();
            e.currentTarget.reset();
            setIsSubmitting(false);
          }, 1000);
      } else {
        alert('Por favor, selecione um item e informe a quantidade.');
        setIsSubmitting(false);
      }
    };
    
    const handleRegisterEntrySubmit = (e: React.FormEvent<HTMLFormElement>) => {
       e.preventDefault();
       setIsSubmitting(true);
       const formData = new FormData(e.currentTarget);
       if(selectedItem && quantity) {
         setTimeout(() => { // Simulate API call
           onRegisterEntry({
             itemId: selectedItem.id,
             quantity: parseInt(quantity, 10),
             supplier: selectedSupplier,
             nf: formData.get('nf') as string,
             observations: formData.get('observations') as string,
           });
           showToast('Entrada registrada com sucesso!');
           resetForm();
           e.currentTarget.reset();
           setIsSubmitting(false);
         }, 1000);
       } else {
         alert('Por favor, selecione o item e a quantidade.');
         setIsSubmitting(false);
       }
    };
    
    const SpinnerIcon = () => (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    );


    const renderForm = () => {
        if (tab === 'nova-saida') {
            return (
                <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
                    <div className="border-b pb-4 mb-6">
                        <h2 className="text-xl font-semibold text-gray-800">Registrar Nova Saída</h2>
                    </div>
                    <form className="space-y-4" onSubmit={handleRegisterExitSubmit}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Data de Saída</label>
                            <input type="text" defaultValue={new Date().toLocaleDateString('pt-BR')} className="w-full p-2 border border-gray-300 rounded-md bg-gray-50" readOnly/>
                        </div>
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Item*</label>
                            <input 
                                type="text" 
                                placeholder="Digite o código ou descrição para pesquisar..." 
                                className="w-full p-2 border border-gray-300 rounded-md" 
                                value={search}
                                onChange={(e) => {
                                  setSearch(e.target.value);
                                  if(selectedItem) setSelectedItem(null);
                                }}
                                autoComplete="off"
                                required
                            />
                            {filteredItems.length > 0 && (
                                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-48 overflow-y-auto">
                                    {filteredItems.map(item => (
                                        <li key={item.id} onClick={() => handleSelect(item)} className="p-2 hover:bg-gray-100 cursor-pointer">
                                            {item.code} - {item.description}
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {selectedItem && (
                               <p className="text-sm text-blue-600 mt-2">Estoque atual: <span className="font-bold">{selectedItem.systemStock}</span> {selectedItem.unit}(s)</p>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade*</label>
                                <input type="number" name="quantity" placeholder="Exemplo: 10" className="w-full p-2 border border-gray-300 rounded-md" value={quantity} onChange={e => setQuantity(e.target.value)} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Solicitante / Setor*</label>
                                <input type="text" name="requester" placeholder="Exemplo: Manutenção" className="w-full p-2 border border-gray-300 rounded-md" required />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Responsável*</label>
                            <input type="text" name="responsible" placeholder="Insira o nome do responsável" className="w-full p-2 border border-gray-300 rounded-md" required />
                        </div>
                        <div className="flex justify-end pt-4">
                            <button type="submit" className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-md transition duration-300 flex items-center justify-center min-w-[120px]" disabled={!selectedItem || isSubmitting}>
                                {isSubmitting ? <><SpinnerIcon /> Processando...</> : 'Registrar'}
                            </button>
                        </div>
                    </form>
                </div>
            );
        }

        // Default to Nova Entrada
        return (
            <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
                <div className="border-b pb-4 mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">Registrar Nova Entrada</h2>
                </div>
                <form className="space-y-4" onSubmit={handleRegisterEntrySubmit}>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Data de Entrada</label>
                        <input type="text" defaultValue={new Date().toLocaleDateString('pt-BR')} className="w-full p-2 border border-gray-300 rounded-md bg-gray-50" readOnly />
                     </div>
                     <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Item*</label>
                            <input 
                                type="text" 
                                placeholder="Digite o código ou descrição para pesquisar..." 
                                className="w-full p-2 border border-gray-300 rounded-md" 
                                value={search}
                                onChange={(e) => {
                                  setSearch(e.target.value);
                                  if(selectedItem) setSelectedItem(null);
                                }}
                                autoComplete="off"
                                required
                            />
                            {filteredItems.length > 0 && (
                                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-48 overflow-y-auto">
                                    {filteredItems.map(item => (
                                        <li key={item.id} onClick={() => handleSelect(item)} className="p-2 hover:bg-gray-100 cursor-pointer">
                                            {item.code} - {item.description}
                                        </li>
                                    ))}
                                </ul>
                            )}
                             {selectedItem && (
                               <p className="text-sm text-blue-600 mt-2">Estoque atual: <span className="font-bold">{selectedItem.systemStock}</span> {selectedItem.unit}(s)</p>
                            )}
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade*</label>
                          <input type="number" name="quantity" placeholder="Exemplo: 100" className="w-full p-2 border border-gray-300 rounded-md" value={quantity} onChange={e => setQuantity(e.target.value)} required />
                      </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fornecedor</label>
                            <select 
                                name="supplier" 
                                className="w-full p-2 border border-gray-300 rounded-md" 
                                value={selectedSupplier}
                                onChange={e => setSelectedSupplier(e.target.value)}
                            >
                                <option value="">Nenhum / Não informado</option>
                                {suppliers.map(supplier => (
                                    <option key={supplier.id} value={supplier.name}>{supplier.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nota Fiscal</label>
                            <input type="text" name="nf" placeholder="Exemplo: 987654" className="w-full p-2 border border-gray-300 rounded-md" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                        <textarea name="observations" rows={3} placeholder="Detalhes adicionais sobre a entrada." className="w-full p-2 border border-gray-300 rounded-md"></textarea>
                    </div>
                    <div className="flex justify-end pt-4">
                         <button type="submit" className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-md transition duration-300 flex items-center justify-center min-w-[150px]" disabled={!selectedItem || isSubmitting}>
                            {isSubmitting ? <><SpinnerIcon /> Processando...</> : 'Registrar Entrada'}
                        </button>
                    </div>
                </form>
            </div>
        );
    };

    return (
      <div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">{tab === 'nova-saida' ? 'Registrar Nova Saída' : 'Registrar Nova Entrada'}</h1>
        {renderForm()}
      </div>
    );
};


// ============================================================================
// Controle Page Component
// ============================================================================
interface ControlePageProps {
    users: User[];
    suppliers: Supplier[];
    allData: object;
    onAddUser: (user: Omit<User, 'id'|'avatarUrl'>) => boolean;
    onUpdateUser: (user: User) => void;
    onDeleteUser: (userId: number) => void;
    onAddSupplier: (supplier: Omit<Supplier, 'id'>) => void;
    onUpdateSupplier: (supplier: Supplier) => void;
    onDeleteSupplier: (supplierId: number) => void;
    onRestoreBackup: (data: any) => void;
    showToast: (message: string) => void;
}

type PanelMode = 'addUser' | 'editUser' | 'changePassword' | 'addSupplier' | 'editSupplier' | '';
interface PanelState {
    isOpen: boolean;
    mode: PanelMode;
    data: User | Supplier | null;
}

const ControlePage: React.FC<ControlePageProps> = ({ 
    users, suppliers, allData,
    onAddUser, onUpdateUser, onDeleteUser,
    onAddSupplier, onUpdateSupplier, onDeleteSupplier,
    onRestoreBackup,
    showToast
}) => {
    const { tab = 'usuarios' } = useParams<{ tab: string }>();
    
    // Deletion modals state
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);
    
    // Slide-over panel state
    const [panelState, setPanelState] = useState<PanelState>({ isOpen: false, mode: '', data: null });
    
    // Form states
    const [formData, setFormData] = useState<any>({});
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const restoreInputRef = useRef<HTMLInputElement>(null);
    const loggedInUser: User | undefined = users.find(u => u.profile === 'Administrador');

    const openPanel = (mode: PanelMode, data: User | Supplier | null = null) => {
        setPanelState({ isOpen: true, mode, data });
        setFormData(data || {});
        setFormErrors({});
    };
    const closePanel = () => {
        setPanelState({ isOpen: false, mode: '', data: null });
        setFormData({});
        setFormErrors({});
    };

    // User Handlers
    const handleSaveUser = (e: React.FormEvent) => {
        e.preventDefault();
        if (panelState.mode === 'addUser') {
            const success = onAddUser(formData);
            if(success) {
                showToast('Usuário adicionado com sucesso!');
                closePanel();
            } else {
                setFormErrors({ email: 'Este e-mail já está em uso.' });
            }
        } else if (panelState.mode === 'editUser') {
            onUpdateUser(formData as User);
            showToast('Usuário atualizado com sucesso!');
            closePanel();
        }
    };
    
    const handleConfirmDeleteUser = () => {
        if (userToDelete) {
            onDeleteUser(userToDelete.id);
            setUserToDelete(null);
            showToast('Usuário excluído com sucesso!');
        }
    };

    const handleChangePassword = (e: React.FormEvent) => {
        e.preventDefault();
        const { newPassword, confirmPassword } = formData;
        if (newPassword !== confirmPassword) {
            setFormErrors({ password: 'As senhas não coincidem.' });
            return;
        }
        if (newPassword.length < 6) {
            setFormErrors({ password: 'A senha deve ter pelo menos 6 caracteres.' });
            return;
        }
        showToast(`Senha do usuário ${panelState.data?.name} alterada com sucesso!`);
        closePanel();
    };

    // Supplier Handlers
     const handleSaveSupplier = (e: React.FormEvent) => {
        e.preventDefault();
        if (panelState.mode === 'addSupplier') {
            onAddSupplier(formData);
            showToast('Fornecedor adicionado com sucesso!');
            closePanel();
        } else if (panelState.mode === 'editSupplier') {
            onUpdateSupplier(formData as Supplier);
            showToast('Fornecedor atualizado com sucesso!');
            closePanel();
        }
    };

    const handleConfirmDeleteSupplier = () => {
        if (supplierToDelete) {
            onDeleteSupplier(supplierToDelete.id);
            setSupplierToDelete(null);
            showToast('Fornecedor excluído com sucesso!');
        }
    };

    // Backup handlers
    const handleCreateBackup = () => {
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
            JSON.stringify(allData, null, 2)
        )}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = `backup-alumasa-${new Date().toISOString()}.json`;
        link.click();
    };

    const handleRestoreClick = () => {
        restoreInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const text = e.target?.result;
                    if (typeof text !== 'string') throw new Error("File content is not a string");
                    const data = JSON.parse(text);
                    if (window.confirm("Tem certeza que deseja restaurar este backup? Todos os dados atuais serão substituídos.")) {
                       onRestoreBackup(data);
                       showToast("Backup restaurado com sucesso!");
                    }
                } catch (error) {
                    alert("Erro ao ler o arquivo de backup. Verifique se o arquivo é um JSON válido.");
                    console.error("Backup restore error:", error);
                }
            };
            reader.readAsText(file);
             // Reset input value to allow selecting the same file again
            event.target.value = '';
        }
    };
    
    const renderPanelContent = () => {
        switch (panelState.mode) {
            case 'addUser':
            case 'editUser':
                return (
                    <form id="user-form" onSubmit={handleSaveUser}>
                        {formErrors.email && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{formErrors.email}</p>}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nome</label>
                                <input type="text" value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">E-mail</label>
                                <input type="email" value={formData.email || ''} onChange={(e) => setFormData({...formData, email: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Perfil</label>
                                <select value={formData.profile || 'Operador'} onChange={(e) => setFormData({...formData, profile: e.target.value as 'Administrador' | 'Operador'})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md">
                                    <option value="Operador">Operador</option>
                                    <option value="Administrador">Administrador</option>
                                </select>
                            </div>
                        </div>
                    </form>
                );
            case 'changePassword':
                return (
                     <form id="password-form" onSubmit={handleChangePassword}>
                        {formErrors.password && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{formErrors.password}</p>}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nova Senha</label>
                                <input type="password" value={formData.newPassword || ''} onChange={(e) => setFormData({...formData, newPassword: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Confirmar Senha</label>
                                <input type="password" value={formData.confirmPassword || ''} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required/>
                            </div>
                        </div>
                    </form>
                );
            case 'addSupplier':
            case 'editSupplier':
                return (
                     <form id="supplier-form" onSubmit={handleSaveSupplier} className="space-y-4">
                        <input type="text" placeholder="Nome" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border rounded-md" required />
                        <input type="text" placeholder="Contato" value={formData.contact || ''} onChange={e => setFormData({...formData, contact: e.target.value})} className="w-full px-3 py-2 border rounded-md" />
                        <input type="email" placeholder="E-mail" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 border rounded-md" />
                        <input type="text" placeholder="Telefone" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 border rounded-md" />
                    </form>
                );
            default:
                return null;
        }
    };
    
    const getPanelTitle = () => {
        switch(panelState.mode) {
            case 'addUser': return 'Adicionar Novo Usuário';
            case 'editUser': return 'Editar Usuário';
            case 'changePassword': return `Alterar Senha de ${panelState.data?.name}`;
            case 'addSupplier': return 'Adicionar Novo Fornecedor';
            case 'editSupplier': return 'Editar Fornecedor';
            default: return '';
        }
    }
    
    const getPanelFormId = () => {
        switch(panelState.mode) {
            case 'addUser':
            case 'editUser':
                return 'user-form';
            case 'changePassword':
                return 'password-form';
            case 'addSupplier':
            case 'editSupplier':
                return 'supplier-form';
            default: return '';
        }
    }


    const renderContent = () => {
        switch (tab) {
            case 'usuarios':
                return (
                    <div className="bg-white p-6 rounded-lg shadow-md">
                      <div className="flex justify-between items-center mb-4">
                          <h2 className="text-xl font-semibold text-gray-800">Gerenciamento de Usuários</h2>
                          <button onClick={() => openPanel('addUser')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md text-sm">+ Novo usuário</button>
                      </div>
                      <table className="w-full text-left">
                          <thead>
                              <tr className="bg-gray-50 border-b">
                                  <th className="p-3 text-sm font-semibold text-gray-600">FOTO</th>
                                  <th className="p-3 text-sm font-semibold text-gray-600">NOME</th>
                                  <th className="p-3 text-sm font-semibold text-gray-600">E-MAIL</th>
                                  <th className="p-3 text-sm font-semibold text-gray-600">PERFIL</th>
                                  <th className="p-3 text-sm font-semibold text-gray-600">AÇÕES</th>
                              </tr>
                          </thead>
                          <tbody>
                              {users.map(user => (
                                  <tr key={user.id} className="border-b">
                                      <td className="p-3"><img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full" /></td>
                                      <td className="p-3 text-sm text-gray-800">{user.name}</td>
                                      <td className="p-3 text-sm text-gray-500">{user.email}</td>
                                      <td className="p-3"><span className={`px-2 py-1 text-xs rounded-full ${user.profile === 'Administrador' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{user.profile}</span></td>
                                      <td className="p-3 text-gray-500 flex items-center space-x-3">
                                          <button onClick={() => openPanel('editUser', user)} className="hover:text-blue-600 transition-colors duration-200" title="Editar">
                                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
                                              </svg>
                                          </button>
                                          <button onClick={() => { if (loggedInUser?.profile === 'Administrador') openPanel('changePassword', user) }} className="hover:text-yellow-600 transition-colors duration-200" title="Alterar Senha">
                                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                              </svg>
                                          </button>
                                          <button onClick={() => setUserToDelete(user)} className="hover:text-red-600 transition-colors duration-200" title="Excluir">
                                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                              </svg>
                                          </button>
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                    </div>
                );
            case 'fornecedores':
                 return (
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-800">Gerenciamento de Fornecedores</h2>
                            <button onClick={() => openPanel('addSupplier')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md text-sm">+ Novo</button>
                        </div>
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50 border-b">
                                    <th className="p-3 text-sm font-semibold text-gray-600">NOME</th>
                                    <th className="p-3 text-sm font-semibold text-gray-600">CONTATO</th>
                                    <th className="p-3 text-sm font-semibold text-gray-600">E-MAIL</th>
                                    <th className="p-3 text-sm font-semibold text-gray-600">TELEFONE</th>
                                    <th className="p-3 text-sm font-semibold text-gray-600">AÇÕES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {suppliers.map(sup => (
                                    <tr key={sup.id} className="border-b">
                                        <td className="p-3 text-sm text-gray-800">{sup.name}</td>
                                        <td className="p-3 text-sm text-gray-500">{sup.contact}</td>
                                        <td className="p-3 text-sm text-gray-500">{sup.email}</td>
                                        <td className="p-3 text-sm text-gray-500">{sup.phone}</td>
                                        <td className="p-3 text-gray-500 flex items-center space-x-3">
                                            <button onClick={() => openPanel('editSupplier', sup)} className="hover:text-blue-600 transition-colors duration-200" title="Editar">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
                                                </svg>
                                            </button>
                                            <button onClick={() => setSupplierToDelete(sup)} className="hover:text-red-600 transition-colors duration-200" title="Excluir">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            case 'backup':
                 return (
                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                      <h2 className="text-xl font-semibold text-gray-800 mb-4">Criar Backup do Sistema</h2>
                      <p className="text-gray-600 mb-4 text-sm">Crie um arquivo de backup com todos os dados atuais do sistema, incluindo itens, usuários e histórico de movimentações. Guarde este arquivo em um local seguro.</p>
                      <button onClick={handleCreateBackup} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md">
                        ↓ Criar e Baixar Backup
                      </button>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                      <h2 className="text-xl font-semibold text-gray-800 mb-4">Restaurar a partir de um backup</h2>
                       <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                        <p className="font-bold text-red-800">Atenção</p>
                        <p className="text-sm text-red-700">Restaurar um backup substituirá TODOS os dados atuais do sistema pelos dados do arquivo. Esta ação não pode ser desfeita.</p>
                       </div>
                       <div className="flex items-center space-x-4">
                         <input type="file" ref={restoreInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
                         <button onClick={handleRestoreClick} className="border border-gray-300 py-2 px-4 rounded-md text-gray-700">
                           🗂️ Escolher Arquivo de Backup
                         </button>
                       </div>
                    </div>
                  </div>
                );
            default:
                return null;
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-semibold text-gray-800 mb-6 capitalize">{tab.replace('-', ' & ')}</h1>
            {renderContent()}

            {/* Slide-over Panel */}
            {panelState.isOpen && (
                <div className="relative z-50" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
                    <div className={`slide-over-overlay ${panelState.isOpen ? 'opacity-100' : 'opacity-0'}`} onClick={closePanel}></div>
                    <div className={`slide-over-panel ${panelState.isOpen ? 'show' : ''}`}>
                        <div className="slide-over-header">
                            <h2 id="slide-over-title" className="text-lg font-medium text-gray-900">{getPanelTitle()}</h2>
                            <button onClick={closePanel} type="button" className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                <span className="sr-only">Close panel</span>
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="slide-over-body">
                           {renderPanelContent()}
                        </div>
                        <div className="slide-over-footer">
                            <button onClick={closePanel} type="button" className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Cancelar</button>
                            <button form={getPanelFormId()} type="submit" className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">Salvar</button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Delete User Modal */}
            {userToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
                        <h3 className="text-lg font-bold text-gray-800">Confirmar Exclusão</h3>
                        <p className="text-gray-600 my-4">Tem certeza que deseja excluir o usuário <span className="font-semibold">{userToDelete.name}</span>? Esta ação não pode ser desfeita.</p>
                        <div className="flex justify-end space-x-2">
                            <button onClick={() => setUserToDelete(null)} className="py-2 px-4 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                            <button onClick={handleConfirmDeleteUser} className="py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700">Excluir</button>
                        </div>
                    </div>
                </div>
            )}
            
             {/* Delete Supplier Modal */}
            {supplierToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
                        <h3 className="text-lg font-bold text-gray-800">Confirmar Exclusão</h3>
                        <p className="text-gray-600 my-4">Tem certeza que deseja excluir o fornecedor <span className="font-semibold">{supplierToDelete.name}</span>?</p>
                        <div className="flex justify-end space-x-2">
                            <button onClick={() => setSupplierToDelete(null)} className="py-2 px-4 bg-gray-200 rounded-md">Cancelar</button>
                            <button onClick={handleConfirmDeleteSupplier} className="py-2 px-4 bg-red-600 text-white rounded-md">Excluir</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ============================================================================
// Main App Component
// ============================================================================
const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [stockItems, setStockItems] = useState<StockItem[]>(mockStockItems);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(mockAuditLogs);
  const [historyData, setHistoryData] = useState<Record<string, ItemHistory[]>>(mockHistoryData);
  const [toastMessage, setToastMessage] = useState('');
  const toastTimeoutRef = useRef<number | null>(null);

  const showToast = useCallback((message: string) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(message);
    toastTimeoutRef.current = window.setTimeout(() => {
      setToastMessage('');
    }, 3000);
  }, []);

  const handleLogin = useCallback(() => setIsLoggedIn(true), []);
  const handleLogout = useCallback(() => setIsLoggedIn(false), []);

  const addAuditLog = (action: string) => {
    const newLog: AuditLog = {
      id: Date.now(),
      timestamp: new Date().toLocaleString('pt-BR'),
      user: 'Administrador', // Mocked user
      action,
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // User Handlers
  const handleAddUser = (user: Omit<User, 'id' | 'avatarUrl'>) => {
    if (users.some(u => u.email.toLowerCase() === user.email.toLowerCase())) {
        return false;
    }
    const newUser: User = {
        id: Date.now(),
        ...user,
        avatarUrl: `https://i.pravatar.cc/150?u=${user.email}`
    };
    setUsers(prev => [newUser, ...prev]);
    addAuditLog(`Criou o usuário ${user.name}.`);
    return true;
  };
  const handleUpdateUser = (updatedUser: User) => {
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    addAuditLog(`Atualizou o usuário ${updatedUser.name}.`);
  };
  const handleDeleteUser = (userId: number) => {
    const user = users.find(u => u.id === userId);
    setUsers(users.filter(u => u.id !== userId));
    if(user) addAuditLog(`Excluiu o usuário ${user.name}.`);
  };
  
  // Supplier Handlers
  const handleAddSupplier = (supplier: Omit<Supplier, 'id'>) => {
    const newSupplier = { id: Date.now(), ...supplier };
    setSuppliers(prev => [newSupplier, ...prev]);
    addAuditLog(`Adicionou o fornecedor ${supplier.name}.`);
  };
  const handleUpdateSupplier = (updatedSupplier: Supplier) => {
    setSuppliers(suppliers.map(s => s.id === updatedSupplier.id ? updatedSupplier : s));
     addAuditLog(`Atualizou o fornecedor ${updatedSupplier.name}.`);
  };
  const handleDeleteSupplier = (supplierId: number) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    setSuppliers(suppliers.filter(s => s.id !== supplierId));
    if (supplier) addAuditLog(`Excluiu o fornecedor ${supplier.name}.`);
  };
  
  // Movement Handlers
  const handleRegisterEntry = (data: { itemId: string; quantity: number; supplier: string; nf: string; observations: string; }) => {
      const item = stockItems.find(i => i.id === data.itemId);
      if (item) {
        setStockItems(prev => prev.map(i => i.id === data.itemId ? {...i, systemStock: i.systemStock + data.quantity} : i));
        
        const newHistoryEntry: EntryItemHistory = {
            id: `h-${Date.now()}`,
            date: new Date().toLocaleDateString('pt-BR'),
            type: 'Entrada',
            quantity: data.quantity,
            user: 'Administrador', // Mocked user
            details: `Fornecedor: ${data.supplier || 'N/A'}. NF: ${data.nf || 'N/A'}. Obs: ${data.observations || 'N/A'}`
        };

        setHistoryData(prev => ({
            ...prev,
            [data.itemId]: [newHistoryEntry, ...(prev[data.itemId] || [])]
        }));
        
        addAuditLog(`Registrou entrada de ${data.quantity} unidade(s) do item ${item.code}. NF: ${data.nf}.`);
      }
  };
  const handleRegisterExit = (data: { itemId: string; quantity: number; requester: string; responsible: string; }) => {
      const item = stockItems.find(i => i.id === data.itemId);
      if (item) {
        const newStock = item.systemStock - data.quantity;
        if(newStock < 0) {
          alert('A quantidade de saída é maior que o estoque atual!');
          return;
        }
        setStockItems(prev => prev.map(i => i.id === data.itemId ? {...i, systemStock: newStock} : i));
        
        const newHistoryEntry: ExitItemHistory = {
            id: `h-${Date.now()}`,
            date: new Date().toLocaleDateString('pt-BR'),
            type: 'Saída',
            quantity: data.quantity,
            user: 'Administrador', // Mocked user
            requester: data.requester,
            responsible: data.responsible,
        };

        setHistoryData(prev => ({
            ...prev,
            [data.itemId]: [newHistoryEntry, ...(prev[data.itemId] || [])]
        }));

        addAuditLog(`Registrou saída de ${data.quantity} unidade(s) do item ${item.code} para ${data.requester}.`);
      }
  };
  
  // Backup Handler
  const handleRestoreBackup = (data: any) => {
      // Basic validation
      if (data.stockItems && data.users && data.suppliers && data.auditLogs && data.historyData) {
        setStockItems(data.stockItems);
        setUsers(data.users);
        setSuppliers(data.suppliers);
        setAuditLogs(data.auditLogs);
        setHistoryData(data.historyData);
        addAuditLog('Sistema restaurado a partir de um backup.');
      } else {
        alert('Arquivo de backup inválido ou corrompido.');
      }
  };


  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }
  
  const PageWrapper: React.FC<{children: React.ReactNode}> = ({ children }) => (
     <div className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
       {children}
     </div>
  );
  
  const allData = { stockItems, users, suppliers, auditLogs, historyData };
  
  const loggedInUser = users.find(u => u.profile === 'Administrador');

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar onLogout={handleLogout} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={loggedInUser} stockItems={stockItems} />
        <main className="flex-1 flex overflow-hidden">
          <Routes>
            <Route path="/" element={<Navigate to="/painel" replace />} />
            <Route path="/painel" element={<PageWrapper><Painel stockItems={stockItems} historyData={historyData} /></PageWrapper>} />
            <Route path="/estoque/atual" element={<PageWrapper><EstoquePage stockItems={stockItems} setStockItems={setStockItems} suppliers={suppliers} addAuditLog={addAuditLog} showToast={showToast} historyData={historyData} /></PageWrapper>} />
            <Route path="/estoque/inventario" element={<PageWrapper><InventoryPage stockItems={stockItems} setStockItems={setStockItems} addAuditLog={addAuditLog} showToast={showToast} /></PageWrapper>} />
            <Route path="/movimentacoes/:tab" element={<PageWrapper><MovimentacoesPage stockItems={stockItems} suppliers={suppliers} onRegisterEntry={handleRegisterEntry} onRegisterExit={handleRegisterExit} showToast={showToast} /></PageWrapper>} />
            <Route path="/controle/:tab" element={<PageWrapper><ControlePage 
                users={users} 
                suppliers={suppliers} 
                allData={allData}
                onAddUser={handleAddUser}
                onUpdateUser={handleUpdateUser}
                onDeleteUser={handleDeleteUser}
                onAddSupplier={handleAddSupplier}
                onUpdateSupplier={handleUpdateSupplier}
                onDeleteSupplier={handleDeleteSupplier}
                onRestoreBackup={handleRestoreBackup}
                showToast={showToast}
            /></PageWrapper>} />
            <Route path="/auditoria/monitoramento" element={<PageWrapper><AuditPage auditLogs={auditLogs} /></PageWrapper>} />
            <Route path="/relatorios" element={<PageWrapper><RelatoriosPage title="Relatórios" stockItems={stockItems} historyData={historyData} /></PageWrapper>} />
            <Route path="*" element={<Navigate to="/painel" replace />} />
          </Routes>
        </main>
      </div>
      <div className={`toast success ${toastMessage ? 'show' : ''}`}>
        {toastMessage}
      </div>
    </div>
  );
};

export default App;