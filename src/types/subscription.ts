export type SubscriptionPlan = 'free' | 'basic' | 'premium';
export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' | 'trial';
export type SubscriptionFeature = 
  | 'text_chat'
  | 'image_upload'
  | 'image_search'
  | 'voice_notes'
  | 'screenshare'
  | 'sms_mode'
  | 'whatsapp_assistant'
  | 'auto_shopper'
  | 'follow_up_calls'
  | 'web_shopper'
  | 'food_delivery'
  | 'shop_online';

export interface Subscription {
  id: string;
  user_id: string;
  status: SubscriptionStatus;
  plan: SubscriptionPlan;
  start_date: string;
  end_date: string;
  features: SubscriptionFeature[];
  trial_end_date?: string;
  payment_method_id?: string;
  last_payment_date?: string;
  next_payment_date?: string;
  auto_renew: boolean;
  price: number;
  currency: string;
  billing_cycle: 'monthly' | 'yearly';
  delivery_credits: number;
  delivery_credit_cost: number;
}

export interface SubscriptionHistory {
  id: string;
  subscription_id: string;
  user_id: string;
  action: 'created' | 'updated' | 'cancelled' | 'renewed' | 'payment_failed';
  previous_plan?: SubscriptionPlan;
  new_plan?: SubscriptionPlan;
  previous_status?: SubscriptionStatus;
  new_status?: SubscriptionStatus;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface DeliveryTransaction {
  id: string;
  user_id: string;
  subscription_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  delivery_address: string;
  delivery_type: 'standard' | 'express';
  created_at: string;
  completed_at?: string;
  payment_intent_id?: string;
} 