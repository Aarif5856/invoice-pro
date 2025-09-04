import React, { useState } from 'react';
import './App.css';

function App() {
  const [message, setMessage] = useState('Invoice Pro App - Ready for PDF Generation');
  const [usageStats, setUsageStats] = useState(() => {
    const saved = localStorage.getItem('invoiceProUsage');
    return saved ? JSON.parse(saved) : { invoices: 0, receipts: 0 };
  });

  // Check usage limit
  const checkUsageLimit = (type) => {
    const limit = 3;
    return usageStats[type] >= limit;
  };

  // Increment usage
  const incrementUsage = (type) => {
    const newStats = { ...usageStats, [type]: usageStats[type] + 1 };
    setUsageStats(newStats);
    localStorage.setItem('invoiceProUsage', JSON.stringify(newStats));
  };

  // Working PDF Generation Function (Based on Proven Pattern)
  const generateWorkingInvoicePDF = async () => {
    try {
      console.log('🧪 Testing: Starting invoice PDF generation...');
      
      // Check usage limit
      if (checkUsageLimit('invoices')) {
        alert('Monthly limit reached! You have generated 3 invoices this month.');
        return;
      }

      // Dynamic import of jsPDF
      const { default: jsPDF } = await import('jspdf');
      console.log('✅ jsPDF imported successfully');
      
      // Create PDF document
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      
      // Simple invoice content
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(24);
      doc.text('INVOICE', 250, 60);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.text('Invoice #: INV-001', 50, 120);
      doc.text('Date: ' + new Date().toLocaleDateString(), 50, 140);
      doc.text('From: Invoice Pro', 50, 180);
      doc.text('To: Test Client', 50, 200);
      doc.text('Amount: $100.00', 50, 240);
      
      // Generate filename
      const filename = `invoice_test_${Date.now()}.pdf`;
      
      // Save PDF using blob method (mobile compatible)
      const pdfBlob = doc.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Increment usage
      incrementUsage('invoices');
      
      console.log('✅ Invoice PDF generated successfully');
      setMessage(`Invoice generated! Count: ${usageStats.invoices + 1}/3`);
      
    } catch (error) {
      console.error('❌ Invoice PDF generation failed:', error);
      alert('Failed to generate invoice PDF: ' + error.message);
    }
  };

  // Working Receipt PDF Generation Function
  const generateWorkingReceiptPDF = async () => {
    try {
      console.log('🧪 Testing: Starting receipt PDF generation...');
      
      // Check usage limit
      if (checkUsageLimit('receipts')) {
        alert('Monthly limit reached! You have generated 3 receipts this month.');
        return;
      }

      // Dynamic import of jsPDF
      const { default: jsPDF } = await import('jspdf');
      console.log('✅ jsPDF imported successfully');
      
      // Create PDF document
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      
      // Simple receipt content
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(24);
      doc.text('RECEIPT', 250, 60);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.text('Receipt #: REC-001', 50, 120);
      doc.text('Date: ' + new Date().toLocaleDateString(), 50, 140);
      doc.text('From: Invoice Pro', 50, 180);
      doc.text('To: Test Client', 50, 200);
      doc.text('Amount: $50.00', 50, 240);
      
      // Generate filename
      const filename = `receipt_test_${Date.now()}.pdf`;
      
      // Save PDF using blob method (mobile compatible)
      const pdfBlob = doc.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Increment usage
      incrementUsage('receipts');
      
      console.log('✅ Receipt PDF generated successfully');
      setMessage(`Receipt generated! Count: ${usageStats.receipts + 1}/3`);
      
    } catch (error) {
      console.error('❌ Receipt PDF generation failed:', error);
      alert('Failed to generate receipt PDF: ' + error.message);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '40px 20px'
      }}>
        {/* Header */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '40px',
          marginBottom: '30px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{fontSize: '48px', marginBottom: '10px'}}>🧾</div>
          <h1 style={{
            fontSize: '32px',
            margin: '0 0 10px 0',
            color: '#2d3748',
            fontWeight: '700'
          }}>Invoice Pro</h1>
          <p style={{
            color: '#4a5568',
            fontSize: '16px',
            margin: '0',
            fontWeight: '500'
          }}>{message}</p>
        </div>

        {/* Usage Stats Card */}
        <div style={{
          background: 'white',
          borderRadius: '15px',
          padding: '25px',
          marginBottom: '30px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h3 style={{
            margin: '0 0 15px 0',
            color: '#2d3748',
            fontSize: '20px',
            fontWeight: '600'
          }}>Monthly Usage</h3>
          
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '30px',
            flexWrap: 'wrap'
          }}>
            <div style={{
              padding: '15px 25px',
              background: usageStats.invoices >= 3 ? '#fed7d7' : '#e6fffa',
              borderRadius: '10px',
              border: `2px solid ${usageStats.invoices >= 3 ? '#fc8181' : '#38b2ac'}`,
              minWidth: '120px'
            }}>
              <div style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: usageStats.invoices >= 3 ? '#c53030' : '#2c7a7b'
              }}>
                {usageStats.invoices}/3
              </div>
              <div style={{
                fontSize: '14px',
                color: usageStats.invoices >= 3 ? '#c53030' : '#2c7a7b',
                fontWeight: '500'
              }}>
                Invoices
              </div>
            </div>
            
            <div style={{
              padding: '15px 25px',
              background: usageStats.receipts >= 3 ? '#fed7d7' : '#e6fffa',
              borderRadius: '10px',
              border: `2px solid ${usageStats.receipts >= 3 ? '#fc8181' : '#38b2ac'}`,
              minWidth: '120px'
            }}>
              <div style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: usageStats.receipts >= 3 ? '#c53030' : '#2c7a7b'
              }}>
                {usageStats.receipts}/3
              </div>
              <div style={{
                fontSize: '14px',
                color: usageStats.receipts >= 3 ? '#c53030' : '#2c7a7b',
                fontWeight: '500'
              }}>
                Receipts
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons Card */}
        <div style={{
          background: 'white',
          borderRadius: '15px',
          padding: '40px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h3 style={{
            margin: '0 0 30px 0',
            color: '#2d3748',
            fontSize: '20px',
            fontWeight: '600'
          }}>Generate Documents</h3>
          
          <div style={{
            display: 'flex',
            gap: '20px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button 
              onClick={generateWorkingInvoicePDF}
              disabled={checkUsageLimit('invoices')}
              style={{
                padding: '15px 30px',
                backgroundColor: checkUsageLimit('invoices') ? '#a0aec0' : '#48bb78',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: checkUsageLimit('invoices') ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                minWidth: '180px',
                boxShadow: checkUsageLimit('invoices') ? 'none' : '0 4px 12px rgba(72, 187, 120, 0.3)',
                transform: checkUsageLimit('invoices') ? 'none' : 'translateY(0)',
                transition: 'all 0.2s ease',
                opacity: checkUsageLimit('invoices') ? 0.6 : 1
              }}
            >
              📄 Generate Invoice
              {checkUsageLimit('invoices') && <div style={{fontSize: '12px', marginTop: '4px'}}>Limit Reached</div>}
            </button>
            
            <button 
              onClick={generateWorkingReceiptPDF}
              disabled={checkUsageLimit('receipts')}
              style={{
                padding: '15px 30px',
                backgroundColor: checkUsageLimit('receipts') ? '#a0aec0' : '#4299e1',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: checkUsageLimit('receipts') ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                minWidth: '180px',
                boxShadow: checkUsageLimit('receipts') ? 'none' : '0 4px 12px rgba(66, 153, 225, 0.3)',
                transform: checkUsageLimit('receipts') ? 'none' : 'translateY(0)',
                transition: 'all 0.2s ease',
                opacity: checkUsageLimit('receipts') ? 0.6 : 1
              }}
            >
              🧾 Generate Receipt
              {checkUsageLimit('receipts') && <div style={{fontSize: '12px', marginTop: '4px'}}>Limit Reached</div>}
            </button>
          </div>

          {/* Reset Button for Testing */}
          <div style={{marginTop: '30px'}}>
            <button 
              onClick={() => {
                localStorage.removeItem('invoiceProUsage');
                setUsageStats({ invoices: 0, receipts: 0 });
                setMessage('Usage reset! You can generate documents again.');
              }}
              style={{
                padding: '8px 20px',
                backgroundColor: '#ed8936',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              🔄 Reset Usage (For Testing)
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '30px',
          color: 'white',
          fontSize: '14px',
          opacity: 0.8
        }}>
          Professional invoicing made simple • Free tier: 3 documents/month
        </div>
      </div>
    </div>
  );
}

export default App;
