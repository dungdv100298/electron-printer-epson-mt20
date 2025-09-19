import React, { useState } from 'react';
import styled from 'styled-components';
import { PrinterDiscovery } from './components/PrinterDiscovery';
import { PrinterConnection } from './components/PrinterConnection';
import { PrintDialog } from './components/PrintDialog';
import { SalesReceiptForm } from './components/SalesReceiptForm';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const Header = styled.header`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 1rem 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
`;

const Title = styled.h1`
  color: white;
  margin: 0;
  font-size: 2rem;
  font-weight: 300;
  text-align: center;
`;

const MainContent = styled.main`
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const CardTitle = styled.h2`
  color: #333;
  margin: 0 0 1.5rem 0;
  font-size: 1.5rem;
  font-weight: 500;
  border-bottom: 2px solid #667eea;
  padding-bottom: 0.5rem;
`;

const StatusBar = styled.div`
  background: rgba(0, 0, 0, 0.1);
  padding: 1rem 2rem;
  color: white;
  font-size: 0.9rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StatusItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StatusIndicator = styled.div<{ connected: boolean }>`
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

function App() {
  const [currentPrinter, setCurrentPrinter] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [appVersion, setAppVersion] = useState('1.0.0');

  React.useEffect(() => {
    // Get app version
    window.electronAPI.getAppVersion().then(setAppVersion);
  }, []);

  const handlePrinterSelected = (printer: any) => {
    setCurrentPrinter(printer);
  };

  const handleConnectionChange = (connected: boolean) => {
    setIsConnected(connected);
  };

  return (
    <AppContainer>
      <Header>
        <Title>EPSON Printer App</Title>
      </Header>
      
      <MainContent>
        <Card>
          <CardTitle>プリンタ検索 (Printer Discovery)</CardTitle>
          <PrinterDiscovery onPrinterSelected={handlePrinterSelected} />
        </Card>

        {currentPrinter && (
          <Card>
            <CardTitle>プリンタ接続 (Printer Connection)</CardTitle>
            <PrinterConnection 
              printer={currentPrinter}
              onConnectionChange={handleConnectionChange}
            />
          </Card>
        )}

        {isConnected && (
          <>
            <Card>
              <CardTitle>印刷テスト (Print Test)</CardTitle>
              <PrintDialog />
            </Card>

            <Card>
              <CardTitle>売上伝票印刷 (Sales Receipt)</CardTitle>
              <SalesReceiptForm />
            </Card>
          </>
        )}
      </MainContent>

      <StatusBar>
        <StatusItem>
          <StatusIndicator connected={isConnected} />
          <span>
            {isConnected 
              ? `接続済み: ${currentPrinter?.name || 'Unknown'}` 
              : '未接続'
            }
          </span>
        </StatusItem>
        <StatusItem>
          <span>Version: {appVersion}</span>
        </StatusItem>
      </StatusBar>
    </AppContainer>
  );
}

export default App;
