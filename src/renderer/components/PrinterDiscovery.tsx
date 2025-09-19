import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { usePrinter } from '../hooks/usePrinter';

const DiscoveryContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const DiscoveryControls = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 1rem;
`;

const Button = styled.button<{ primary?: boolean; disabled?: boolean }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  background: ${props => 
    props.primary 
      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      : '#f5f5f5'
  };
  color: ${props => props.primary ? 'white' : '#333'};
  opacity: ${props => props.disabled ? 0.6 : 1};
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const PrinterList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 300px;
  overflow-y: auto;
`;

const PrinterItem = styled.div<{ selected: boolean }>`
  padding: 1rem;
  border: 2px solid ${props => props.selected ? '#667eea' : '#e0e0e0'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.selected ? '#f0f4ff' : 'white'};
  
  &:hover {
    border-color: #667eea;
    background: #f0f4ff;
  }
`;

const PrinterName = styled.div`
  font-weight: 600;
  color: #333;
  margin-bottom: 0.25rem;
`;

const PrinterAddress = styled.div`
  font-size: 0.9rem;
  color: #666;
  font-family: monospace;
`;

const StatusMessage = styled.div<{ type: 'info' | 'success' | 'error' }>`
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
  width: 20px;
  height: 20px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 0.5rem;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

interface PrinterDiscoveryProps {
  onPrinterSelected: (printer: any) => void;
}

export const PrinterDiscovery: React.FC<PrinterDiscoveryProps> = ({ onPrinterSelected }) => {
  const { 
    discoveredPrinters, 
    isDiscovering, 
    startDiscovery, 
    stopDiscovery 
  } = usePrinter();
  
  const [selectedPrinter, setSelectedPrinter] = useState<any>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const handleStartDiscovery = async () => {
    try {
      setStatusMessage('プリンタを検索中...');
      await startDiscovery();
      setStatusMessage('検索完了');
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (error) {
      console.error('Discovery failed:', error);
      setStatusMessage('検索に失敗しました');
      setTimeout(() => setStatusMessage(''), 5000);
    }
  };

  const handleStopDiscovery = async () => {
    try {
      await stopDiscovery();
      setStatusMessage('検索を停止しました');
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (error) {
      console.error('Stop discovery failed:', error);
    }
  };

  const handlePrinterSelect = (printer: any) => {
    setSelectedPrinter(printer);
    onPrinterSelected(printer);
  };

  useEffect(() => {
    if (discoveredPrinters.length > 0) {
      setStatusMessage(`${discoveredPrinters.length}台のプリンタが見つかりました`);
      setTimeout(() => setStatusMessage(''), 3000);
    }
  }, [discoveredPrinters]);

  return (
    <DiscoveryContainer>
      <DiscoveryControls>
        <Button 
          onClick={handleStartDiscovery}
          disabled={isDiscovering}
          primary
        >
          {isDiscovering && <LoadingSpinner />}
          {isDiscovering ? '検索中...' : '検索開始'}
        </Button>
        
        <Button 
          onClick={handleStopDiscovery}
          disabled={!isDiscovering}
        >
          検索停止
        </Button>
      </DiscoveryControls>

      {statusMessage && (
        <StatusMessage type={statusMessage.includes('失敗') ? 'error' : 'info'}>
          {statusMessage}
        </StatusMessage>
      )}

      <PrinterList>
        {discoveredPrinters.length === 0 ? (
        <StatusMessage type="info">
          プリンタが見つかりません。検索を開始してください。
          <br />
          <small>システムにインストールされたプリンタを検索します。</small>
        </StatusMessage>
        ) : (
          discoveredPrinters.map((printer, index) => (
            <PrinterItem
              key={index}
              selected={selectedPrinter?.address === printer.address}
              onClick={() => handlePrinterSelect(printer)}
            >
              <PrinterName>{printer.name}</PrinterName>
              <PrinterAddress>Port: {printer.address}</PrinterAddress>
            </PrinterItem>
          ))
        )}
      </PrinterList>
    </DiscoveryContainer>
  );
};
