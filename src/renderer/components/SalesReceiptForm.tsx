import React, { useState } from 'react';
import styled from 'styled-components';
import { SalesReceiptData } from '../../types/printer.types';

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SectionTitle = styled.h3`
  color: #333;
  margin: 0;
  font-size: 1.2rem;
  font-weight: 500;
  border-bottom: 2px solid #667eea;
  padding-bottom: 0.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: #333;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  resize: vertical;
  min-height: 80px;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const ItemRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr 1fr 1fr 1fr auto;
  gap: 0.5rem;
  align-items: end;
`;

const Button = styled.button<{ primary?: boolean; danger?: boolean; disabled?: boolean }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  background: ${props => {
    if (props.danger) return '#f44336';
    if (props.primary) return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    return '#f5f5f5';
  }};
  color: ${props => props.danger || props.primary ? 'white' : '#333'};
  opacity: ${props => props.disabled ? 0.6 : 1};
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1rem;
`;

const StatusMessage = styled.div<{ type: 'success' | 'error' | 'info' }>`
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  font-weight: 500;
  background: ${props => {
    switch (props.type) {
      case 'success': return '#e8f5e8';
      case 'error': return '#ffeaea';
      default: return '#e3f2fd';
    }
  }};
  color: ${props => {
    switch (props.type) {
      case 'success': return '#2e7d32';
      case 'error': return '#c62828';
      default: return '#1976d2';
    }
  }};
  border: 1px solid ${props => {
    switch (props.type) {
      case 'success': return '#c8e6c9';
      case 'error': return '#ffcdd2';
      default: return '#bbdefb';
    }
  }};
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 0.5rem;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const SummarySection = styled.div`
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #667eea;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  
  &:last-child {
    font-weight: bold;
    font-size: 1.1rem;
    border-top: 1px solid #ddd;
    padding-top: 0.5rem;
    margin-top: 0.5rem;
  }
`;

export const SalesReceiptForm: React.FC = () => {
  const [receiptData, setReceiptData] = useState<SalesReceiptData>({
    header: {
      receiptNo: '',
      date: new Date().toISOString().split('T')[0],
      customerCode: '',
      customerName: ''
    },
    items: [],
    summary: {
      subtotal: 0,
      tax: 0,
      total: 0
    }
  });
  
  const [isPrinting, setIsPrinting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const updateHeader = (field: keyof typeof receiptData.header, value: string) => {
    setReceiptData(prev => ({
      ...prev,
      header: { ...prev.header, [field]: value }
    }));
  };

  const addItem = () => {
    setReceiptData(prev => ({
      ...prev,
      items: [...prev.items, {
        productCode: '',
        productName: '',
        quantity: 1,
        price: 0,
        total: 0
      }]
    }));
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    setReceiptData(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      
      // Recalculate total for this item
      if (field === 'quantity' || field === 'price') {
        newItems[index].total = newItems[index].quantity * newItems[index].price;
      }
      
      return { ...prev, items: newItems };
    });
  };

  const removeItem = (index: number) => {
    setReceiptData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const calculateSummary = () => {
    const subtotal = receiptData.items.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;
    
    setReceiptData(prev => ({
      ...prev,
      summary: { subtotal, tax, total }
    }));
  };

  const handlePrint = async () => {
    setIsPrinting(true);
    setStatusMessage('印刷中...');
    
    try {
      const success = await window.electronAPI.printSalesReceipt(receiptData);
      
      if (success) {
        setStatusMessage('売上伝票の印刷が完了しました');
      } else {
        setStatusMessage('印刷に失敗しました');
      }
    } catch (error) {
      console.error('Print failed:', error);
      setStatusMessage('印刷エラーが発生しました');
    } finally {
      setIsPrinting(false);
      setTimeout(() => setStatusMessage(''), 3000);
    }
  };

  const handleClear = () => {
    setReceiptData({
      header: {
        receiptNo: '',
        date: new Date().toISOString().split('T')[0],
        customerCode: '',
        customerName: ''
      },
      items: [],
      summary: {
        subtotal: 0,
        tax: 0,
        total: 0
      }
    });
  };

  const handleSampleData = () => {
    setReceiptData({
      header: {
        receiptNo: 'R' + Date.now().toString().slice(-6),
        date: new Date().toISOString().split('T')[0],
        customerCode: 'C001',
        customerName: 'サンプル商事株式会社'
      },
      items: [
        {
          productCode: 'P001',
          productName: '商品A',
          quantity: 2,
          price: 1000,
          total: 2000
        },
        {
          productCode: 'P002',
          productName: '商品B',
          quantity: 1,
          price: 1500,
          total: 1500
        }
      ],
      summary: {
        subtotal: 3500,
        tax: 350,
        total: 3850
      }
    });
  };

  React.useEffect(() => {
    calculateSummary();
  }, [receiptData.items]);

  return (
    <FormContainer>
      <FormSection>
        <SectionTitle>伝票情報</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <FormGroup>
            <Label htmlFor="receiptNo">伝票番号:</Label>
            <Input
              id="receiptNo"
              value={receiptData.header.receiptNo}
              onChange={(e) => updateHeader('receiptNo', e.target.value)}
              placeholder="R001"
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="date">日付:</Label>
            <Input
              id="date"
              type="date"
              value={receiptData.header.date}
              onChange={(e) => updateHeader('date', e.target.value)}
            />
          </FormGroup>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <FormGroup>
            <Label htmlFor="customerCode">顧客コード:</Label>
            <Input
              id="customerCode"
              value={receiptData.header.customerCode}
              onChange={(e) => updateHeader('customerCode', e.target.value)}
              placeholder="C001"
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="customerName">顧客名:</Label>
            <Input
              id="customerName"
              value={receiptData.header.customerName}
              onChange={(e) => updateHeader('customerName', e.target.value)}
              placeholder="株式会社サンプル"
            />
          </FormGroup>
        </div>
      </FormSection>

      <FormSection>
        <SectionTitle>商品明細</SectionTitle>
        {receiptData.items.map((item, index) => (
          <ItemRow key={index}>
            <Input
              placeholder="商品コード"
              value={item.productCode}
              onChange={(e) => updateItem(index, 'productCode', e.target.value)}
            />
            <Input
              placeholder="商品名"
              value={item.productName}
              onChange={(e) => updateItem(index, 'productName', e.target.value)}
            />
            <Input
              type="number"
              placeholder="数量"
              value={item.quantity}
              onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
            />
            <Input
              type="number"
              placeholder="単価"
              value={item.price}
              onChange={(e) => updateItem(index, 'price', parseInt(e.target.value) || 0)}
            />
            <Input
              type="number"
              value={item.total}
              readOnly
              style={{ background: '#f5f5f5' }}
            />
            <Button
              onClick={() => removeItem(index)}
              danger
            >
              削除
            </Button>
          </ItemRow>
        ))}
        <Button onClick={addItem}>
          商品を追加
        </Button>
      </FormSection>

      <SummarySection>
        <SectionTitle>合計</SectionTitle>
        <SummaryRow>
          <span>小計:</span>
          <span>¥{receiptData.summary.subtotal.toLocaleString()}</span>
        </SummaryRow>
        <SummaryRow>
          <span>税額 (10%):</span>
          <span>¥{receiptData.summary.tax.toLocaleString()}</span>
        </SummaryRow>
        <SummaryRow>
          <span>合計:</span>
          <span>¥{receiptData.summary.total.toLocaleString()}</span>
        </SummaryRow>
      </SummarySection>

      <ButtonGroup>
        <Button 
          onClick={handlePrint}
          disabled={isPrinting || receiptData.items.length === 0}
          primary
        >
          {isPrinting && <LoadingSpinner />}
          {isPrinting ? '印刷中...' : '印刷'}
        </Button>
        
        <Button onClick={handleSampleData}>
          サンプルデータ
        </Button>
        
        <Button onClick={handleClear}>
          クリア
        </Button>
      </ButtonGroup>

      {statusMessage && (
        <StatusMessage type={
          statusMessage.includes('完了') ? 'success' : 
          statusMessage.includes('失敗') || statusMessage.includes('エラー') ? 'error' : 
          'info'
        }>
          {statusMessage}
        </StatusMessage>
      )}
    </FormContainer>
  );
};
