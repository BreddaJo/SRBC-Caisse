import React, { useState } from 'react';
import { CreditCard, Banknote, FileCheck, Trash2, X, Camera } from 'lucide-react';

const products = [
  { id: 1, name: 'PRÉSENCE', price: 5, color: 'bg-yellow-500' },
  { id: 2, name: 'EAU', price: 1, color: 'bg-blue-500' },
  { id: 3, name: 'CAFÉ', price: 1, color: 'bg-orange-700' },
  { id: 4, name: 'SNACK', price: 1, color: 'bg-green-600' },
  { id: 5, name: 'SOFT', price: 2, color: 'bg-red-500' },
  { id: 6, name: 'BIÈRE', price: 2.5, color: 'bg-amber-600' },
  { id: 7, name: 'VIN', price: 3, color: 'bg-purple-600' },
  { id: 8, name: 'POLO', price: 20, color: 'bg-indigo-500' },
  { id: 9, name: 'ADHÉSION', price: 120, color: 'bg-pink-500' },
];

const CashRegisterPreview = () => {
  const [adherents, setAdherents] = useState([]);
  const [selectedAdherent, setSelectedAdherent] = useState(null);
  const [newAdherentName, setNewAdherentName] = useState('');
  const [dailyTotals, setDailyTotals] = useState({ total: 0, card: 0, cash: 0, cheque: 0 });
  const [isCustomAmountDialogOpen, setIsCustomAmountDialogOpen] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [history, setHistory] = useState([]);

  const addAdherent = () => {
    if (newAdherentName.trim() !== '') {
      const newAdherent = {
        id: Date.now(),
        name: newAdherentName,
        orders: [],
        paymentStatus: null
      };
      setAdherents([...adherents, newAdherent]);
      setNewAdherentName('');
    }
  };

  const addProductToAdherent = (product) => {
      if (selectedAdherent && !selectedAdherent.paymentStatus) {
      const updatedAdherent = { ...selectedAdherent };
      const existingOrder = updatedAdherent.orders.find(order => order.id === product.id);
      
      if (existingOrder) {
        existingOrder.quantity += 1;
      } else {
        updatedAdherent.orders.push({ ...product, quantity: 1 });
      }

      setSelectedAdherent(updatedAdherent);
      updateAdherent(updatedAdherent);
      addToHistory('add', product);
    }
  };

  const removeProductFromAdherent = (productId) => {
      if (selectedAdherent && !selectedAdherent.paymentStatus) {
      const updatedAdherent = { ...selectedAdherent };
      const orderIndex = updatedAdherent.orders.findIndex(order => order.id === productId);
      
      if (orderIndex !== -1) {
        const removedProduct = updatedAdherent.orders[orderIndex];
        if (removedProduct.quantity > 1) {
          removedProduct.quantity -= 1;
        } else {
          updatedAdherent.orders.splice(orderIndex, 1);
        }

        setSelectedAdherent(updatedAdherent);
        updateAdherent(updatedAdherent);
        addToHistory('remove', removedProduct);
      }
    }
  };

  const updateAdherent = (updatedAdherent) => {
    const updatedAdherents = adherents.map(adherent =>
      adherent.id === updatedAdherent.id ? updatedAdherent : adherent
    );
    setAdherents(updatedAdherents);
  };

  const calculateAdherentTotal = (adherent) => {
    return adherent.orders.reduce((total, order) => total + order.price * order.quantity, 0);
  };

  const handlePayment = (method) => {
  if (selectedAdherent && !selectedAdherent.paymentStatus) {
    const total = calculateAdherentTotal(selectedAdherent);
    const updatedAdherent = { ...selectedAdherent, paymentStatus: method };
    setSelectedAdherent(updatedAdherent);
    updateAdherent(updatedAdherent);
    
    setDailyTotals(prevTotals => ({
      ...prevTotals,
      total: prevTotals.total + total,
      [method]: prevTotals[method] + total
    }));

  addToHistory('payment', { method, amount: total });

    if (method === 'cash') {
      setCashGiven('');
      setChangeToGive(0);
      }
    }
  };

  const addCustomAmountToAdherent = () => {
    if (selectedAdherent && customAmount && !isNaN(customAmount)) {
      const customProduct = {
        id: Date.now(),
        name: 'Montant personnalisé',
        price: parseFloat(customAmount),
        quantity: 1
      };
      addProductToAdherent(customProduct);
      setIsCustomAmountDialogOpen(false);
      setCustomAmount('');
    }
  };

  const addToHistory = (action, item) => {
    setHistory([...history, { action, item, timestamp: Date.now() }]);
  };

  const undoLastAction = () => {
    if (history.length > 0) {
      const lastAction = history[history.length - 1];
      // Implement undo logic based on the last action
      // This is a simplified version and may need more complex logic
      if (lastAction.action === 'add') {
        removeProductFromAdherent(lastAction.item.id);
      } else if (lastAction.action === 'remove') {
        addProductToAdherent(lastAction.item);
      } else if (lastAction.action === 'payment') {
        // Undo payment logic
      }
      setHistory(history.slice(0, -1));
    }
  };

  const [cashGiven, setCashGiven] = useState('');

  const [changeToGive, setChangeToGive] = useState(0);

  const calculateChange = () => {
  const total = calculateAdherentTotal(selectedAdherent);
  const change = parseFloat(cashGiven) - total;
  setChangeToGive(change >= 0 ? change : 0);
  };

  return (
    <div className="flex flex-col h-screen max-w-6xl mx-auto bg-gray-100 p-4 text-sm">
      <div className="flex flex-1 gap-4">
        {/* Left compartment - Adherent list */}
        <div className="w-1/4 bg-white p-4 rounded shadow">
          <h2 className="text-lg font-bold mb-2">Adhérents</h2>
          <div className="flex mb-2">
            <input 
              className="border rounded px-2 py-1 w-full mr-2" 
              placeholder="Nom de l'adhérent"
              value={newAdherentName}
              onChange={(e) => setNewAdherentName(e.target.value)}
            />
            <button className="bg-blue-500 text-white px-2 py-1 rounded" onClick={addAdherent}>+</button>
          </div>
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
            {adherents.map(adherent => (
              <div 
                key={adherent.id} 
                className={`p-2 mb-1 rounded cursor-pointer ${selectedAdherent?.id === adherent.id ? 'bg-blue-100' : 'bg-gray-100'}`}
                onClick={() => setSelectedAdherent(adherent)}
              >
                {adherent.name}
              </div>
            ))}
          </div>
        </div>

        <div className="w-2/4 bg-white p-4 rounded shadow">
          <h2 className="text-lg font-bold mb-2">Produits</h2>
          <div className="grid grid-cols-3 gap-2">
            {products.map(product => (
              <button 
                key={product.id} 
                className={`${product.color} p-4 rounded text-center font-bold text-white`}
                onClick={() => addProductToAdherent(product)}
              >
                {product.name}
              </button>
            ))}
            <button 
              className="bg-gray-500 p-4 rounded text-center font-bold text-white"
              onClick={() => setIsCustomAmountDialogOpen(true)}
            >
              AUTRE
            </button>
          </div>
        </div>

        <div className="w-1/4 bg-white p-4 rounded shadow">
          <h2 className="text-lg font-bold mb-2">Détails de l'adhérent</h2>
          {selectedAdherent && (
            <>
              <h3 className="font-bold">{selectedAdherent.name}</h3>
              <ul className="mb-2 max-h-[calc(100vh-400px)] overflow-y-auto">
                {selectedAdherent.orders.map((order) => (
                  <li key={order.id} className="flex justify-between items-center mb-1">
                    <span>{order.name} x{order.quantity} - {(order.price * order.quantity).toFixed(2)} €</span>
                    <button 
                      onClick={() => removeProductFromAdherent(order.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </li>
                ))}
              </ul>
              <p className="font-bold mb-2 text-lg">Total: {calculateAdherentTotal(selectedAdherent).toFixed(2)} €</p>
              {!selectedAdherent.paymentStatus ? (
  <>
    <div className="grid grid-cols-3 gap-1 mb-2">
      <button 
        onClick={() => handlePayment('cash')} 
        className="bg-green-500 text-white p-2 rounded flex items-center justify-center"
      >
        <Banknote className="mr-1 h-4 w-4" /> ESPECE
      </button>
      <button 
        onClick={() => handlePayment('card')} 
        className="bg-blue-500 text-white p-2 rounded flex items-center justify-center"
      >
        <CreditCard className="mr-1 h-4 w-4" /> CB
      </button>
      <button 
        onClick={() => handlePayment('cheque')} 
        className="bg-yellow-500 text-white p-2 rounded flex items-center justify-center"
      >
        <FileCheck className="mr-1 h-4 w-4" /> CHEQUE
      </button>
    </div>
    {selectedAdherent.paymentStatus === 'cash' && (
      <div className="mt-2">
        <input
          type="number"
          className="border rounded px-2 py-1 w-full mb-2"
          placeholder="Montant donné"
          value={cashGiven}
          onChange={(e) => {
            setCashGiven(e.target.value);
            calculateChange();
          }}
        />
        {changeToGive > 0 && (
          <p className="text-green-600 font-bold">
            Monnaie à rendre : {changeToGive.toFixed(2)} €
          </p>
        )}
      </div>
    )}
  </>
) : (
  <p className="text-green-600 font-bold text-lg">
    Payé en {selectedAdherent.paymentStatus === 'cash' ? 'espèces' : selectedAdherent.paymentStatus === 'card' ? 'CB' : 'chèque'}
  </p>
)}


      <div className="bg-white p-4 mt-4 rounded shadow flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold mb-2">Totaux de la journée</h2>
          <div className="flex gap-6 text-lg">
            <p className="font-semibold">Total: <span className="text-blue-600">{dailyTotals.total.toFixed(2)} €</span></p>
            <p className="font-semibold">Espèces: <span className="text-green-600">{dailyTotals.cash.toFixed(2)} €</span></p>
            <p className="font-semibold">CB: <span className="text-red-600">{dailyTotals.card.toFixed(2)} €</span></p>
            <p className="font-semibold">Chèque: <span className="text-yellow-600">{dailyTotals.cheque.toFixed(2)} €</span></p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <button onClick={undoLastAction} className="bg-red-500 text-white p-2 rounded flex items-center justify-center">
            <X className="mr-2 h-4 w-4" /> Annuler dernière action
          </button>
          <button className="bg-purple-500 text-white p-2 rounded flex items-center justify-center">
            <Camera className="mr-2 h-4 w-4" /> Capture d'écran
          </button>
        </div>
      </div>

      {isCustomAmountDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded">
            <h2 className="text-lg font-bold mb-2">Montant personnalisé</h2>
            <input
              type="number"
              className="border rounded px-2 py-1 w-full mb-2"
              placeholder="Montant"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
            />
            <div className="flex justify-end">
              <button
                className="bg-gray-300 text-black px-2 py-1 rounded mr-2"
                onClick={() => setIsCustomAmountDialogOpen(false)}
              >
                Annuler
              </button>
              <button
                className="bg-blue-500 text-white px-2 py-1 rounded"
                onClick={addCustomAmountToAdherent}
              >
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashRegisterPreview;
