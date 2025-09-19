import React, { useState } from 'react';
import styled from 'styled-components';

const PrintContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
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

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  resize: vertical;
  min-height: 100px;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  accent-color: #667eea;
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

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
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

export const PrintDialog: React.FC = () => {
  const [text, setText] = useState('Hello, EPSON Printer!\nThis is a test print.');
  const [align, setAlign] = useState<'left' | 'center' | 'right'>('left');
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [bold, setBold] = useState(false);
  const [cut, setCut] = useState(true);
  const [feedLines, setFeedLines] = useState(2);
  const [isPrinting, setIsPrinting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const handlePrintText = async () => {
    setIsPrinting(true);
    setStatusMessage('印刷中...');
    
    try {
      const success = await window.electronAPI.printText(text, {
        align,
        fontSize,
        bold,
        cut,
        feedLines
      });
      
      if (success) {
        setStatusMessage('印刷が完了しました');
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

  const handleClearText = () => {
    setText('');
  };

  const handleInsertSampleText = () => {
    setText(`EPSON Printer Test
================

Date: ${new Date().toLocaleString('ja-JP')}

This is a test print from the EPSON Printer App.
The printer is working correctly!

Features:
- Text alignment: ${align}
- Font size: ${fontSize}
- Bold: ${bold ? 'Yes' : 'No'}
- Auto cut: ${cut ? 'Yes' : 'No'}

Thank you for using EPSON Printer App!`);
  };

  return (
    <PrintContainer>
      <FormGroup>
        <Label htmlFor="text">印刷テキスト:</Label>
        <TextArea
          id="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="印刷したいテキストを入力してください..."
        />
      </FormGroup>

      <FormGroup>
        <Label htmlFor="align">文字揃え:</Label>
        <Select
          id="align"
          value={align}
          onChange={(e) => setAlign(e.target.value as 'left' | 'center' | 'right')}
        >
          <option value="left">左揃え</option>
          <option value="center">中央揃え</option>
          <option value="right">右揃え</option>
        </Select>
      </FormGroup>

      <FormGroup>
        <Label htmlFor="fontSize">フォントサイズ:</Label>
        <Select
          id="fontSize"
          value={fontSize}
          onChange={(e) => setFontSize(e.target.value as 'small' | 'medium' | 'large')}
        >
          <option value="small">小</option>
          <option value="medium">中</option>
          <option value="large">大</option>
        </Select>
      </FormGroup>

      <FormGroup>
        <CheckboxContainer>
          <Checkbox
            type="checkbox"
            id="bold"
            checked={bold}
            onChange={(e) => setBold(e.target.checked)}
          />
          <Label htmlFor="bold">太字</Label>
        </CheckboxContainer>
      </FormGroup>

      <FormGroup>
        <CheckboxContainer>
          <Checkbox
            type="checkbox"
            id="cut"
            checked={cut}
            onChange={(e) => setCut(e.target.checked)}
          />
          <Label htmlFor="cut">自動カット</Label>
        </CheckboxContainer>
      </FormGroup>

      <FormGroup>
        <Label htmlFor="feedLines">改行数:</Label>
        <Select
          id="feedLines"
          value={feedLines}
          onChange={(e) => setFeedLines(parseInt(e.target.value))}
        >
          <option value={0}>0</option>
          <option value={1}>1</option>
          <option value={2}>2</option>
          <option value={3}>3</option>
          <option value={5}>5</option>
        </Select>
      </FormGroup>

      <ButtonGroup>
        <Button 
          onClick={handlePrintText}
          disabled={isPrinting || !text.trim()}
          primary
        >
          {isPrinting && <LoadingSpinner />}
          {isPrinting ? '印刷中...' : '印刷'}
        </Button>
        
        <Button onClick={handleInsertSampleText}>
          サンプルテキスト
        </Button>
        
        <Button onClick={handleClearText}>
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
    </PrintContainer>
  );
};
