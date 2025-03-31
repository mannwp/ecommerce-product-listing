export interface Product {
  id: string
  name: string
  price: number
  category: 'Electronics' | 'Clothing' | 'Books' | 'Home'
  images: string[]
  stockStatus: 'In Stock' | 'Out of Stock'
}
