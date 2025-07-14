export interface Product {
    id: string;
    name: string;
    description: string;
    productNo: string;
    total_in_store: number;
  }
  
  export interface Sale {
    id: string;
    name: string;
    mob: string;
    location: string;
    description: string;
    color: string;
    quantity: number;
    type: 'bought' | 'sold';
    customer_name:string;
    created_by:string;

  }
  