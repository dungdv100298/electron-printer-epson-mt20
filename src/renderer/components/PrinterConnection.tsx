import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const ConnectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const PrinterInfo = styled.div`
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #667eea;
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

const ConnectionControls = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
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

const StatusIndicator = styled.div<{ connected: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: 8px;
  background: ${props => props.connected ? '#e8f5e8' : '#ffeaea'};
  color: ${props => props.connected ? '#2e7d32' : '#c62828'};
  font-weight: 500;
  justify-content: center;
`;

const StatusDot = styled.div<{ connected: boolean }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.connected ? '#4CAF50' : '#f44336'};
  animation: ${props => props.connected ? 'pulse 2s infinite' : 'none'};
  
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
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

const TestButton = styled(Button)`
  background: #4CAF50;
  color: white;
  margin-top: 1rem;
`;

interface PrinterConnectionProps {
  printer: any;
  onConnectionChange: (connected: boolean) => void;
}

export const PrinterConnection: React.FC<PrinterConnectionProps> = ({ 
  printer, 
  onConnectionChange 
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string>('');

  useEffect(() => {
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    try {
      const connected = await window.electronAPI.isPrinterConnected();
      setIsConnected(connected);
      onConnectionChange(connected);
    } catch (error) {
      console.error('Failed to check connection status:', error);
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const success = await window.electronAPI.connectPrinter(printer);
      if (success) {
        setIsConnected(true);
        onConnectionChange(true);
        setTestResult('接続に成功しました');
      } else {
        setTestResult('接続に失敗しました');
      }
    } catch (error) {
      console.error('Connection failed:', error);
      setTestResult('接続エラーが発生しました');
    } finally {
      setIsConnecting(false);
      setTimeout(() => setTestResult(''), 3000);
    }
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      await window.electronAPI.disconnectPrinter();
      setIsConnected(false);
      onConnectionChange(false);
      setTestResult('切断しました');
    } catch (error) {
      console.error('Disconnection failed:', error);
      setTestResult('切断エラーが発生しました');
    } finally {
      setIsDisconnecting(false);
      setTimeout(() => setTestResult(''), 3000);
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    try {
      const success = await window.electronAPI.testPrinter();
      setTestResult(success ? 'テスト成功' : 'テスト失敗');
    } catch (error) {
      console.error('Test failed:', error);
      setTestResult('テストエラーが発生しました');
    } finally {
      setIsTesting(false);
      setTimeout(() => setTestResult(''), 3000);
    }
  };

  return (
    <ConnectionContainer>
      <PrinterInfo>
        <PrinterName>{printer.name}</PrinterName>
        <PrinterAddress>Port: {printer.address}</PrinterAddress>
      </PrinterInfo>

      <StatusIndicator connected={isConnected}>
        <StatusDot connected={isConnected} />
        {isConnected ? '接続済み' : '未接続'}
      </StatusIndicator>

      <ConnectionControls>
        {!isConnected ? (
          <Button 
            onClick={handleConnect}
            disabled={isConnecting}
            primary
          >
            {isConnecting && <LoadingSpinner />}
            {isConnecting ? '接続中...' : '接続'}
          </Button>
        ) : (
          <Button 
            onClick={handleDisconnect}
            disabled={isDisconnecting}
            danger
          >
            {isDisconnecting && <LoadingSpinner />}
            {isDisconnecting ? '切断中...' : '切断'}
          </Button>
        )}
      </ConnectionControls>

      {isConnected && (
        <TestButton 
          onClick={handleTest}
          disabled={isTesting}
        >
          {isTesting && <LoadingSpinner />}
          {isTesting ? 'テスト中...' : '接続テスト'}
        </TestButton>
      )}

      {testResult && (
        <StatusIndicator connected={testResult.includes('成功')}>
          {testResult}
        </StatusIndicator>
      )}
    </ConnectionContainer>
  );
};
