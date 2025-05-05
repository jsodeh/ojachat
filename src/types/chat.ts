export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description?: string;
}

export type MessageContent = {
  text: string;
  products?: Product[];
}

export interface Message {
  role: 'user' | 'assistant';
  content: {
    text: string;
    products?: any[];
    actionButtons?: {
      label: string;
      onClick: () => void;
    }[];
  };
  timestamp: number;
}

export type ChatSession = {
  id: string;
  title: string;
  messages: Message[];
  timestamp: number;
};
