import React, { useState, useEffect } from 'react';
import { StorageService } from '../services';
import './ClientManager.css';

const ClientManager = ({ onSelectClient, onClose }) => {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name'); // name, created, lastUsed
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    company: '',
    taxId: '',
    website: '',
    notes: ''
  });

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    filterAndSortClients();
  }, [clients, searchTerm, sortBy]);

  const loadClients = async () => {
    setIsLoading(true);
    try {
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const clientTemplates = StorageService.getClientTemplates();
      const enrichedClients = clientTemplates.map(client => ({
        ...client,
        lastUsed: client.lastUsed || client.createdAt || new Date().toISOString(),
        invoiceCount: getClientInvoiceCount(client.clientName),
        totalAmount: getClientTotalAmount(client.clientName)
      }));
      
      setClients(enrichedClients);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getClientInvoiceCount = (clientName) => {
    const history = StorageService.getHistory();
    return history.filter(doc => 
      doc.clientName?.toLowerCase() === clientName?.toLowerCase()
    ).length;
  };

  const getClientTotalAmount = (clientName) => {
    const history = StorageService.getHistory();
    return history
      .filter(doc => doc.clientName?.toLowerCase() === clientName?.toLowerCase())
      .reduce((sum, doc) => sum + (doc.amount || 0), 0);
  };

  const filterAndSortClients = () => {
    let filtered = clients.filter(client =>
      client.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort clients
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.clientName || '').localeCompare(b.clientName || '');
        case 'created':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'lastUsed':
          return new Date(b.lastUsed || 0) - new Date(a.lastUsed || 0);
        case 'invoiceCount':
          return b.invoiceCount - a.invoiceCount;
        case 'totalAmount':
          return b.totalAmount - a.totalAmount;
        default:
          return 0;
      }
    });

    setFilteredClients(filtered);
  };

  const handleSaveClient = () => {
    if (!newClient.name.trim()) {
      alert('Client name is required');
      return;
    }

    try {
      const clientData = {
        name: newClient.name,
        clientName: newClient.name,
        clientDetails: formatClientDetails(newClient),
        ...newClient,
        createdAt: editingClient ? editingClient.createdAt : new Date().toISOString(),
        lastUsed: new Date().toISOString()
      };

      if (editingClient) {
        // Update existing client
        StorageService.updateClientTemplate(editingClient.id, clientData);
      } else {
        // Add new client
        StorageService.saveClientTemplate(clientData);
      }

      loadClients();
      resetForm();
      setShowAddForm(false);
      setEditingClient(null);
    } catch (error) {
      console.error('Error saving client:', error);
      alert('Failed to save client');
    }
  };

  const formatClientDetails = (client) => {
    const details = [];
    if (client.company) details.push(client.company);
    if (client.email) details.push(client.email);
    if (client.phone) details.push(client.phone);
    if (client.address) details.push(client.address);
    if (client.website) details.push(client.website);
    return details.join('\n');
  };

  const handleEditClient = (client) => {
    setEditingClient(client);
    setNewClient({
      name: client.clientName || '',
      email: client.email || '',
      phone: client.phone || '',
      address: client.address || '',
      company: client.company || '',
      taxId: client.taxId || '',
      website: client.website || '',
      notes: client.notes || ''
    });
    setShowAddForm(true);
  };

  const handleDeleteClient = (clientId) => {
    if (confirm('Are you sure you want to delete this client?')) {
      StorageService.deleteClientTemplate(clientId);
      loadClients();
    }
  };

  const resetForm = () => {
    setNewClient({
      name: '',
      email: '',
      phone: '',
      address: '',
      company: '',
      taxId: '',
      website: '',
      notes: ''
    });
  };

  const handleSelectClient = (client) => {
    // Update last used timestamp
    StorageService.updateClientTemplate(client.id, {
      ...client,
      lastUsed: new Date().toISOString()
    });
    
    onSelectClient({
      clientName: client.clientName,
      clientDetails: client.clientDetails
    });
    
    if (onClose) onClose();
  };

  if (isLoading) {
    return (
      <div className="client-manager">
        <div className="client-manager-header">
          <div className="loading-skeleton title-skeleton"></div>
          <div className="loading-skeleton button-skeleton"></div>
        </div>
        <div className="client-grid">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="client-card loading">
              <div className="loading-skeleton card-skeleton"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="client-manager">
      <div className="client-manager-header">
        <div className="header-title">
          <h2>Client Management</h2>
          <p>{clients.length} clients • {filteredClients.length} shown</p>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-primary"
            onClick={() => setShowAddForm(true)}
          >
            ➕ Add Client
          </button>
          {onClose && (
            <button
              className="btn btn-secondary"
              onClick={onClose}
            >
              ✕ Close
            </button>
          )}
        </div>
      </div>

      <div className="client-manager-controls">
        <div className="search-section">
          <div className="search-input-container">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search clients by name, company, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button
                className="clear-search"
                onClick={() => setSearchTerm('')}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="sort-section">
          <label className="sort-label">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="name">Name A-Z</option>
            <option value="lastUsed">Recently Used</option>
            <option value="created">Recently Added</option>
            <option value="invoiceCount">Most Invoices</option>
            <option value="totalAmount">Highest Amount</option>
          </select>
        </div>
      </div>

      {filteredClients.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>No clients found</h3>
          <p>
            {searchTerm 
              ? `No clients match "${searchTerm}"`
              : 'Add your first client to get started'
            }
          </p>
          <button
            className="btn btn-primary"
            onClick={() => setShowAddForm(true)}
          >
            ➕ Add Your First Client
          </button>
        </div>
      ) : (
        <div className="client-grid">
          {filteredClients.map((client) => (
            <div key={client.id} className="client-card">
              <div className="client-header">
                <div className="client-avatar">
                  {(client.clientName || client.name || '?')[0].toUpperCase()}
                </div>
                <div className="client-info">
                  <h3 className="client-name">{client.clientName || client.name}</h3>
                  {client.company && (
                    <p className="client-company">{client.company}</p>
                  )}
                </div>
              </div>

              <div className="client-details">
                {client.email && (
                  <div className="detail-item">
                    <span className="detail-icon">📧</span>
                    <span className="detail-text">{client.email}</span>
                  </div>
                )}
                {client.phone && (
                  <div className="detail-item">
                    <span className="detail-icon">📞</span>
                    <span className="detail-text">{client.phone}</span>
                  </div>
                )}
                {client.address && (
                  <div className="detail-item">
                    <span className="detail-icon">📍</span>
                    <span className="detail-text">{client.address}</span>
                  </div>
                )}
              </div>

              <div className="client-stats">
                <div className="stat-item">
                  <span className="stat-number">{client.invoiceCount}</span>
                  <span className="stat-label">Invoices</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">${client.totalAmount.toLocaleString()}</span>
                  <span className="stat-label">Total</span>
                </div>
              </div>

              <div className="client-actions">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleSelectClient(client)}
                >
                  Select
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleEditClient(client)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-error btn-sm"
                  onClick={() => handleDeleteClient(client.id)}
                >
                  Delete
                </button>
              </div>

              <div className="client-meta">
                <span className="last-used">
                  Last used: {new Date(client.lastUsed).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Client Modal */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingClient ? 'Edit Client' : 'Add New Client'}</h3>
              <button
                className="modal-close"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingClient(null);
                  resetForm();
                }}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="form-grid">
                <div className="form-field">
                  <label className="field-label required">Client Name</label>
                  <input
                    type="text"
                    placeholder="Enter client name"
                    value={newClient.name}
                    onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-field">
                  <label className="field-label">Company</label>
                  <input
                    type="text"
                    placeholder="Company name"
                    value={newClient.company}
                    onChange={(e) => setNewClient({ ...newClient, company: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-field">
                  <label className="field-label">Email</label>
                  <input
                    type="email"
                    placeholder="client@company.com"
                    value={newClient.email}
                    onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-field">
                  <label className="field-label">Phone</label>
                  <input
                    type="tel"
                    placeholder="Phone number"
                    value={newClient.phone}
                    onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-field full-width">
                  <label className="field-label">Address</label>
                  <textarea
                    placeholder="Complete address"
                    value={newClient.address}
                    onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                    className="form-input"
                    rows="3"
                  />
                </div>

                <div className="form-field">
                  <label className="field-label">Website</label>
                  <input
                    type="url"
                    placeholder="https://company.com"
                    value={newClient.website}
                    onChange={(e) => setNewClient({ ...newClient, website: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-field">
                  <label className="field-label">Tax ID</label>
                  <input
                    type="text"
                    placeholder="Tax identification number"
                    value={newClient.taxId}
                    onChange={(e) => setNewClient({ ...newClient, taxId: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-field full-width">
                  <label className="field-label">Notes</label>
                  <textarea
                    placeholder="Additional notes about this client"
                    value={newClient.notes}
                    onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })}
                    className="form-input"
                    rows="3"
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingClient(null);
                  resetForm();
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSaveClient}
              >
                {editingClient ? 'Update Client' : 'Add Client'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientManager;
