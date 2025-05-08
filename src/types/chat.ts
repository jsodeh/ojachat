export type MessageRole = 'user' | 'assistant' | 'system';

export interface ActionButton {
  label: string;
  action: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description?: string;
}

export interface OrderStatus {
  type: 'order_status';
  message: string;
  orderId: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
}

export interface PaymentInstructions {
  type: 'payment_instructions';
  amount: number;
  reference: string;
  accountDetails: {
    bank: string;
    accountNumber: string;
    accountName: string;
  };
}

export interface TotalAmount {
  type: 'total_amount';
  subtotal: number;
  shipping: number;
  total: number;
}

export type RichComponent = OrderStatus | PaymentInstructions | TotalAmount;

export interface MessageContent {
  text: string;
  products?: Product[];
  actionButtons?: ActionButton[];
  richComponent?: RichComponent;
}

export interface Message {
  role: MessageRole;
  content: MessageContent;
}

export type ChatSession = {
  id: string;
  title: string;
  messages: Message[];
  timestamp: number;
};
